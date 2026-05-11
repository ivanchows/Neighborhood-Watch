# Sentry — Community Safety Intelligence

Express + Handlebars web app for neighborhood watch / community safety reporting.

## Setup

```bash
npm install
npm start
```

Visit http://localhost:3000

For auto-reload during development:

```bash
npm run dev
```

## Project Structure

```
sentry/
├── app.js
├── package.json
├── README.md
├── .gitignore
│
├── config/
│   ├── mongoCollections.js
│   ├── mongoConnection.js
│   └── settings.js
│
├── data/
│   ├── errorchecking.js
│   ├── incidentfunctions.js
│   ├── services.js
│   └── users.js
│
├── public/
│   ├── css/
│   │   └── styles.css
│   │
│   ├── js/
│   │   ├── form_validate.js
│   │   ├── form_validation.js
│   │   ├── home.js
│   │   └── local_services.js
│   │
│   └── images/
│
├── routes/
│   ├── auth_routes.js
│   ├── incident_routes.js
│   ├── service_routes.js
│   └── index.js
│
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   │
│   ├── partials/
│   │   └── nav.handlebars
│   │
│   ├── Deletion.handlebars
│   ├── Status_Update.handlebars
│   ├── Verify.handlebars
│   ├── adminUserProfile.handlebars
│   ├── adminUsers.handlebars
│   ├── error.handlebars
│   ├── home.handlebars
│   ├── incident_card.handlebars
│   ├── incident_create.handlebars
│   ├── incident_update.handlebars
│   ├── incidents.handlebars
│   ├── profile.handlebars
│   ├── register.handlebars
│   ├── services.handlebars
│   ├── signin.handlebars
│   └── signout.handlebars
```

## Adding a new page

1. Create `views/your-page.hbs` with just the page content (no `<html>` / `<head>`).
2. Add a route in `app.js`:
   ```js
   app.get('/your-page', (req, res) => {
     res.render('your-page', { title: 'Your Page' });
   });
   ```
3. The `main.hbs` layout wraps it automatically with the nav, fonts, and styles.

## Notes

- The home page modal data is currently hardcoded in `public/js/home.js` for the demo. When you wire up real incidents, replace the `incidents` array with data fetched from your backend.
- The map is a stylized SVG placeholder. Swap in Google Maps when ready — the pin click handlers are already in place via `data-incident` attributes.
- Routes use `/register.html` and `/login.html` to match the existing nav links. Change the route paths and `href` values together if you prefer something else.
