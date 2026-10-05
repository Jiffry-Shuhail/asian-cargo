# Asian Cargo — customer invoice modernization specification

2026-10-05. Latest authoritative clarification: fewer than 5 staff, fewer than 10 shipments/month; manual authorized clone unlocking after customer invoicing; editable weights subject to locks; React frontend with Ant Design and restrained motion. This document supersedes conflicting workload estimates and unresolved invoice-unlock questions in CONFIRMED-DESIGN.md. Its other confirmed rules remain applicable.

This is a design/audit update on modernization/security-foundation, not a major rewrite or deployment. Live Firebase tools remain unavailable. Repository handlers demonstrably use Firestore (admin.firestore in customer, shipment, quotation, clearing and other routes). No Realtime Database operations were found in the reviewed handlers; this does not prove the live project has no Realtime Database. No live samples, rules, indexes, functions or billing metrics were inspected.

## Architecture decision ADR-003

Recommend React + TypeScript + Vite, Ant Design components and ConfigProvider design tokens, CSS Modules for layouts, Motion for focused transitions, and animated SVG icons. Use static Firebase Hosting, Firebase Authentication and a small HTTPS Functions API with existing Firestore. Electron can remain a thin shell with restricted print/download IPC. No extra database, Redis, microservices or always-on backend.

| Choice | Rendering/deployment | Operational fit | Decision |
|---|---|---|---|
| React + Vite | Static bundle, client routing and authenticated API calls; Hosting rewrite to index for app routes | Simple browser/Electron reuse; runtime shipment IDs; no SEO need in private screens | Recommended |
| Next.js static export | Build-time HTML and client fetching; no runtime Next server | Can work using a static invoice shell/query IDs, but unknown dynamic route IDs need special routing design | Feasible, limited extra value here |
| Next.js server deployment | Request-time rendering, Server Actions, request-dependent routes/cookies and other runtime features | Adds server ownership/cost for rendering this internal app | Use only if an actual server-rendering requirement emerges |

Next static export does not support server features such as Server Actions, ISR and request-dependent handlers; default image optimization also requires an alternative. Next is not inherently expensive, but its server features are unnecessary for this scope. Vite's build produces assets; its development/preview server is not the production backend. Keep secrets out of all frontend build variables. Use an approved HTTPS/custom-protocol Electron origin and narrow IPC; never package Admin credentials. Preserve current PDF/Excel output fixtures while replacing the DOM-scraping editor.

Backend comparison: local PostgreSQL + API offers SQL constraints and LAN operation but requires data migration, equipment, UPS, backup and patching; consider it only if offline editing becomes essential and a maintained server exists. Functions + Firestore retains current data and supports shared remote work with low idle costs. Optional Electron + that same API preserves file handling; it is not a second backend. 2nd-gen Functions use managed Cloud Run infrastructure internally; no standalone Cloud Run deployment is proposed.

## What is confirmed and what is not

Confirmed: verification freezes ORIGINAL; independent clones; clearance freezes all business data; authorized users may manually unlock an invoiced clone; issued customer invoice snapshots must remain unchanged; editable weight inputs; default LKR and privileged currency changes; owner-only application billing; scoped client role administration.

Still unresolved: exact per-tonne unit/formula and meanings of numeric defaults; permission assignees; invoice correction/replacement numbering and cancellation/credit-note rules; offline requirement; clearance checklist and retention policy. Do not ask again whether cloning/unlocking or small workload is required. Manual unlock is now confirmed, but its reason/review policy below is a recommendation.

## Module audit and completion backlog

Classification is source-based. No module is labelled “complete and working” without runtime evidence. No whole module was proven mocked; placeholders are identified individually. Evidence paths refer to routes/js unless prefixed public.

