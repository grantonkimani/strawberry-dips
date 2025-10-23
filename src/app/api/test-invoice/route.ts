import { NextRequest, NextResponse } from 'next/server';
import { buildInvoiceHtml, generateInvoicePdfBuffer, type InvoiceOrder } from '@/lib/invoice';

// Ensure this route runs on Node.js runtime (PDFKit requires Node APIs)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Sample order data for testing
    const sampleOrder: InvoiceOrder = {
      id: 'test-order-12345678',
      created_at: new Date().toISOString(),
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      phone: '+254 700 123 456',
      delivery_address: '123 Main Street, Nairobi, Kenya',
      delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      delivery_time: 'morning',
      notes: 'Please ring the doorbell twice',
      subtotal: 2500,
      delivery_fee: 300,
      discount: 0,
      total: 2800,
      order_items: [
        {
          product_name: 'Premium Chocolate Covered Strawberries (12 pieces)',
          quantity: 2,
          unit_price: 1250,
          line_total: 2500
        }
      ]
    };

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'html';

    if (format === 'pdf') {
      const pdfBuffer = await generateInvoicePdfBuffer(sampleOrder);
      if (!pdfBuffer) {
        return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
      }

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="test-invoice.pdf"',
        },
      });
    }

    // Return HTML invoice
    const htmlInvoice = buildInvoiceHtml(sampleOrder);
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Invoice - Strawberry Dips</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .actions { text-align: center; margin-bottom: 20px; }
          .btn { display: inline-block; padding: 10px 20px; margin: 0 10px; background: #e91e63; color: white; text-decoration: none; border-radius: 5px; }
          .btn:hover { background: #c2185b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="actions">
            <a href="/api/test-invoice?format=pdf" class="btn">Download PDF Invoice</a>
            <a href="/api/test-invoice" class="btn">View HTML Invoice</a>
          </div>
          ${htmlInvoice}
        </div>
      </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Test invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test invoice' },
      { status: 500 }
    );
  }
}
