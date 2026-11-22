# ShopLedger guidance

## Stack
- Node.js CommonJS application using Express 4 and body-parser JSON middleware.
- Browser UI is static HTML, CSS, and JavaScript in `public/`.
- Application data is stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/customers.js` — customer and Khata settlement endpoints.
- `routes/orders.js` — order listing, lookup, placement, and cancellation endpoints.
- `routes/products.js` — product catalog and coupon listing endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, validation, discounts, and active coupon listing.
- `lib/dates.js` — today, date-key normalization, and fiscal-year helpers.
- `lib/inventory.js` — product lookup, sellable stock checks, stock reservation/release, and summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer lookup, Khata charges/reversals, and settlements.
- `lib/orders.js` — order add/get/cancel/list operations.
- `lib/pricing.js` — subtotal, coupon discount, and checkout totals.
- `lib/reports.js` — dashboard summary and GST reconciliation calculations.
- `lib/store.js` — synchronous JSON database read/write and audit-log append.
- `lib/tax.js` — item GST rate lookup and CGST/SGST split.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test` from the repository root.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js`; `lib/tax.js` only if truly needed.
