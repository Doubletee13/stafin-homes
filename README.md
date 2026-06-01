# Stafin Homes

Full-stack monorepo for the Stafin Homes platform.

## Project Structure

```
stafin-homes/
├── backend/           # FastAPI application
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/          # Static HTML frontend
│   ├── index.html
│   └── Dockerfile
├── database/          # SQL init scripts
│   └── init.sql
├── docker-compose.yml
└── .env               # Environment variables (do not commit)
```

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Run the stack

```bash
docker-compose up --build
```

### Endpoints

| Service  | URL                            |
|----------|-------------------------------|
| Backend  | http://localhost:8000/health   |
| Frontend | http://localhost:3000          |

## Features Added in UI/UX Overhaul Phase

- **Admin Statistics Dashboard**: Default overview tab for administrators displaying high-level metrics like total property listings and client inquiries.
- **Smart Sticky Navbar**: Dynamically hides on scroll down and reveals on scroll up, while supporting a live real estate news ticker.
- **Complete SEO Enhancement**: Comprehensive OpenGraph and Twitter card meta tags added to public-facing pages, with security `noindex` applied to admin views.
- **Mobile Responsive Modals**: Improved mobile UI for property and notification management with clean single-column forms on small screens.
- **Enhanced Dark Mode**: Corrected contrast issues across property cards, navigation drawers, and global typographies.

## Environment Variables

Copy `.env` and adjust credentials as needed. **Never commit `.env` to version control.**
