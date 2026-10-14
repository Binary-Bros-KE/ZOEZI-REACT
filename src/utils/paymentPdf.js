export const paymentReference = (p) => `ZOEZI-${p._id || p.transactionId || new Date(p.createdAt).getTime()}`;
const money = (v) => `KES ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
const date = (v) => v && !Number.isNaN(new Date(v).getTime()) ? new Date(v).toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi' }) : 'Not recorded';
const successful = (p) => !p.status || p.status === 'complete';
const signedAmount = (p) => (p.operation === 'deduct' ? -1 : 1) * Number(p.amount || 0);

export async function createPaymentPdf(student, history, payment = null, options = {}) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const colors = { ink: rgb(.16, .14, .12), muted: rgb(.43, .43, .43), gold: rgb(.65, .46, .15), border: rgb(.77, .77, .75), pale: rgb(.97, .96, .93), white: rgb(1, 1, 1), red: rgb(.7, .19, .16) };
  const title = payment ? (payment.operation === 'deduct' ? 'PAYMENT ADJUSTMENT' : 'PAYMENT RECEIPT') : 'STUDENT STATEMENT';
  const reference = payment ? paymentReference(payment) : `STMT-${student.admissionNumber || student._id}`;
  const clean = (value) => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E\n]/g, '?');
  const wrap = (value, width, size = 9, face = font) => {
    const lines = [];
    for (const paragraph of clean(value).split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        if (line && face.widthOfTextAtSize(line + ' ' + word, size) > width) { lines.push(line); line = ''; }
        for (const char of (line ? ' ' : '') + word) {
          if (face.widthOfTextAtSize(line + char, size) > width) { lines.push(line); line = ''; }
          line += char;
        }
      }
      lines.push(line);
    }
    return lines;
  };
  let logo;
  try {
    let logoBytes = options.logoBytes;
    if (!logoBytes && typeof window !== 'undefined') {
      const response = await fetch('/primary-logo.png');
      if (response.ok) logoBytes = await response.arrayBuffer();
    }
    if (logoBytes) logo = await pdf.embedPng(logoBytes);
  } catch { /* The school name remains visible if the logo cannot load. */ }
  let page, y;
  const text = (value, x, top, size = 9, strong = false, color = colors.ink) => page.drawText(clean(value), { x, y: top - size, size, font: strong ? bold : font, color });
  const right = (value, edge, top, size = 9, strong = false, color = colors.ink) => text(value, edge - (strong ? bold : font).widthOfTextAtSize(clean(value), size), top, size, strong, color);
  const box = (x, top, width, height, fill = colors.white) => page.drawRectangle({ x, y: top - height, width, height, color: fill, borderColor: colors.border, borderWidth: .55 });
  const rule = (top, color = colors.border) => page.drawLine({ start: { x: 40, y: top }, end: { x: 555, y: top }, thickness: .6, color });
  const newPage = (continued = false) => {
    page = pdf.addPage([595.28, 841.89]);
    page.drawRectangle({ x: 40, y: 800, width: 515, height: 3, color: colors.gold });
    if (logo) page.drawImage(logo, { x: 40, y: 746, width: 154, height: 52 });
    else text('ZOezi School', 40, 783, 21, true, colors.gold);
    text('zoezischool.com', 40, 737, 8, false, colors.muted);
    right(title, 555, 782, 17, true);
    const refLines = wrap(reference, 300, 7.5);
    refLines.forEach((line, i) => right(line, 555, 754 - i * 10, 7.5, false, colors.muted));
    right(continued ? 'CONTINUED' : payment ? (payment.operation === 'deduct' ? 'DEDUCTION' : 'PAYMENT RECEIVED') : 'PAYMENT HISTORY', 555, 724, 8, true, colors.gold);
    rule(707);
    text(payment ? 'RECEIVED FROM' : 'STUDENT ACCOUNT', 40, 694, 7.5, true, colors.muted);
    const name = wrap(`${student.firstName || ''} ${student.lastName || ''}`.trim(), 330, 12, bold);
    name.forEach((line, i) => text(line, 40, 680 - i * 15, 12, true));
    const course = wrap(student.course || 'Course not recorded', 330, 9);
    const courseTop = 680 - name.length * 15 - 5;
    course.forEach((line, i) => text(line, 40, courseTop - i * 12, 9));
    right('ADMISSION NUMBER', 555, 694, 7.5, true, colors.muted);
    wrap(student.admissionNumber || 'Not recorded', 160, 10).forEach((line, i) => right(line, 555, 679 - i * 13, 10, true));
    right(`Issued: ${date(new Date())}`, 555, 651, 8, false, colors.muted);
    y = Math.min(623, courseTop - course.length * 12 - 17);
  };
  newPage();
  // Grid cells wrap independently; large rows continue with the column headings repeated.
  const table = (headers, widths, rows, { aligns = [], minimumHeight = 0 } = {}) => {
    const header = () => {
      let x = 40;
      widths.forEach((width, i) => { box(x, y, width, 24, colors.pale); text(headers[i], x + 7, y - 8, 7, true); x += width; });
      y -= 24;
    };
    header();
    const start = y;
    rows.forEach((cells, rowIndex) => {
      const lines = cells.map((cell, i) => wrap(cell, widths[i] - 14, 8));
      const count = Math.max(...lines.map(l => l.length));
      let offset = 0;
      while (offset < count) {
        if (y < 100) { newPage(true); header(); }
        const visible = Math.min(count - offset, Math.max(1, Math.floor((y - 78) / 11) - 1));
        const height = visible * 11 + 14;
        let x = 40;
        widths.forEach((width, i) => {
          box(x, y, width, height, rowIndex % 2 ? colors.pale : colors.white);
          lines[i].slice(offset, offset + visible).forEach((line, j) => {
            if (aligns[i] === 'right') right(line, x + width - 7, y - 7 - j * 11, 8);
            else text(line, x + 7, y - 7 - j * 11, 8);
          });
          x += width;
        });
        y -= height;
        offset += visible;
      }
    });
    if (minimumHeight && start - y < minimumHeight && y - (minimumHeight - (start - y)) > 260) {
      const height = minimumHeight - (start - y);
      let x = 40;
      widths.forEach(width => { box(x, y, width, height); x += width; });
      y -= height;
    }
    y -= 16;
  };
  const totals = (rows) => {
    const height = rows.length * 24;
    if (y - height < 80) newPage(true);
    rows.forEach(([label, value, emphasis = false, warning = false]) => {
      box(285, y, 270, 24, emphasis ? colors.pale : colors.white);
      text(label, 295, y - 7, 9, emphasis, warning ? colors.red : colors.ink);
      right(value, 545, y - 7, 9, emphasis, warning ? colors.red : colors.ink);
      y -= 24;
    });
    y -= 20;
  };
  const note = (label, value) => {
    const lines = wrap(value, 495, 8);
    if (y < 115) newPage(true);
    text(label, 40, y, 8, true, colors.gold);
    y -= 17;
    lines.forEach(line => {
      if (y < 78) { newPage(true); text(label + ' (continued)', 40, y, 8, true, colors.gold); y -= 17; }
      text(line, 40, y, 8, false, colors.muted);
      y -= 12;
    });
    y -= 12;
  };
  if (payment) {
    table(['PAYMENT DATE', 'PAYMENT METHOD', 'RECORDED BY'], [145, 155, 215], [[date(payment.createdAt), (payment.paymentMethod || 'Not recorded').replace(/_/g, ' ').toUpperCase(), payment.recordedBy || 'Not recorded']]);
    table(['#', 'DESCRIPTION', 'AMOUNT'], [30, 355, 130], [['1', `${payment.operation === 'deduct' ? 'Payment deduction / adjustment' : 'Course fee payment'}\n${student.course || 'School fees'}\nTransaction: ${payment.transactionId || 'Not recorded'}`, money(payment.amount)]], { aligns: ['', '', 'right'], minimumHeight: 170 });
    totals([[payment.operation === 'deduct' ? 'Amount deducted' : 'Amount received', money(payment.amount), true]]);
    if (payment.notes) note('PAYMENT NOTES', payment.notes);
    note('ACKNOWLEDGEMENT', payment.operation === 'deduct' ? 'This document records a deduction from the student payment account.' : 'Payment received with thanks. Please retain this receipt for your records.');
  } else {
    const sorted = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const net = sorted.filter(successful).reduce((sum, p) => sum + signedAmount(p), 0);
    const opening = Number(student.upfrontFee || 0) - net;
    table(['STATEMENT DATE', 'COURSE FEE', 'PAYMENTS ON ACCOUNT'], [145, 175, 195], [[date(new Date()), money(student.courseFee), money(student.upfrontFee)]], { aligns: ['', 'right', 'right'] });
    text('PAYMENT HISTORY', 40, y, 9, true, colors.gold);
    y -= 20;
    table(['DATE', 'REFERENCE / DETAILS', 'STATUS', 'PAYMENT', 'DEDUCTION'], [62, 223, 62, 84, 84],
      sorted.length ? sorted.map(p => [
        date(p.createdAt),
        `${paymentReference(p)}\n${(p.paymentMethod || '-').replace(/_/g, ' ').toUpperCase()} | Recorded by: ${p.recordedBy || '-'}${p.transactionId ? `\nTransaction: ${p.transactionId}` : ''}${p.notes ? `\nNote: ${p.notes}` : ''}`,
        (p.status || 'complete').toUpperCase(),
        p.operation === 'deduct' ? '-' : money(p.amount),
        p.operation === 'deduct' ? money(p.amount) : '-',
      ]) : [['-', 'No detailed payment records available.', '-', '-', '-']],
      { aligns: ['', '', '', 'right', 'right'], minimumHeight: 170 });
    const totalPayments = sorted.filter(p => successful(p) && p.operation !== 'deduct').reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalDeductions = sorted.filter(p => successful(p) && p.operation === 'deduct').reduce((sum, p) => sum + Number(p.amount || 0), 0);
    totals([
      ['Recorded payments', money(totalPayments)],
      ['Recorded deductions', money(totalDeductions)],
      ...(Math.abs(opening) > .005 ? [['Earlier payments*', money(opening)]] : []),
      ['Total paid on account', money(student.upfrontFee), true],
      ['Course fee', money(student.courseFee)],
      ['Balance due', money(Math.max(0, Number(student.courseFee || 0) - Number(student.upfrontFee || 0))), true, true],
      ...(Number(student.upfrontFee || 0) > Number(student.courseFee || 0) ? [['Credit on account', money(Number(student.upfrontFee) - Number(student.courseFee)), true]] : []),
    ]);
    if (Math.abs(opening) > .005) note('ACCOUNT NOTE', '* Earlier payments reflect amounts on the account without detailed payment history.');
    note('STATEMENT NOTE', 'Payments are listed oldest first. Pending and failed entries are shown for reference and excluded from recorded totals. Dates use East Africa Time.');
  }
  pdf.setTitle(`${title} | ${reference}`);
  pdf.setAuthor('ZOezi School');
  pdf.getPages().forEach((sheet, i) => {
    page = sheet;
    rule(57);
    text('ZOezi School  |  zoezischool.com', 40, 44, 8, false, colors.muted);
    right(`Page ${i + 1} of ${pdf.getPageCount()}`, 555, 44, 8, false, colors.muted);
  });
  return { bytes: await pdf.save(), filename: `${payment ? paymentReference(payment) : `ZOEZI-statement-${student.admissionNumber || student._id}`}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_') };
}
