# M-Pesa Setup Guide for Strawberrydips

## 🚀 Quick Setup

### 1. Get M-Pesa Business Credentials

You need to get these from **Safaricom Developer Portal** (https://developer.safaricom.co.ke/):

- **Consumer Key** ✅ (You have this)
- **Consumer Secret** ✅ (You have this)  
- **Shortcode** ❌ (Need to get from Safaricom)
- **Till Number** ❌ (Need to get from Safaricom)
- **Passkey** ❌ (Need to get from Safaricom)

### 2. Create Environment File

Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# M-Pesa Configuration
MPESA_CONSUMER_KEY=7AiL4HAFuA6YDLny1G7cGkuSu8TeYQs0x6VwGjgWnQHP1Idq
MPESA_CONSUMER_SECRET=RPoGYRF7idWHRJaGrIB4CXc9KoOjZcsJA4h0obI8oVJ1QPZBmaZX8l5ZfFdSOafq
MPESA_SHORTCODE=YOUR_SHORTCODE_HERE
MPESA_TILL_NUMBER=YOUR_TILL_NUMBER_HERE
MPESA_PASSKEY=YOUR_PASSKEY_HERE
MPESA_ENVIRONMENT=sandbox

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. What You Need to Do

1. **Contact Safaricom** to get:
   - Business Shortcode
   - Till Number  
   - Passkey

2. **Replace the placeholders** in `.env.local` with real values

3. **Test the integration** - payments will work immediately!

## 📱 How M-Pesa Payment Works

1. Customer enters phone number
2. System sends STK Push to their phone
3. Customer enters M-Pesa PIN
4. Payment is processed automatically
5. Order status updates in database

## 🔧 Technical Details

- **API Endpoints Created:**
  - `/api/mpesa/initiate` - Start payment
  - `/api/mpesa/callback` - Handle M-Pesa responses
  - `/api/mpesa/status` - Check payment status

- **Database Integration:**
  - Orders table updated with payment status
  - Payment references stored
  - Real-time status updates

## 🎯 Next Steps

1. Get missing credentials from Safaricom
2. Update `.env.local` file
3. Test with real phone numbers
4. Switch to production when ready

## 📞 Support

If you need help getting M-Pesa credentials, contact Safaricom Business Support or visit their developer portal.