| Module / classification | Current → missing behavior → recommendation | Business rule / task / acceptance test |
|---|---|---|
| Authentication/access: partial | Firebase sessions + new coarse Access guard → configurable roles/owner segregation absent → replace coarse grants through shared policy | Existing middleware/access.js; BR-19 scoped grants; self-escalation denied |
| Exporters: partial | exporter.js reads/writes; syncShipment.js separate counter → transactional allocation absent → preserve exporter numbering with reservation/idempotency | BR-16; concurrent creates unique, retry returns same ID |
| Customers/pricing: partial | customer.js + public/app/js/customer/weightPricing.js persist customer defaults → schema/override history absent → typed pricing forms, retirement and revision checks | Invalid price/unit rejected; referenced customer cannot vanish |
| Products/categories/units: partial and broken update | products.js has CRUD/search; app.js /updateProducts baseline calls nonexistent function; alternate updateProducts calls collection.set → repair explicit document-ID contract | Update one product only; invalid IDs/fields rejected |
| Shipment preparation/drafts: partial; data-integrity defect | syncShipment.js saves maps/deletes draft before success → atomicity absent → transactional submit, private per-draft records | BR-03/07; injected failure preserves draft, repeated submit does not duplicate |
| Shipment listing: partial | shipment.js filters active after pagination/count → inconsistent pages → filter before pagination, capped cursor query | BR-08; counts/rows reconcile including inactive fixture |
| Weight/header editing: missing lock step | weightUpdate.js/updateShipmentHeader.js merge requests → revision and document locks absent → shared guarded service | Verified-original and cleared updates denied |
| Original/clone workflow: missing explicit business step | status-named maps in syncShipment.js → no separate verified original / clone revision identity → explicit document model | BR-13–15; clone A never mutates original/B |
| Commercial invoice: partial | public/app/js/shipment/Invoice.js calculates in browser, shipment.js trusts merges → authoritative formula/issue history absent | Separate from customer pricing; golden monetary fixtures required |
| Customer invoice: partial with calculation defects | CustomerInvoice.js builds/edits/PDFs; createCustomerInvoice overwrites nested array → stable IDs/snapshots/issue/unlock absent | First vertical slice specified below |
| Packing/unloading/delivery/collection reports: source implementations present, runtime unverified | public/app/js/shipment/{packinglist,unloading,deliveryReport,Collection}.js → immutable source/version exports unproven | Capture baseline fixtures; reconcile headers, cartons and pagination |
| Quotation: partial | quotation.js merge/list and browser UI → validation, lifecycle and error completion gaps | Handle absent vs existing IDs; failed writes give finite error response |
| Clearing module: partial | clearing.js persists records → not an atomic shipment clearance lock | Do not equate Clearing collection entry with confirmed final clearance; test parent lock transaction |
| Excel import: broken/incomplete prototype | readExcel.js logs file and returns fixed error → no validated persisted import | Preview/error rows/duplicate policy before commit; malformed input makes zero writes |
| User directory: partial | authentication.js listUsers, now filtered → pagination/admin lifecycle absent | Pagination and scoped user management, no owner privilege grants |
| Subscription: missing explicit feature | legacy SYSTEM/CONFIG incidental billing → owner lifecycle/audit absent | BR-18; suspension checked at commit, client cannot access controls |
| Dashboard/preferences: missing requested feature | no implemented versioned configurable dashboard demonstrated → scoped summary and preferences | Real metrics only, reset/version validation, keyboard use |
| Desktop output: partial/unverified | main.js electron-dl and embedded PDFs → platform print/download regression absent | Windows PDF preview/download/print acceptance; no privileged renderer APIs |

## Customer invoice: observed data and formulas

Evidence: public/app/js/shipment/CustomerInvoice.js, especially CustomerInvoice, makeCustomerInvoice, editCustomerInvoice, grandTotal and #customer-invoice-update; routes/js/shipment.js createCustomerInvoice.

The source is the UI-selected status-map entry, not a separately identified original/clone revision. Cartons group by customer. Customer master data supplies defaultWeight/defaultPacking (fallback 225 each), and goodsWeight matches product/category with a price and unit. Unit conversion uses Unit.reverse/scale. Rows charge quantity or allocated weight × price; packing charges carton count × packing rate; manually entered “others” amounts are summed. The browser scrapes contenteditable DOM cells and sends total plus customer rows; the backend merges the client payload without recalculation.

