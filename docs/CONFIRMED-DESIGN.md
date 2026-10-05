# Asian Cargo — confirmed requirements and budget-conscious design

Updated 2026-10-05. This document supersedes the architecture, role and workflow proposals in MODERNIZATION.md where they conflict. The source audit remains valid. This is a reviewable design, not a deployed implementation. No production data, paid service or migration was changed.

## 1. Confirmed requirements and access status

The owner confirmed: collaborative documentation with administrator-controlled permissions; immutable ORIGINAL after verification; independent named clones with their own revisions; irrevocable business-data lock on clearance; exporter-dependent numbering; LKR default with Admin/Finance currency changes; owner-only discretionary application subscription management; configurable client roles; preservation of practical Electron document handling; limited budget. Offline editing is not confirmed.

Project identifiers supplied by the owner:
- Project: asian-cargo; number: 904246648379.
- Web App ID: 1:904246648379:web:ac5590fbf7f5ffeaeb461e.
- Supplied Realtime Database endpoint: https://asian-cargo.firebaseio.com.

These identify the intended project but are not authentication credentials. No Firebase tools were exposed, and plugin discovery returned no matching available plugin. Live project existence/configuration, Firestore location, rules, indexes, Auth providers, deployed functions, billing plan and usage remain unverified. The supplied Realtime Database URL is not a Firestore endpoint; repository business handlers use admin.firestore(). Do not migrate databases just because a Realtime Database URL was supplied. More integrations may be available in the plugin directory, but no connection is claimed here.

Next read-only inspection, once authenticated access exists: project/database metadata and locations; rules/index definitions; deployed function metadata; Auth provider configuration without user export; daily usage metrics; at most a few redacted schema samples per evidenced collection. Assess query indexes and read count before fetching samples. No full scans or customer PII in reports. A service-account private key is not requested in chat.

## 2. Additional repository findings

Source reviewed: baseline 126589b961fe28079d38f2c41dcadda2c5c94da9 plus security foundation in draft PR #1, remote commit 5823ef78e8734b199140c8019d811fda36dca155.

| Finding | Evidence | Implication |
|---|---|---|
| Exporter numbering is client-influenced | routes/js/syncShipment.js addShipment: key = exporter + ' SHIPMENT ' + shipment; client index selects branch; separate Exporter.shipment update | No safe concurrent allocation or retry identity; no annual reset/prefix configuration observed in this flow; gaplessness not established |
| State and document content are conflated | syncShipment.js: status array, activeStatus, status-named carton maps | Legacy labels need manual mapping to original/clone, not automatic conversion to workflow states |
| Freight default 660 | syncShipment.js sets freight='660'; Invoice.js creates/reset UI freight to '0' near line 973 and stores invoice.freight | Defaults conflict; 660 is a freight field default, not proof of currency or intended charging formula |
| Rate default 0.700 | syncShipment.js valuePerTone; Invoice.js near 863–909 | Calculation multiplies netWeight by rate directly; no /1000 conversion at those calculation sites |
| Rounding changes totals | Invoice.js near 88–110 and 894–909 | Unit price rounds to 2 decimals and floors at 0.01; total recalculated from rounded quantity and unit price. This is observed, not approved |
| CIF output is a decomposition | Invoice.js near 342–360 | Cost = stored grand total minus insurance minus freight; do not add freight again without confirming meaning |
| Invoice flag is not a backend lock | Invoice.js enableInvoiceControl hides controls; shipment.js createInvoice/createCustomerInvoice merge payloads | isInvoiced does not implement immutable originals, cleared shipments or revision control |
| Shipment scope appears shared | shipment.js collection queries filter exporter; no tenant/organization/assignedTo enforcement found in reviewed routes | One installation/shared shipment pool is inferred, not a proven multi-tenant system. Pending drafts are keyed by user |
| Existing document presentation is client-side | Invoice.js uses pdfMake.getDataUrl and TableToExcel; CustomerInvoice.js also embeds PDF; main.js electron-dl | Preserve PDF preview, Excel export and download; printer behavior still requires desktop acceptance testing |

The first patch remains transitional: legacy:operate is coarse access, not configurable RBAC; immutable document/clearance rules and live subscription checks have NOT been implemented. Earlier removal of incidental month-end mutation is not a subscription feature. No new runtime tests were performed during this documentation update.

