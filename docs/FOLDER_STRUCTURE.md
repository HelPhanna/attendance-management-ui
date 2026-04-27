# UI Folder Structure

This project now uses a feature-first structure.

## Top level

- `src/app`: app bootstrap concerns (store, hooks, routes)
- `src/features`: domain features (auth, dashboard, layout, not-found)
- `src/shared`: reusable UI pieces shared across features
- `src/assets`: static frontend assets

## Feature pattern

Inside each feature, prefer this layout:

- `components/`: feature-specific UI pieces
- `pages/`: route-level screens
- `store/`: feature state (slice, selectors, thunks)

## Import aliases

Configured aliases:

- `@app/*`
- `@features/*`
- `@shared/*`

Use aliases over deep relative imports for readability.
