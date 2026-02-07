# Premium Manage and Ads Add - Complete User Guide

## Quick Summary

**Premium Manage:** Click on a username to see 11 management options  
**Ads Add:** Click "Add New Ad" button and fill in Title + Price (required fields)

Both features are working correctly! This guide explains how to use them.

---

## 🎯 Premium Manage - Step-by-Step Guide

### How to Access
1. Login to admin panel at `/admin-login`
2. Navigate to **Admin → Premium Manage** (`/admin/premium-manage`)

### What You'll See
```
┌────────────────────────────────────────────┐
│ 👑 Premium Manage                          │
│ Complete user management with 11 options   │
├────────────────────────────────────────────┤
│ All Registered Members        [123 users]  │
│                                            │
│ [Search: username or email...]            │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ 👤 john_doe                            │ │
│ │    john@example.com                    │ │
│ │    active     LKR 5,000                │ │
│ ├────────────────────────────────────────┤ │
│ │ 👤 jane_smith                          │ │
│ │    jane@example.com                    │ │
│ │    pending    LKR 0                    │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ⬇️ CLICK ON A USERNAME TO SEE OPTIONS     │
└────────────────────────────────────────────┘
```

### Step-by-Step Usage

**Step 1:** See the list of all registered users
- Shows username, email, status, and balance
- Users are color-coded by status:
  - 🟢 Green: active
  - 🔴 Red: frozen
  - 🟠 Orange: pending

**Step 2 (Optional):** Use search to filter users
- Type in the search box
- Filters by username or email
- Updates list in real-time

**Step 3:** **CLICK on any username** to select them
- This is the KEY step many users miss!
- The selected user will highlight with orange border
- Options appear below

**Step 4:** View user details that appear below
- User info header (avatar, name, email, status, phone)
- 6 balance stat cards showing:
  - Balance
  - Milestone Amount (can be negative)
  - Ongoing Milestone
  - Milestone Reward
  - Ads Completed
  - Points (0-100)

**Step 5:** Use any of the 11 action buttons
- Displayed in a colorful grid
- Each button has icon, label, and description
- See detailed explanations below

### The 11 Action Options

#### 1. 🎁 E-VOUCHER (Orange)
**Purpose:** Create milestone hold system  
**What it does:**
- Locks user's ads when they reach a specific count
- User must deposit to continue clicking ads
- Sets negative milestone amount (e.g., -5000 = must deposit 5000)

**When to use:** Require deposit from high-earning users

**Fields:**
- Milestone Ads Count (e.g., 21 - when to lock)
- Milestone Amount (e.g., -5000 - deposit required)
- Milestone Reward (e.g., 2000 - bonus given)
- Ongoing Milestone (e.g., 9000 - pending amount)
- Banner URL (optional - popup image)

#### 2. 🔄 AD RESET (Red)
**Purpose:** Reset user's ad count to zero  
**What it does:**
- Sets totalAdsCompleted = 0
- One-click action, no form needed

**When to use:** Start user over from beginning

#### 3. ⭐ E-BONUS (Green)
**Purpose:** Set instant bonus reward  
**What it does:**
- When user reaches specific ad count, they get instant bonus
- NO locking, NO deposit required
- Just a reward for reaching milestone

**When to use:** Motivate users with rewards

**Fields:**
- Bonus Ads Count (e.g., 21 - when to give bonus)
- Bonus Amount (e.g., 500 - reward amount)
- Banner URL (optional - celebration popup)

#### 4. 💵 ADD $ (Blue)
**Purpose:** Add money to user's balance  
**What it does:**
- Adds specified amount to balance field
- Instant credit

**When to use:** Manual balance correction or bonus

**Fields:**
- Amount (e.g., 1000)

#### 5. 💰 ADD VALUE (Orange)
**Purpose:** Set milestone fields  
**What it does:**
- Add values to specific fields:
  - milestoneAmount (withdrawable balance)
  - ongoingMilestone (pending/locked)
  - milestoneReward (commission per ad)
- Can add negative values to milestoneAmount

**When to use:** Fine-tune user balances

**Fields:**
- Select field (dropdown)
- Amount (can be negative)
- Reset to 0 option