## 3. Workflow and immutable documents

Only the following business milestones are confirmed. Proposed stored codes: DOCUMENTATION, VERIFIED, CLEARED; VERIFIED represents completed verification/checking, not a new business stage. A clone is a document type, never a shipment status.

| Current → next | Authorized permission / proposed role assignment | Required validations at commit | Data locked |
|---|---|---|---|
| New → Documentation | shipment:create; assigned by Client Admin | Active account/subscription; valid exporter; unique idempotency key; transactional number allocation; schema validity | None yet |
| Documentation → Documentation | shipment:edit and document:edit; authorized documentation staff | Current revision matches; access/scope valid; shipment not cleared | Existing immutable revisions cannot be edited |
| Documentation → Verified | shipment:verify; configurable verifier role | Original exists and schema is valid; expected shipment/original revisions; verified content snapshot; unresolved required validation failures absent | ORIGINAL content and identity frozen; record verifiedBy/At and revision |
| Verified → Verified | clone:create/edit/rename as relevant; authorized staff | Verified original reference; independent clone; correct revisions; current permissions; shipment not cleared | ORIGINAL remains immutable; only permitted clone/business metadata changes |
| Verified → Cleared | shipment:clear; designated clearance staff | Verified original; all mandatory work complete; all applicable document validations; expected parent revision; atomic lock/audit | Shipment plus every original/clone and associated business record |
| Cleared → any | Nobody, including Super Admin | Reject | All business data remains locked |

No direct Documentation → Cleared or rollback from Verified is proposed. Clone creation before verification is not confirmed; default proposal restricts creation to verified originals. Exact mandatory clearance checklist and editable shipment metadata after verification need approval. Invoicing is a separate action; do not infer that it advances shipment state.

Independent snapshot design: each clone gets a stable random document ID, name, sourceOriginalId, sourceOriginalRevision and copied content. Renaming changes only its name. Avoid shared mutable maps or inheritance from live original fields. Snapshots use more storage but make provenance, isolation and historical printing straightforward at this scale. Each edit appends an immutable revision, advances a pointer and records actor/time/changed fields. Bound document/line sizes; measure legacy payloads before deciding whether line items need separate documents.

Every write—including jobs, bulk operations, attachments, invoice saves and renames—must transactionally read the parent shipment and the applicable document. Verified-original and cleared checks are independent of permissions and run even for the owner. All client writes to business collections are denied under the proposed API-only model; Admin SDK functions enforce invariants. Rules cannot constrain privileged IAM administrators or service-account code: restrict IAM and route every supported mutation through the same service, backed by audit/restore procedures. Claim application-level immutability, not resistance to a malicious cloud project owner.

Verification and clearance append audit data without altering the frozen content. Post-clearance operational logs live separately and cannot change business fields. A possible correction process would create a linked correction document with reason/approval and preserve the original; this is UNCONFIRMED and not enabled. No reopen or owner override is assumed.

## 4. Numbering, financial data and historical documents

ExporterNumbering/{exporterId}: nextNumber, optional prefix, formatVersion, revision. Initial proposal: preserve current numeric sequence, no annual reset and no reuse. Prefix/reset/gapless behavior remains a decision, not an invented requirement. Exporter can configure permitted formats only through an authorized service; seed nextNumber from a reconciled inventory, not just an untrusted client counter.

Atomic creation: read access/role definitions, subscription, exporter counter and idempotency record; validate; create shipment and original; reserve unique NumberReservations/{exporterId:number}; increment counter; record successful request and audit; remove only the committed user's draft. Retry with same key+same payload returns the existing ID; same key+different hash returns 409. Do not allocate numbers for drafts. Cancellation retains a number rather than silently reusing it. One counter per exporter serializes creation there; measure contention before introducing blocks, which would complicate gaplessness.

Proposed financial snapshot fields: currencyCode (default LKR for NEW documents), weightUnit, actualWeight, chargeableWeight, rateBasisUnit, ratePerUnit, freightAmount, insuranceAmount, taxLines, minimumCharge, roundingPolicyVersion, exchangeRateSnapshot (only when conversion exists), issuedAt/By and calculationVersion. Use decimal strings or tested scaled integers, not binary floating point for authoritative money. Currency scale must follow approved supported currencies; 2 decimals is not universal.

