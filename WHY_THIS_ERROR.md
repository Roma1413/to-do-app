# ❌ Why "Cannot connect to server" Error?

## 🔍 The Problem

Your frontend is trying to connect to:
```
https://todo-backend.onrender.com
```

But it can't reach it because:

### Reason 1: You're Running Locally (Most Likely)

**If you're opening `index.html` directly or running locally:**
- Frontend should use: `http://localhost:5000`
- But it's trying to use: `https://todo-backend.onrender.com`
- **Result:** Can't connect!

### Reason 2: Render Backend is Sleeping

**Render free tier:**
- Backend spins down after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- **Result:** Connection timeout!

### Reason 3: Render Backend Not Deployed

**If backend isn't deployed to Render:**
- URL doesn't exist
- **Result:** Cannot connect!

---

## ✅ Solutions

### Solution 1: Use Local Backend (Recommended for Development)

**Step 1: Start your local backend**
```powershell
cd "C:\Users\Ramazan\Desktop\TO-DO WEB\backend"
npm start
```

**Step 2: Make sure frontend uses localhost**

The code should automatically detect localhost. If it doesn't:

**Option A: Open via localhost**
- Don't open `index.html` directly
- Instead, start backend and visit: `http://localhost:5000`
- Backend serves the frontend automatically

**Option B: Force localhost in code**
Edit `frontend/app.js` line 5-7:
```javascript
const BACKEND_URL = 'http://localhost:5000'; // Force localhost
```

### Solution 2: Fix Render Backend

**If you want to use Render backend:**

1. **Check if backend is deployed:**
   - Go to Render dashboard
   - Check if `todo-backend` service is running
   - If not, deploy it first

2. **Wake up the backend:**
   - Visit: `https://todo-backend.onrender.com`
   - Wait 30 seconds for it to wake up
   - Then try login again

3. **Update the URL:**
   - Make sure `frontend/app.js` has correct Render URL
   - Should be: `https://YOUR-ACTUAL-BACKEND.onrender.com`

---

## 🎯 Quick Fix (Right Now)

### For Local Development:

```powershell
# Terminal 1: Start backend
cd "C:\Users\Ramazan\Desktop\TO-DO WEB\backend"
npm start

# Then visit in browser:
# http://localhost:5000
```

**Don't open `index.html` directly!** Use `http://localhost:5000` instead.

---

## 🔍 How to Check

### Check 1: What URL is Being Used?

**Open browser console (F12) and type:**
```javascript
BACKEND_URL
```

**Should show:**
- `http://localhost:5000` (if running locally)
- `https://todo-backend.onrender.com` (if on Render)

### Check 2: Is Backend Running?

**Test local backend:**
```powershell
# Visit in browser:
http://localhost:5000
```

**Test Render backend:**
```powershell
# Visit in browser:
https://todo-backend.onrender.com
```

**If you see:** Your app or API response → Backend is working!  
**If you see:** "Cannot connect" → Backend is not running!

---

## 💡 Best Practice

**For Development:**
- ✅ Use local backend: `http://localhost:5000`
- ✅ Start backend: `cd backend && npm start`
- ✅ Visit: `http://localhost:5000` (not index.html directly)

**For Production:**
- ✅ Deploy backend to Render
- ✅ Update frontend URL to Render backend
- ✅ Deploy frontend to Render

---

## 🚀 Quick Fix Now

**Just run this:**

```powershell
cd "C:\Users\Ramazan\Desktop\TO-DO WEB\backend"
npm start
```

**Then visit:** `http://localhost:5000` in browser

**That's it!** It will work! 🎉