Additional confirmed code defects, not yet patched:
- INV-01: subsequent cartons for an existing customer add weight/carton IDs but skip quantityAdjustment (commented out). Product-specific charges can omit later-carton goods.
- INV-02: productweight is deducted from value.weight during allocation, then deducted again from thisWeight during rendering. A 100-unit weight with one matched product yields remaining 0, then displayed base weight -100. This is a direct arithmetic trace, not a live production reproduction.
- INV-03: matched-product allocation divides the changing remainder by the original product count, making allocation order-sensitive. No approved equal-allocation rule exists.
- INV-04: the customized branch adds custom rows to thisTotal but not the base row's amount. Initial displayed total can disagree with grandTotal(), which sums all amount cells after editing.
- INV-05: monetary input validation is client-side; backend accepts submitted totals and arbitrary nested data. No duplicate issue key, revision check or immutable customer-invoice version exists.
- INV-06: update button is disabled before request and restored only on success; error responses can leave it disabled. Use finally cleanup, preserve unsaved inputs and distinguish safe retry from new issue.

Rate trace remains distinct: syncShipment.js seeds freight='660' and valuePerTone='0.700'; commercial Invoice.js directly multiplies netWeight × valuePerTone and decomposes total into cost/freight/insurance. CustomerInvoice.js uses customer-specific defaults (225 fallbacks) and goodsWeight pricing; do not conflate these systems. End-user weight override does not establish that 660 or 0.700 is a weight. Actual stored configurations and historical currencies are unverified.

## Field-level invoice contract (proposed)

All edits require active account/subscription, current revision and applicable permission. Issued snapshots are never edited. Cleared parent blocks every mutation; ORIGINAL lock always wins. “Draft only” includes a new revision draft, not alteration of the old issue.

| Field | Source / mode | Editable by | Validation | Effect on total | Locked when |
|---|---|---|---|---|---|
| shipmentId/exporter/number | Selected shipment; automatic | Not free text; choose valid source | Existing authorized shipment | None directly | Draft binds source; rebind regenerates with confirmation |
| sourceDocumentId/revision | Explicit original/clone picker; automatic reference | invoice:generate | Same shipment, revision exists | Rebuild candidate lines | Issue; changing source never edits old issue |
| customerId/name/contact | Customer + carton grouping; snapshot default | invoice:override-contact for display fields | Stable customer ID, text limits, valid contact | None | Issue |
| invoice number/date | Server allocation/server issue time; proposed | No arbitrary number edit | Unique issue reservation; timestamp | None | Issue |
| descriptions | Source goods/line labels; default/manual | invoice:override-description | Length/allowed text; no HTML execution | None | Issue |
| actual source weight | Document revision; automatic | document:edit with weight permission through document service | Finite nonnegative, explicit unit | Regeneration may change amounts | Verified ORIGINAL / Cleared |
| chargeable quantity/weight | Derived default; explicit override | invoice:override-weight | Decimal precision, nonnegative, unit compatible, reason | quantity × rate | Issue |
| unit/conversion | Approved Unit schema; derived | finance:override-unit (proposed) | Compatible dimensions; no fallback guessing | Converts billing basis | Issue |
| weight rate | Customer goods/category/default pricing | invoice:override-rate (Finance suggested) | Nonnegative decimal, currency/basis, reason | quantity × rate | Issue |
| packing count/rate | Carton count + defaultPacking | invoice:override-packing | Count integer ≥0; rate decimal; reason for divergence | count × rate | Issue |
| other charge label/amount | Existing supported manual others rows | invoice:override-charge | Approved label, finite amount, reason; negative policy unconfirmed | Added amount | Issue |
| currency | LKR for new draft or approved configured value | financial-config:write / Finance | Supported currency; explicit unit/rate reset or conversion policy | Defines denomination, not automatic FX | Issue |
| line totals/grand total | Server calculator; calculated | Nobody directly | Decimal arithmetic, approved rounding version | Authoritative result | Issue snapshot |
| note | Manual | invoice:edit-note | Text length; sanitized output | None | Issue |
| override metadata | Before/after, reason, actor/time | Generated by server | Required reason, original default retained | Explain changes only | Append-only |

Proposed candidate total = sum(approved weight/quantity rows × rates) + sum(packing counts × rates) + sum(permitted others). No invented taxes or discounts. Block issue for missing unit mappings and unapproved calculation policies. Show frontend preview from the same calculator contract, but server recalculates at save/issue. Weight/rate limits must be business-approved, not arbitrary caps. Blank, NaN, Infinity, negative and mismatched-unit cases need explicit errors.

## Separate lifecycles and permission matrix