If weight is kg and rate is currency per metric tonne, a candidate formula is chargeableWeightKg / 1000 × ratePerTonne. This is NOT approved and must not replace the legacy multiplication silently. Confirm whether 0.700 represents per kg, per tonne, valuation rather than customer charge, or something else. CustomerInvoice.js handles KG and separate pricing paths; its billing cannot be inferred from the commercial invoice valuation flow.

Admin/Finance may change permitted currency/rates for future documents. Copy approved settings into a document at issue; never bind a historical invoice to live global settings or derive missing historical currency as LKR without evidence. Reprinting uses the issued snapshot. Open: settings scope (global/shipment/invoice), decimal precision, rounding order, minimum charge, taxes, foreign exchange source/date and invoice locking semantics.

## 5. Roles and subscription management

Application owner identity is provisioned outside client role administration. Super Admin is not a client-editable permission string. Server-derived installation scope prevents Client Admin assigning owner permissions. A role grant must be a subset of an explicit server-side delegable permission catalog; changing role membership/definitions is audited and uses revisions. Clients cannot write role/access documents directly.

| Capability | Super Admin | Client Admin | Configurable staff role |
|---|---|---|---|
| Shipment create/edit | Permitted, lock-bound | Permitted/delegable, lock-bound | shipment:create/edit |
| Verify original | Permitted, lock-bound | Delegable | shipment:verify |
| Clone create/edit/rename | Permitted, lock-bound | Delegable | clone:create/edit/rename separately |
| Clear shipment | Permitted | Delegable | shipment:clear |
| Issue invoice / finance actions | Permitted, lock-bound | Delegable | invoice:issue / finance:edit |
| Currency/rate settings | Permitted | Authorized Admin | financial-config:write for Finance |
| Reports/exports | Permitted, scoped | Scoped/delegable | report:read/export |
| Client users and roles | Permitted | Own installation, bounded grants | Only explicitly delegated administration |
| Subscription fee/deadline/payment/suspend/restore | Owner only | Never | Never |
| Overwrite verified original or cleared data | Never | Never | Never |

No arbitrary tenants are added now. An installation record supports this client's application subscription; introducing multiple organizations later requires explicit membership/resource migration and negative isolation tests. Staff cannot choose installation scope in a request.

OwnerSubscription/{installationId}: currency, amount, dueAt, graceUntil, accessState, noticeText, reminderSchedule, revision. Owner-only event log: previous/new amount and reason, deadline changes, payment confirmation/reference, suspension and reactivation, actor/server time. No random charges, automatic +50 fees or implicit payment inference. Remaining days are derived from deadline and a documented timezone, not a competing editable counter. Client-facing endpoint returns only approved notice/deadline/access state; amount visibility needs owner choice. Internal configuration is never returned to client administrators.

Proposed suspension policy (requires owner acceptance): reminders during active/grace periods; owner explicitly suspends or opts into a scheduled deadline rule. Suspension blocks new business reads/writes/exports, but permits authentication, notice display, logout and owner management. Already committed transactions stay committed; a racing write re-reads subscription inside the transaction and conflicts/retries if suspension wins first. Background business jobs obey the same gate; backups, audit and owner reminders continue. Payment recording and restoration are explicit, audited actions. Revoking sessions supplements live checks; stale token claims never authorize work.

Electron online mode must call the authoritative API for edits and printing fresh documents. It may display a notice when offline; queued drafts are not accepted transactions and must revalidate on reconnect. Already downloaded files cannot be remotely recalled. Fully offline operation on a client-controlled machine cannot offer tamper-proof owner suspension: that is a real trade-off, not something encryption or obfuscation fixes.

## 6. Lowest-cost suitable architecture (ADR-002; supersedes ADR-001)

Provisional recommendation: Firebase Hosting (static web assets), Firebase Authentication, a small number of 2nd-gen HTTPS Cloud Functions reusing Express/services, and current Firestore. Keep Electron as an optional thin desktop shell for existing document handling. Scale to zero, no Redis, no Cloud SQL, no always-on server, no microservice split. Use an isolated emulator project for development. Choose the SAME region as the existing database where practical once known; latency/data residency may outweigh the illustrative US pricing used below.

