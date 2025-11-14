# QuotaTrackr - Sales Target & Progress Monitoring Platform

## Project Overview
QuotaTrackr is a comprehensive web platform for monitoring sales targets and tracking customer progress end-to-end. The application serves Admin, GM (General Manager), and AM (Account Manager) roles with role-specific dashboards and features.

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter
- **Charts**: Recharts
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: JWT-based sessions with bcrypt password hashing

## Design System
- **Font**: Inter (weights: 400, 500, 600, 700)
- **Primary Color**: #0EA5E9 (Sky Blue) - HSL(199, 89%, 48%)
- **Accent Color**: #22C55E (Emerald Green) - HSL(142, 71%, 45%)
- **Design Philosophy**: Clean, modern, data-focused enterprise dashboard
- **Spacing**: Consistent use of Tailwind units (2, 4, 6, 8)
- **Typography Hierarchy**: Text-3xl for page titles, text-xl for sections, text-lg for cards

## Project Structure
```
client/
  src/
    components/
      ui/              # shadcn/ui components
      dashboards/      # Role-specific dashboard components
      app-sidebar.tsx  # Main navigation sidebar
      kpi-card.tsx     # Reusable KPI metric card
      status-badge.tsx # Customer status badge component
      customer-detail.tsx # Customer detail with progress timeline
      protected-route.tsx # Authentication wrapper
    lib/
      currency.ts      # Rupiah formatting utilities
      queryClient.ts   # TanStack Query configuration
    pages/
      login.tsx        # Authentication page
      dashboard.tsx    # Main dashboard router (role-based)
      users.tsx        # User management (Admin/GM)
      targets.tsx      # Target management
      customers.tsx    # Customer CRUD (AM only)
      reports.tsx      # Reporting interface
      presentation.tsx # AM presentation mode
    App.tsx            # Main app with routing
    index.css          # Tailwind + design tokens

server/
  db.ts               # Database connection
  storage.ts          # Data access layer
  routes.ts           # API endpoints
  index.ts            # Express server

shared/
  schema.ts           # Drizzle schema + TypeScript types
```

## Database Schema

### Users
- Hierarchical structure: Admin → GM → AM
- Roles: ADMIN, GM, AM
- Email authentication with bcrypt hashed passwords
- Department assignment for GM/AM
- GM assignment for AM (gmId foreign key)

### Departments
- Simple name-based organization
- Used for grouping GMs and AMs

### Targets
- Monthly targets per AM (period: YYYY-MM format)
- Decimal amounts in Rupiah
- Set by Admin or GM

### Customers
- Owned by AM (amId foreign key)
- 5-stage status pipeline: Prospect → On Going → Negotiation → Closed Won/Lost
- Potential amount in Rupiah
- Estimated close date

### Progresses
- Activity timeline per customer
- Date, note, status update
- Optional file URL for attachments
- Linked to both customer and AM

## Key Features

### Authentication & RBAC
- Email/password login
- Role-based route protection
- Automatic redirect to role-appropriate dashboard

### Role Capabilities
**Admin:**
- Manage all users (GMs and AMs)
- Create departments
- Set targets for all AMs
- View company-wide dashboard and reports

**GM:**
- Manage AMs under their department
- Set targets for their AMs
- View department dashboard and AM performance
- Access reports for their team

**AM:**
- Manage own customer pipeline
- Log customer progress with timeline
- View personal targets and dashboard
- Access presentation mode for client meetings

### Dashboards
- **Admin**: Total targets/actuals, AM count, achievement rate, bar chart comparison
- **GM**: Department totals, AM performance breakdown
- **AM**: Personal target, total potential, customer status pie chart, progress rate

### Customer Management
- Full CRUD for AM's customers
- Status pipeline tracking
- Progress timeline with file upload capability
- Detailed customer view with activity history

### Target Management
- Period-based (monthly) target setting
- Admin/GM can set targets for AMs
- AM can view their targets with Rupiah formatting

### Reporting
- Target vs actual by AM
- Period filtering
- Achievement rate calculations
- Summary metrics

### Presentation Mode
- Clean, full-screen view for AM
- Customer cards with key information
- Recent activity timeline
- Print-friendly layout

## Currency Formatting
- Indonesian Rupiah (Rp) with dot separators
- Format: "Rp 1.500.000"
- Compact format for large numbers: "Rp 1,5M" or "Rp 1,5Jt"
- Right-aligned in tables

## Status Badge Colors
- Prospect: Blue (bg-blue-100)
- On Going: Yellow (bg-yellow-100)
- Negotiation: Purple (bg-purple-100)
- Closed Won: Emerald (bg-emerald-100)
- Closed Lost: Gray (bg-gray-100)

## Development Workflow
1. Run `npm run dev` to start both frontend (Vite) and backend (Express)
2. Database migrations: `npm run db:push` (Drizzle)
3. Frontend served on port 5000
4. Backend API routes prefixed with `/api`

## API Endpoints (Planned)
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `GET /api/users` - List users (with role filtering)
- `POST /api/users` - Create user
- `DELETE /api/users/:id` - Delete user
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `GET /api/targets` - List targets
- `POST /api/targets` - Create target
- `GET /api/customers` - List customers (AM's own or filtered by role)
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/progresses` - Get customer progress timeline
- `POST /api/customers/:id/progresses` - Log progress
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/gm/:id` - GM dashboard stats
- `GET /api/dashboard/am/:id` - AM dashboard stats
- `GET /api/reports` - Generate reports with period filter

## User Preferences
- Desktop-first responsive design
- Minimal use of animations (subtle hover/active states)
- Focus on data density and clarity
- Clean, professional aesthetic for business use
- Sidebar navigation with role-conditional menu items

## Recent Changes
- 2025-01-14: Initial project setup with complete schema and all frontend components
- Configured design tokens (Inter font, sky blue primary, emerald accent)
- Built all role-specific dashboards with Recharts visualizations
- Implemented complete customer management with progress timeline
- Created presentation mode for AM role
- Set up authentication flow and protected routes
- Implemented all backend API endpoints with Express
- Set up PostgreSQL database with Drizzle ORM and migrations
- Implemented session-based authentication with bcrypt password hashing
- Connected all frontend components to backend APIs using TanStack Query
- Added file upload functionality for progress tracking (multer with 5MB limit)
- Implemented password reset with role-based permissions (Admin/GM/own)
- Added optimistic updates to customer and user mutations for instant feedback
- Seeded database with initial users (Admin, GM, AM)

## Completed Features
✅ Role-based authentication and authorization
✅ User management with hierarchical access control
✅ Department management
✅ Target setting and tracking by period
✅ Customer CRUD with 5-stage status pipeline
✅ Progress timeline with file attachment support
✅ Dashboard aggregations for all roles (Admin, GM, AM)
✅ Reporting with period filtering
✅ Presentation mode for AM
✅ File uploads for progress documentation
✅ Password reset functionality
✅ Optimistic UI updates
✅ Rupiah currency formatting throughout

## Next Steps
- Add export functionality for reports (CSV/PDF)
- Implement automated reminders for stale customers
- Add advanced filtering and search
- Performance optimization for large datasets
- Add email notifications for milestone achievements
