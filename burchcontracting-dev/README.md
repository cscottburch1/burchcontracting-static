# Burch Contracting - Development Site

Static website for Burch Contracting built with Vite and Tailwind CSS.

## 🚀 Auto-Deployment

This repository is configured for automatic deployment to Hostinger.

- **Live URL**: https://dev.burchcontracting.com
- **Deployment**: Automatic on push to `main` branch
- **CI/CD**: GitHub Actions

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup instructions.

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
burchcontracting-dev/
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
- **Deployment**: GitHub Actions → Hostinger FTP

## 📝 Making Changes

1. Make your changes locally
2. Test with `npm run dev`
3. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
4. GitHub Actions will automatically build and deploy to Hostinger
5. Check deployment status in the **Actions** tab on GitHub

## 🔧 Configuration

- **Vite Config**: See [vite.config.js](vite.config.js)
- **Tailwind Config**: Configured via `@tailwindcss/vite` plugin
- **Deployment Workflow**: See [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

## 📚 Resources

- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
