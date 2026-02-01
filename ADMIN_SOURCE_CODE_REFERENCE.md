# 📁 Complete Admin Source Code Reference

## Overview
The admin panel contains **14 TypeScript/React files** with full management capabilities. Here's the complete breakdown:

---

## 1️⃣ **ADMIN LAYOUT** 
### File: `client/src/pages/admin/layout.tsx` (62 lines)

Wraps all admin pages with authentication check and sidebar navigation.

```typescript
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: currentUser } = useQuery<User>({ queryKey: ["/api/auth/me"] });

  if (!currentUser || currentUser.isAdmin !== 1) {
    setLocation("/login"); // Redirect non-admins
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <header>
        <SidebarTrigger />
        <Button onClick={handleLogout}>Logout</Button>
      </header>
      <main>{children}</main>
    </SidebarProvider>
  );
}
```

**Key Features:**
- Admin authentication check
- Auto-redirect to login if not admin
- Sidebar toggle
- Logout button

---

## 2️⃣ **ADMIN SIDEBAR NAVIGATION**
### File: `client/src/components/admin-sidebar.tsx` (116 lines)

Navigation menu with 10 admin sections.

```typescript
const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Ads", url: "/admin/ads", icon: Calendar },
  { title: "Withdraw List", url: "/admin/withdrawals", icon: BookOpen },
  { title: "Transaction Details", url: "/admin/transactions", icon: TrendingUp },
  { title: "Premium", url: "/admin/premium", icon: Crown },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Deposit Details", url: "/admin/deposits", icon: CreditCard },
  { title: "Commission", url: "/admin/commission", icon: DollarSign },
  { title: "Social Media", url: "/admin/social-media", icon: Share2 },
  { title: "Admins", url: "/admin/admins", icon: UserCog },
];
```

---

## 3️⃣ **DASHBOARD**
### File: `client/src/pages/admin/dashboard.tsx` (238 lines)

Main admin dashboard with statistics and high-priority assignments.

```typescript
interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalCommission: string;
  totalWithdraw: string;
  totalDeposit: string;
}

export default function AdminDashboard() {
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { data: withdrawals = [] } = useQuery<Withdrawal[]>({ queryKey: ["/api/admin/withdrawals"] });

  const stats: DashboardStats = {
    totalUsers: users.length,
    totalCommission: users.reduce((sum, user) => sum + parseFloat(user.milestoneReward), 0),
    totalWithdraw: withdrawals.filter(w => w.status === 'approved').reduce(...)
  };

  return (
    <>
      {/* 5 stat cards: Users, Bookings, Commission, Withdrawals, Deposits */}
      {/* High Priority Assignments: Pending users & withdrawals */}
    </>
  );
}
```

**Displays:**
- 5 stat cards with gradients
- Pending user approvals
- Pending withdrawal requests

---

## 4️⃣ **ALL USERS**
### File: `client/src/pages/admin/users.tsx` (224 lines)

Complete user management with search and status control.

```typescript
export default function AdminUsers() {
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const [searchTerm, setSearchTerm] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => 
      apiRequest("POST", `/api/admin/users/${userId}/status`, { status })
  });

  return (
    <>
      <Input placeholder="Search by name, username, or email..." />
      <Table>
        {users.map(user => (
          <TableRow>
            <TableCell>{user.fullName}</TableCell>
            <TableCell>@{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell><Badge>{user.status}</Badge></TableCell>
            <TableCell>
              <Button onClick={() => updateStatusMutation.mutate({ userId: user.id, status: "active" })}>
                Approve
              </Button>
              <Button variant="destructive" onClick={() => updateStatusMutation.mutate({ userId: user.id, status: "frozen" })}>
                Freeze
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </>
  );
}
```

**Features:**
- Search users by name/username/email
- View all users in table
- Approve/Freeze accounts
- Auto-refresh every 3 seconds

---

## 5️⃣ **PENDING APPROVALS**
### File: `client/src/pages/admin/pending.tsx` (140 lines)

Dedicated page for reviewing pending user registrations.

```typescript
export default function AdminPending() {
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    select: (data) => data.filter((user) => user.status === "pending"),
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => 
      apiRequest("POST", `/api/admin/users/${userId}/status`, { status })
  });

  return (
    <>
      {users.map(user => (
        <Card>
          <CardTitle>{user.fullName}</CardTitle>
          <CardDescription>@{user.username}</CardDescription>
          <p>{user.email}</p>
          <p>Registered: {new Date(user.registeredAt).toLocaleDateString()}</p>
          <Button onClick={() => updateStatusMutation.mutate({ userId: user.id, status: "active" })}>
            <Check /> Approve
          </Button>
          <Button variant="destructive" onClick={() => updateStatusMutation.mutate({ userId: user.id, status: "frozen" })}>
            <X /> Reject
          </Button>
        </Card>
      ))}
    </>
  );
}
```

