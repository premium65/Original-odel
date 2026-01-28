# OdelADS - Ad Clicking Reward Platform

## Overview

OdelADS (AdClicker) is a web application where users earn money by watching advertisements. The platform features a user dashboard for tracking earnings and viewing ads, a withdrawal system for cashing out, and an admin panel for managing users, ads, and withdrawal requests. Users have balance fields including milestone amounts, daily rewards, and restriction/promotion modes that affect earnings calculations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark mode focused)
- **Animations**: Framer Motion for page transitions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Build Tool**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Authentication
- **Method**: Replit OpenID Connect (OIDC) authentication
- **Session Management**: Express sessions with PostgreSQL store
- **User Model**: Extended with balance fields, bank details, and restriction/promotion fields

### Key Data Models
- **Users**: Balance tracking (milestoneAmount, milestoneReward, pendingAmount), ad completion stats, bank details, restriction/promotion fields
- **Ads**: Title, description, image, target URL, price, active status
- **Withdrawals**: Amount, method, account details, status (pending/approved/rejected)
- **Deposits**: Transaction history for balance changes

### Route Structure
- `/api/ads` - Ad CRUD operations and click processing
- `/api/withdrawals` - Withdrawal requests and admin approval
- `/api/users` - User management (admin operations)
- `/api/auth/user` - Current user session data

### Scheduled Tasks
- Uses node-cron for scheduled jobs (e.g., daily milestone reward resets)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and migrations

### Authentication
- **Replit Auth**: OpenID Connect integration for user authentication
- **Passport.js**: Authentication middleware with OpenID Client strategy

### Third-Party Services
- No external payment processors currently integrated
- Email functionality available via nodemailer (not fully implemented)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ISSUER_URL`: OIDC issuer (defaults to Replit)
- `REPL_ID`: Replit environment identifier

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express-session` / `connect-pg-simple`: Session management
- `openid-client`: OIDC authentication
- `node-cron`: Scheduled task execution
- `zod`: Runtime type validation