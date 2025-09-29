# IntaSend Timeout Implementation with Document Upload Fallback

## Overview

I've implemented a timeout mechanism for IntaSend payments that allows users to proceed with document upload if the payment gateway takes too long to respond.

## Features Implemented

### 1. Frontend Timeout Handling
- **File**: `src/components/IntaSendPayment.tsx`
- Added 15-second timeout using `AbortController` for frontend requests
- Displays document upload option when timeout occurs
- Allows users to upload payment confirmation documents as fallback

### 2. Backend Timeout Handling
- **File**: `src/app/api/intasend/initiate/route.ts`
- Added 20-second timeout for IntaSend API calls
- Returns specific timeout response (HTTP 408) when IntaSend is slow
- Marks orders with `intasend_timeout` status for manual processing

### 3. Document Upload API
- **File**: `src/app/api/orders/create-with-documents/route.ts`
- New endpoint to handle document upload fallback
- Stores uploaded files in `uploads/payment-documents/` directory
- Creates orders with `document_pending` payment status

### 4. Database Schema Update
- **File**: `add-payment-documents-column.sql`
- Adds `payment_documents` column to store uploaded document filenames
- Adds index on `payment_status` for better query performance

## How It Works

### Normal Flow
1. User clicks "Pay with IntaSend"
2. Frontend makes request to `/api/intasend/initiate`
3. Backend calls IntaSend API
4. Payment proceeds normally

### Timeout Flow
1. User clicks "Pay with IntaSend"
2. Either frontend (15s) or backend (20s) timeout occurs
3. User sees timeout message with document upload option
4. User can upload payment receipts/confirmations
5. Order is created with `document_pending` status for manual review

## User Experience

When timeout occurs, users see:
- Clear explanation that IntaSend is taking longer than expected
- Option to upload payment documents instead
- File upload interface accepting PDF, JPG, PNG, DOC, DOCX
- Two buttons: "Proceed with Documents" and "Retry IntaSend"

## Files Modified/Created

1. **Modified**: `src/components/IntaSendPayment.tsx`
   - Added timeout handling with AbortController
   - Added document upload UI and functionality
   - Added retry mechanism

2. **Modified**: `src/app/api/intasend/initiate/route.ts`
   - Added Promise.race timeout handling
   - Added timeout-specific error responses

3. **Created**: `src/app/api/orders/create-with-documents/route.ts`
   - New API endpoint for document upload fallback
   - File handling and storage
   - Order creation with document tracking

4. **Created**: `add-payment-documents-column.sql`
   - Database migration for document storage

## Database Migration Required

Run this SQL to add the required database column:

```sql
-- Add column for storing payment document filenames
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_documents TEXT;

-- Add index for faster queries on payment status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Add a comment to explain the new column
COMMENT ON COLUMN orders.payment_documents IS 'Comma-separated list of uploaded payment document filenames';
```

## File Upload Directory

Ensure the following directory exists and is writable:
```
uploads/payment-documents/
```

## Admin Considerations

Orders with timeout/document upload will have these statuses:
- `intasend_timeout`: IntaSend API timed out
- `document_pending`: Documents uploaded, awaiting manual verification

Admin panel should filter and handle these orders appropriately for manual payment verification.


