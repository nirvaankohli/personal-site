# personal-site
Personal site with a lightweight Flask-backed admin dashboard.

## Admin auth
Set these environment variables before running the app:

- `SECRET_KEY`: session signing key.
- `ADMIN_USERNAME`: dashboard username. Defaults to `admin`.
- `ADMIN_PASSWORD`: dashboard password. Defaults to `change-me-now`.
- `ADMIN_PASSWORD_HASH`: optional Werkzeug password hash. If set, it is used instead of `ADMIN_PASSWORD`.

## Local run
```bash
python app.py
```

The site will be available at `http://localhost:8000/` and the dashboard at `http://localhost:8000/admin/`.

## Coolify deployment
Use the included `Dockerfile`.

Set these environment variables in Coolify:

- `SECRET_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
- `SESSION_COOKIE_SECURE=true`

Recommended persistent mounts:

- `/app/data`
- `/app/images`

Recommended health check path:

- `/api/healthz`

If you use `ADMIN_PASSWORD_HASH`, generate it locally with:
```bash
python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('your-password'))"
```
