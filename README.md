# Build With Ronald

Static website published from this repository. The existing cinematic Three.js workshop remains the foundation; no framework, bundler or backend is required.

- `index.html`: service, project and contact content.
- `assets/site.js`: navigation, section progress and email request preparation.
- `assets/workshop.js`: workshop geometry, section camera compositions and demand-driven rendering.
- `assets/workshop-tour.js` and `.css`: the interactive five-station workshop explorer.
- `assets/workshop-items.js`: the shared catalogue connecting equipment, close-up cameras, labels and service/project routes.
- `assets/service-guide.js` and `.css`: service categories, accessible selection and result counts.
- `assets/project-guide.js` and `.css`: the four-project selector, related Fur the Love builds and project-fragment routing.
- `assets/workshop-info.css`: the personal introduction and native FAQ expanders.
- `assets/site.css` and `assets/workshop.css`: original base and workshop presentation.
- `assets/vendor/three.min.js`: the same Three.js r128 version previously loaded from cdnjs, now served locally. Its license header is preserved.

Serve the repository with any static HTTP server to preview it; opening the HTML directly from disk can prevent WebGL textures from loading.

## Interactive workshop

Open the workshop explorer to visit Repair, Business IT, Projects, Servers and Security. Select a station, use previous/next, drag the scene or use the rotation buttons, and reset the view when needed. Each station leads to the relevant services, project or preselected service request. Closing the explorer restores the page position and opener focus; following a link moves focus to its destination.

Equipment hotspots and the matching text controls open close-up views of the laptop, phone, workstation, router, server connections and security technology. The shared equipment catalogue keeps each item's camera, description and enquiry route together. The Projects station has exactly four monitors: Fur the Love Website, Fur the Love Operations, Secure Watch and CodeCredit. Selecting a project provides a close-up and a route to its card in the showcase.

The project selector offers All four, Fur the Love, Secure Watch and CodeCredit. Fur the Love shows the public website and private operations software together, with a short explanation of their relationship. The other project filters expand a single build for closer reading. Explorer handoffs and project URL fragments reveal the appropriate group; navigation to other sections preserves the visitor's selection. Every project remains available without JavaScript.

The service guide filters the original seven services into Device repair, Business IT, Websites & software, and Servers & security. All services restores every card. Selection uses pressed-state buttons and a live result count. Explorer links select the matching category, and the complete service list remains available without JavaScript. The process chapter adds a personal introduction and three native FAQ expanders covering local/remote arrangements, uncertain diagnoses and scope/pricing.

The scene renders on demand for camera movement, pointer interaction, texture loading and resizing, then stops after movement settles. Rendering suspends in hidden tabs. Reduced-motion mode makes camera changes immediate, and mobile pixel density is capped. If WebGL becomes unavailable, the explorer closes and the regular page remains usable.

## Contact behavior

The form prepares a `mailto:` draft. It does not store information or submit requests to a server. Visitors send from their email app, or copy the request and use the displayed email address. No success message claims an email has been sent. Do not replace this with a fake submission confirmation.

## Portfolio asset sources

`assets/projects/fur-love-logo.webp` comes from the public logo at `https://furthelovepetsitting.com/assets/fur-love-logo.png`. `fur-love-dogs-original.jpg` is the unmodified photograph from `https://furthelovepetsitting.com/photos/dog-boarding.jpg`, retrieved September 14, 2026. Its EXIF orientation is deliberately preserved: the earlier WebP conversion discarded it and displayed the dogs sideways. The browser displays the original upright; the 3D wall now uses the logo rather than stretching this portrait into a landscape monitor. Any future optimization must preserve the displayed orientation.

`securewatch-preview.webp` is an optimized copy of Secure Watch’s existing product-vision illustration. It is labelled as an illustration, not a screenshot or a live camera feed. Operations and CodeCredit use typographic artwork without customer records, usage numbers or simulated dashboards.

## Showcase scope

Only Fur the Love Website, Fur the Love Operations, Secure Watch and CodeCredit are showcased. Product descriptions are grounded in the respective project sources. The public Fur the Love website has an external link. The Operations Center is private; other public demo URLs have not been verified, so the remaining cards offer expandable project details and a project-specific contact route. Existing enquiry text is preserved when visitors switch projects.

## Validation

Run these checks from the repository root:

- `node scripts/check.cjs`: script syntax, local assets, anchors, labels, four-project scope and original photo orientation.
- `node scripts/request-check.cjs`: request validation, email encoding, service/project selection, copy content and clipboard fallback.
- `node scripts/service-guide-check.cjs`: category filtering, accessible state, reset and explorer selection integration.
- `node scripts/project-guide-check.cjs`: four-project filtering, the Fur the Love pair, accessible state, public selection, direct project URLs and hidden-fragment navigation.
- `node scripts/workshop-check.cjs`: real Three.js scene execution with mocked rendering, demand-mode settling, motion preferences, mobile density, tab visibility and WebGL loss/restoration.
- `node scripts/tour-check.cjs`: station controls, request/category routing, drag behavior, native dialog cleanup and focus/scroll restoration.

Equipment and project-browser checks passed at desktop 1440×900, tablet 768×1024, portrait phones 390×844 and 360×740, and landscape 844×390. Verified projected targets, item selection, close-ups, actual scene dragging, the item picker, station reset, keyboard wrapping, Escape, project filtering and destination focus, paired Fur the Love builds, exact equipment-service preselection, project enquiry prefill/copy, and retained upright photo dimensions. Local fixtures verify reduced-motion startup, missing WebGL and script-free access to all seven services and four projects. The six automated checks cover all 12 equipment routes, rendering lifecycle and guarded asynchronous focus restoration.

These sizes are browser viewport tests, not physical iOS/Android hardware tests. The `mailto:` contact flow remains unchanged: visitors send the prepared draft themselves, and tests do not send live service requests. This static site has no backend delivery integration.