Shipment: Documentation → Verified → Cleared, as already specified. ORIGINAL: editable before verification, immutable afterwards. Clone control: EDITABLE → LOCKED_ON_ISSUE → EDITABLE_BY_AUTHORIZED_UNLOCK → LOCKED_AFTER_REVIEW. Names are proposed technical labels, not extra shipment stages. Clearance overrides all clone states.

Invoice: DRAFT → ISSUED. Proposed REVISION_DRAFT references a prior issue and can become a new ISSUED snapshot; whether old issue becomes SUPERSEDED, voided or requires a credit note remains unconfirmed. Do not introduce financial cancellation silently.

| Action / permission | Suggested assignees | Guard and audit |
|---|---|---|
| invoice:generate/read | Operations, Finance | Source authorized; draft generation persists source revision |
| invoice:override-weight/description | Authorized Operations, Finance | Explicit reason and old/new values |
| invoice:override-rate/charge/currency | Finance, authorized Client Admin | Delegation limits; approved units/currency |
| invoice:issue | Finance, authorized Client Admin | Recalculate, validate, idempotency, snapshot, clone lock in one transaction |
| clone:unlock-after-invoice | Finance, specifically delegated Client Admin | Nonblank reason, clone only, not Cleared; preserve issued snapshot |
| clone:review-relock | Designated reviewer/Finance | Current revision reviewed; audit; invoice divergence checked |
| invoice:create-revision | Finance | Keep previous issue; business reissue policy must be approved before issue |
| invoice:print/download | Authorized staff | Snapshot-level read/export access and subscription policy |
| financial-config:write | Authorized Admin/Finance | Affects future defaults only |
| subscription:* | Owner only | Never client-delegable |

Unlock opens the clone editor, not the issued invoice. Edits advance clone revision and display “Source changed since invoice vN”. Relocking requires review; propose blocking clearance while affected issued invoices have unresolved divergence. This clearance validation needs confirmation. Super Admin has no verified-original or final-clearance override.

## Persistence, queries and cache invalidation

Retain the proposed Shipments/Documents/Revisions, exporter counter/reservations, Access/Roles, AuditEvents and owner subscription separation. Add Shipments/{id}/Invoices/{invoiceId} with customerId, sourceDocumentId, sourceRevision, state, revision and current issued version pointer; Versions/{versionId} stores immutable inputs, currency/rates/rounding/results plus rendered artifact hash/templateVersion. Printed issue uses its exact version, never live customer defaults.

Draft revisions and immutable issued versions are different. Persist idempotency keys scoped to actor/action/source/customer, request hash and result. In one issue transaction read live role/access/subscription, shipment lock, source/current draft revisions and uniqueness reservation; write issue snapshot, draft state, clone lock and audit. Unknown required fields or competing edits return 409/validation error without partial changes. Original issuance cannot mutate frozen ORIGINAL content. Use deterministic render input and retain issued PDF if exact byte-identical re-download is required.

Firestore does not enforce foreign keys: validate source/customer/parent references in service transactions. All direct client business writes denied under API-only proposal; IAM and service code protect Admin SDK access. Share one lock service across legacy endpoints until retired, background jobs and bulk actions. Never leave a legacy merge endpoint able to bypass new locks.

Indexes: invoices by customerId+issuedAt DESC for customer history, state+updatedAt DESC for draft queues when collection-group queries are needed; scope filters must precede these if installations later expand. Within a shipment use bounded nested queries. Existing exporterId/state/createdAt shipment indexes remain proposals pending actual query plans. Large snapshots excluded from indexing; stable ID tiebreaker cursors; avoid full reads of invoice payloads for dashboard cards.

At this workload, prefer request-time bounded queries/aggregations over background analytics infrastructure. Session-memory query cache, 30–60s for operational lists, 1–5m for masters. Keys include user/scope, entity ID, filters and revision. On edit invalidate document, draft preview and relevant totals; on verify/clear invalidate parent/document permissions and all shipment views; on issue invalidate invoice history, dashboard and clone control; on role changes clear user's protected caches/refetch access. Server always validates latest grants/locks/subscription at commit, regardless of cache TTL. No Redis. Show pending vs persisted saves distinctly.

## Actual-workload monthly estimate

