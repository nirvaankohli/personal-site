# Nirvaan Kohli portfolio

A portfolio of projects, experiences, and writing across robotics, AI, and software engineering. The introduction uses the [React Bits Light Rays](https://reactbits.dev/c/backgrounds/light-rays) background and [Warm Tooltip](https://reactbits.dev/c/micro/warm-tooltip) for social links.

Run `npm install` and `npm run dev` to preview locally. Run `npm run build` to create the static site in `dist/`. The Dockerfile builds and serves that site with Nginx.

## Add or edit a project

Each project has its own file in `src/projects/`. Edit one of those JSON files to change its text, tools, links, or gallery. To add a project, copy a file, give it a unique `slug` and `order`, and set `portfolio` to `programming`, `engineering`, or `photography`. The site finds the new file automatically.

Put project images in `public/projects/` and refer to them as `/projects/filename.png` in the JSON. `cover` is the main image. Add any number of images to `gallery`; each one appears when a visitor clicks **See more**. The `details` array holds the extra paragraphs shown there, and `highlights` holds the short facts beside them. You can leave `gallery`, `details`, `highlights`, `tools`, or `links` as empty arrays when you do not have content for them yet.

Gallery images can include an optional `group` label to separate sets of images and `"orientation": "portrait"` for tall phone screenshots. To put a playable demo in the main media spot, add an optional `video` object with `url`, `embedUrl`, and `title`, as in `src/projects/route-risk.json`. When a video is present, it replaces the cover image on the page.

Example:

```json
{
  "order": 6,
  "slug": "my-project",
  "portfolio": "programming",
  "title": "My Project",
  "type": "Web app",
  "year": "2026",
  "description": "One sentence about what it does.",
  "cover": { "src": "/projects/my-project.png", "alt": "What the main image shows" },
  "tools": ["React", "TypeScript"],
  "details": ["A little more about the idea and how you built it."],
  "highlights": ["One useful detail", "Another useful detail"],
  "gallery": [
    { "src": "/projects/my-project-detail.png", "alt": "What this image shows", "caption": "A short caption" }
  ],
  "links": [
    { "label": "GitHub", "url": "https://github.com/your-name/my-project" }
  ]
}
```