#### 6. 🎯 AD'S (Cyan)
**Purpose:** Set specific ad count  
**What it does:**
- Resets ads to 0, then adds specified count
- Sets exact number

**When to use:** Set user to specific progress point

**Fields:**
- Ads Count (e.g., 15)

#### 7. 🏆 REWARDS (Purple)
**Purpose:** Set VIP points  
**What it does:**
- Sets user's VIP tier points (0-100)
- Resets first, then adds new value

**When to use:** Award or adjust VIP status

**Fields:**
- Points (0-100)

**VIP Tiers:**
- 0-19: Bronze (1% commission)
- 20-39: Silver (2% commission)
- 40-59: Gold (5% commission)
- 60-79: Platinum (8% commission)
- 80-100: Diamond (10% commission)

#### 8. 🏦 BANK (Teal)
**Purpose:** Update bank details  
**What it does:**
- Updates user's withdrawal bank information

**When to use:** User changes banks or corrections needed

**Fields:**
- Bank Name
- Account Number
- Account Holder Name
- Branch Name

#### 9. 👤 PROFILE (Pink)
**Purpose:** Update user information  
**What it does:**
- Updates username, mobile, or password

**When to use:** User requests changes or corrections

**Fields:**
- Username
- Mobile Number
- Password (leave empty to keep current)

#### 10. ❄️ FREEZE / 🌟 UNFREEZE (Gray/Green)
**Purpose:** Suspend or activate account  
**What it does:**
- Changes status between "active" and "frozen"
- Frozen users cannot login

**When to use:** Suspicious activity or violation

**Note:** Button changes based on current status

#### 11. 🗑️ DELETE (Red)
**Purpose:** Permanently remove user  
**What it does:**
- Deletes user account completely
- Requires confirmation

**When to use:** Remove spam or duplicate accounts

**⚠️ Warning:** This action cannot be undone!

---

## 🎨 Ads Add - Step-by-Step Guide

### How to Access
1. Login to admin panel at `/admin-login`
2. Navigate to **Admin → Ads** (`/admin/ads`)

### What You'll See
```
┌─────────────────────────────────────────────────┐
│ 📢 Manage Ads              [+ Add New Ad]       │
│ Create and manage advertisement cards           │
├─────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │ Left Panel  │ │ Middle Panel│ │ Right Panel ││
│ │             │ │             │ │             ││
│ │ All Ads     │ │ Edit/Create │ │ Live        ││
│ │ List        │ │ Form        │ │ Preview     ││
│ │             │ │             │ │             ││
│ │ 27 ads      │ │ [Form       │ │ [Preview    ││
│ │ displayed   │ │  Fields]    │ │  Card]      ││
│ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────┘
```

### The 27 Sample Ads

The system comes pre-loaded with 27 sample ads:
- 📱 Electronics (5): iPhone, Samsung, Dell, Sony, Canon
- 👟 Fashion (6): Nike, Rolex, Levi's, Ray-Ban, Louis Vuitton, North Face
- 🏠 Home & Garden (5): IKEA, Dyson, Sheets, KitchenAid, Smart Lights
- ⚽ Sports (4): Yonex, Adidas, Wilson, Yoga Mat
- 💄 Beauty (4): La Mer, MAC, Chanel, Dyson Airwrap
- 🍫 Food & Beverage (3): Nespresso, Godiva, Dom Pérignon

**You can:**
- View them in the left panel
- Edit any ad by clicking on it
- Delete ads you don't want
- Add new ads (see below)

### Step-by-Step: Add New Ad

**Step 1:** Click the green "Add New Ad" button
- Located in top right corner
- Button has a + icon

**Step 2:** Form appears with "Create New Ad" title
- Displayed in middle panel
- Previous ad (if any) is deselected

**Step 3:** Fill in REQUIRED fields
- **Ad Title:** Text input (required)
  - Example: "Complete Survey to Earn"
  - Must not be empty
- **Price:** Number input (required)
  - Example: 101.75
  - Must be greater than 0

**Step 4:** Fill in OPTIONAL fields
- **Image:** Click to upload
  - Supports PNG, JPG, GIF
  - Max size: 5MB
  - Shows preview when uploaded
- **Description:** Text area
  - Example: "Complete a simple survey and earn rewards instantly!"
