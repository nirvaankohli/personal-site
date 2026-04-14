import hmac
import json
import os
import re
import secrets
from functools import wraps
from pathlib import Path
from typing import Any

from flask import Flask, abort, jsonify, request, send_from_directory, session
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
IMAGES_DIR = ROOT_DIR / "images"
PROJECTS_FILE = DATA_DIR / "projects.json"
EVENTS_FILE = DATA_DIR / "events.json"
UPLOAD_DIRECTORIES = {
    "projects": IMAGES_DIR / "screenshots",
    "events": IMAGES_DIR / "events",
}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if key and key not in os.environ:
            os.environ[key] = value


load_env_file(ROOT_DIR / ".env")


def env_bool(name: str, default: bool) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "change-this-secret-key")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = os.environ.get("SESSION_COOKIE_SAMESITE", "Lax")
app.config["SESSION_COOKIE_SECURE"] = env_bool("SESSION_COOKIE_SECURE", True)
app.config["PERMANENT_SESSION_LIFETIME"] = int(os.environ.get("SESSION_TTL_SECONDS", "43200"))
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)  # type: ignore[assignment]


def load_collection(path: Path, key: str) -> list[dict[str, Any]]:
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    return payload.get(key, [])


def save_collection(path: Path, key: str, items: list[dict[str, Any]]) -> None:
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    payload = {key: items}
    tmp_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    tmp_path.replace(path)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or secrets.token_hex(4)


def unique_strings(values: list[Any]) -> list[str]:
    result: list[str] = []
    for value in values:
        cleaned = str(value).strip()
        if cleaned and cleaned not in result:
            result.append(cleaned)
    return result


def normalize_project(payload: dict[str, Any]) -> dict[str, Any]:
    title = str(payload.get("title", "")).strip()
    item_id = str(payload.get("id", "")).strip() or slugify(title)
    return {
        "id": item_id,
        "title": title,
        "intent": str(payload.get("intent", "")).strip(),
        "status": str(payload.get("status", "research")).strip() or "research",
        "tags": unique_strings(payload.get("tags", [])),
        "date": str(payload.get("date", "")).strip(),
        "featured": bool(payload.get("featured", False)),
        "image": str(payload.get("image", "")).strip(),
        "repo": str(payload.get("repo", "")).strip(),
        "demo": str(payload.get("demo", "")).strip(),
    }


def normalize_event(payload: dict[str, Any]) -> dict[str, Any]:
    title = str(payload.get("title", "")).strip()
    item_id = str(payload.get("id", "")).strip() or slugify(title)
    return {
        "id": item_id,
        "title": title,
        "description": str(payload.get("description", "")).strip(),
        "date": str(payload.get("date", "")).strip(),
        "dateDisplay": str(payload.get("dateDisplay", "")).strip(),
        "type": str(payload.get("type", "project")).strip() or "project",
        "tags": unique_strings(payload.get("tags", [])),
        "image": str(payload.get("image", "")).strip(),
        "link": str(payload.get("link", "")).strip(),
    }


def admin_username() -> str:
    return os.environ.get("ADMIN_USERNAME", "admin")


def password_is_valid(password: str) -> bool:
    configured_hash = os.environ.get("ADMIN_PASSWORD_HASH", "").strip()
    configured_password = os.environ.get("ADMIN_PASSWORD", "change-me-now")

    if configured_hash:
        return check_password_hash(configured_hash, password)

    return hmac.compare_digest(password, configured_password)


def is_authenticated() -> bool:
    return bool(session.get("authenticated"))


def require_auth(handler):
    @wraps(handler)
    def wrapped(*args, **kwargs):
        if not is_authenticated():
            return jsonify({"error": "Authentication required."}), 401
        return handler(*args, **kwargs)

    return wrapped


def upsert(items: list[dict[str, Any]], item: dict[str, Any]) -> list[dict[str, Any]]:
    next_items = [existing for existing in items if existing.get("id") != item["id"]]
    next_items.append(item)
    return next_items


def remove_item(items: list[dict[str, Any]], item_id: str) -> list[dict[str, Any]]:
    return [item for item in items if item.get("id") != item_id]


