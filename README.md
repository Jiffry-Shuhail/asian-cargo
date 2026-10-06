# Asian Cargo

Latest: [customer invoice milestone, frontend decision and actual-workload budget](docs/CUSTOMER-INVOICE-MILESTONE.md).

Electron + Express cargo operations application using Firebase Authentication and Firestore.

Read the latest [confirmed workflow, subscription design and monthly cost comparison](docs/CONFIRMED-DESIGN.md).

See [business requirements, audit, architecture and rollout plan](docs/MODERNIZATION.md).

This modernization branch adds a fail-closed access boundary. Existing accounts require an active server-managed `Access/{uid}` record before using business endpoints. It is not production-ready and has not been deployed.

- `npm test`: isolated authorization tests; no cloud connection.
- `npm ci`: install locked dependencies (requires package network access).
- `npm run start:server`: Express on loopback port 3000; needs isolated Firebase credentials and configuration.
- `npm start`: Electron desktop (graphical environment required).

Set `GOOGLE_APPLICATION_CREDENTIALS` to a credential file outside the repository and `GCLOUD_PROJECT` to a staging project. Do not distribute privileged credentials with desktop builds. See the runbook for access provisioning and unresolved rollout gates.