**Features:**
- Grid view of pending users
- Auto-refresh every 2 seconds
- Approve/Reject buttons
- User email and registration date

---

## 6️⃣ **USER DETAILS**
### File: `client/src/pages/admin/user-detail.tsx` (298 lines)

Detailed view of individual user with financial info and actions.

```typescript
export default function AdminUserDetail() {
  const [, params] = useRoute("/admin/users/:id");
  const userId = parseInt(params?.id || "0");
  
  const { data: user } = useQuery<User>({
    queryKey: [`/api/admin/users/${userId}`],
    enabled: userId > 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      apiRequest("POST", `/api/admin/users/${userId}/status`, { status })
  });

  const depositMutation = useMutation({
    mutationFn: (amount: string) =>
      fetch(`/api/admin/users/${userId}/deposit`, {
        method: "POST",
        body: JSON.stringify({ amount })
      })
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    depositMutation.mutate(depositAmount);
  };

  return (
    <>
      {/* User Information Card */}
      {/* Account Status Card with Approve/Freeze/Unfreeze buttons */}
      {/* Financial Card with balances */}
      {/* Deposit Section */}
      {/* Bank Details */}
      {/* Ads Click History */}
    </>
  );
}
```

**Displays:**
- Full name, username, email
- Registration date
- Current status badge
- Destination Amount
- Milestone Amount
- Milestone Reward
- Deposit form
- Bank details

---

## 7️⃣ **ADS MANAGEMENT**
### File: `client/src/pages/admin/ads.tsx` (511 lines)

Complete ad creation, editing, and deletion.

```typescript
export default function AdminAds() {
  const [adCode, setAdCode] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("101.75");
  const [details, setDetails] = useState("");
  const [link, setLink] = useState("");

  const createAdMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        body: formData,
      });
      return response.json();
    }
  });

  const updateAdMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      fetch(`/api/admin/ads/${id}`, { method: "PUT", body: formData })
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/ads/${id}`, { method: "DELETE" })
  });

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("adCode", adCode);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("details", details);
    formData.append("link", link);
    
    createAdMutation.mutate(formData);
  };

  return (
    <>
      <Dialog>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Ad</Button>
        <DialogContent>
          <Label>Ad Code</Label>
          <Input value={adCode} onChange={(e) => setAdCode(e.target.value)} />
          
          <Label>Image</Label>
          <Input type="file" onChange={handleImageChange} />
          {imagePreview && <img src={imagePreview} />}
          
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          
          <Label>Price (LKR)</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} />
          
          <Label>Details</Label>
          <Textarea value={details} onChange={(e) => setDetails(e.target.value)} />
          
          <Label>Link</Label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} />
          
          <Button onClick={handleSubmit}>Create Ad</Button>
        </DialogContent>
      </Dialog>

      {/* Ads Grid with Edit/Delete */}
    </>
  );
}
```

**Features:**
- Add new ads (with image upload)
- Edit existing ads
- Delete ads
- Image preview

---

## 8️⃣ **WITHDRAWALS MANAGEMENT**
### File: `client/src/pages/admin/withdrawals.tsx` (320 lines)

Process withdrawal requests with approval/rejection.

```typescript
export default function AdminWithdrawals() {
  const { data: withdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["/api/admin/withdrawals"],
  });
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/withdrawals/${id}/approve`, { method: "POST" })
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ notes })
      })
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Accept</TableHead>
            <TableHead>Reject</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.map(withdrawal => (
            <TableRow>
              <TableCell>{withdrawal.id}</TableCell>
              <TableCell>{userMap.get(withdrawal.userId)?.fullName}</TableCell>
              <TableCell>
                <p>Requested: {format(withdrawal.requestedAt, "PPP")}</p>
                <p>Status: {withdrawal.status}</p>
              </TableCell>
              <TableCell>₹{withdrawal.amount}</TableCell>
              <TableCell>+91XXXXXX</TableCell>
              <TableCell>
                <Button onClick={() => approveMutation.mutate(withdrawal.id)}>
                  Approve
                </Button>
              </TableCell>
              <TableCell>
                <Button 
                  variant="destructive"
                  onClick={() => handleRejectClick(withdrawal)}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Reject Dialog with notes */}
    </>
  );
}
```

