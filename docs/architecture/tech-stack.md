# Canvas App Frontend - Technology Stack Research & Recommendations

**Date:** 2026-01-18
**Purpose:** Define optimal frontend architecture for Object-Centric No-Code Platform
**Backend:** FastAPI + PostgreSQL (JSONB Hybrid Model)
**Status:** 🔍 Research Complete - Ready for Implementation

---

## Executive Summary

Bu döküman, **canvas-app-backend** için modern, production-ready bir frontend teknoloji stack'i belirlemek amacıyla detaylı araştırma ve analiz içerir.

### 🎯 Proje Gereksinimleri

Backend API'den gelen gereksinimler:

1. **Dynamic Object Management**: Contact, Company, Opportunity gibi kullanıcı tanımlı object'ler
2. **Field Library**: Tekrar kullanılabilir field kütüphanesi (Email, Phone, Name, etc.)
3. **Multi-View Support**: Table, Kanban, Calendar, Form görünümleri
4. **Relationship Management**: Object'ler arası 1:N ve N:N ilişkiler
5. **Drag & Drop**: Field ekleme, kanban kartları, form builder
6. **Real-time Updates**: WebSocket desteği (future)
7. **Complex Data Tables**: Sorting, filtering, pagination
8. **Form Builder**: Dinamik form oluşturma

---

## 🏗️ Recommended Technology Stack

### Core Framework & Build Tool

```yaml
Framework: React 19
Build Tool: Vite 6.0
Compiler: SWC (Rust-based)
Language: TypeScript 5.7
Package Manager: pnpm (recommended) / npm
```

#### Rationale

**React 19** (Released late 2024):
- ✅ **Server Actions**: 'use server' directive ile form submissions
- ✅ **Compiler Improvements**: React Compiler ile otomatik optimizasyon
- ✅ **Better Suspense**: Async component desteği
- ✅ **Document Metadata**: Helmet gerekmeden meta tag'ler
- ✅ **Stable Ecosystem**: 10+ yıllık olgun ekosistem

**Vite 6.0**:
- ✅ **20-30x Faster**: esbuild ile traditional bundler'lardan çok hızlı
- ✅ **Instant HMR**: Hot Module Replacement < 100ms
- ✅ **Native ESM**: Modern browser'lar için optimize
- ✅ **SWC Integration**: TypeScript/JSX transform hızı
- ✅ **Tree Shaking**: Production bundle optimization