def next_upload_name(directory: Path, original_name: str) -> str:
    base_name = secure_filename(original_name) or f"upload-{secrets.token_hex(4)}"
    stem = Path(base_name).stem
    suffix = Path(base_name).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type.")

    candidate = f"{stem}{suffix}"
    index = 1
    while (directory / candidate).exists():
        candidate = f"{stem}-{index}{suffix}"
        index += 1
    return candidate


@app.post("/api/auth/login")
def login() -> tuple[Any, int] | Any:
    payload = request.get_json(silent=True) or {}
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))

    if username != admin_username() or not password_is_valid(password):

        return jsonify({"error": "Invalid username or password."}), 401

    session.clear()
    session.permanent = True
    session["authenticated"] = True
    session["username"] = username
    return jsonify({"authenticated": True, "username": username})


@app.get("/api/auth/session")
def auth_session() -> Any:
    return jsonify(
        {
            "authenticated": is_authenticated(),
            "username": session.get("username"),
        }
    )


@app.post("/api/auth/logout")
def logout() -> Any:
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/admin/projects")
@require_auth
def get_projects() -> Any:
    return jsonify({"projects": load_collection(PROJECTS_FILE, "projects")})


@app.post("/api/admin/projects")
@require_auth
def save_project() -> tuple[Any, int] | Any:
    payload = request.get_json(silent=True) or {}
    project = normalize_project(payload)

    if not project["title"]:
        return jsonify({"error": "Project title is required."}), 400

    projects = load_collection(PROJECTS_FILE, "projects")
    projects = upsert(projects, project)
    save_collection(PROJECTS_FILE, "projects", projects)
    return jsonify({"project": project})


@app.delete("/api/admin/projects/<item_id>")
@require_auth
def delete_project(item_id: str) -> Any:
    projects = load_collection(PROJECTS_FILE, "projects")
    projects = remove_item(projects, item_id)
    save_collection(PROJECTS_FILE, "projects", projects)
    return jsonify({"ok": True})


@app.get("/api/admin/events")
@require_auth
def get_events() -> Any:
    return jsonify({"events": load_collection(EVENTS_FILE, "events")})


@app.post("/api/admin/events")
@require_auth
def save_event() -> tuple[Any, int] | Any:
    payload = request.get_json(silent=True) or {}
    event = normalize_event(payload)

    if not event["title"]:
        return jsonify({"error": "Event title is required."}), 400

    events = load_collection(EVENTS_FILE, "events")
    events = upsert(events, event)
    save_collection(EVENTS_FILE, "events", events)
    return jsonify({"event": event})


@app.delete("/api/admin/events/<item_id>")
@require_auth
def delete_event(item_id: str) -> Any:
    events = load_collection(EVENTS_FILE, "events")
    events = remove_item(events, item_id)
    save_collection(EVENTS_FILE, "events", events)
    return jsonify({"ok": True})


@app.post("/api/admin/upload")
@require_auth
def upload_image() -> tuple[Any, int] | Any:
    collection = str(request.form.get("collection", "")).strip()
    upload = request.files.get("file")

    if collection not in UPLOAD_DIRECTORIES:
        return jsonify({"error": "Invalid upload collection."}), 400

    if upload is None or not upload.filename:
        return jsonify({"error": "No file provided."}), 400

    directory = UPLOAD_DIRECTORIES[collection]
    directory.mkdir(parents=True, exist_ok=True)

    try:
        filename = next_upload_name(directory, upload.filename)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    upload.save(directory / filename)
    public_prefix = (
        "/images/screenshots" if collection == "projects" else "/images/events"
    )
    return jsonify({"path": f"{public_prefix}/{filename}"})


@app.get("/api/healthz")
def healthcheck() -> Any:
    return jsonify({"ok": True})


@app.route("/", defaults={"requested_path": ""})
@app.route("/<path:requested_path>")
def serve_site(requested_path: str) -> Any:
    if requested_path.startswith("api/"):
        abort(404)

    relative_path = Path(requested_path)
    target = (ROOT_DIR / relative_path).resolve()

    if ROOT_DIR not in target.parents and target != ROOT_DIR:
        abort(404)

    if requested_path == "":
        target = ROOT_DIR / "index.html"
    elif target.is_dir():
        target = target / "index.html"

    if not target.exists() or not target.is_file():
        abort(404)

    return send_from_directory(ROOT_DIR, target.relative_to(ROOT_DIR).as_posix())


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
