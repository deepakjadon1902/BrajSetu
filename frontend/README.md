# Braj Setu Properties Frontend

Property search and listing submissions for Braj Setu Properties, serving Vrindavan, Mathura, Govardhan, Barsana and nearby Braj Mandal towns.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

The app uses TanStack Start, React, TypeScript, Tailwind CSS and Vite.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

With the development server running on port 5173, use `npm run test:smoke` to check server-rendered routes. Set `SMOKE_BASE_URL` to check another local server.

The API is configured with `VITE_API_BASE_URL` for development and `VITE_PRODUCTION_API_BASE_URL` for production. Listing failures show a retry action; sample properties are not substituted for unavailable live listings.

Saved listings and property preferences stay on the current device. Account name and phone changes are saved through the authenticated `PATCH /api/auth/me` endpoint. Run backend checks with `npm test` from the backend directory.

The interface uses shared spacing, colour, button and container styles in `src/styles.css`. Navigation, photo dialogs and mobile filters use accessible Radix dialogs. Keep mobile controls at least 44px high, use visible form labels, and check widths from 320px upward when making layout changes.
