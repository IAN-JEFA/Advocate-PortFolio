# Nairobi Legal Chambers — Website

## What's in here

```
site/
├── index.html   Single-page site: Hero, About, Practice Areas, Attorneys,
│                Case Studies, Testimonials, Insights, FAQ, Contact/Booking
├── style.css    Design system (navy/royal-blue glassmorphism, dark/light theme)
├── script.js    All front-end behavior: scrollspy nav, dropdown, filters, search,
│                slider, FAQ accordion, booking form
├── logo.png
└── backend/     Node/Express/MongoDB API (optional — see below)
```

This is a single HTML page with anchor-linked sections (`#about`, `#practice`, etc.) rather than separate pages — no `fetch()`, no partials.

## Navigation

The nav is condensed to reduce clutter:
- **About**, **Practice Areas**, **Contact** as direct links
- **Work** is a dropdown containing Attorneys, Case Studies, and Insights — sections that are secondary to a first-time visitor but still one click away
- A pill-shaped active indicator slides between links as you scroll (scrollspy), so the nav always reflects where you are on the page
- On mobile, the dropdown collapses into an expandable list inside the slide-out menu

## Running the front end

Plain HTML/CSS/JS — no build step.

In VS Code:
1. Install the **Live Server** extension.
2. Right-click `index.html` → **Open with Live Server**.
3. Scroll through the page and click each nav item (including the Work dropdown) to confirm the indicator and smooth-scroll both work.

## Running the backend (optional)

The backend gives you real contact-form email delivery, appointment storage, and admin-managed content (attorneys, case studies, testimonials, blog posts) via a JWT-protected API. The front end works fine without it — the contact form just shows a front-end "sent" confirmation until you wire it up.

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — a local MongoDB instance or a free MongoDB Atlas cluster
- `JWT_SECRET` — any long random string
- `SMTP_USER` / `SMTP_PASS` — for Gmail, use an [App Password](https://myaccount.google.com/apppasswords), not your normal password
- `CLIENT_ORIGIN` — the URL Live Server runs on (default `http://127.0.0.1:5500`)

Create your first admin login:
```bash
node seedAdmin.js
```
This prints an email/password — log in once via `POST /api/auth/login`, then change the password directly in the database.

Start the API:
```bash
npm run dev
```

Runs on `http://localhost:5000`. Check it's alive: `http://localhost:5000/api/health`.

## Connecting the contact form to the backend

In `script.js`, the `consultationForm` submit handler currently just shows a success animation. To actually send the data, replace the `setTimeout` block with:

```javascript
fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, phone, service, message })
})
  .then(res => res.json())
  .then(() => {
    form.classList.add('sent');
    setTimeout(() => { form.reset(); form.classList.remove('sent'); submitBtn.disabled = false; }, 2600);
  })
  .catch(() => { submitBtn.disabled = false; alert('Something went wrong — please try again or call the office.'); });
```

Do the same for the appointment fields, pointing at `/api/appointments` instead.

## API reference (once the backend is running)

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/contact` | POST | Public | Submit contact form |
| `/api/appointments` | POST | Public | Book a consultation |
| `/api/appointments` | GET | Admin | List all bookings |
| `/api/appointments/:id` | PATCH | Admin | Update booking status |
| `/api/attorneys` | GET | Public | List attorneys |
| `/api/attorneys` | POST/PUT/DELETE | Admin | Manage attorneys |
| `/api/case-studies` | GET | Public | List case studies |
| `/api/case-studies` | POST/PUT/DELETE | Admin | Manage case studies |
| `/api/testimonials` | GET | Public | List testimonials |
| `/api/testimonials` | POST/PUT/DELETE | Admin | Manage testimonials |
| `/api/blog` | GET | Public | List blog posts |
| `/api/blog` | POST/PUT/DELETE | Admin | Manage blog posts |
| `/api/auth/login` | POST | Public | Get a JWT |

Admin routes need `Authorization: Bearer <token>` from `/api/auth/login`.

## What's intentionally not included

A rich-text-editor admin **dashboard UI**, image upload handling, and analytics — the API above supports all of that data-wise, but building a polished admin interface on top of it is a separate, sizeable project. If you want that next, it's a natural follow-up once the core site and API are live.