Budget assumptions at an upper planning bound of 5 users/10 shipments (actual is below this): 1 original + 3 clones/shipment; 20 saved edits/document; up to 5 customer invoices/shipment; bounded master/query reads. Assume 2,000 DB reads/day, 500 writes/day including audit/revisions; 10,000 function calls/month averaging conservative 0.4 billed seconds at 1 CPU/0.5GiB, zero minimum instances. Retained average database+indexes 0.5GiB, file storage 2GiB, downloads 1GiB/month, Hosting transfer 2GB/month with 1GB assets, extra API egress 0.2GiB. Logs 0.1GiB at default retention, one scheduler job, seven daily backups equivalent to 3.5GiB. Data history can grow independently of shipment count.

Using the same illustrative us-central1 rates, unused shared free allowances and evenly distributed daily usage (actual location still unknown):

| Item | Expected modeled USD/month |
|---|---:|
| Reads/writes/storage within Firestore free quota | 0.00 |
| 4,000 CPU-seconds / 2,000GiB-seconds / 10k calls within compute allowances | 0.00 |
| Hosting within daily transfer/storage allowances | 0.00 |
| Auth email/password or Google; no SMS/SAML | 0.00 |
| File storage 2 × $0.02 and downloads 1 × $0.12 (no bucket free credit assumed) | 0.16 |
| Seven daily database backups, 3.5 × about $0.03 | 0.11 |
| API egress 0.2 × assumed $0.12 | 0.02 |
| Logs/scheduler within available allowances | 0.00 |
| Build/artifacts/file operations allowance, not measured bill | 0.50–2.00 |
| Illustrative total | 0.79–2.29 |
| Practical budget reserve | $1–5/month |

Approximate LKR reserve Rs.336–1,678/month using 335.60/USD (Seylan selling rate reported 2026-10-05, source in CONFIRMED-DESIGN.md). No guaranteed zero bill. Excludes development/support, equipment, tax/card FX, unexpected retained files, abusive traffic and paid messaging. Blaze billing required for hosted Functions. Free database quotas are daily; compute allowance is shared at billing-account level. Other projects can consume it. Alerts do not stop usage; service-specific spend caps are not universal Firestore/Storage caps.

Local SQL cash budget remains hardware/UPS depreciation + power + backup + maintenance, not shipment-based pricing; no new supplier quote obtained. With existing machine its cash cost may be low, but backend/data rewrite and recovery effort exceed the benefit at this workload. Cloud + optional Electron is recommended unless required offline work changes the decision. Measure reads and output bytes after the first slice before adding any paid optimization.

Current official pricing checked 2026-10-05: https://firebase.google.com/pricing ; https://cloud.google.com/firestore/pricing ; https://cloud.google.com/run/pricing . File/log/scheduler and FX source references remain in CONFIRMED-DESIGN.md. Rates are region/bucket-dependent; do not present US illustration as verified asian-cargo billing.

## Representative screen design proposal

Design specification, not an implemented React screen. Ant Design token palette: navy navigation, teal primary action, neutral light surface and charcoal dark surface, restrained amber warning. Consistent 8px spacing, readable tabular numerals, visible focus and text labels beside lock icons. No 3D financial charts.

| Dashboard region | Components and content | Interaction |
|---|---|---|
| App shell | Layout/Sider/Menu, breadcrumb, search, theme toggle, profile | Collapsible keyboard-accessible navigation; owner area absent for client roles |
| Header | “Operations overview”, date filter, New shipment | Scope/freshness visible; no invented live figures |
| Summary row | Statistic cards: Documentation, Verified, Draft invoices, Cleared | Click to identically filtered table; shallow depth only |
| Main panel | Table of recent shipments with exporter, number, milestone, documents, updated time | Search, filter, 20-row cursor pages, saved columns/density |
| Side panel | Review queue + recent audit activity | Source changed, needs review, permission-safe links |
| Layout control | Approved widget selection/order and reset | Versioned personal settings; no arbitrary data query builder |

| Customer invoice region | Proposed Ant Design composition | Business feedback |
|---|---|---|
| Header | Breadcrumb “Shipment → Documents → Customer invoice”, state Tags, source revision | ORIGINAL verified / clone editable / invoice issued are separate labels |
| Source strip | Select customer + document, read-only source revision/date | Preview regeneration warns before discarding manual overrides |
| Main editor | Form + Table grouped Weight, Packing, Other supported charges | Number inputs with unit/currency; calculated vs overridden labels |
| Right summary | Card showing subtotals, currency, total and validation summary | Totals not directly editable; discrepancy blocks issue |
| History drawer | Timeline + before/after comparison | Actor, reason, source version and issue version |
| Action bar | Save draft, Preview, Issue; issued view Print/Download | Permission+lock explanation for unavailable actions |
| Clone action | “Enable clone editing” reason modal, then Review and relock | Issued invoice stays unchanged; stale-source warning persistent |