**Sources:**
- [Complete Guide to React + TypeScript + Vite (2026)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)
- [React + Vite: The Fastest Stack for 2026](https://devot.team/blog/react-vite)
- [React 19 and TypeScript Best Practices (2025)](https://medium.com/@CodersWorld99/react-19-typescript-best-practices-the-new-rules-every-developer-must-follow-in-2025-3a74f63a0baf)

---

### State Management

```yaml
Server State: TanStack Query v5
Client State: Zustand 4.x
Table State: TanStack Table v8 (built-in)
Form State: React Hook Form v7
```

#### TanStack Query (React Query)

**Use Case:** Backend API data fetching, caching, synchronization

```typescript
// Example: Fetch objects
const { data: objects, isLoading } = useQuery({
  queryKey: ['objects'],
  queryFn: () => apiClient.get('/api/objects'),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Features:**
- ✅ **Automatic Caching**: Akıllı cache invalidation
- ✅ **Background Refetching**: Stale data güncellemesi
- ✅ **Optimistic Updates**: UI hemen güncellenir
- ✅ **Pagination/Infinite Scroll**: Built-in support
- ✅ **DevTools**: React Query DevTools

**Why NOT Redux?**
- ❌ Overkill for server state management
- ❌ TanStack Query zaten server state'i yönetiyor
- ❌ Boilerplate kod fazlalığı

#### Zustand

**Use Case:** Minimal client-side state (UI state, modals, preferences)

```typescript
// Example: App state
const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  currentApp: null,
  setCurrentApp: (app) => set({ currentApp: app }),
}));
```

**Features:**
- ✅ **Minimal Bundle**: ~1.5 KB gzipped
- ✅ **No Boilerplate**: Redux gibi provider/action/reducer yok
- ✅ **TypeScript Native**: Type-safe
- ✅ **DevTools**: Redux DevTools uyumlu
- ✅ **Middleware Support**: Persist, immer, devtools

**Sources:**
- [TanStack Query vs State Managers](https://tanstack.com/query/v4/docs/framework/react/guides/does-this-replace-client-state)
- [Modernizing React: Redux to Zustand & TanStack Query](https://makepath.com/modernizing-your-react-applications-from-redux-to-zustand-tanstack-query-and-redux-toolkit/)
- [TanStack in 2026: Complete Guide](https://www.codewithseb.com/blog/tanstack-ecosystem-complete-guide-2026)

---

### UI Component Library

```yaml
Base Components: shadcn/ui (Radix UI + Tailwind)
Styling: Tailwind CSS 3.4
Icons: lucide-react
Headless UI: Radix UI
```

#### ⚠️ IMPORTANT: Radix UI Maintenance Concern

**CRITICAL UPDATE (2026):**
Radix UI creators announced the library **isn't being actively maintained**. This affects shadcn/ui which is built on Radix primitives.

**Alternatives:**
1. **React Aria** (Adobe) - Actively maintained, WAI-ARIA compliant
2. **Base UI** (MUI team) - Headless components, modern
3. **Headless UI** (Tailwind Labs) - Minimal, well-maintained

**Recommendation:**

**For This Project: Continue with shadcn/ui BUT with Migration Plan**

**Why?**
- ✅ shadcn/ui kod'u **kendi projenizde** (copy-paste pattern)
- ✅ Radix UI stable release (breaking change riski düşük)
- ✅ Community fork'lar zaten başladı (örn: `@radix-ui/react-fork`)
- ✅ Migration path hazır (React Aria'ya geçiş kolay)

**Migration Timeline:**
- **Q1 2026**: shadcn/ui ile başla (rapid development)
- **Q2-Q3 2026**: React Aria'ya migration plan
- **Q4 2026**: Production'da React Aria + Untitled UI React

**Interim Solution:**
```typescript
// Use shadcn/ui components but abstract them
// components/ui/button.tsx (shadcn/ui wrapper)

// Easy to replace with React Aria later:
// components/ui/button-aria.tsx
```

#### Tailwind CSS

**Use Case:** Utility-first styling

```yaml
Config:
  - JIT Mode: Enabled (instant compilation)
  - Plugins: @tailwindcss/forms, @tailwindcss/typography
  - Dark Mode: class strategy
  - Content Paths: src/**/*.{ts,tsx}
