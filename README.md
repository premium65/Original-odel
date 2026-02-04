# ODEL ADS - Rating-Ads Platform

Full-stack web application where users earn money by clicking/watching ads (101.75 LKR per click).

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SESSION_SECRET

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## Documentation

- **[Project Overview](CLAUDE.md)** - Complete system guide
- **[Admin Panel Reference](ADMIN_SOURCE_CODE_REFERENCE.md)** - Admin features and source code
- **[Manual Deposit API](MANUAL_DEPOSIT_API.md)** - Admin deposit endpoint documentation
- **[Database Architecture](DATABASE_ARCHITECTURE.md)** - Schema and relationships
- **[Windows Setup](WINDOWS_SETUP_COMPLETE.md)** - Windows deployment guide
- **[Backend Setup](BACKEND_SETUP_GUIDE.md)** - Server configuration

## Key Features

### User Features
- Ad clicking with rewards (101.75 LKR per ad)
- Withdrawal requests
- VIP rewards system (Bronze to Diamond tiers)
- Premium plans
- Event participation

### Admin Features
- **User Management**: Approve, freeze, manage users
- **Manual Deposits**: Add funds to user accounts
- **Transaction Management**: Process withdrawals and deposits
- **Ad Management**: Create and manage ads
- **Premium Plans**: Configure VIP and premium offerings
- **CMS**: Manage site content, branding, and settings

## Tech Stack

- **Frontend**: React 18.3 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Express Session with bcrypt
- **State Management**: TanStack Query

## Environment Variables

Required in `.env`:

```bash
DATABASE_URL=postgresql://user:pass@host/db  # PostgreSQL connection
SESSION_SECRET=your-secret-key               # Session encryption key
NODE_ENV=development                         # or production
PORT=5000                                    # Server port
```

## Project Structure

```
Original-odel/
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/       # Route pages
│   │   ├── components/  # Reusable components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/              # Express backend
│   ├── routes/          # API routes
│   │   └── admin/       # Admin-specific routes
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Data access layer
│   └── app.ts          # Express app setup
├── shared/             # Shared code
│   ├── schema.ts       # Database schema
│   └── routes.ts       # Route definitions
└── attached_assets/    # Static assets
```

## Common Tasks

### Admin Login
1. Navigate to `/admin/login`
2. Default credentials: `admin` / `admin123`
3. Or create admin: `POST /api/admin/auth/setup`

### Manual Deposit
See [MANUAL_DEPOSIT_API.md](MANUAL_DEPOSIT_API.md) for complete documentation.

```bash
POST /api/admin/transactions/deposits/manual
{
  "userId": "user-uuid",
  "amount": "500",
  "description": "Bonus"
}
```

### Database Migrations
```bash
npm run db:push  # Push schema changes to database
```

## Troubleshooting

### 401 Unauthorized Errors
1. Check `SESSION_SECRET` is set in `.env`
2. Re-login through admin panel
3. Verify cookies are enabled in browser

### 500 Server Errors
1. Check `DATABASE_URL` is correct
2. Verify PostgreSQL is accessible
3. Check server logs for detailed errors

### Build Issues
```bash
npm run check    # TypeScript type check
npm run build    # Production build
```

## Support & Documentation

- See [CLAUDE.md](CLAUDE.md) for complete system documentation
- Check [MANUAL_DEPOSIT_API.md](MANUAL_DEPOSIT_API.md) for API details
- Review [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) for schema info

## License

MIT
