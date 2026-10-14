export const paymentReference = (p) => `ZOEZI-${p._id || p.transactionId || new Date(p.createdAt).getTime()}`;
const money = (v) => `KES ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
const date = (v) => v && !Number.isNaN(new Date(v).getTime()) ? new Date(v).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) : 'Not recorded';

export async function createPaymentPdf(student, history, payment = null) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const title = payment ? (payment.operation === 'deduct' ? 'Payment adjustment' : 'Payment receipt') : 'Student payment statement';
  let page, y;
  const newPage = () => {
    page = pdf.addPage([595.28, 841.89]);
    y = 790;
    page.drawText('ZOezi School', { x: 45, y, size: 20, font: bold, color: rgb(0.55, 0.4, 0.12) });
    y -= 28;
    page.drawText(title, { x: 45, y, size: 15, font: bold });
    y -= 32;
  };
  const line = (value, strong = false) => {
    const face = strong ? bold : font;
    for (const paragraph of String(value ?? '').replace(/[^\x20-\x7E\n]/g, '?').split('\n')) {
      let part = '';
      const draw = () => {
        if (y < 65) newPage();
        page.drawText(part, { x: 45, y, size: 10, font: face });
        y -= 16;
      };
      for (const char of paragraph) {
        if (face.widthOfTextAtSize(part + char, 10) > 500) { draw(); part = ''; }
        part += char;
      }
      draw();
    }
  };
  newPage();
  line(`Student: ${student.firstName || ''} ${student.lastName || ''}`, true);
  line(`Admission: ${student.admissionNumber || 'Not recorded'}`);
  line(`Course: ${student.course || 'Not recorded'}`);
  line(`Generated: ${date(new Date())} (East Africa Time)`);
  line('');
  if (payment) {
    line(`Reference: ${paymentReference(payment)}`, true);
    line(`Date: ${date(payment.createdAt)}`);
    line(`Amount ${payment.operation === 'deduct' ? 'deducted' : 'received'}: ${money(payment.amount)}`, true);
    line(`Method: ${payment.paymentMethod || 'Not recorded'}`);
    line(`Transaction ID: ${payment.transactionId || 'Not recorded'}`);
    line(`Recorded by: ${payment.recordedBy || 'Not recorded'}`);
    if (payment.notes) line(`Notes: ${payment.notes}`);
  } else {
    const sorted = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const net = sorted.filter(p => !p.status || p.status === 'complete').reduce((sum, p) => sum + (p.operation === 'deduct' ? -1 : 1) * Number(p.amount || 0), 0);
    line(`Course fee: ${money(student.courseFee)}`, true);
    line(`Total paid on account: ${money(student.upfrontFee)}`);
    line(`Balance due: ${money(Math.max(0, Number(student.courseFee || 0) - Number(student.upfrontFee || 0)))}`);
    line(`Credit on account: ${money(Math.max(0, Number(student.upfrontFee || 0) - Number(student.courseFee || 0)))}`);
    line(`Net recorded payments: ${money(net)}`);
    const opening = Number(student.upfrontFee || 0) - net;
    if (Math.abs(opening) > 0.005) line(`Earlier payments without detailed history: ${money(opening)}`);
    line('');
    line('Payment history (oldest first)', true);
    if (!sorted.length) line('No detailed payment records available.');
    sorted.forEach((p, i) => {
      line(`${i + 1}. ${date(p.createdAt)} | ${p.operation === 'deduct' ? 'Deduction' : 'Payment'} | ${money(p.amount)} | ${p.status || 'complete'}`, true);
      line(`Reference: ${paymentReference(p)}`);
      line(`Method: ${p.paymentMethod || '-'} | Transaction: ${p.transactionId || '-'} | Recorded by: ${p.recordedBy || '-'}`);
      if (p.notes) line(`Notes: ${p.notes}`);
      line('');
    });
  }
  pdf.getPages().forEach((sheet, i) => sheet.drawText(`ZOezi School | Page ${i + 1} of ${pdf.getPageCount()}`, { x: 45, y: 35, size: 9, font }));
  return { bytes: await pdf.save(), filename: `${payment ? paymentReference(payment) : `ZOEZI-statement-${student.admissionNumber || student._id}`}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_') };
}
