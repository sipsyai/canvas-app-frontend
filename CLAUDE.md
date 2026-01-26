# Canvas App Frontend

No-code platform frontend - React 19 + Vite 6 + TypeScript 5.7

## Commands

- Start: `./start.sh` | Stop: `./stop.sh`
- Build: `npm run build`
- Lint: `npm run lint --fix`
- Type check: `npm run type-check`

## Documentation

@docs/SUMMARY.md

## Code Rules

@.claude/rules/accessibility.md
@.claude/rules/components.md
@.claude/rules/api-patterns.md
@.claude/rules/typescript.md

## Project Structure

- `src/features/` - Feature modules (auth, fields, objects, records, relationships, applications)
- `src/components/ui/` - React Aria components (WCAG 2.1 AA)
- `src/lib/api/` - API client (Axios)
- `src/stores/` - Zustand stores

## Critical Rules

1. UI components MUST use React Aria (no plain HTML forms)
2. API calls MUST go through `src/lib/api/client.ts`
3. Turkish language for user-facing documentation

## Key Files

- API Client: `src/lib/api/client.ts`
- Router: `src/app/router.tsx`
- Auth: `src/features/auth/`

## Environment

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