- **Currency:** Dropdown
  - LKR (Sri Lankan Rupee) - default
  - USD, EUR, INR also available
- **Price Color:** Color picker
  - Default: #f59e0b (orange)
  - Click to choose custom color
- **Features:** Checkmark items
  - Add bullet points
  - Click "+" to add more
  - Click "X" to remove
- **Button Text:** Text input
  - Default: "Watch Ad"
  - Example: "Start Survey", "View Offer"
- **Button Icon:** Dropdown
  - Options: Shopping Cart, Arrow Right, External Link, Play, Download, None
  - Default: Play
- **Button URL:** Text input
  - Where users go when they click
  - Example: https://example.com/survey
- **Active Status:** Toggle
  - Default: Active (shown to users)
  - Inactive: Hidden from users
- **Show on Dashboard:** Toggle
  - Default: Yes
- **Display Order:** Number
  - Controls sort order
  - Lower numbers appear first

**Step 5:** Click green "Save" button
- Located in top right of form
- Has save icon

**Step 6:** Verify success
- Success toast appears: "Ad created successfully!"
- New ad appears in left panel list
- Form stays open with the new ad selected

### Form Validation

The system checks:
- ✅ Ad Title not empty
- ✅ Price greater than 0
- ❌ If validation fails: Error toast with specific message

### Editing Existing Ads

**To Edit:**
1. Click on any ad in the left panel list
2. Form populates with ad's current data
3. Change any fields
4. Click "Save" button
5. Success toast: "Ad updated successfully!"

**To Delete:**
1. Click trash icon on ad in left panel
2. Confirmation dialog appears
3. Confirm deletion
4. Success toast: "Ad deleted successfully!"

---

## 🔧 Troubleshooting

### Premium Manage Issues

#### Issue: "Only seeing user list, no options"
**Cause:** Haven't selected a user yet  
**Solution:**
1. Click on a username in the list
2. Wait for user details to load
3. Options appear below the list
4. Look for "Quick Actions (11 Options)" heading

#### Issue: "Options disappeared after selecting user"
**Cause:** May need to scroll down  
**Solution:**
- Scroll down on the page
- Options are below user info header and stat cards

#### Issue: "Can't click on username"
**Cause:** List still loading or JavaScript error  
**Solution:**
1. Wait for list to fully load (spinner disappears)
2. Refresh the page (F5)
3. Check browser console (F12) for errors
4. Try different browser

#### Issue: "Selected user not loading"
**Cause:** Network issue or backend problem  
**Solution:**
1. Check if spinner appears below user list
2. Wait a few seconds
3. If spinner stays forever, backend may be down
4. Check browser console for API errors

### Ads Add Issues

#### Issue: "Add New Ad button not working"
**Cause:** Button may be loading or disabled  
**Solution:**
1. Make sure page fully loaded
2. Check if button is green (not gray/disabled)
3. Click directly on button text or + icon
4. Refresh page and try again

#### Issue: "Save button disabled/not working"
**Cause:** Form validation failing  
**Solution:**
1. Make sure Ad Title is filled in (not empty)
2. Make sure Price is filled in (must be > 0)
3. Both fields are REQUIRED
4. Check for red error messages

#### Issue: "Form not appearing"
**Cause:** Form is in middle panel, may need to scroll  
**Solution:**
1. After clicking "Add New Ad", look for middle panel
2. Title should change to "Create New Ad"
3. Scroll down if needed
4. If still not visible, refresh page

#### Issue: "Image upload not working"
**Cause:** File too large or wrong format  
**Solution:**
1. Check file size (max 5MB)
2. Use PNG, JPG, or GIF format
3. Try different image
4. Or skip image and add URL manually

#### Issue: "Ad created but not showing"
**Cause:** May need to refresh query  
**Solution:**
1. Check for success toast message
2. Scroll in left panel list
3. Refresh page (F5) if needed
4. Check if "Total: X ads" count increased

---

## 📋 Quick Reference

### Premium Manage Quick Commands

