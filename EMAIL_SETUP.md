# Email Setup Guide for Strawberry Dips

## Gmail SMTP Configuration

To enable email notifications, you need to set up Gmail SMTP:

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-factor authentication if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Strawberry Dips App"
4. Copy the generated 16-character password

### Step 3: Add Environment Variables
Add these to your `.env.local` file:

```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-character-app-password
NEXT_PUBLIC_SITE_URL=https://www.strawberrydips.shop
```

### Step 4: Test Email
1. Start your development server
2. Place a test order
3. Check if confirmation email is sent
4. Update order status in admin panel to test other emails

## Email Templates Included:
- ✅ Order Confirmation (sent automatically after payment)
- ✅ Preparing (sent when status changed to "preparing")
- ✅ Out for Delivery (sent when status changed to "out_for_delivery")
- ✅ Delivered (sent when status changed to "delivered")

## Features:
- ✅ Professional HTML email templates
- ✅ Order tracking links
- ✅ Customer order details
- ✅ Delivery information
- ✅ Storage tips for delivered orders
- ✅ Responsive email design

## Admin Panel Updates:
- ✅ Status dropdown in orders table
- ✅ Automatic email sending when status changes
- ✅ Loading indicators during updates
- ✅ Success/error notifications

## Order Tracking:
- ✅ Public tracking page: `/track/[orderId]`
- ✅ Order status display
- ✅ Customer information
- ✅ Order items and totals
- ✅ Delivery details
- ✅ Contact information