```

**Features:**
- ✅ **Rapid Development**: Utility classes hızlı prototipleme
- ✅ **Consistent Design**: Design system out-of-the-box
- ✅ **Tree Shaking**: Kullanılmayan CSS otomatik temizlenir
- ✅ **Responsive**: Mobile-first approach
- ✅ **Dark Mode**: Built-in support

**Sources:**
- [15 Best React UI Libraries for 2026](https://www.builder.io/blog/react-component-libraries-2026)
- [shadcn/ui vs Radix vs Tailwind UI (2025)](https://javascript.plainenglish.io/shadcn-ui-vs-radix-ui-vs-tailwind-ui-which-should-you-choose-in-2025-b8b4cadeaa25)
- [14 Best React UI Component Libraries (2026)](https://www.untitledui.com/blog/react-component-libraries)

---

### Data Table & Virtualization

```yaml
Data Table: TanStack Table v8
Virtualization: @tanstack/react-virtual
```

#### TanStack Table

**Use Case:** Complex data tables (Object records)

```typescript
// Example: Contact table
const table = useReactTable({
  data: contacts,
  columns: contactColumns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

**Features:**
- ✅ **Headless**: UI'dan bağımsız (Tailwind + shadcn/ui ile combine)
- ✅ **Sorting**: Multi-column, custom comparators
- ✅ **Filtering**: Global + column filters
- ✅ **Pagination**: Server + client-side
- ✅ **Row Selection**: Multi-select, checkbox
- ✅ **Column Resizing**: Drag-to-resize
- ✅ **Virtualization**: @tanstack/react-virtual ile 10k+ rows

**Why NOT AG-Grid / Material Table?**
- ❌ AG-Grid ücretli (commercial license)
- ❌ Material Table eski, bakım yok
- ✅ TanStack Table modern, free, flexible

**Sources:**
- [TanStack Table Docs](https://tanstack.com/table/v8/docs/framework/react/guide/table-state)

---

### Drag & Drop

```yaml
Library: dnd-kit
Fallback: @hello-pangea/dnd (for simpler cases)
```

#### dnd-kit

**Use Case:** Kanban boards, form builder, field reordering

```typescript
// Example: Kanban board
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function KanbanBoard() {
  return (
    <DndContext collisionDetection={closestCorners}>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </SortableContext>
    </DndContext>
  );
}
```

**Features:**
- ✅ **Flexible & Powerful**: En kapsamlı drag-drop library
- ✅ **60fps Performance**: Hardware acceleration
- ✅ **Auto-scrolling**: Edge'lerde otomatik scroll
- ✅ **Collision Detection**: Akıllı drop zone tespiti
- ✅ **Accessibility**: Keyboard + screen reader support
- ✅ **Touch Support**: Mobile uyumlu

**@hello-pangea/dnd (Fallback):**
- Daha basit use case'ler için (list reordering)
- react-beautiful-dnd fork (maintained)

**Sources:**
- [Top 5 Drag-and-Drop Libraries (2026)](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [Build Kanban with dnd-kit](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html)
- [Drag and Drop Kanban with React](https://radzion.com/blog/kanban/)

---

### Form Management

```yaml
Forms: React Hook Form v7
Validation: Zod
Form Builder: react-hook-form + custom builder
```

#### React Hook Form + Zod

**Use Case:** Dynamic form creation, record editing

```typescript
// Example: Contact form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  name: z.string().min(2),
});

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

**Features:**
- ✅ **Performance**: Minimal re-renders (uncontrolled inputs)
- ✅ **TypeScript**: Type-safe form values
- ✅ **Validation**: Zod schema validation
- ✅ **Dynamic Forms**: Field array support (perfect for no-code)
- ✅ **Small Bundle**: ~8.5 KB gzipped

**Why Zod?**
- ✅ TypeScript-first schema validation
- ✅ Runtime type safety
- ✅ Error messages customizable
- ✅ Integration with React Hook Form

**Form Builder (Custom):**
- React Hook Form + dnd-kit
- Drag fields → Generate schema → Render form
- Similar to Formium/Tally.so approach

**Alternative:** FormEngine (open-source, but overkill)

**Sources:**
- [FormEngine - Drag & Drop Form Builder](https://formengine.io/)

---

### Routing

```yaml
Router: React Router v6
Type-safe Routes: @tanstack/react-router (consider for v2)
```

#### React Router v6

**Use Case:** Client-side routing

```typescript
// Example: App routes
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: 'apps', element: <AppsPage /> },
      { path: 'apps/:appId', element: <AppDetail /> },
      { path: 'apps/:appId/objects/:objectId', element: <ObjectRecords /> },
    ],
  },
]);
```

**Features:**
- ✅ **Nested Routes**: Layout hierarchy
- ✅ **Data Loading**: Loader functions (SSR-like pattern)
- ✅ **Error Boundaries**: Route-level error handling
- ✅ **Code Splitting**: Lazy loading routes

**Future Consideration: TanStack Router**
- Type-safe params/search
- File-based routing option
- Better DX for complex apps

---

### HTTP Client & API Layer

```yaml
HTTP Client: Axios
API Client: Custom wrapper with TanStack Query
Real-time: Socket.IO (future)
```

#### Axios

**Use Case:** HTTP requests to FastAPI backend

```typescript
// utils/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Features:**
- ✅ **Interceptors**: Global request/response handling
- ✅ **TypeScript**: Type-safe responses
- ✅ **Cancellation**: AbortController support
- ✅ **Progress**: Upload/download progress

