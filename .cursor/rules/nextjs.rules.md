# Next.js Rules

## Project Structure

- Use the `app/` directory (Next.js 13+) with App Router; prefer Server Components by default.
- Organize features under `src/features/<feature-name>` with components, hooks, utils, styles.
- Keep API routes lightweight (proxy, SSR helpers); business logic stays in NestJS backend.

## Code Style

- Write functional components with TypeScript interfaces.
- Use `"use client"` only when necessary (forms, interactive UI).
- Avoid inline styles; prefer Tailwind CSS or styled-components.
- Create reusable hooks (`useAuth`, `useFetch`, `useTheme`) for shared logic.

## Data Fetching

- Use `react-query` or Next.js `fetch` with caching for data fetching.
- Apply `getServerSideProps` / `getStaticProps` only for SSR/SSG; keep domain logic in backend.
- Use ISR (Incremental Static Regeneration) for performance optimization.

## Routing

- Dynamic routes: `[id].tsx` or `app/[id]/page.tsx`.
- Nested layouts: `app/(auth)/login/page.tsx`.
- Use `next/link` for navigation; integrate with `expo-linking` for deep linking.

## Performance

- Optimize images with `next/image` (WebP, lazy loading).
- Use dynamic imports (`next/dynamic`) for code splitting.
- Prefetch routes with `Link` component.
- Push heavy logic to server components; minimize client-side libraries.

## State Management

- Global state: Context + reducer or Zustand.
- Data fetching: `react-query` or Next.js cache.
- Avoid Redux unless enterprise-scale complexity requires it.

## Error Handling

- Global error boundary: `app/error.tsx`.
- Validation: Zod + DTOs.
- Logging: Integrate Sentry (`@sentry/nextjs`).

## Security

- Sanitize user inputs (DOMPurify).
- Use secure cookies (`httpOnly`, `sameSite`, `secure`).
- Implement CSRF protection (`next-csrf`).
- Enforce HTTPS in production.

## Testing

- Unit tests: Jest + React Testing Library.
- Integration tests: Playwright or Cypress.
- Snapshot tests for UI consistency.

## Internationalization

- Use `next-intl` or `next-i18next` for i18n.
- Support RTL layouts.
- Ensure accessibility: text scaling, ARIA roles.