| Action | What to Do |
|--------|------------|
| See options | Click username in list |
| Search users | Type in search box |
| Change user | Click "Change User" button |
| Lock ads | Use E-VOUCHER |
| Give instant bonus | Use E-BONUS |
| Reset ads to 0 | Click AD RESET |
| Add balance | Use ADD $ |
| Set milestones | Use ADD VALUE |
| Set ad count | Use AD'S |
| Set VIP points | Use REWARDS |
| Update bank | Use BANK |
| Update profile | Use PROFILE |
| Suspend account | Use FREEZE |
| Remove account | Use DELETE |

### Ads Add Quick Commands

| Action | What to Do |
|--------|------------|
| Create new ad | Click "Add New Ad" button |
| Edit existing ad | Click ad in left list |
| Delete ad | Click trash icon on ad |
| Upload image | Click image area |
| Change image | Click "Change" button |
| Remove image | Click X button |
| Add feature | Click "+" below features |
| Remove feature | Click trash icon on feature |
| Save ad | Click green "Save" button |
| Cancel | Click "Cancel" button |

### Required Fields Checklist

**Premium Manage:**
- None - just click username!

**Ads Add:**
- [ ] Ad Title (text, not empty)
- [ ] Price (number, must be > 0)

That's it! All other fields are optional.

---

## ✅ Success Checklist

### Premium Manage
- [ ] Logged into admin panel
- [ ] Navigated to Premium Manage
- [ ] Can see user list
- [ ] Searched for a user (optional)
- [ ] **Clicked on a username**
- [ ] User info header appeared
- [ ] Can see 6 balance stat cards
- [ ] Can see 11 action buttons in grid
- [ ] Can see bank information
- [ ] Clicked an action button
- [ ] Modal/action worked correctly

### Ads Add
- [ ] Logged into admin panel
- [ ] Navigated to Ads
- [ ] Can see 27 sample ads in left list
- [ ] Clicked "Add New Ad" button
- [ ] Form appeared with "Create New Ad" title
- [ ] Filled in Ad Title
- [ ] Filled in Price
- [ ] (Optional) Uploaded image
- [ ] (Optional) Filled other fields
- [ ] Clicked "Save" button
- [ ] Saw success toast
- [ ] New ad appeared in list

---

## 💡 Tips & Best Practices

### Premium Manage
1. **Use search** to quickly find users by username or email
2. **Check status** before taking action (color-coded badges)
3. **Review stats** before making balance changes
4. **Test with one user** before bulk operations
5. **Document reasons** for freeze/delete actions
6. **Be careful with DELETE** - it's permanent!

### Ads Add
1. **Use high-quality images** (800px width recommended)
2. **Write clear titles** that explain the offer
3. **Set realistic prices** for your target audience
4. **Test button URL** before saving
5. **Use "Watch Ad" button text** for click ads
6. **Use "Add to Cart" button text** for products
7. **Organize with display order** (1, 2, 3, etc.)
8. **Keep inactive ads** as drafts
9. **Review preview** before saving

---

## 🎓 Common Questions

### Q: Why don't I see options in Premium Manage?
**A:** You need to click on a username first! Options appear below when user is selected.

### Q: How many ads can I create?
**A:** Unlimited! The system supports as many ads as you need.

### Q: Can I edit the 27 sample ads?
**A:** Yes! Click on any ad to edit or delete it. They're just examples.

### Q: What's the difference between E-VOUCHER and E-BONUS?
**A:**
- **E-VOUCHER:** Locks ads, requires deposit
- **E-BONUS:** Instant reward, no locking

### Q: Can I set negative prices?
**A:** No, price must be greater than 0. But you can set negative milestoneAmount in ADD VALUE.

### Q: What happens if I delete an ad?
**A:** It's removed from the system. Users won't see it anymore. Action is permanent.

### Q: Can frozen users see their account?
**A:** No, frozen users cannot login. Their status must be changed to "active" first.

---

## 📞 Need More Help?

If you're still having issues:

1. **Check browser console** (Press F12, click Console tab)
2. **Try different browser** (Chrome, Firefox, Edge)
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Check server logs** for backend errors
5. **Verify database connection** is working
6. **Contact support** with specific error messages

---

## 🎉 You're All Set!

You now know how to:
- ✅ Manage users with 11 powerful options
- ✅ Create and edit advertising cards
- ✅ Troubleshoot common issues
- ✅ Use both features effectively

Happy managing! 🚀