Desktop uses editor/summary split; tablet stacks summary; mobile uses labelled line-item cards with totals and explicit edit drawer, not a wide spreadsheet. Print template is separate A4 layout with no navigation/motion; repeating headers, page numbers and long-line wrapping. Maintain PDF, Excel and Electron download behavior through adapters. Confirm actual printer margins during testing.

Motion: 120–200ms transitions for drawer/state feedback, small icon motion on successful save, optional decorative depth on header/cards. Respect prefers-reduced-motion; never animate numeric values through misleading intermediate totals. Error focus goes to first invalid field, issue/unlock modals restore focus, status announcements use accessible live text. No paid icon dependency is required.

## Updated BRD, migration and milestone acceptance

Add BR-21: explicit clone unlock after invoice with required reason/audit, never original/cleared override. BR-22: immutable issued customer-invoice versions linked to exact source revision. BR-23: server-derived invoice draft with permission-controlled field overrides. BR-24: React/Ant Design browser+Electron output parity. BR-25: cost measured against under-5-user/10-shipment profile. Existing BR-01–20 continue, interpreted with this latest clarification.

Priority P0: current unsafe merge paths and calculation defects; collect approved example invoices and lock semantics. P1: customer-invoice vertical slice. P2: remaining catalog/shipment/quotation/clearing modules. P3: configurable dashboard/motion after correctness. No unrelated ERP modules.

Phases keeping the old app usable:
1. Add shared typed calculator/schema and permission/transaction service in emulator-only development. Do not change production formulas from inferred meanings.
2. Build React shell and invoice screen beside legacy UI; route only the new slice through guarded API. Adapt old writers to the same guards before any real mixed use.
3. Migrate a small synthetic fixture; compare old/new PDF and Excel output and explicitly explain intentional bug corrections. No production data required.
4. After architecture/scope approval and authenticated access: inspect schemas, approve backup/export, dry-run legacy customerInvoice array to stable invoice IDs/versions. Preserve source labels/raw values; quarantine missing currency/units instead of guessing.
5. Reconcile per-customer rows, cartons, totals and issued history. Freeze legacy writers for cutover; retain backup and replay journal for rollback. Do not dual-write without a reconciliation design.
6. Expand modules progressively; deploy only with explicit approval.

Concrete first milestone: one source clone + one customer invoice from React selection through authorized draft calculation/overrides, transactional issue, immutable persistence, PDF preview/print/download and manual clone unlock/review. Emulator-only; no paid deployment. Include an ORIGINAL read-only case and Cleared rejection case.

Acceptance gates (proposed tests, not executed):
- Two cartons/same customer include all products; weight allocation conserves approved total and is order-independent; displayed total equals server total before/after edit.
- Golden approved weight/packing/other calculations match exactly at decimal boundaries; zero quantity, missing unit, bad input and excessive precision fail appropriately.
- Unauthorized override fields, role escalation and direct database writes are denied; UI hiding alone is not sufficient.
- Simultaneous draft edits yield conflict; duplicate issue returns same result; altered retry payload is rejected.
- Changing customer defaults/source after issue does not change saved issue or its rendered artifact.
- Clone unlock requires permission+reason and audit; edits affect no sibling/original; relock checks current revision.
- Clearance/suspension racing with write yields serial committed-or-rejected result; no partial issue or orphan number.
- PDF/Excel fixture comparison and actual Windows print/download tests; 360px mobile, keyboard and reduced-motion checks.

Inspection/testing record: source reads, code-path arithmetic trace, framework/pricing documentation and whitespace validation only. No new runtime/emulator/browser/printing test was executed in this documentation stage. Earlier 11 authorization tests do not validate this proposed workflow. Firebase production access remains blocked. No infrastructure cost incurred.

Framework references checked 2026-10-05:
- https://vite.dev/guide/static-deploy.html
- https://nextjs.org/docs/app/guides/static-exports
- https://ant.design/docs/react/customize-theme/
