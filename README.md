# Build With Ronald

Static website published from this repository. The existing cinematic Three.js workshop remains the foundation; no framework, bundler or backend is required.

- `index.html`: service, project and contact content.
- `assets/site.js`: navigation, section progress and email request preparation.
- `assets/workshop.js`: workshop geometry, section camera compositions and demand-driven rendering.
- `assets/site.css` and `assets/workshop.css`: original base and workshop presentation.
- `assets/vendor/three.min.js`: the same Three.js r128 version previously loaded from cdnjs, now served locally. Its license header is preserved.

Run `node scripts/check.cjs` for syntax, asset, anchor and content-integrity checks, and `node scripts/request-check.cjs` for email encoding, required details, service selection and clipboard fallback checks. The request tests exercise the real handlers without sending email. Serve the repository with any static HTTP server to preview it; opening the HTML directly from disk can prevent WebGL textures from loading.

## Contact behavior

The form prepares a `mailto:` draft. It does not store information or submit requests to a server. Visitors send from their email app, or copy the request and use the displayed email address. No success message claims an email has been sent. Do not replace this with a fake submission confirmation.

## Portfolio asset sources

`assets/projects/fur-love-logo.webp` and `dog-boarding.webp` are optimized derivatives of the public brand and dog-boarding imagery at `https://furthelovepetsitting.com/assets/fur-love-logo.png` and `https://furthelovepetsitting.com/photos/dog-boarding.jpg`, retrieved for Ronald’s portfolio on September 14, 2026. These are project imagery, not screenshots of an application. The other project tiles use typographic artwork. Development concepts remain explicitly labelled.

## Validation for the workshop upgrade

Browser checks covered desktop (1440×900 and the default desktop viewport), tablet (768×1024), and phones (390×844 and 360×740). Verified section navigation, mobile menu close/Escape, selected service transfer, required details, clipboard request content, motion toggle, loaded project imagery and absence of horizontal overflow. Fixture checks verified initial reduced-motion mode, missing Three.js fallback, and readable content/direct email without JavaScript. Public destinations for Fur the Love, Clara Realty, Move With Tai and Guardians were opened; Clara’s public entry is a sign-in screen, not an anonymous dashboard demo.

Device sizes are browser viewport tests, not physical iOS/Android hardware tests. Email delivery depends on the visitor sending the prepared draft; no live service request was sent during testing. This is a static site and has no automated backend delivery integration.
