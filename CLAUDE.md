# Mira Autowellness Website

Build-free static site (HTML/CSS/vanilla JS, no framework, no build step). Header/footer are duplicated across every HTML page (no templating) — edit all pages when changing them.

## Git / Deployment (IMPORTANT)

This project is connected to GitHub → Netlify auto-deploy:
- Remote: `git@github.com:Benfriess/Mira-Autowellness.git` (branch `main`)
- Netlify watches `main` and rebuilds automatically on every push — there is no separate build step, it just serves the pushed files.
- Push access is via a dedicated SSH key (`~/.ssh/id_ed25519_github`, configured in `~/.ssh/config` for `github.com`). Already authenticated — do not attempt to re-auth or touch GitHub account/SSH-key settings.

**Standing instruction — the user wants every finished change kept in sync automatically:**
After completing a meaningful, verified change to the site (content edit, new page, asset swap, bugfix, etc.), commit and push it to `origin/main` without asking for confirmation each time — the user has explicitly pre-authorized this ongoing workflow (2026-07-02). This keeps the customer's live Netlify site current automatically.

- Write clear, specific commit messages (German, matching prior commit style) describing *what* changed and briefly *why*.
- Still exercise judgment: don't push obviously broken/half-finished work, don't push mid-task (e.g. partway through a multi-file rename) — finish the coherent unit of work first, verify it in preview, then commit+push.
- Do NOT force-push, rewrite history, or touch branches other than `main` without being asked.
- `.gitignore` excludes `.DS_Store` and `.claude/` (local tooling, not site content) — keep it that way.
- Real project path contains a non-breaking space (`Dokumente ` before `/Claude/Website`) — from Bash use the glob `cd /Users/ben/Documents/Dokumente*/Claude/Website`; run git commands there directly (that IS the actual working tree / repo root, not a copy).
