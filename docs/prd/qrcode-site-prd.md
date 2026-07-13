# QR Code Site PRD

## 1. Product Summary

Build a lightweight QR code generator website deployed on Cloudflare Pages or Workers. The site is reached through a custom domain, and its primary job is to convert user-entered plain text or JSON into a downloadable QR code.

MVP scope is intentionally narrow:

- Generate QR codes from plain text.
- Generate QR codes from valid JSON.
- Preview the QR code instantly in the browser.
- Download the result as PNG or SVG.
- Copy the QR image or encoded content where browser support allows.

Out of scope for MVP:

- Image upload or image-to-QR generation.
- User accounts.
- Saved history.
- Short links.
- Analytics.
- Batch generation.
- Payment or admin systems.

## 2. Goals

- Let a user generate a QR code in less than 10 seconds after opening the site.
- Keep the app cheap to host and simple to maintain.
- Make JSON input safer by validating and formatting it before generation.
- Support custom domain deployment through Cloudflare.

## 3. Target Users

- Individual users who need occasional QR codes.
- Small teams that need a simple internal QR tool.
- Developers or operators who need to encode JSON payloads into QR codes for testing, devices, labels, or handoff flows.

## 4. Core User Flow

1. User opens the custom domain, for example `https://qr.example.com`.
2. User chooses `Text` or `JSON` mode.
3. User enters content.
4. In JSON mode, the site validates and optionally formats the JSON.
5. The QR preview updates after the content is valid.
6. User adjusts basic options if needed.
7. User downloads PNG/SVG or copies the QR result.

## 5. Functional Requirements

### 5.1 Domain And Deployment

- The production site should support a custom domain through Cloudflare.
- Recommended MVP hosting: Cloudflare Pages for the static web app.
- If server-side APIs are added later, use Pages Functions or a Worker.
- The UI should show the current site domain in a small settings area, but domain binding itself is handled in Cloudflare, not inside the app.

### 5.2 Input Modes

Text mode:

- Accept free-form plain text.
- Preserve line breaks.
- Show character count.
- Generate as long as content is non-empty.

JSON mode:

- Accept raw JSON.
- Validate before generating.
- Show a clear inline error when JSON is invalid.
- Provide a `Format JSON` action.
- Generate from the normalized JSON string after validation.

### 5.3 QR Generation

- Use the `qrcode` npm package from `soldair/node-qrcode` as the generation library candidate.
- Generate in the browser for MVP to reduce backend needs and latency.
- Support error correction level choices: `L`, `M`, `Q`, `H`.
- Default error correction: `M`.
- Support foreground and background color options.
- Support output size option, default `512px`.

### 5.4 Preview And Export

- Show a live QR preview beside the editor on desktop and below the editor on mobile.
- Export PNG.
- Export SVG.
- Copy encoded content.
- Copy image when browser Clipboard APIs allow it; otherwise show a fallback message.

### 5.5 Empty And Error States

- Empty input: show a calm placeholder preview and disable export actions.
- Invalid JSON: keep the last valid QR preview if available, but show the validation error and disable export for the current invalid content.
- Oversized content: warn that dense QR codes may be hard to scan, and recommend shortening content.

## 6. Non-Functional Requirements

- First screen should load quickly on Cloudflare Pages.
- QR generation should happen without sending input content to a server in MVP.
- The UI should work on desktop and mobile.
- Generated QR codes should be scannable with common mobile camera apps.
- No tracking or analytics in MVP unless explicitly added later.

## 7. Recommended Architecture

MVP recommendation: Cloudflare Pages static app.

- Frontend: Vite + React or plain TypeScript.
- QR library: `qrcode`.
- Styling: small local CSS or Tailwind if the project already chooses it.
- Deployment: Cloudflare Pages with a custom domain.

Possible future expansion:

- Pages Functions or Worker API for server-side preset sharing.
- KV for saved presets or public templates.
- D1 for user-owned history if accounts are introduced.

## 8. Key Screens

MVP has one main screen:

- Header with product name and current domain.
- Mode switch: Text / JSON.
- Editor area.
- QR preview area.
- Compact options row.
- Export actions.

No landing page is needed for MVP. The tool itself should be the first screen.

## 9. Acceptance Criteria

- A user can open the site and generate a QR code from plain text.
- A user can paste valid JSON, format it, and generate a QR code.
- Invalid JSON blocks generation and shows an understandable error.
- The generated QR can be downloaded as PNG and SVG.
- The app can be deployed to Cloudflare Pages and configured with a custom domain.

## 10. References

- `soldair/node-qrcode`: https://github.com/soldair/node-qrcode
- Cloudflare Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Cloudflare Workers custom domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Cloudflare Pages Functions bindings: https://developers.cloudflare.com/pages/functions/bindings/
