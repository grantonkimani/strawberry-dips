# Payment System Setup Guide

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# IntaSend Configuration (M-Pesa payments)
INTASEND_PUBLISHABLE_KEY=your_intasend_publishable_key
INTASEND_SECRET_KEY=your_intasend_secret_key
INTASEND_TEST_MODE=false

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://strawberrydips.shop
```

## Payment Methods Status

### ✅ Currently Working:
- **IntaSend M-Pesa**: Fully functional payment system
- **Database**: Orders and payments storage
- **Admin Dashboard**: Protected with authentication

### 🔧 Needs Configuration:
- **Environment Variables**: Add your production keys to Vercel

## How to Get API Keys

### IntaSend (M-Pesa Payments):
1. Go to [intasend.com](https://intasend.com)
2. Create account and get your API keys
3. Add keys to your environment variables

## Test Mode

IntaSend works in both test and live mode:
- **Test Mode**: Use test phone numbers
- **Live Mode**: Real M-Pesa transactions

## Production Setup

Your app will use these environment variables:
- ✅ `INTASEND_PUBLISHABLE_KEY`: Add to Vercel environment variables
- ✅ `INTASEND_SECRET_KEY`: Add to Vercel environment variables
- ✅ `NEXT_PUBLIC_BASE_URL`: https://strawberrydips.shop

M-Pesa payments will work perfectly once you add your keys! 🎉