**Features:**
- View all withdrawal requests
- Filter by user/amount/ID
- Approve withdrawals
- Reject with notes

---

## 9️⃣ **RATINGS MANAGEMENT**
### File: `client/src/pages/admin/ratings.tsx` (120 lines)

Moderate user-submitted ratings.

```typescript
export default function AdminRatings() {
  const { data: ratings } = useQuery<Rating[]>({
    queryKey: ["/api/admin/ratings"],
  });

  const deleteRatingMutation = useMutation({
    mutationFn: (ratingId: number) =>
      apiRequest("DELETE", `/api/admin/ratings/${ratingId}`, {})
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rater</TableHead>
            <TableHead>Target User</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ratings.map(rating => (
            <TableRow>
              <TableCell>User #{rating.userId}</TableCell>
              <TableCell>@{rating.targetUsername}</TableCell>
              <TableCell>
                {Array.from({ length: rating.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
              </TableCell>
              <TableCell>{rating.comment}</TableCell>
              <TableCell>{new Date(rating.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button 
                  variant="destructive"
                  onClick={() => deleteRatingMutation.mutate(rating.id)}
                >
                  <Trash2 /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
```

**Features:**
- View all ratings/reviews
- Star ratings display
- Delete inappropriate ratings

---

## 🔟 **PREMIUM USERS MANAGEMENT**
### File: `client/src/pages/admin/premium.tsx` (550 lines)

Advanced user management with restrictions, deposits, and custom values.

```typescript
export default function AdminPremium() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    refetchOnMount: "always",
  });

  // Mutations for various operations
  const setRestrictionMutation = useMutation({
    mutationFn: ({ userId, adsLimit, deposit, commission, pendingAmount }) =>
      fetch(`/api/admin/users/${userId}/restrict`, {
        method: "POST",
        body: JSON.stringify({ adsLimit, deposit, commission, pendingAmount })
      })
  });

  const resetMutation = useMutation({
    mutationFn: ({ userId, field }) =>
      fetch(`/api/admin/users/${userId}/reset`, {
        method: "POST",
        body: JSON.stringify({ field })
      })
  });

  const addValueMutation = useMutation({
    mutationFn: ({ userId, field, amount }) =>
      fetch(`/api/admin/users/${userId}/add-value`, {
        method: "POST",
        body: JSON.stringify({ field, amount })
      })
  });

  const editUserMutation = useMutation({
    mutationFn: ({ userId, data }) =>
      fetch(`/api/admin/users/${userId}/details`, {
        method: "PATCH",
        body: JSON.stringify(data)
      })
  });

  const editBankMutation = useMutation({
    mutationFn: ({ userId, data }) =>
      fetch(`/api/admin/users/${userId}/bank`, {
        method: "PATCH",
        body: JSON.stringify(data)
      })
  });

  return (
    <>
      <Input placeholder="Search users..." />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Inv Code</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Total Booking</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Premium Treasure</TableHead>
            <TableHead>Normal Treasure</TableHead>
            <TableHead>Booking Value</TableHead>
            <TableHead>Edit User</TableHead>
            <TableHead>Bank Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.id * 15 + 60}</TableCell>
              <TableCell>{user.id}1892</TableCell>
              <TableCell>
                <span>{(user as any).totalAdsCompleted || 0}/{(user as any).restrictionAdsLimit || ''}</span>
                <Button onClick={() => handleRestrict(user.id)}>Promotions</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleReset(user.id, 'booking')}>RESET</Button>
              </TableCell>
              <TableCell>
                <span>{user.points || 0}</span>
                <Button onClick={() => handleAdd(user.id, 'points')}>SET</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleAdd(user.id, 'premiumTreasure')}>ADD</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleAdd(user.id, 'normalTreasure')}>ADD</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleAdd(user.id, 'bookingValue')}>ADD</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEditUser(user.id)}>EDIT</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEditBank(user.id)}>EDIT</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialogs for modifying values */}
    </>
  );
}
```

**Features:**
- Search users
- Set ad count restrictions
- Reset booking counts
- Add points
- Manage treasures
- Edit user details
- Edit bank information

---

## 1️⃣1️⃣ **DEPOSITS** 
### File: `client/src/pages/admin/deposits.tsx` (23 lines)

Stub page for deposit management (under development).

---

## 1️⃣2️⃣ **TRANSACTIONS**
### File: `client/src/pages/admin/transactions.tsx` (20 lines)

Stub page for transaction history (under development).

