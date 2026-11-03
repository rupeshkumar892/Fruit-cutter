# Fruit Cutter — Browser + Installable Android

This project uses one HTML/CSS/JavaScript codebase.

## Browser
```bash
npm install
npm run dev
```

For production:
```bash
npm run build
npm run preview
```

## Install as a mobile app (PWA)
Deploy the built site over HTTPS. On Android Chrome, use **Install app / Add to Home screen**. The manifest and service worker are included.

## Build a real Android APK/AAB with Capacitor
Install Android Studio and an Android SDK first.

```bash
npm install
npm run build
npx cap add android
npx cap sync
npx cap open android
```

Then use Android Studio to build an APK or signed AAB.

## Notes
- Responsive portrait/landscape layout.
- Touch and mouse/pointer controls.
- No browser Fullscreen API, avoiding the permissions-policy error encountered in embedded previews.
- Original Fruit Cutter branding/assets; not a copy of Fruit Ninja branding or copyrighted game assets.
