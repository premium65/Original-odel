# RateHub - Community Rating Platform

## Overview

RateHub is a community-driven rating and review platform that allows users to register, submit ratings for other community members, and share reviews. The application features an admin approval workflow where new user registrations must be approved before they can fully participate in the platform. The system is built with a React frontend using shadcn/ui components and a Node.js/Express backend with PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR and optimized production builds
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query (React Query)** for server state management, data fetching, and caching

**UI Component Library**
- **shadcn/ui** components built on Radix UI primitives (configured with "new-york" style)
- **Tailwind CSS** for styling with custom design tokens defined in CSS variables
- Component variants managed with `class-variance-authority`
- Design system follows Material Design principles prioritizing clarity and efficient workflows

**State Management**
- Server state: TanStack Query with query key-based caching
- Form state: React Hook Form with Zod schema validation
- Session state: Managed server-side with cookies, queried via `/api/auth/me` endpoint

**Key Frontend Patterns**
- Form validation using `@hookform/resolvers` with Zod schemas shared between client and server
- Toast notifications via custom hook (`useToast`) with Radix Toast primitives
- Responsive design with mobile-first approach using Tailwind breakpoints

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- Separate entry points for development (`index-dev.ts`) and production (`index-prod.ts`)
- Development mode integrates Vite middleware for SSR-like rendering of `index.html`
- Production mode serves pre-built static assets from `dist/public`

**Session Management**
- **express-session** middleware with configurable session store
- Sessions stored with `connect-pg-simple` (PostgreSQL session store)
- Cookie-based authentication with HTTP-only cookies
- Session data includes `userId` for authenticated requests

**Authentication & Authorization**
- **bcrypt** for password hashing with 10 salt rounds
- Password verification on login
- Admin role determined by `isAdmin` flag (0 = regular user, 1 = admin)
- Route-level authorization checks (admin routes verify `isAdmin === 1`)

**API Design**
- RESTful API structure under `/api` prefix
- Authentication endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Admin endpoints: `/api/admin/users`, `/api/admin/pending`, `/api/admin/approve/:id`, `/api/admin/freeze/:id`
- Rating endpoints: `/api/ratings`, `/api/ratings/my`

### Data Storage

**Database**
- **PostgreSQL** via Neon serverless driver (`@neondatabase/serverless`)
- WebSocket support for Neon using `ws` package
- Connection pooling with `Pool` from `@neondatabase/serverless`
- **Production/Development Sync**: `db.ts` checks `/tmp/replitdb` first (production deployment) and falls back to `process.env.DATABASE_URL` (development) ensuring both environments use the same Neon PostgreSQL database

**ORM & Schema**
- **Drizzle ORM** for type-safe database operations
- Schema defined in `shared/schema.ts` for code sharing between frontend and backend
- Schema validation using `drizzle-zod` for automatic Zod schema generation from Drizzle tables

**Database Tables**
1. **users** - User accounts with approval workflow
   - Fields: id, username, email, password (hashed), fullName, status (pending/active/frozen), registeredAt, isAdmin
   - Unique constraints on username and email
   
2. **ratings** - User-submitted ratings and reviews
   - Fields: id, userId (FK to users), targetUsername, rating (1-5), comment, createdAt
   - Relation: Many ratings belong to one user

**Data Access Layer**
- **Storage Pattern**: `DatabaseStorage` class implements `IStorage` interface
- Abstraction allows for potential storage backend swapping
- Methods include user CRUD operations and rating management
- Uses Drizzle query builder with type-safe operations

### External Dependencies

**Core Runtime Dependencies**
- **@neondatabase/serverless** (v0.10.4) - PostgreSQL client for Neon database
- **drizzle-orm** (v0.39.1) - TypeScript ORM
- **express** - Web server framework
- **bcrypt** (v6.0.0) - Password hashing
- **express-session** - Session middleware
- **connect-pg-simple** (v10.0.0) - PostgreSQL session store

**Frontend UI Dependencies**
- **@radix-ui/react-*** - Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, select, etc.)
- **@tanstack/react-query** (v5.60.5) - Data fetching and caching
- **react-hook-form** - Form state management
- **@hookform/resolvers** (v3.10.0) - Form validation integration
- **zod** - Schema validation library
- **wouter** - Lightweight routing
- **lucide-react** - Icon library
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** (v0.7.1) - Component variant management
- **cmdk** (v1.1.1) - Command menu component
- **date-fns** (v3.6.0) - Date manipulation
- **vaul** - Drawer component

**Build & Development Tools**
- **vite** - Build tool and dev server
- **@vitejs/plugin-react** - React plugin for Vite
- **typescript** - Type checking
- **tailwindcss** - CSS processing
- **postcss** - CSS transformation
- **autoprefixer** - CSS vendor prefixing
- **drizzle-kit** - Database migration tool
- **esbuild** - JavaScript bundler for server code
- **tsx** - TypeScript execution for development

**Replit-Specific Integrations**
- **@replit/vite-plugin-runtime-error-modal** - Development error overlay
- **@replit/vite-plugin-cartographer** - Code navigation (dev only)
- **@replit/vite-plugin-dev-banner** - Development banner (dev only)