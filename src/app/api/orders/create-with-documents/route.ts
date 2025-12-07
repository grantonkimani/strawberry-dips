import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { sendOrderConfirmationEmail } from '@/lib/email';

const VAT_RATE = 0.16;
const DEFAULT_DELIVERY_FEE = 5.99;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract order details
    const orderId = formData.get('orderId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const customerPhone = formData.get('customerPhone') as string;
    const cartItems = JSON.parse(formData.get('cartItems') as string || '[]');
    const deliveryInfo = JSON.parse(formData.get('deliveryInfo') as string || '{}');

    // Validate required fields
    if (!orderId || !amount || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerEmail, customerPhone' },
        { status: 400 }
      );
    }

    // Create a new order in Supabase
    const subtotalFromItems = Array.isArray(cartItems)
      ? cartItems.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
      : 0;
    const deliveryFee = DEFAULT_DELIVERY_FEE;
    const finalTotal = isNaN(amount) ? subtotalFromItems + deliveryFee + parseFloat((subtotalFromItems * VAT_RATE).toFixed(2)) : amount;
    const vatAmount = Math.max(parseFloat((finalTotal - subtotalFromItems - deliveryFee).toFixed(2)), 0);

    const { data: newOrder, error: createError } = await supabase
      .from('orders')
      .insert({
        customer_first_name: customerName?.split(' ')[0] || 'Customer',
        customer_last_name: customerName?.split(' ').slice(1).join(' ') || 'Name',
        customer_email: customerEmail,
        customer_phone: customerPhone,
        subtotal: subtotalFromItems,
        delivery_fee: deliveryFee,
        total: finalTotal,
        status: 'pending',
        payment_method: 'document_upload',
        payment_status: 'document_pending', // Special status for document uploads
        delivery_address: deliveryInfo.address || 'Not provided',
        delivery_city: deliveryInfo.city || 'Not provided',
        delivery_state: deliveryInfo.state || 'Not provided',
        delivery_zip_code: deliveryInfo.area || 'Nairobi',
        delivery_date: deliveryInfo.deliveryDate || new Date().toISOString().split('T')[0],
        delivery_time: deliveryInfo.deliveryTime || 'morning',
        special_instructions: deliveryInfo.specialInstructions || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating order:', createError);
      return NextResponse.json(
        { error: 'Failed to create order', details: createError.message },
        { status: 500 }
      );
    }

    const order = newOrder;

    // Create order items if cart items are provided
    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_name: item.name,
        product_category: item.category || 'Strawberry Dips',
        unit_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        product_image_url: item.image || null, // Store product image URL
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Don't fail the request, just log the error
      }
    }

    // Handle file uploads
    const uploadedDocuments: string[] = [];
    const uploadsDir = join(process.cwd(), 'uploads', 'payment-documents');
    
    // Ensure upload directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Process uploaded files
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key.startsWith('document_') && value instanceof File) {
        const file = value as File;
        const timestamp = Date.now();
        const fileName = `${order.id}_${timestamp}_${file.name}`;
        const filePath = join(uploadsDir, fileName);

        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filePath, buffer);
          uploadedDocuments.push(fileName);
        } catch (fileError) {
          console.error('Error saving file:', fileError);
          // Continue with other files even if one fails
        }
      }
    }

    // Store document information in the database
    if (uploadedDocuments.length > 0) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_documents: uploadedDocuments.join(','),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order with document info:', updateError);
      }
    }

    // Send order confirmation email
    try {
      const emailResult = await sendOrderConfirmationEmail({
        id: order.id,
        customer_name: customerName,
        customer_email: customerEmail,
        phone: customerPhone,
        delivery_address: deliveryInfo.address || 'Not provided',
        delivery_date: deliveryInfo.deliveryDate || new Date().toISOString().split('T')[0],
        delivery_time: deliveryInfo.deliveryTime || 'morning',
        delivery_city: deliveryInfo.city || 'Not provided',
        delivery_state: deliveryInfo.state || 'Not provided',
        special_instructions: deliveryInfo.specialInstructions || null,
        subtotal: subtotalFromItems,
        delivery_fee: deliveryFee,
        vat_amount: vatAmount,
        discount: 0,
        total: finalTotal,
        order_items: cartItems?.map((item: any) => ({
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: (Number(item.price) || 0) * (Number(item.quantity) || 1),
        })) || [],
        tracking_code: order.id.slice(0, 8).toUpperCase(), // Use order ID as tracking code
      });
      
      if (!emailResult.success) {
        console.warn('Order confirmation email failed:', emailResult.error);
        // Don't fail the request if email fails
      } else {
        console.log('Order confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      documentsUploaded: uploadedDocuments.length,
      message: `Order created successfully with ${uploadedDocuments.length} document(s) uploaded. Your order will be processed once payment documents are verified.`,
    });

  } catch (error) {
    console.error('Create order with documents error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create order with documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


