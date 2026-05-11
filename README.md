# Sentry — Community Safety Intelligence

Express + Handlebars + MongoDB web app for neighborhood watch / community safety reporting.

---

## Prerequisites

Start MongoDB before running the app:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod
```

---

## Installation & Running

```bash
npm install
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

The app connects to the `Neighborhood_Watch` database automatically on first run — no seed step required.

---

## All Features

### Authentication

| Action | URL | Notes |
|---|---|---|
| Register | `GET /register` | Redirects to `/signin` on success |
| Sign in | `GET /signin` | Redirects to `/` on success |
| Sign out | `GET /signout` | Destroys session |

**Registration requirements:**
- First/last name: 2–25 characters, letters/hyphens/apostrophes only
- Email: valid format, must be unique
- Gender: `M`, `F`, `NB`, or "prefer not to say"
- Age: integer between 16 and 100
- Address: street, city, valid US state abbreviation, 5-digit ZIP code
- Password: at least 8 characters, at least one uppercase letter, one number, and one special character — no spaces allowed
- Banned accounts cannot sign in

---

### User Profile

**URL:** `GET /profile` (requires login)

Displays your account details including:
- Personal info (name, email, gender, age, address)
- Role and trust rating
- Filed reports count
- Verified reports count
- Watch list ZIP codes
- Account creation date

**Edit profile:** `POST /profile/update`  
Updates name, email, gender, age, and address. Your home ZIP is automatically re-synced to your watch list.

**Add a ZIP to your watch list:** `POST /profile/watchlist/add`  
Add any 5-digit US ZIP code. Duplicates are rejected.

**Delete account:** `POST /profile/delete`  
Permanently removes your account and destroys the session.

---

### Incidents

#### Browse all incidents

`GET /incidents` — publicly visible list of every incident stored in the database.

#### Create an incident

`GET /incident_create` / `POST /incident_create` (requires login)

Fill in:
- **Category** (≤ 100 chars): `traffic`, `theft`, `animal`, `crime`, `car accident`, `suspicious activity`, `debris`, or any custom label
- **Title** (≤ 100 chars)
- **Description** (≤ 500 chars)
- **Location** (≤ 100 chars) — geocoded automatically via Nominatim for map pin placement

The incident is linked to your account, your `filedReports` list is updated, and the status starts as `Active`.

#### View an incident card

`GET /incident_card/:id` (requires login)

Shows full incident details including:
- Category-specific cover image (traffic, theft, animal, crime, car accident, suspicious activity, debris, or default)
- Status badge (Active / Resolved / Authorities Notified)
- Verified flag set by admin
- Like count
- All comments
- Edit / Delete / Verify / Status Update buttons (shown only when permitted — see roles below)

#### Update an incident

`GET /incident_update/:id` / `POST /incident_update/:id` (requires login, owner only)

Partial updates — leave a field blank to keep its current value. You can update category, title, description, and location.

#### Delete an incident

`POST /incident_card/:id` (requires login)

Only the incident owner can delete, and only if the incident has **not** been verified (verified = `""` or `"no"`). Admins verified incidents are protected.

#### Verify an incident

`GET /verify/:id` / `POST /verify/:id` (requires login, **admin only**)

Sets the incident's `verified` field to `yes` or `no`. When verified, the reporter's trust rating is recalculated as `(verifiedReports / filedReports) × 10`.

#### Update incident status

`GET /status_update/:id` / `POST /status_update/:id` (requires login)

Valid statuses: `active`, `resolved`, `authorities notified`  
Allowed for: the incident owner or any admin.

#### Like an incident

`POST /like/:id` (requires login)

Each user can like an incident once. Duplicate likes are rejected.

#### Comment on an incident

`POST /comment/:id` (requires login)

Comments are 1–500 characters and stored both in a separate collection and embedded in the incident document. Comments display on the incident card with the author's full name.

---

### Local Emergency Services

`GET /services` (requires login)

