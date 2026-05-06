# Attendance Management UI

Frontend application for the Attendance Management System.
Built with React, TypeScript, Vite, Redux Toolkit, and Tailwind CSS.

## Features

- Authentication: login, register, forgot password
- Attendance workflows: attendance, record history, blacklist, analytics
- Admin management pages
- Profile and settings pages
- Shared layout with role-aware routing

## Tech Stack

- React 19
- TypeScript 5
- Vite 7
- Redux Toolkit + React Redux
- React Router
- Axios
- Tailwind CSS
- ESLint

## Prerequisites

- Node.js 18+
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Scripts

- `npm run dev`: Start local dev server
- `npm run build`: Type-check and build production files
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint

## Project Structure

```text
src/
  app/                 # App bootstrap (store, hooks, routes)
  assets/              # Static assets
  features/            # Feature modules
    admin/
    attendance/
    auth/
    dashboard/
    layout/
    not-found/
    settings/
  shared/              # Shared components, auth utilities, icons, API helpers
```

For more structure details, see `docs/FOLDER_STRUCTURE.md`.

## Build Output

Production files are generated in `dist/`.

## Notes

This UI is part of a school assignment project: Attendance Management System.
