# Premium Management Documentation

This directory contains comprehensive documentation for the Admin Site Premium Management system in the ACCOR Travel Booking Platform.

## Documentation Files

### 1. **PREMIUM_MANAGEMENT_DOCUMENTATION.txt** (Main Documentation)
   - **For**: Developers, System Administrators
   - **Size**: 882 lines
   - **Contents**:
     - Complete technical documentation
     - System overview and architecture
     - Database models and schemas
     - API endpoints and controllers
     - Calculation formulas with examples
     - Admin panel components
     - User flows and processes
     - Security and validation
     - Complete code references
     - Testing checklist
     - Deployment notes

### 2. **PREMIUM_MANAGEMENT_QUICK_REFERENCE.txt** (Quick Reference)
   - **For**: Developers, Technical Support
   - **Size**: 337 lines
   - **Contents**:
     - Quick overview of the system
     - Key features summary
     - Simple 3-step admin workflow
     - Commission calculation examples
     - Validation rules
     - API endpoints list
     - Configuration details
     - Troubleshooting guide
     - Error messages reference

### 3. **HOW_TO_ASSIGN_PREMIUM_TASKS.txt** (User Guide)
   - **For**: Admin Users, Operations Team
   - **Size**: 395 lines
   - **Contents**:
     - Step-by-step instructions for assigning tasks
     - Detailed walkthrough with screenshots descriptions
     - Example scenarios
     - Common errors and solutions
     - Best practices for admins
     - FAQs
     - Tips for success

## Quick Start

### For Admin Users
Start with: **HOW_TO_ASSIGN_PREMIUM_TASKS.txt**

This file provides simple, step-by-step instructions on how to assign premium hotel booking tasks to users through the admin panel.

### For Developers
Start with: **PREMIUM_MANAGEMENT_QUICK_REFERENCE.txt**

Then refer to: **PREMIUM_MANAGEMENT_DOCUMENTATION.txt** for detailed technical information.

### For System Administrators
Read all three files:
1. Start with HOW_TO_ASSIGN_PREMIUM_TASKS.txt to understand user workflow
2. Review PREMIUM_MANAGEMENT_QUICK_REFERENCE.txt for system overview
3. Study PREMIUM_MANAGEMENT_DOCUMENTATION.txt for complete technical details

## System Overview

The Premium Management system allows administrators to assign premium hotel booking tasks to users. When users complete these tasks, they earn commission fees based on the hotel price and commission percentage set by the admin.

### Key Features
- Three user tiers: TRIAL, GOLD, DIAMOND
- Commission-based reward system
- Premium task assignment and tracking
- Wallet management with automatic calculations
- Admin audit trails and history tracking

### Technology Stack
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Admin Panel**: Next.js 14 + TypeScript + Mantine UI
- **User Panel**: Next.js 14 + TypeScript + NextUI

## Commission Calculation

**Simple Formula:**
```
Commission Fee = (Commission % × Hotel Price) / 100
```

**Example:**
- Hotel Price: $1000
- Commission: 5%
- User Earns: $50

## File Locations

### Backend Code
- **Controllers**: `/api-main/controllers/package.controller.js`
- **Models**: `/api-main/models/premiumTask.js`
- **Calculations**: `/api-main/lib/calculation.js`
- **Configuration**: `/api-main/config/index.js`

### Admin Panel Code
- **Form Component**: `/admin-panel-main/components/defaults/PreBookingAddForm/`
- **List View**: `/admin-panel-main/components/defaults/PremiumBookingList/`
- **History View**: `/admin-panel-main/components/defaults/PremiumHistory/`
- **Pages**: `/admin-panel-main/app/(defaults)/premium-list/` and `/premium-history/`

## API Endpoints

### Admin Endpoints
- `GET /api/admin/get-user-asset?userId={id}` - Get user details
- `GET /api/admin/get-bookings-by-filter?price={price}` - Filter hotels by price
- `PUT /api/admin/pre-booking-update` - Create/assign premium task
- `GET /api/admin/premium-history` - View task history
- `DELETE /api/admin/premium-booking-cancel` - Cancel premium task

### User Endpoints
- `POST /api/user/complete-task` - Complete assigned task

## Configuration

Located in: `/api-main/config/index.js`

**Key Settings:**
- `MINIMUM_BALANCE`: 10000
- `PREMIUM_TASK.HOTEL_NAMES`: ["Finch inn", "Four Seasons", "Atlas Hotel", "Azure Inn"]
- `PREMIUM_TASK.HOTEL_IMAGES`: Array of 6 hotel images
- `PREMIUM_TASK.DESCRIPTION`: Default hotel description

## Validation Rules

- ✓ Hotel Price: Must be > 0
- ✓ Commission: Must be ≥ 1%
- ✓ Task Number: Must be between 1-30
- ✓ User Badge: Cannot be "trial"
- ✓ User Balance: Must maintain ≥ 10,000

## Common Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "you can't add premium task to this user" | User has trial badge | Upgrade user to gold/diamond |
| "Please fill the commissionFee field" | Commission empty | Enter commission % |
| "Invalid Value" | Price/commission ≤ 0 | Enter positive number |
| "Please select the hotel" | No hotel selected | Select hotel with radio button |

## Testing

Before deploying to production:
- ✓ Test form validation with invalid inputs
- ✓ Test hotel filtering by price
- ✓ Test commission calculation accuracy
- ✓ Test with trial user (should reject)
- ✓ Test with gold/diamond user (should succeed)
- ✓ Verify wallet balance updates
- ✓ Verify admin log creation
- ✓ Test task cancellation
- ✓ Test premium history display

## Support

For questions or issues:
1. Check the documentation files
2. Review the troubleshooting sections
3. Check Admin Logs for audit trail
4. Contact system administrator

## Version Information

- **Documentation Version**: 1.0
- **Last Updated**: 2024-02-14
- **Platform**: ACCOR Travel Booking Platform
- **Created By**: System Documentation Generator

## License

This documentation is part of the ACCOR Travel Booking Platform and is proprietary.

---

**Note**: This documentation set provides complete information about the Premium Management system. All three files work together to give you a full understanding of the system from both user and technical perspectives.
