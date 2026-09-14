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

`assets/projects/fur-love-logo.webp` comes from the public logo at `https://furthelovepetsitting.com/assets/fur-love-logo.png`. `fur-love-dogs-original.jpg` is the unmodified photograph from `https://furthelovepetsitting.com/photos/dog-boarding.jpg`, retrieved September 14, 2026. Its EXIF orientation is deliberately preserved: the earlier WebP conversion discarded it and displayed the dogs sideways. The browser displays the original upright; the 3D wall now uses the logo rather than stretching this portrait into a landscape monitor. Any future optimization must preserve the displayed orientation.

`securewatch-preview.webp` is an optimized copy of Secure Watch’s existing product-vision illustration. It is labelled as an illustration, not a screenshot or a live camera feed. Operations and CodeCredit use typographic artwork without customer records, usage numbers or simulated dashboards.

## Showcase scope

Only Fur the Love Website, Fur the Love Operations, Secure Watch and CodeCredit are showcased. Product descriptions are grounded in the respective project sources. The public Fur the Love website has an external link. The Operations Center is private; other public demo URLs have not been verified, so the remaining cards offer expandable project details and a project-specific contact route. Existing enquiry text is preserved when visitors switch projects.

## Validation for the workshop upgrade

Browser checks covered desktop (1440×900 and the default desktop viewport), tablet (768×1024), and phones (390×844 and 360×740). Verified section navigation, mobile menu close/Escape, selected service transfer, required details, clipboard request content, motion toggle, loaded project imagery and absence of horizontal overflow. The focused showcase adds checks for upright photo rendering, four-project scope, expandable details, project enquiry prefill and preserving existing messages. The mobile motion control is inside the menu so it cannot obscure project cards. Fixture checks for the base workshop verified initial reduced-motion mode, missing Three.js fallback, and readable content/direct email without JavaScript.

Device sizes are browser viewport tests, not physical iOS/Android hardware tests. Email delivery depends on the visitor sending the prepared draft; no live service request was sent during testing. This is a static site and has no automated backend delivery integration.
