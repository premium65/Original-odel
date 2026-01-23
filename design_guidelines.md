# Design Guidelines: Rating/Review Website

## Design Approach
**Selected Approach:** Design System - Material Design inspired
**Justification:** Information-dense application requiring clear data presentation, form management, and admin workflows. Prioritizes usability and consistency over visual flair.

## Core Design Principles
1. **Clarity First:** Clear visual hierarchy for registration forms and admin data tables
2. **Status Indicators:** Obvious visual distinction between active/frozen/pending accounts
3. **Efficient Workflows:** Streamlined admin approval process with minimal clicks
4. **Trustworthy:** Professional appearance that builds user confidence in registration

---

## Typography
- **Primary Font:** Inter (via Google Fonts CDN)
- **Headings:** 
  - H1: text-3xl md:text-4xl, font-bold
  - H2: text-2xl md:text-3xl, font-semibold
  - H3: text-xl, font-semibold
- **Body:** text-base, font-normal
- **Small Text/Labels:** text-sm, font-medium
- **Admin Tables:** text-sm for density

## Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8, etc.)
- Section padding: py-12 md:py-16
- Component gaps: gap-4 to gap-6
- Form field spacing: space-y-4
- Container max-width: max-w-6xl for content, max-w-7xl for wide layouts

---

## Component Library

### Frontend Components

**Registration Form:**
- Card-based design with shadow and rounded corners
- Vertical form layout with clear labels above inputs
- Input fields with borders and focus states
- Primary action button at bottom
- Success message display after submission
- Status banner showing "Account pending approval"

**Rating Interface:**
- Star rating component with hover states
- Review text area with character count
- User profile display with avatar placeholder
- Rating submission confirmation

**Navigation:**
- Clean header with logo, navigation links, and login/register CTAs
- Sticky navigation on scroll
- Mobile hamburger menu

### Admin Panel Components

**Admin Dashboard:**
- Sidebar navigation with icon + label
- Main content area with data tables
- Stats cards showing: Total Users, Pending Approvals, Active Users, Frozen Accounts

**User Management Table:**
- Sortable columns: Name, Email, Registration Date, Status
- Status badges: "Pending" (yellow), "Active" (green), "Frozen" (red)
- Quick action buttons: Approve, Freeze, View Details
- Checkbox selection for bulk actions
- Search and filter controls above table
- Pagination for large datasets

**User Detail View:**
- Two-column layout: User info left, actions right
- All registration details displayed clearly
- Status toggle with confirmation modal
- Activity log section showing status changes

**Approval Queue:**
- Dedicated view for pending registrations
- Card-based layout showing user details at a glance
- Approve/Reject buttons prominently displayed
- Batch approval functionality

---

## Key Screens

### Frontend
1. **Homepage:** Hero with site purpose, featured ratings, how it works section
2. **Registration Page:** Centered form, simple and clear
3. **Login Page:** Similar to registration, with password reset link
4. **User Dashboard:** Personal ratings, account status indicator

### Admin Panel
1. **Dashboard Overview:** Stats cards + recent activity
2. **All Users Table:** Comprehensive user management
3. **Pending Approvals:** Queue requiring admin attention
4. **User Profile Detail:** Full registration information

---

## Images
**Frontend Hero Image:** Illustration or photo representing community ratings/reviews - people giving feedback or star ratings. Place at top of homepage spanning full width, height of 60vh on desktop, 40vh on mobile.

**Placeholder Avatars:** Use icon library for default user avatars in tables and profiles.

---

## Status Indicators
- **Pending:** Amber/yellow badge with "Pending Approval" text
- **Active:** Green badge with "Active" text
- **Frozen:** Red badge with "Frozen" text
- Use icon library (Heroicons) for status icons: clock (pending), check-circle (active), x-circle (frozen)

## Forms & Inputs
- All form inputs have consistent height: h-10
- Rounded corners: rounded-md
- Border treatment with focus ring
- Required field indicators (*)
- Inline validation messages
- Submit buttons: Full width on mobile, auto width on desktop

## Icons
**Icon Library:** Heroicons (via CDN)
Use throughout admin panel for navigation, actions, and status indicators.

---

This design prioritizes **functional clarity** and **efficient data management** while maintaining a professional, trustworthy appearance appropriate for a rating/review platform.