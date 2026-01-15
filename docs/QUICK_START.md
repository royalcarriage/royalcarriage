# Royal Carriage Admin System - Quick Start Guide

**Last Updated:** January 14, 2026  
**Status:** ✅ Production Ready

---

## 🚀 System Access

### Live URLs
- **Login:** https://royalcarriagelimoseo.web.app/login
- **Dashboard:** https://royalcarriagelimoseo.web.app/admin
- **Firebase Console:** https://console.firebase.google.com/project/royalcarriagelimoseo

### Admin Pages
- Dashboard: `/admin`
- Page Analyzer: `/admin/analyze`
- User Management: `/admin/users`
- Analytics: `/admin/analytics`
- Settings: `/admin/settings`

---

## 👤 First-Time Setup

### Create Initial Admin User

You need to create your first super admin user to access the system.

**Using MemStorage (Current Default):**

Add this to `server/index.ts` temporarily:

```typescript
import { storage } from './storage';

(async () => {
  const admin = await storage.getUserByUsername('admin');
  if (!admin) {
    const user = await storage.createUser({
      username: 'admin',
      password: 'Admin123!'
    });
    await storage.updateUserRole(user.id, 'super_admin');
    console.log('✅ Admin created: admin / Admin123!');
  }
})();
```

**Using PostgreSQL:**

```bash
# 1. Setup database
export DATABASE_URL="postgresql://localhost:5432/royalcarriage"
npx drizzle-kit migrate

# 2. Hash password
node -e "require('bcryptjs').hash('YourPass123!', 10).then(console.log)"

# 3. Create user
psql royalcarriage -c "INSERT INTO users (username, password, role) VALUES ('admin', 'HASHED_PASSWORD', 'super_admin');"
```

---

## 🔐 Login Process

1. Visit: https://royalcarriagelimoseo.web.app/login
2. Enter username and password
3. Click "Sign In"
4. Redirected to dashboard

**Session:** 24 hours  
**Security:** HTTP-only cookies, HTTPS only in production

---

## 📊 Dashboard Overview

### Stats Cards
- Pages Analyzed
- AI Suggestions
- Images Generated
- Avg SEO Score

### Quick Actions
- Analyze All Pages
- Manage Users (admin+)
- Generate Content
- Generate Images

### Recent Activity
- Real-time operation feed
- Status indicators
- Timestamps

### System Status
- Service health
- Uptime percentages
- Operational status

---

## 👥 User Roles

### Hierarchy

```
super_admin → Full control
    ↓
admin → Management access
    ↓
user → Basic access
```

### Permissions

| Feature | User | Admin | Super Admin |
|---------|:----:|:-----:|:-----------:|
| Dashboard | ✅ | ✅ | ✅ |
| Page Analyzer | ❌ | ✅ | ✅ |
| User Management | ❌ | View | Full |
| Analytics | ❌ | ✅ | ✅ |
| Settings | ❌ | ❌ | ✅ |

---

## 🛠️ Development

### Local Setup

```bash
npm install
npm run dev
# http://localhost:5000
```

### Build & Deploy

```bash
npm run check      # TypeScript
npm run build      # Production build
firebase deploy    # Deploy to Firebase
```

### Environment Variables

```bash
NODE_ENV=production
SESSION_SECRET=your-64-char-secret
DATABASE_URL=postgresql://... (optional)
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📱 Navigation Guide

### Sidebar

- **Expand/Collapse:** Click menu icon
- **Active Page:** Amber highlight
- **Role-Based:** Menu filtered by permissions
- **Logout:** Always at bottom

### Pages

**Dashboard:** Overview and quick actions  
**Page Analyzer:** SEO analysis (admin+)  
**User Management:** User CRUD (admin+)  
**Analytics:** Traffic stats (admin+)  
**Settings:** System config (super admin)

---

## 🔧 User Management

### Add User (Super Admin)

```typescript
POST /api/auth/register
{
  "username": "newuser",
  "password": "SecurePass123!"
}
```

### Update Role

```typescript
PUT /api/users/:id/role
{
  "role": "admin" | "super_admin" | "user"
}
```

### Delete User

```typescript
DELETE /api/users/:id
```

**Protections:**
- Cannot delete yourself
- Cannot remove own super admin role

---

## 🔍 Troubleshooting

### Login Issues

**Can't login:**
- Check username/password
- Verify user exists
- Check SESSION_SECRET set

**Session expires:**
- 24-hour timeout
- Re-login required
- Automatic redirect

### Navigation Issues

**Blank page:**
- Check browser console
- Clear cache
- Verify JavaScript enabled

**Missing menu items:**
- Check user role
- Verify authentication
- Review permissions

### API Errors

**401 Unauthorized:**
- Not logged in
- Session expired
- Login required

**403 Forbidden:**
- Insufficient permissions
- Wrong role for action
- Check role hierarchy

---

## 📚 API Endpoints

### Auth

```
POST   /api/auth/login       Login
POST   /api/auth/logout      Logout
GET    /api/auth/me          Current user
POST   /api/auth/register    Create user (super admin)
GET    /api/auth/check       Auth status
```

### Users

```
GET    /api/users             List all (admin+)
GET    /api/users/:id         Get one (admin+)
PUT    /api/users/:id/role    Update role (super admin)
DELETE /api/users/:id         Delete (super admin)
```

---

## 🎯 Common Tasks

### Check System Health

1. Login to dashboard
2. View System Status card
3. Check service uptimes
4. Review automation schedule

### Analyze Pages

1. Navigate to Page Analyzer
2. Click "Analyze All Pages"
3. Review scores
4. Implement recommendations

### Manage Admins

1. Go to User Management
2. Create user via API
3. Update role to admin/super_admin
4. Share credentials securely

### Configure System

1. Login as super admin
2. Navigate to Settings
3. Update configurations
4. Save changes

---

## ✅ System Status

**Build:** ✅ Passing (0 TypeScript errors)  
**Deployment:** ✅ Live on Firebase  
**Authentication:** ✅ Working  
**Navigation:** ✅ All pages accessible  
**Security:** ✅ HTTPS, HSTS, RBAC active

**The system is ready for production use!** 🎉

---

For detailed documentation, see:
- `AUTHENTICATION_INTEGRATION_COMPLETE.md`
- `ADMIN_DASHBOARD_REDESIGN.md`
- `COMPLETE_SYSTEM_DEPLOYMENT.md`