**Integration with TanStack Query:**
```typescript
// hooks/useObjects.ts
export const useObjects = () => {
  return useQuery({
    queryKey: ['objects'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/objects');
      return data;
    },
  });
};
```

---

### Development Tools

```yaml
Linting: ESLint 9 + typescript-eslint
Formatting: Prettier 3
Type Checking: TypeScript 5.7
Git Hooks: Husky + lint-staged
Testing: Vitest + React Testing Library
E2E Testing: Playwright (recommended)
```

#### ESLint + Prettier

**ESLint Config:**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off" // React 19 doesn't need import
  }
}
```

**Prettier Config:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

#### Vitest + React Testing Library

**Why Vitest over Jest?**
- ✅ Vite-native (same config)
- ✅ 10x faster than Jest
- ✅ ESM support out-of-the-box
- ✅ Watch mode optimized

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## 📦 Complete Package.json Dependencies

```json
{
  "name": "canvas-app-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.28.0",
    "@tanstack/react-query": "^5.62.7",
    "@tanstack/react-table": "^8.20.5",
    "@tanstack/react-virtual": "^3.10.8",
    "zustand": "^4.5.5",
    "axios": "^1.7.9",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^9.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-tabs": "^1.1.1",
    "lucide-react": "^0.468.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react-swc": "^3.7.2",
    "vite": "^6.0.5",
    "typescript": "^5.7.2",
    "@typescript-eslint/eslint-plugin": "^8.19.1",
    "@typescript-eslint/parser": "^8.19.1",
    "eslint": "^9.17.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.1.0",
    "prettier": "^3.4.2",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "vitest": "^2.1.8",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "@vitest/ui": "^2.1.8",
    "jsdom": "^25.0.1",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.11"
  }
}
```

---

## 🏗️ Recommended Project Structure

```
canvas-app-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/                       # Application setup
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx          # Query, Router providers
│   │
│   ├── features/                  # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── objects/
│   │   │   ├── components/
│   │   │   │   ├── ObjectList.tsx
│   │   │   │   ├── ObjectForm.tsx
│   │   │   │   └── FieldLibrary.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useObjects.ts
│   │   │   │   └── useFields.ts
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── records/
│   │   │   ├── components/
│   │   │   │   ├── RecordTable.tsx
│   │   │   │   ├── RecordDetail.tsx
│   │   │   │   ├── KanbanView.tsx
│   │   │   │   └── FormBuilder.tsx
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   ├── relationships/
│   │   └── applications/
│   │
│   ├── components/                # Shared components
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── common/
│   │       ├── DataTable.tsx      # TanStack Table wrapper
│   │       ├── DraggableList.tsx  # dnd-kit wrapper
│   │       └── FormRenderer.tsx
│   │
│   ├── lib/                       # Utilities & config
│   │   ├── api/
│   │   │   ├── client.ts          # Axios instance
│   │   │   ├── endpoints.ts
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── cn.ts              # Tailwind merge
│   │   │   ├── date.ts
│   │   │   └── validation.ts
│   │   └── constants.ts
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── useAppStore.ts
│   │   └── useUserStore.ts
│   │
│   ├── hooks/                     # Global hooks
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   │
│   ├── types/                     # Global types
│   │   ├── api.ts
│   │   └── models.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts
│
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Day 1-2: Project Setup**
- [ ] Initialize Vite + React + TypeScript
- [ ] Configure Tailwind CSS + PostCSS
- [ ] Setup ESLint + Prettier + Husky
- [ ] Install core dependencies
- [ ] Configure absolute imports (@/ alias)