This is Firebase Functions deployment, not a separately managed Cloud Run architecture. Google's 2nd-gen Functions run on Cloud Run internally and use its compute pricing; that dependency is not an extra duplicate backend charge. Reuse code but refactor credentials, handlers, permissions and transaction services. Hosting session/CSRF compatibility remains a required task; prefer reviewed callable/token-auth API boundaries for the new UI while preserving old login only during controlled transition.

| Dimension | Electron + local API + PostgreSQL | Firebase Functions + Firestore | Thin Electron + same Firebase backend |
|---|---|---|---|
| Initial effort | Highest data rewrite; machine/UPS/backup setup | Lower; keeps existing Auth/data and extracts services | Same backend; retain desktop packaging |
| Recurring spend | Hardware amortization, power, backup, support | Usage-based; billing account needed | Cloud usage plus desktop support; not inherently cheaper |
| Concurrent users | One authoritative LAN server; SQL transactions | Shared remote service; Firestore transactions | Same as Firebase |
| Remote access | Secure VPN/TLS and server availability required | Internet access from authorized devices | Internet API; local preview/download |
| Power/internet | LAN can survive internet loss; UPS needed for power | Internet loss interrupts new work | Existing files remain readable; offline writes not promised |
| Integrity/reporting | FK/unique constraints and SQL joins; migration cost | Explicit integrity service; denormalized query models | Same Firebase integrity model |
| Recovery | Owner must operate tested off-device backups | Managed backup plus tested restores; paid | Same cloud recovery plus local file policy |
| Maintenance | OS/database/security and replacement ownership | Function/dependency/rules maintenance | Adds Electron updater/security workload |
| Owner fee enforcement | Client can tamper with fully local code/data | Owner-controlled server checks | Cloud checks reliable for online actions only |
| Growth | Server capacity and remote networking upgrades | Usage and query tuning; portable service boundaries | Same backend growth |

Local SQL could be right for one office with mandatory offline work and an existing maintained server. It is not the lowest-risk rewrite here. The recommendation remains conditional on user count, monthly workload and internet needs—not a measured project bill.

## 7. Monthly scenarios and costing

Pricing checked 2026-10-05; official sources below. Estimates use an illustrative us-central1 default Firestore Standard database and request-based 2nd-gen Functions, not the unverified project region. One eligible billing account with unused shared compute free allowance; 30 evenly active days; no phone SMS, SAML/OIDC, AI, paid email, taxes or card fees. Storage values are average retained footprints including history, not merely monthly new uploads. Local and support assumptions are planning inputs, not supplier quotations.

| Input | Low | Expected | Higher |
|---|---:|---:|---:|
| Monthly active staff / peak concurrent | 5 / 2 | 20 / 5 | 75 / 20 |
| Shipments/month | 100 | 500 | 2,000 |
| Original + clones per shipment | 1 + 1 | 1 + 3 | 1 + 5 |
| Reads/day (including authorization, queries, retries) | 5,000 | 30,000 | 200,000 |
| Writes/day (including revisions/audit) | 1,000 | 5,000 | 30,000 |
| Function requests/month | 20,000 | 200,000 | 2,000,000 |
| Conservative billed seconds/request | 0.3 | 0.4 | 0.5 |
| Function memory / CPU | 0.5 GiB / 1 | Same | Same |
| Estimated active CPU-seconds | 6,000 | 80,000 | 1,000,000 |
| Estimated memory GiB-seconds | 3,000 | 40,000 | 500,000 |
| DB + index GiB | 0.5 | 2 | 20 |
| Seven daily backups, equivalent GiB retained | 3.5 | 14 | 140 |
| File storage GiB / download GiB | 5 / 1 | 20 / 10 | 100 / 100 |
| Hosting transfer GB / stored GB | 2 / 1 | 10 / 1 | 60 / 1 |
| Additional API internet response GiB | 0.2 | 2 | 20 |
| File upload/download operations | 1k / 5k | 5k / 50k | 20k / 500k |
| Log ingestion GiB / scheduled jobs | 0.2 / 1 | 2 / 1 | 10 / 1 |

Functions overlap/concurrency can lower billed active time; cold starts, retries and overhead can raise it. No minimum instances. Do not multiply concurrent request durations and claim exact compute usage. Numbers here conservatively assume no overlap savings.

