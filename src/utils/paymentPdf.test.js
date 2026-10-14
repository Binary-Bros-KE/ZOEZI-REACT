import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { createPaymentPdf, paymentReference } from './paymentPdf.js';

const student = { _id: 'student-1', firstName: 'Jane', lastName: 'Doe', admissionNumber: 'Z/001', course: 'Training', courseFee: 10000, upfrontFee: 2500 };
const payment = { _id: 'saved-payment-1', amount: 2500, createdAt: '2026-10-14T08:00:00Z', status: 'complete', paymentMethod: 'cash', recordedBy: 'Admin' };

test('saved receipt reference stays identical when reopened from history', async () => {
  const result = await createPaymentPdf(student, [payment], payment);
  const reopened = await createPaymentPdf(student, [{ ...payment }], { ...payment });
  assert.equal(result.filename, reopened.filename);
  assert.equal(result.filename, paymentReference(payment) + '.pdf');
  assert.equal((await PDFDocument.load(result.bytes)).getPageCount(), 1);
});

test('large statements and long notes generate valid multiple page PDFs without changing history', async () => {
  const history = Array.from({ length: 100 }, (_, i) => ({ ...payment, _id: String(i), operation: i % 3 === 0 ? 'deduct' : 'add', notes: 'Long note '.repeat(70) }));
  const original = JSON.stringify(history);
  const result = await createPaymentPdf(student, history);
  assert.ok((await PDFDocument.load(result.bytes)).getPageCount() > 1);
  assert.equal(JSON.stringify(history), original);
  assert.equal(result.filename, 'ZOEZI-statement-Z_001.pdf');
});

test('empty history and deductions produce readable PDF documents', async () => {
  for (const entry of [null, { ...payment, operation: 'deduct', notes: 'Adjustment\nSecond line' }]) {
    const result = await createPaymentPdf(student, [], entry);
    assert.equal((await PDFDocument.load(result.bytes)).getPageCount(), 1);
  }
});