**Day 3-4: Core Infrastructure**
- [ ] Setup React Router
- [ ] Configure TanStack Query
- [ ] Create Axios client + interceptors
- [ ] Setup Zustand stores (app, user)
- [ ] Create layout components (AppShell, Navbar)

**Day 5-7: shadcn/ui Setup**
- [ ] Initialize shadcn/ui CLI
- [ ] Add essential components (Button, Input, Dialog, etc.)
- [ ] Create custom theme (colors, typography)
- [ ] Test dark mode support

### Phase 2: Authentication (Week 2)

**Day 1-3: Auth Flow**
- [ ] Login/Register pages
- [ ] JWT token management
- [ ] Protected routes HOC
- [ ] Auth state with Zustand
- [ ] Persist auth state (localStorage)

**Day 4-5: API Integration**
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register
- [ ] GET /api/auth/me
- [ ] Logout functionality
- [ ] Error handling (401, 403)

### Phase 3: Objects & Fields (Week 3-4)

**Week 3: Field Library**
- [ ] Field list component (TanStack Table)
- [ ] Field creation form (React Hook Form + Zod)
- [ ] Field types support (text, email, phone, etc.)
- [ ] Field categories
- [ ] Field search & filter

**Week 4: Object Management**
- [ ] Object list page
- [ ] Object creation form
- [ ] Field Library modal (drag-to-add)
- [ ] Object-Field mapping UI
- [ ] Field reordering (dnd-kit)

### Phase 4: Records & Views (Week 5-6)

**Week 5: Table View**
- [ ] RecordTable component (TanStack Table)
- [ ] Dynamic columns (from object fields)
- [ ] Sorting, filtering, pagination
- [ ] Inline editing (React Hook Form)
- [ ] Bulk actions (select, delete)

**Week 6: Kanban View**
- [ ] KanbanBoard component (dnd-kit)
- [ ] Drag-drop cards between columns
- [ ] Card detail modal
- [ ] Status field selection
- [ ] Add new card

### Phase 5: Relationships (Week 7)

- [ ] Relationship definition UI
- [ ] Lookup field (N:1) selector
- [ ] Many-to-Many junction UI
- [ ] Related records list component
- [ ] Link/unlink records

### Phase 6: Form Builder (Week 8)

- [ ] Drag-drop form builder (dnd-kit)
- [ ] Field palette component
- [ ] Form preview
- [ ] Save form layout (object.views.form)
- [ ] Render saved form

### Phase 7: Polish & Testing (Week 9-10)

**Week 9: UI/UX Polish**
- [ ] Loading states (Skeleton UI)
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Empty states
- [ ] Responsive design (mobile)

**Week 10: Testing & Deployment**
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Performance optimization
- [ ] Bundle size analysis
- [ ] Deploy to Vercel/Netlify

---

## ⚠️ Critical Decisions & Trade-offs

### 1. Radix UI Maintenance Risk

**Problem:** Radix UI not actively maintained
**Impact:** shadcn/ui dependency risk
**Mitigation:**
- Start with shadcn/ui (faster development)
- Abstract components behind custom wrappers
- Plan React Aria migration (Q2-Q3 2026)
- Monitor community forks

**Migration Example:**
```typescript
// v1: shadcn/ui (Radix)
import { Button } from '@/components/ui/button';

// v2: Wrapper (easy to swap)
import { Button } from '@/components/base/button';
// → Internal implementation can switch to React Aria
```

### 2. State Management Strategy

**Why NOT Redux Toolkit?**
- TanStack Query handles server state better
- Zustand simpler for client state
- Reduces boilerplate by 70%

**Why NOT Context API?**
- Performance issues with frequent updates
- Prop drilling in complex components
- No DevTools support

