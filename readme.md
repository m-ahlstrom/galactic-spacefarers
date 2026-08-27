# Galactic Spacefarers

A SAP CAP application for managing galactic spacefarers, built with SAP CAP, SQLite, OData V4 and SAP Fiori elements.

The application provides a Fiori List Report and Object Page for managing spacefarers, with a multi-entity data model, layered authorization (role-based, row-based, and field-based), validated business rules, draft handling, cosmic service event handlers, real email notifications and an extensive automated test suite.

## Data model

- **Spacefarers** — the core entity with associations to origin/destination planets, department, position, and spacesuit color.
- **Planets** — includes a `restricted` flag; some planets (Enceladus, Titan, Ganymede) require an authorized department to travel to.
- **Departments** — Exploration, Science, Navigation, Mining, Engineering.
- **Positions** — 7 ranks per department (Cadet → Admiral), so rank is scoped to a department, not global.
- **PlanetAccess** — junction entity resolving the many-to-many between restricted planets and the departments authorized to travel there.
- **SpacesuitColors** — a fixed color palette, gated by department and by minimum rank via **DepartmentColorAccess** (e.g. Engineering may wear Void Black at any rank, but Rose Gold only from rank 5 upward).

## Business rules enforced server-side

- A spacefarer traveling to a restricted planet must belong to a department cleared for that planet (`PlanetAccess`).
- A spacefarer's spacesuit color must be authorized for their department, and — for premium colors — their rank must meet the department's minimum (`DepartmentColorAccess`).
- Stardust collection and wormhole navigation skill are range-validated on both create and edit.
- `originPlanet`, `age`, `department`, `position`, and `wormhole navigation skill` can only be changed by MissionControl, regular users cannot self-promote or reassign themselves.
- A regular user can only edit records they own, ownership is set server-side on creation and can never be spoofed via the request payload.

## Authentication & Authorization

- All access requires authentication (mocked locally via CAP's built-in auth).
- Users can only **read** spacefarers whose origin planet matches their own (`$user.planet`), MissionControl sees everyone.
- Users can only **edit** records they personally own (`owner = $user`), MissionControl can edit any record.
- Locked fields (see above) are enforced both server-side (rejected outright) and in the UI (rendered read-only for non-MissionControl users).

## How to use

Clone the repository:

`git clone https://github.com/m-ahlstrom/galactic-spacefarers.git`

Enter the project directory:

`cd galactic-spacefarers`

Install the dependencies:

`npm install`

Run the application:

`cds watch`

The CAP service is available at:

`http://localhost:4004`

To access and edit every record, sign in as `alice:alice` (MissionControl / admin). To see how a regular user experiences the app, use `bob:bob` or `zork:zork` — each can only see spacefarers from their own origin planet, and can only edit entries they created themselves. An example seeded `.csv` dataset (100 spacefarers, plus planets/departments/positions/colors reference data) is provided under `db/data`.

## Sending emails

When a new spacefarer is created, the service sends a welcome email.

### Option A — Gmail (default)

1. Enable **2-Step Verification** on the Gmail account you want to send from (Google Account → Security).
2. Under Security → **App passwords**, generate a new app password.
3. Create a `.env` file in the project root with:

```env
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your16charapppassword
```

### Option B — any other SMTP provider

Add `SMTP_HOST` (and optionally `SMTP_PORT`/`SMTP_SECURE`) to `.env` to bypass the Gmail shortcut and connect to any SMTP server directly:

```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

Use `SMTP_PORT=465` and `SMTP_SECURE=true` for providers that require implicit TLS; most providers (including company mail servers) use `587` with `SMTP_SECURE=false` (STARTTLS negotiated automatically).

Either way, run the app with `cds watch` and create a spacefarer through the Fiori UI to trigger a real send. During automated tests (`npm test`), email sending is skipped and logged to the console instead, so the test suite never requires real credentials.

## Testing

Run the full test suite with:

`npm test`

Tests resolve all reference data (planets, departments, positions, record ownership) dynamically via OData `$filter` queries rather than hardcoded IDs, so the suite remains valid even if the seed dataset is regenerated or reordered.