Pricing inputs: Firestore reads 50k/day and writes 20k/day free, then US illustrative $0.03/$0.09 per 100k; 1 GiB database free, approximately $0.15/GiB-month beyond; backup about $0.03/GiB-month (730-hour conversion). Functions request-based CPU 180k seconds, memory 360k GiB-seconds and 2m requests free; then $0.000024/CPU-second, $0.0000025/GiB-second and $0.40/million requests. Standard Hosting transfer 360 MB/day free then $0.15/GB; stored assets under 10GB. Daily quotas are not a monthly pool: bursty usage can cost more.

Files model conservatively uses $0.02/GiB-month and $0.12/GiB internet transfer, without assuming free bucket allowances; actual legacy appspot/new bucket and destination pricing differ. API egress separately modeled at $0.12/GiB with no free credit to avoid assuming a North American allowance applies to Sri Lanka. Do not charge the same download both through Storage and Functions in actual billing. File operations, build/artifact costs and variance are included in the stated reserve. Small standard email/password or Google Auth populations have no modeled charge; SMS excluded. Logs stay below the referenced 50GiB ingestion allowance; one scheduler job assumes available three-job allowance. PITR is not included; backup restores/export jobs are contingency spend, not normal activity.

| Estimated USD component | Low | Expected | Higher |
|---|---:|---:|---:|
| Functions CPU/memory/requests after free allowances | 0.00 | 0.00 | 20.03 |
| Firestore reads+writes after daily free allowances | 0.00 | 0.00 | 1.62 |
| Database/index storage | 0.00 | 0.15 | 2.85 |
| Backup retention | 0.11 | 0.42 | 4.20 |
| File storage + downloads | 0.22 | 1.60 | 14.00 |
| Hosting transfer | 0.00 | 0.00 | 7.38 |
| API response egress | 0.02 | 0.24 | 2.40 |
| Build, artifacts, file operations and variance reserve (assumption) | 1.00 | 3.00 | 10.00 |
| Modeled total (rounded) | 1.35 | 5.41 | 62.48 |
| Practical planning range, USD | 2–5 | 6–15 | 65–100 |
| Planning range, approximately LKR | 670–1,680 | 2,010–5,040 | 21,810–33,560 |

LKR uses 335.60 per USD, Seylan selling rate reported by Newswire on 2026-10-05. It is a dated budgeting conversion, not a guaranteed card/Google settlement rate. Totals exclude tax and exchange markup. Free credits/trials are not used in the model.

| Architecture monthly planning comparison (USD; LKR in parentheses) | Low | Expected | Higher |
|---|---|---|---|
| Firebase platform only | 2–5 (670–1,680) | 6–15 (2,010–5,040) | 65–100 (21,810–33,560) |
| Thin Electron + Firebase | Same platform bill plus desktop support | Same platform bill plus desktop support | Same platform bill plus desktop support |
| Local API/PostgreSQL operating budget, including assumed support | 15–35 (5,030–11,750) | 25–60 (8,390–20,140) | 60–140 (20,140–46,980) |

Local bands are NOT market quotes: model equipment+UPS amortized over 36 months ($5–20/month), power ($3–15), off-device backup ($2–10), support allowance ($5–95 depending load). For example, a 30W always-on unit uses 21.6kWh/month; multiply by actual tariff. Initial equipment/UPS allowance $180–720 if absent, plus migration labor. Existing hardware can reduce cash spend but not maintenance risk. For a fair total-cost comparison, add developer support time to cloud options too (e.g. 1–3 hours/month × your actual support rate). Existing user PCs/internet excluded from every option; incremental redundancy/VPN must be added if required.

Blaze/billing is required for the proposed hosted Functions deployment even if usage fits no-cost allowances. Alerts-only budgets do NOT stop usage. Current official documentation also describes spend-cap budgets for Functions and certain other products; these are service-specific, not a Firestore/Storage/project-wide cap, and pausing a service affects business availability. Verify eligibility/configuration before relying on them. No billing or cap configuration has been changed.

Refine estimates with four measurements: actual simultaneous staff and shipments/clones; daily read/write totals including polling/listeners; average document/files/retained revisions and download volume; billed function instance time/region and existing billing-account free-tier use.

## 8. Target data model, indexes and integrity

Keep evidenced master entities Exporter, Customer, Product, Category, Unit, Quotation, Clearing; add versioned collections through a migration, not an in-place destructive rewrite.