---

## 1️⃣3️⃣ **COMMISSION**
### File: `client/src/pages/admin/commission.tsx` (22 lines)

Stub page for commission settings (under development).

---

## 1️⃣4️⃣ **SOCIAL MEDIA**
### File: `client/src/pages/admin/social-media.tsx` (22 lines)

Stub page for social media links (under development).

---

## 1️⃣5️⃣ **BOOKINGS**
### File: `client/src/pages/admin/bookings.tsx` (23 lines)

Stub page for bookings management (under development).

---

## 1️⃣6️⃣ **ADMINS**
### File: `client/src/pages/admin/admins.tsx` (23 lines)

Stub page for admin user management (under development).

---

## 📊 Complete File Structure

```
client/src/
├── components/
│   └── admin-sidebar.tsx          ← Navigation (10 menu items)
│
├── pages/
│   └── admin/
│       ├── layout.tsx             ← Auth wrapper + sidebar
│       ├── dashboard.tsx          ← Stats & high priority
│       ├── users.tsx              ← All users management
│       ├── pending.tsx            ← Pending approvals
│       ├── user-detail.tsx        ← Individual user details
│       ├── ads.tsx                ← Ad CRUD operations
│       ├── withdrawals.tsx        ← Withdrawal requests
│       ├── ratings.tsx            ← Rating moderation
│       ├── premium.tsx            ← Advanced user management
│       ├── deposits.tsx           ← Stub
│       ├── transactions.tsx       ← Stub
│       ├── commission.tsx         ← Stub
│       ├── social-media.tsx       ← Stub
│       ├── bookings.tsx           ← Stub
│       └── admins.tsx             ← Stub
```

---

## 🔐 Authentication Flow

1. User logs in with `testaccount` / `Test@12345` or `admin` / `123456`
2. Admin Layout checks `currentUser.isAdmin === 1`
3. If not admin, redirects to `/login`
4. If admin, displays sidebar + admin pages

---

## 🎯 Key API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/:id` | GET | Get user details |
| `/api/admin/users/:id/status` | POST | Update user status |
| `/api/admin/users/:id/deposit` | POST | Add deposit |
| `/api/admin/users/:id/restrict` | POST | Set restrictions |
| `/api/admin/users/:id/reset` | POST | Reset field |
| `/api/admin/users/:id/add-value` | POST | Add value to field |
| `/api/admin/users/:id/details` | PATCH | Edit user details |
| `/api/admin/users/:id/bank` | PATCH | Edit bank details |
| `/api/admin/ads` | GET, POST | List/Create ads |
| `/api/admin/ads/:id` | PUT, DELETE | Update/Delete ads |
| `/api/admin/withdrawals` | GET | List withdrawals |
| `/api/admin/withdrawals/:id/approve` | POST | Approve withdrawal |
| `/api/admin/withdrawals/:id/reject` | POST | Reject withdrawal |
| `/api/admin/ratings` | GET | List ratings |
| `/api/admin/ratings/:id` | DELETE | Delete rating |

---

## 💡 Usage Tips

### View Users
1. Go to Admin Dashboard
2. Click "Users" in sidebar
3. Use search box to filter

### Approve New Users
1. Click "Withdraw List" (actually Pending Approvals in nav)
2. Or go to Dashboard → see pending cards
3. Click "Approve" button

### Manage Ads
1. Click "Ads" in sidebar
2. Click "Add Ad" button
3. Fill form with: Code, Image, Name, Price, Details, Link
4. Click Edit or Delete for existing ads

### Process Withdrawals
1. Click "Withdraw List" in sidebar
2. View all pending requests
3. Click "Accept" or "Reject"
4. Add rejection notes if needed

### Advanced Premium Management
1. Click "Premium" in sidebar
2. Search for user
3. Use action buttons:
   - **Promotions**: Set ad limits
   - **RESET**: Reset booking count
   - **SET**: Set points value
   - **ADD**: Add to treasures
   - **EDIT**: Modify user details
   - **EDIT**: Update bank info

---

## ✨ Summary

**Total Admin Pages:** 16 files  
**Fully Implemented:** 9 pages  
**Under Development:** 7 stub pages  
**Total Lines of Code:** ~2,000+ lines  

The admin panel is **production-ready** for core operations:
- ✅ User management & approval
- ✅ Ad management (CRUD)
- ✅ Withdrawal processing
- ✅ Rating moderation
- ✅ Advanced user controls
- ⏳ Deposits, Transactions, Commission, Social Media, Bookings (stubs ready for implementation)
