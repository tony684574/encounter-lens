# Encounter Lens Client

React/Vite frontend for the Encounter Lens practitioner workspace.

## Setup

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Do not put the FHIR bearer token, Supabase database URL, or JWT secret in this client env file.

## Current slice

This frontend currently includes:

- React/Vite setup
- React Router
- Axios API client
- login page
- protected practitioner home page
- placeholder landing panel for Iteration 1

Next slice:

- load daily schedule
- load patient table
- create appointment form
