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

### Environment Variables

Copy `.env` and adjust credentials as needed. **Never commit `.env` to version control.**
