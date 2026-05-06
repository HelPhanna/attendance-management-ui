# UI Developer Onboarding

This guide helps the next developer clone, configure, and run the frontend quickly.

## 1. Tech Stack

- React 19 + TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios

## 2. Clone and Enter Project

```bash
git clone <your-repo-url>
cd Attendance-Management/attendance-management-ui
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Environment Setup

Create `.env` from example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Default API URL from `.env.example`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

If backend runs on another port/host, update `VITE_API_BASE_URL`.

## 5. Run the UI

```bash
npm run dev
```

Default UI URL:

- `http://localhost:5173`

## 6. Build and Validate

```bash
npm run lint
npm run build
npm run preview
```

## 7. Important Folders

- [src/app](D:\Year 3 Semester 2\SA\Attendance-Management\attendance-management-ui\src\app): app wiring, routes, store
- [src/features](D:\Year 3 Semester 2\SA\Attendance-Management\attendance-management-ui\src\features): feature modules
- [src/shared](D:\Year 3 Semester 2\SA\Attendance-Management\attendance-management-ui\src\shared): shared API/auth/components/icons
- [src/shared/api/http.ts](D:\Year 3 Semester 2\SA\Attendance-Management\attendance-management-ui\src\shared\api\http.ts): axios base config

## 8. Handover Notes

- Keep frontend API calls aligned with backend route/response changes.
- Main auth pages:
  - [LoginPage.tsx](D:\Year 3 Semester 2\SA\Attendance-Management\attendance-management-ui\src\features\auth\pages\LoginPage.tsx)
  - [RegisterPage.tsx](D:\Year 3 Semester 2\SA\Attendance-Management\attendance-management-ui\src\features\auth\pages\RegisterPage.tsx)
- Main attendance pages:
  - [AttendancePage.tsx](D:\Year 3 Semester 2\SA\Attendance-Management\attendance-management-ui\src\features\attendance\pages\AttendancePage.tsx)
  - [ReportsAnalyticsPage.tsx](D:\Year 3 Semester 2\SA\Attendance-Management\attendance-management-ui\src\features\attendance\pages\ReportsAnalyticsPage.tsx)

## 9. Suggested Daily Workflow

1. Pull latest code.
2. Run `npm install` if dependencies changed.
3. Run `npm run dev`.
4. Run `npm run lint` before commit.
