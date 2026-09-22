# Burch Contracting - Development Site

Static website for Burch Contracting built with Vite and Tailwind CSS.

## Deployment

**Deploys are run by hand. Pushing to `main` does not deploy.**

- **Live URL**: https://burchcontracting.com
- **Served by**: a Cloudflare Worker (`cloudflare/worker.js`) from `dist/`
- **Deploy workflow**: `.github/workflows/cloudflare.yml`, triggered deliberately

Automated deploy-on-push has taken this site down before, which is why the
trigger is manual. Hostinger no longer receives a copy: the FTP workflow was
deleted in Phase 4, so rolling back means `wrangler rollback` to a previous
Worker version, not removing the Worker route.

Read `docs/RUNBOOK.md` before deploying. Its first item — this repository is
never squash- or rebase-merged — matters before you merge anything.

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup instructions.

## 💲 Pricing

`src/js/calculator-config.js` is the single authoritative source for all
pricing on this site. See [PRICING.md](PRICING.md) before changing any
dollar figure, rate, or the overhead & profit percentage.

## 📦 Development

### Prerequisites
- Node.js 20 or higher
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions deployment workflow
├── public/
│   └── images/              # Static images
├── src/
│   ├── css/
│   │   └── main.css        # Tailwind CSS
│   └── js/
│       └── main.js         # JavaScript
├── index.html              # Homepage
├── services.html           # Services page
├── about.html              # About page
├── contact.html            # Contact page
├── package.json
├── vite.config.js
└── DEPLOYMENT.md           # Deployment setup guide
```

## 🛠️ Tech Stack

- **Build Tool**: Vite 8
- **CSS Framework**: Tailwind CSS 4
- **Hosting**: Cloudflare Workers + D1 (contact form and leads admin)
- **Deployment**: `.github/workflows/cloudflare.yml`, run deliberately

## 📝 Making Changes

1. Make your changes locally
2. Test with `npm run dev`
3. Build and check before committing:
   ```bash
   BUILD_ENV=production npm run build
   npm run check-build
   node scripts/dates-set-by-head.mjs
   ```
4. Open a PR. **Merge it with a merge commit — never squash or rebase**
   (`docs/RUNBOOK.md` explains what squashing does to every page's content date)
5. Deploy deliberately from the **Actions** tab; it does not happen on push

## 🔧 Configuration

- **Vite Config**: See [vite.config.js](vite.config.js)
- **Tailwind Config**: Configured via `@tailwindcss/vite` plugin
- **Deployment Workflow**: See [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

## 📚 Resources

- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
