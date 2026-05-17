# Encounter Lens

FHIR practitioner app challenge project.

## Current slice

This repository currently contains the backend starter API.

It includes:

- Express backend
- backend-only FHIR token handling
- Patient CRUD API contracts
- practitioner-managed schedule API
- audit logging schema
- validation with Zod
- Jest tests
- secure-ish defaults: Helmet, CORS allowlist, rate limiting, no frontend secrets

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env` locally.

Never commit `.env`.

## Database

Run this file in Supabase SQL editor or local Postgres:

```txt
server/src/db/schema.sql
```

## Test

```bash
npm test
```

## Run

```bash
npm run dev
```

Health check:

```txt
GET http://localhost:5000/healthcheck
```

## GitHub first push

From the `encounter-lens` root:

```bash
git init
git add .
git commit -m "adds Encounter Lens backend starter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/encounter-lens.git
git push -u origin main
```
