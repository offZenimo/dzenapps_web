# DzenApps static website (GitHub Pages ready)

This is a simple static website (no build step) with:
- Dark/light themes (default: dark)
- 3 languages (RU/EN/BE)
- Pages: Home, Products, About/Contacts, News, Terms, Privacy
- Social buttons prepared (currently disabled: "Soon")
- Email button: mailto:dzenapps@gmail.com

## Run locally
Just open `index.html` in your browser.

## Deploy to GitHub Pages
1) Create a GitHub repository (public).
2) Upload all files from this folder to the repo root (or push via git).
3) In the repository: Settings → Pages → Source: "Deploy from a branch" → Branch: `main` (or `master`) and `/ (root)`.
4) Save. GitHub will publish your site at the shown URL.

Optional: add a custom domain later in Settings → Pages.

## Customize
- Edit translations in `assets/i18n.js`
- Edit content in the HTML files
- Add real social links in `assets/app.js` (socialLinks structure)