| Target | Relationship and authority |
|---|---|
| Shipments/{id} | exporterId, preserved legacyNumber/legacyId, state, revision, originalDocumentId, createdAt, verifiedAt, clearedAt |
| Shipments/{id}/Documents/{docId} | type ORIGINAL/CLONE, independent name, sourceOriginalId/revision, currentRevision, content or bounded line references; locks derive from parent and original verification |
| .../Documents/{docId}/Revisions/{revisionId} | Append-only snapshot, actor/time, changed fields, hash; copy financial context and rendering version |
| ExporterNumbering/{exporterId} | Allocation counter/config/revision; references existing exporter |
| NumberReservations/{exporterId:number} | Unique transactional reservation, shipmentId; stable after cancellation |
| Idempotency/{scopedKeyHash} | Request hash, result ID, actor/action; retention covers retry guarantees |
| Access/{uid}, Roles/{roleId} | Auth UID, active, role IDs, installation; server-owned delegation limits; no owner grant through client roles |
| FinancialConfig/{scopeId} | Versioned future defaults; privileged writes; issued documents copy values |
| OwnerSubscription/{installationId} | Owner-only fee/deadline/payment/access policy; client API returns an allowlisted notice |
| AuditEvents/{eventId} | Append-only event, resource/revision references, actor, server time; separate owner-only billing audit |
| Users/{uid}/Drafts/{draftId} | Private draft with revision; remove only as part of successful submission |
| Users/{uid}/Preferences/{id} | Versioned allowed layouts, density/theme; never permissions or arbitrary code |

Firestore references do not enforce foreign keys. Service transactions validate parent/exporter existence, unique original/reservations, source-original membership and permission scope. Soft-retire referenced masters; reject destructive deletion while referenced. Retention and right-to-delete policies need approval; do not cascade-delete shipments/history. Issued/cleared documents are retained under an approved retention schedule, not automatically purged.

Every clone update transaction also increments parent shipment revision. This serializes clearance against all child edits without rewriting every child on clearance. Parent CLEARED is the authoritative lock. Verify-original transaction writes its fixed revision and parent state together. Invoice actions read and obey parent/document locks too. Limit transaction size; large imports become staged, validated batches with explicit per-record commit outcomes, never a fake all-or-nothing promise.

Proposed indexes linked to queries (not deployed; inspect current definitions first):
- Shipments: exporterId ASC, createdAt DESC, stable document ID cursor — exporter browse.
- Shipments: state ASC, createdAt DESC — work queues.
- Shipments: exporterId ASC, state ASC, createdAt DESC — combined filter only if used.
- AuditEvents: resourceId ASC, occurredAt DESC — history.
- Quotation/Clearing: date DESC retained, plus actual filter combinations after measurement.
- Nested revisions: sequence/time descending; documents by type/name only where UI query needs it.
Exclude large snapshot/line payloads from automatic indexing where not queried. Avoid unbounded arrays/maps for revisions. Do not add organization indexes before actual organization scope exists. Use explicit name-search strategy; do not represent prefix matching as full-text search.

## 9. Performance and caching

Replace whole-collection reads and offset pagination with bounded cursor queries, stable sort and page size caps. Apply active-state filters before counts/pagination. Cache static assets with content hashes; master-data lists 1–5 minutes with version/ETag and invalidation on changes. Cache keys include installation, effective scope/version, filters, page cursor and schema version. Clear user caches on logout/suspension; no shared private response caching.

Short-lived (e.g. 30 seconds) dashboard aggregates may lag and must display freshness. Updates use idempotent event IDs or transactional increments; scheduled reconciliation repairs drift. Distinguish active, verified and cleared; count clones separately. Currency totals remain separate unless an explicit exchange policy exists. Drill-down uses the same authorized filters.

Authoritative writes NEVER use cached access, role grant, subscription state, shipment lock or numbering. Read all relevant authority documents within the commit transaction so revocation/clearance/suspension conflicts cause retry and revalidation. Revision preconditions return 409 with reload/compare options; no silent last-write-wins. Debounced editing improves perceived UI speed but show Saved only after acknowledgment. No Redis proposed.

## 10. BRD traceability, migration and next milestone