Looks up nearby emergency services by ZIP code using:
1. **Nominatim** (OpenStreetMap) to geocode the ZIP
2. **Overpass API** to query within a 10 km radius

Returns four categories sorted by distance:
- Police stations
- Fire stations
- Hospitals
- Urgent care centers

Each entry shows name, address, phone number (if available), and distance in miles.

The ZIP defaults to your profile address ZIP. You can search any other 5-digit ZIP using the query parameter `?zip=XXXXX`.

---

### Home Page

`GET /` — accessible to everyone, shows:
- 5 most recent incidents (newest first)
- Interactive map with pins for each recent incident (geocoordinates from Nominatim)
- "Sign in" / "Register" prompt for guests
- "Report Incident" shortcut for logged-in users

---

### Admin Panel

All admin routes require login and `role === "admin"`.

| Action | URL |
|---|---|
| List all users | `GET /admin/users` |
| View a user's profile | `GET /admin/users/:id` |
| Upgrade user to admin | `POST /admin/users/:id/upgrade` |
| Ban a user | `POST /admin/users/:id/ban` |

Admins can also verify/reject incidents and update statuses on any incident.

---

## User Roles

| Role | Can do |
|---|---|
| `user` | Register, sign in, create/update/delete own incidents, like, comment, manage profile, view local services |
| `admin` | Everything a user can do, plus verify incidents, update any incident's status, access admin user panel, upgrade/ban users |
| `banned` | Cannot sign in |

---

## Testing the App Manually

1. **Register** a new account at `/register`
2. **Sign in** at `/signin`
3. **Create an incident** at `/incident_create` — use a real address like `Hoboken, NJ` as the location to get a map pin
4. **Browse incidents** at `/incidents` and click one to open its card
5. **Like** the incident from the card page
6. **Add a comment** from the card page
7. **Update the incident status** (owner or admin)
8. **Check local services** at `/services` — your home ZIP is pre-filled
9. To test **admin features**: manually update a user document in MongoDB (`role: "admin"`), then sign back in, and use `/admin/users` to manage other accounts and `/verify/:id` to verify incidents

---

## Project Structure

```
sentry/
├── app.js                     # Express setup, sessions, Handlebars config
├── package.json
│
├── config/
│   ├── mongoCollections.js    # Collection getters (incidents, users, comments, notifications)
│   ├── mongoConnection.js     # MongoDB connection
│   └── settings.js            # DB name & server URL
│
├── data/
│   ├── errorchecking.js       # id_checker, string_checker
│   ├── incidentfunctions.js   # Incident CRUD, likes, comments, notifications, geocoding
│   ├── services.js            # Local services lookup via Nominatim + Overpass
│   └── users.js               # User CRUD, auth, validation helpers
│
├── public/
│   ├── css/styles.css
│   └── js/
│       ├── form_validate.js   # Client-side registration validation
│       ├── form_validation.js # Client-side sign-in validation
│       ├── home.js            # Home page map + incident pin interactions
│       └── local_services.js  # Services page ZIP search
│
├── routes/
│   ├── index.js               # Mounts all routers
│   ├── auth_routes.js         # /, /register, /signin, /signout, /profile, /admin/*
│   ├── incident_routes.js     # /incidents, /incident_create, /incident_card/:id, etc.
│   └── service_routes.js      # /services
│
└── views/
    ├── layouts/main.handlebars
    ├── partials/nav.handlebars
    ├── home.handlebars
    ├── register.handlebars
    ├── signin.handlebars
    ├── signout.handlebars
    ├── profile.handlebars
    ├── incidents.handlebars
    ├── incident_create.handlebars
    ├── incident_card.handlebars
    ├── incident_update.handlebars
    ├── Verify.handlebars
    ├── Status_Update.handlebars
    ├── Deletion.handlebars
    ├── services.handlebars
    ├── adminUsers.handlebars
    ├── adminUserProfile.handlebars
    └── error.handlebars
```
