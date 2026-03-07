# Attendance Management System - Frontend

A modern web application for managing student attendance using React, TypeScript, and Vite. This frontend provides a user-friendly interface for authentication, attendance tracking, and management features.

## Features

- **User Authentication**: Secure login, registration, and password recovery
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Type-Safe**: Built with TypeScript for better code quality
- **Fast Development**: Powered by Vite with Hot Module Replacement (HMR)
- **Modern Stack**: React 18+ with TypeScript

##  Tech Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Linting**: ESLint

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Navbar, Footer)
│   ├── icons/           # Icon components
│   ├── layouts/         # Layout components
│   └── user/            # User-related components (Login, Register, etc.)
├── pages/
│   ├── auth/            # Authentication pages
│   ├── layout/          # Layout pages
│   ├── notfound/        # 404 page
│   └── Testing/         # Testing components
├── assets/              # Static assets
├── App.tsx              # Root component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

- **`npm run dev`** - Start development server with HMR
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint to check code quality

## 🔐 Authentication

The application includes user authentication with the following pages:

- **Login** - User sign-in
- **Register** - New user registration
- **Forgot Password** - Password recovery

## 🎨 Styling

This project uses **Tailwind CSS** for styling. Configuration can be found in `tailwind.config.js`.

## 📝 Configuration Files

- **vite.config.ts** - Vite configuration
- **tsconfig.json** - TypeScript configuration
- **eslint.config.js** - ESLint rules
- **tailwind.config.js** - Tailwind CSS configuration

## 🚀 Deployment

Build the project for production:

```bash
npm run build
```

The build artifacts will be generated in the `dist/` directory.

## 📄 License

This project is part of the School Assignment - Attendance Management System.

## 👥 Contributing

For contributions, please follow the project's coding standards and create pull requests for review.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