| Requirement | Evidence/confirmed source | Implementation task | Acceptance test |
|---|---|---|---|
| BR-13 Original immutable after verification | Owner clarification; legacy lacks guard | Shared document service | Every API and privileged role denied original mutation after verify |
| BR-14 Independent clone revision/name | Owner clarification | Snapshot clone + rename API | Edit/rename clone A leaves original/B byte-identical |
| BR-15 Clearance locks all business data | Owner clarification | Parent transaction guard | Concurrent clear/edit yields one serial outcome; later writes denied |
| BR-16 Exporter sequence safe on retries | syncShipment.js + owner | Counter/reservation/idempotency | Concurrent same-exporter creation unique; retries return same ID |
| BR-17 Historical money preserved | Owner LKR/rate clarification | Issued financial snapshots | Changing defaults leaves prior issue/reprint unchanged |
| BR-18 Owner-only subscription lifecycle | SYSTEM/CONFIG legacy + owner | Separate owner service and events | Client Admin cannot read/write/grant owner access; suspend race tested |
| BR-19 Bounded client role delegation | Owner clarification | Server permission catalog | Self-escalation and out-of-scope role assignment denied |
| BR-20 Affordable operation | Owner budget | Usage instrumentation/caps plan | Load fixture reports reads, writes, duration; estimate reconciled |

BR-01 through BR-12 remain in MODERNIZATION.md; new requirements refine their meaning. UI target remains responsive light/dark enterprise screens, keyboard forms, configurable dashboards and reduced-motion-aware 3D accents. First workflow shows shipment milestone separately from ORIGINAL/CLONE document tabs, visible verified/cleared locks, revision conflicts and export history. No visual mock is presented as working software in this update.

Prioritized migration scope for approval:
1. Emulator-only domain service: document snapshots/revisions, transaction locks, configurable permissions, subscription gate, exporter allocation. Close remaining malformed-payload paths before exposure.
2. One full Documentation → Verified → clone edit → Cleared slice with responsive UI, audit and PDF/export regression fixtures.
3. Read-only production schema/index/usage inspection, then owner-approved export/backup. Map each legacy status-map key to document type; quarantine ambiguity instead of guessing. Preserve IDs/numbers and financial values; do not retroactively mark verification or currency without evidence.
4. Dry run into a separate staging schema/project; reconcile shipment/document counts, carton quantities/weights, per-currency totals, original hashes and exporter high-water marks. Test missing references and large payloads. Owner reviews exceptions.
5. Approved cutover: freeze old writers (desktop included), final delta, reconcile, enable new writers. Rollback retains old dataset and journal; after new writes, reconcile/replay before reverting. No uncontrolled dual writers.
6. Remaining modules, aggregates and configurable dashboards after primary integrity tests pass.

Concrete next milestone: build and demonstrate the emulator-only shipment-document vertical slice, with negative lock tests for every role, independent clone snapshots, concurrent numbering/retry tests, and suspension-versus-write tests. It requires no paid deployment or production access. Full migration/paid deployment remains subject to approval of this scope.

Focused outstanding decisions: (1) after invoice issuance, can a clone still change or must correction create a new issue? (2) what are the weight unit and the business meaning of 0.700 and 660? (3) approximate users/concurrency/shipments and whether offline editing is essential. Additional defaults to approve during design: clone-before-verification, clearance checklist, scope of currency settings, numbering prefixes/reset, retention and suspension read/export policy.

## Sources checked 2026-10-05

- https://firebase.google.com/pricing — Hosting, Auth and product allowances.
- https://cloud.google.com/firestore/pricing — Standard regional operations, storage and backups.
- https://cloud.google.com/run/pricing — request-based compute used in 2nd-gen estimate.
- https://firebase.google.com/docs/functions/version-comparison — managed 2nd-gen infrastructure.
- https://cloud.google.com/storage/pricing — illustrative file storage/transfer model.
- https://cloud.google.com/products/observability/pricing — log allowance.
- https://cloud.google.com/scheduler/pricing — scheduler allowance.
- https://firebase.google.com/docs/projects/billing/avoid-surprise-bills — alerts versus service spend caps.
- https://www.newswire.lk/2026/10/05/dollar-rate-today-rupee-steady-against-usd/ — dated LKR conversion.

Verification record: source inspection, official documentation lookup and costing arithmetic only in this turn. Previous branch has 11 passing isolated authorization tests; they do not test the proposed domain design. No live Firebase reads, scans, modifications, migration, paid-service enablement or deployment occurred.
