# Snosio Clinic Management System

A full-featured clinic management system for Snosio Clinic.

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Database: SQLite (for immediate setup and local testing)
- Auth: JWT + role-based access

## Features

- Login and role-based access
- Patient registration and management
- Doctor appointment scheduling
- Consultation and follow-up tracking
- Prescriptions and pharmacy workflow
- Billing and invoice management
- Inventory and stock tracking
- Lab tests and diagnostic workflows
- Dashboard and summary reports

## Run locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Then open the frontend dev URL and sign in with one of the seeded users:

- admin@snosio.com / Admin@123
- doctor@snosio.com / Doctor@123
- reception@snosio.com / Reception@123
- nurse@snosio.com / Nurse@123
- billing@snosio.com / Billing@123
- pharmacy@snosio.com / Pharmacy@123
- lab@snosio.com / Lab@123

## App flow

The backend exposes REST endpoints and the frontend uses those routes to provide the clinic operations experience. The data model connects patients, doctors, appointments, consultations, prescriptions, billing, inventory, and reports in one system.

## Architecture

- Frontend: React app with pages for dashboard, patients, appointments, billing, inventory, prescriptions, lab tests, and reports.
- Backend: Express API with validation, auth middleware, and SQLite-based storage.
- Database: relational tables for users, patients, appointments, consultations, prescriptions, invoices, inventory, and lab tests.

## Notes

The current setup is designed to be easy to run and understand for a clinic project and is suitable as a starter foundation for a modern medical management platform.