**Why TanStack Query + Zustand?**
- Clear separation: server vs client state
- Minimal bundle size (combined ~10 KB)
- Best-in-class DX

### 3. Component Library Choice

**Alternatives Considered:**
1. **Material UI** - Too opinionated, large bundle
2. **Ant Design** - Chinese-centric design, heavy
3. **Chakra UI** - Good but less flexible than Tailwind
4. **Headless UI** - Minimal, but less features than Radix

**Winner: shadcn/ui + Tailwind**
- Full control over code
- Tailwind flexibility
- Modern design patterns
- Copy-paste = no dependency hell

---

## 📊 Performance Targets

### Bundle Size
- **Initial Load:** < 250 KB (gzipped)
- **Lazy Routes:** < 50 KB each
- **Total (all routes):** < 500 KB

### Lighthouse Scores
- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 90+

### Runtime Performance
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Page Transitions:** < 100ms
- **Table Rendering (1000 rows):** < 50ms

---

## 🔗 Sources & References

### Technology Research
- [Complete Guide to React + TypeScript + Vite (2026)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)
- [React 19 and TypeScript Best Practices (2025)](https://medium.com/@CodersWorld99/react-19-typescript-best-practices-the-new-rules-every-developer-must-follow-in-2025-3a74f63a0baf)
- [React + Vite: The Fastest Stack for 2026](https://devot.team/blog/react-vite)
- [JavaScript Frameworks - Heading into 2026](https://dev.to/this-is-learning/javascript-frameworks-heading-into-2026-2hel)

### State Management
- [TanStack Query vs State Managers](https://tanstack.com/query/v4/docs/framework/react/guides/does-this-replace-client-state)
- [Modernizing React: Redux to Zustand & TanStack Query](https://makepath.com/modernizing-your-react-applications-from-redux-to-zustand-tanstack-query-and-redux-toolkit/)
- [TanStack in 2026: Complete Guide](https://www.codewithseb.com/blog/tanstack-ecosystem-complete-guide-2026)

### UI Components
- [15 Best React UI Libraries for 2026](https://www.builder.io/blog/react-component-libraries-2026)
- [shadcn/ui vs Radix vs Tailwind UI (2025)](https://javascript.plainenglish.io/shadcn-ui-vs-radix-ui-vs-tailwind-ui-which-should-you-choose-in-2025-b8b4cadeaa25)
- [14 Best React UI Component Libraries (2026)](https://www.untitledui.com/blog/react-component-libraries)
- [Best React UI Component Libraries (2026)](https://blog.croct.com/post/best-react-ui-component-libraries)

### Drag & Drop
- [Top 5 Drag-and-Drop Libraries (2026)](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [Build Kanban with dnd-kit](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html)
- [Drag and Drop Kanban with React](https://radzion.com/blog/kanban/)

### No-Code Platform Patterns
- [Best No-Code AI Tools 2026](https://www.singular-innovation.com/post/no-code-ai-tools-2026)
- [NoCode Platforms for 2026](https://nocodeapi.com/nocode-platforms-for-2026-what-to-expect-and-what-you-actually-need/)
- [Airtable Front-End Guide](https://www.softr.io/blog/airtable-front-end)

---

## 🎯 Next Steps

1. **Review this document** with team/stakeholders
2. **Approve technology choices** or discuss alternatives
3. **Start Phase 1** (Project Setup) following roadmap
4. **Create GitHub repository** and initialize project
5. **Setup CI/CD pipeline** (GitHub Actions + Vercel)

---

**Status:** ✅ Research Complete - Ready for Implementation
**Estimated Development Time:** 10 weeks (MVP with core features)
**Team Size:** 1-2 frontend developers
**Tech Stack Version:** 2026 Q1

**Questions or Concerns?** Review Backend API documentation at `/Users/ali/Documents/Projects/canvas-app-backend/docs/api/00-FRONTEND-GUIDE.md`
