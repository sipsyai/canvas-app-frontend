# Canvas App Frontend

**Modern No-Code Platform Frontend** - Built with React 19, Vite 6, TypeScript, and React Aria Components

## 🚀 Tech Stack

### Core
- **React 19** - Latest React with modern features
- **Vite 6** - Ultra-fast build tool with SWC
- **TypeScript 5.7** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling

### State & Data
- **TanStack Query v5** - Server state management
- **Zustand** - Lightweight client state
- **TanStack Table v8** - Powerful data tables
- **React Hook Form + Zod** - Forms & validation

### UI Components
- **React Aria Components** - Adobe's accessible primitives
- **dnd-kit** - Drag & drop functionality
- **React Flow** - Workflow canvas editor
- **Lucide React** - Beautiful icons

### Backend Integration
- **Axios** - HTTP client
- **React Router v6** - Client-side routing

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Approve build scripts (required once)
pnpm approve-builds

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🗂️ Project Structure

```
canvas-app-frontend/
├── src/
│   ├── app/                   # Application setup
│   │   ├── App.tsx           # Main app component
│   │   └── router.tsx        # Route definitions
│   │
│   ├── features/              # Feature modules
│   │   ├── auth/             # Authentication
│   │   ├── objects/          # Object management
│   │   ├── records/          # Record CRUD
│   │   ├── relationships/    # Relationship builder
│   │   └── applications/     # App collections
│   │
│   ├── components/            # Shared components
│   │   ├── ui/               # UI primitives (React Aria)
│   │   ├── layout/           # Layout components
│   │   └── common/           # Common components
│   │
│   ├── lib/                   # Utilities
│   │   ├── api/              # API client
│   │   └── utils/            # Helper functions
│   │
│   ├── stores/                # Zustand stores
│   ├── hooks/                 # Custom hooks
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
│
├── public/                    # Static assets
├── index.html                 # HTML entry point
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔧 Development

### Scripts

```bash
# Development
pnpm dev              # Start dev server (http://localhost:5173)

# Build & Preview
pnpm build            # Type-check + build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript type checking
```

### Environment Variables

Create `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 📚 Key Features (Planned)

### Phase 1: Foundation
- [x] Project setup with Vite + React + TypeScript
- [x] Tailwind CSS configuration
- [x] TanStack Query setup
- [x] React Router setup
- [ ] Authentication flow
- [ ] Protected routes

### Phase 2: Objects & Fields
- [ ] Field Library UI
- [ ] Object management
- [ ] Field-to-Object mapping
- [ ] Drag-drop field ordering

### Phase 3: Records & Views
- [ ] Data table with TanStack Table
- [ ] Kanban board with dnd-kit
- [ ] Record detail page
- [ ] Form builder

### Phase 4: Relationships
- [ ] Relationship builder UI
- [ ] Lookup field selector
- [ ] Many-to-many junction UI
- [ ] Related records display

### Phase 5: Workflow (React Flow)
- [ ] Workflow canvas editor
- [ ] Custom node types
- [ ] Connection rules
- [ ] Save/load workflows

## 🎨 Component Library

We use **React Aria Components** for accessible, unstyled primitives:

```tsx
import { Button, Dialog, TextField } from 'react-aria-components';

// Fully accessible, keyboard navigable, screen reader friendly
<Button onPress={() => alert('Clicked!')}>
  Click me
</Button>
```

### Why React Aria?
- ✅ Actively maintained by Adobe
- ✅ WAI-ARIA compliant
- ✅ Full keyboard navigation
- ✅ Screen reader support
- ✅ Internationalization (i18n)
- ✅ Mobile-friendly

## 📖 Backend Integration

Connect to the FastAPI backend:

```typescript
// src/lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor for JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

## 🧪 Testing (Coming Soon)

```bash
# Unit tests with Vitest
pnpm test

# E2E tests with Playwright
pnpm test:e2e
```

## 📦 Build & Deploy

### Build for Production

```bash
pnpm build
# Output: dist/
```

### Deploy Options

**Vercel (Recommended):**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Cloudflare Pages:**
```bash
wrangler pages deploy dist
```

## 🔗 Related Projects

- **Backend:** [canvas-app-backend](../canvas-app-backend) - FastAPI + PostgreSQL
- **Documentation:** [FRONTEND_TECHNOLOGY_RESEARCH.md](./FRONTEND_TECHNOLOGY_RESEARCH.md)

## 📝 License

[Your License]

---

**Status:** ✅ Project Setup Complete - Ready for Feature Development

**Next Steps:**
1. Implement authentication UI
2. Build Field Library components
3. Create Object management pages
4. Develop Record CRUD interface
