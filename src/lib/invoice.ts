import type { Readable } from 'stream';

// Lazy import PDFKit to remain compatible with edge/serverless where needed
// We guard the import so local/dev can generate PDFs while production can opt-out
async function getPDFKit() {
  try {
    // Dynamic import - PDFKit types may not be available
    const mod = await import('pdfkit');
    // Some bundlers default export, others named
    return (mod as any).default || (mod as any);
  } catch {
    return null;
  }
}

export type InvoiceOrderItem = {
  name: string;
  quantity: number;
  unit_price: number; // KSH
  total: number; // KSH
};

export type InvoiceOrder = {
  id: string;
  created_at?: string;
  customer_name?: string;
  customer_email?: string;
  phone?: string;
  delivery_address?: string;
  delivery_date?: string | null;
  delivery_time?: string | null;
  notes?: string | null;
  subtotal?: number;
  delivery_fee?: number;
  discount?: number;
  vat_amount?: number;
  total: number;
  order_items?: Array<{
    product_name?: string;
    quantity?: number;
    unit_price?: number;
    line_total?: number;
  }>;
};

export function buildInvoiceHtml(order: InvoiceOrder): string {
  const orderIdShort = order.id?.slice(0, 8) || '';
  const created = order.created_at ? new Date(order.created_at) : new Date();
  const fmt = (n?: number | null) => typeof n === 'number' ? `KSH ${n.toFixed(2)}` : '—';
  const items = (order.order_items || []).map((it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.product_name || ''}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.quantity ?? 1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${fmt(it.unit_price ?? 0)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${fmt(it.line_total ?? (it.unit_price || 0) * (it.quantity || 1))}</td>
      </tr>
  `).join('');

  return `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin:0 auto; padding:24px;">
    <div style="text-align:center; margin-bottom:24px;">
      <h1 style="margin:0;color:#e91e63;">🍓 Strawberry Dips</h1>
      <p style="margin:4px 0;color:#666;">Premium Chocolate Covered Strawberries</p>
    </div>
    <div style="display:flex;justify-content:space-between;gap:16px;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:16px;margin-bottom:16px;">
      <div>
        <h3 style="margin:0 0 8px 0;color:#333;">Invoice</h3>
        <p style="margin:2px 0;color:#555;">Order: #${orderIdShort}</p>
        <p style="margin:2px 0;color:#555;">Date: ${created.toLocaleDateString()}</p>
      </div>
      <div>
        <h3 style="margin:0 0 8px 0;color:#333;">Billed To</h3>
        <p style="margin:2px 0;color:#555;">${order.customer_name || ''}</p>
        <p style="margin:2px 0;color:#555;">${order.customer_email || ''}</p>
        <p style="margin:2px 0;color:#555;">${order.phone || ''}</p>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#f6f6f6;">
          <th style="text-align:left;padding:8px;">Item</th>
          <th style="text-align:left;padding:8px;">Qty</th>
          <th style="text-align:left;padding:8px;">Unit</th>
          <th style="text-align:left;padding:8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items || ''}
      </tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;">
      <table style="min-width:320px;border-collapse:collapse;">
        <tr>
          <td style="padding:6px;color:#555;">Subtotal</td>
          <td style="padding:6px;color:#111;text-align:right;">${fmt(order.subtotal ?? (order.total - (order.delivery_fee || 0) + (order.discount || 0)))}</td>
        </tr>
        ${typeof order.vat_amount === 'number' ? `
        <tr>
          <td style="padding:6px;color:#555;">VAT (16%)</td>
          <td style="padding:6px;color:#111;text-align:right;">${fmt(order.vat_amount)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:6px;color:#555;">Delivery Fee</td>
          <td style="padding:6px;color:#111;text-align:right;">${fmt(order.delivery_fee || 0)}</td>
        </tr>
        ${typeof order.discount === 'number' && order.discount > 0 ? `
        <tr>
          <td style="padding:6px;color:#555;">Discount</td>
          <td style="padding:6px;color:#111;text-align:right;">- ${fmt(order.discount)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:6px;color:#111;font-weight:bold;border-top:1px solid #eee;">Grand Total</td>
          <td style="padding:6px;color:#111;font-weight:bold;text-align:right;border-top:1px solid #eee;">${fmt(order.total)}</td>
        </tr>
      </table>
    </div>
    <div style="margin-top:16px;color:#555;font-size:14px;">
      <p style="margin:4px 0;">Delivery: ${order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'} ${order.delivery_time || ''}</p>
      <p style="margin:4px 0;">Address: ${order.delivery_address || '—'}</p>
      ${order.notes ? `<p style=\"margin:4px 0;\">Notes: ${order.notes}</p>` : ''}
    </div>
    <p style="margin-top:24px;color:#777;font-size:12px;text-align:center;">Thank you for your order! Track it at ${process.env.NEXT_PUBLIC_SITE_URL || ''}/track/${order.id}</p>
  </div>`;
}

export async function generateInvoicePdfBuffer(order: InvoiceOrder): Promise<Buffer | null> {
  // Allow disabling PDF generation via env for edge runtimes
  if (process.env.GENERATE_PDF_INVOICE === 'false') return null;

  const PDFKit = await getPDFKit();
  if (!PDFKit) return null;

  // Fix PDFKit font path issue by using built-in fonts
  const doc = new (PDFKit as any)({ 
    size: 'A4', 
    margin: 40,
    font: 'Helvetica', // Use built-in font
    autoFirstPage: true
  });
  const chunks: Buffer[] = [];
  const stream = doc as unknown as Readable;

  return new Promise<Buffer>((resolve) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fillColor('#e91e63').fontSize(22).text('Strawberry Dips', { align: 'left' });
    doc.moveDown(0.2);
    doc.fillColor('#666').fontSize(10).text('Premium Chocolate Covered Strawberries');
    doc.moveDown(1);

    // Invoice meta
    const orderIdShort = order.id?.slice(0, 8) || '';
    const created = order.created_at ? new Date(order.created_at) : new Date();
    doc.fillColor('#111').fontSize(16).text('Invoice', { continued: false });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333').text(`Order: #${orderIdShort}`);
    doc.text(`Date: ${created.toLocaleDateString()}`);
    doc.moveDown(0.5);

    // Billed to
    doc.fontSize(12).fillColor('#111').text('Billed To');
    doc.fontSize(10).fillColor('#333').text(order.customer_name || '');
    if (order.customer_email) doc.text(order.customer_email);
    if (order.phone) doc.text(order.phone);
    doc.moveDown(1);

    // Table headers
    const startX = doc.x;
    const colWidths = [240, 60, 80, 80];
    const headers = ['Item', 'Qty', 'Unit', 'Total'];
    doc.fontSize(10).fillColor('#111');
    headers.forEach((h, i) => {
      doc.text(h, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), doc.y, { width: colWidths[i] });
    });
    doc.moveDown(0.3);
    doc.strokeColor('#eee').moveTo(startX, doc.y).lineTo(555, doc.y).stroke();

    const fmt = (n?: number | null) => typeof n === 'number' ? `KSH ${n.toFixed(2)}` : '—';
    (order.order_items || []).forEach((it) => {
      const name = it.product_name || '';
      const qty = it.quantity ?? 1;
      const unit = fmt(it.unit_price ?? 0);
      const line = fmt(it.line_total ?? (it.unit_price || 0) * (it.quantity || 1));
      const row = [name, String(qty), unit, line];
      row.forEach((val, i) => {
        doc.fillColor('#333').text(val, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), doc.y, { width: colWidths[i] });
      });
      doc.moveDown(0.2);
    });

    doc.moveDown(0.5);
    doc.strokeColor('#eee').moveTo(startX, doc.y).lineTo(555, doc.y).stroke();

    // Totals
    const rightX = 300;
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333').text('Subtotal', rightX, doc.y, { width: 120 });
    doc.text(fmt(order.subtotal ?? (order.total - (order.delivery_fee || 0) + (order.discount || 0))), rightX + 140, doc.y, { width: 100, align: 'right' });
    doc.moveDown(0.2);
    if (typeof order.vat_amount === 'number') {
      doc.text('VAT (16%)', rightX, doc.y, { width: 120 });
      doc.text(fmt(order.vat_amount), rightX + 140, doc.y, { width: 100, align: 'right' });
      doc.moveDown(0.2);
    }
    doc.text('Delivery Fee', rightX, doc.y, { width: 120 });
    doc.text(fmt(order.delivery_fee || 0), rightX + 140, doc.y, { width: 100, align: 'right' });
    if (typeof order.discount === 'number' && order.discount > 0) {
      doc.moveDown(0.2);
      doc.text('Discount', rightX, doc.y, { width: 120 });
      doc.text(`- ${fmt(order.discount)}`, rightX + 140, doc.y, { width: 100, align: 'right' });
    }
    doc.moveDown(0.3);
    doc.strokeColor('#eee').moveTo(rightX, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.2);
    doc.fontSize(11).fillColor('#111').text('Grand Total', rightX, doc.y, { width: 120 });
    doc.text(fmt(order.total), rightX + 140, doc.y, { width: 100, align: 'right' });

    doc.moveDown(1);
    doc.fillColor('#666').fontSize(9).text(`Track your order: ${(process.env.NEXT_PUBLIC_SITE_URL || '')}/track/${order.id}`);

    doc.end();
  });
}


