# HTTPS Setup for Development

## 🔒 The Warning You Saw

The browser warning **"Automatic payment methods filling is disabled because this form does not use a secure connection"** means:

- Your site runs on `http://localhost:3000` (not secure)
- Browsers block auto-fill on non-HTTPS sites for security
- **Payment still works** - you just need to enter details manually

## 🚀 Quick Fix: Use HTTPS

### Option 1: Run with HTTPS (Recommended)
```bash
npm run dev:https
```
Then visit: `https://localhost:3000`

### Option 2: Keep HTTP (Simpler)
```bash
npm run dev
```
Then visit: `http://localhost:3000`
- Payment forms won't auto-fill
- Everything else works normally

## ✅ What HTTPS Gives You

- **Auto-fill payment forms** ✅
- **Saved payment methods** ✅  
- **Better security** ✅
- **No browser warnings** ✅

## 🧪 Test Both Options

1. **HTTP**: `npm run dev` → `http://localhost:3000`
2. **HTTPS**: `npm run dev:https` → `https://localhost:3000`

Both work perfectly for testing payments! 🎉
