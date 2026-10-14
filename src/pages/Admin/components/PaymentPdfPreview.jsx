import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { createPaymentPdf } from '../../../utils/paymentPdf';

export function PaymentPdfPreview({ student, history, payment, onClose }) {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  const frame = useRef(null);
  useEffect(() => {
    let active = true, url;
    createPaymentPdf(student, history, payment).then(({ bytes, filename }) => {
      if (!active) return;
      url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      setDocument({ url, filename });
    }).catch(() => { if (active) setError('Unable to generate the PDF. Close this preview and try again.'); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [student, history, payment]);
  useEffect(() => {
    const escape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [onClose]);
  return (
    <div className="fixed inset-0 bg-black/80 z-[1100] p-3 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="PDF preview">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-lg">{payment ? 'Receipt / adjustment' : 'Student statement'} PDF preview</h2>
          <div className="flex gap-3 items-center">
            {document && <a className="px-3 py-2 bg-blue-600 text-white rounded" href={document.url} download={document.filename}>Download PDF</a>}
            <button className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50" disabled={!document} onClick={() => {
              try { frame.current.contentWindow.focus(); frame.current.contentWindow.print(); }
              catch { toast.error('Use the print button in the PDF viewer, or download the PDF to print.'); }
            }}>Print</button>
            <button className="px-3 py-2 border rounded" onClick={onClose}>Close</button>
          </div>
        </div>
        {error ? <p role="alert" className="p-6 text-red-600">{error}</p> : document ? <>
          <p className="px-4 py-2 text-sm text-gray-600">Preview the PDF below. If your browser cannot display it, download it to view or print.</p>
          <iframe ref={frame} title="Payment PDF preview" src={document.url} className="w-full flex-1 border-0" />
        </> : <p role="status" className="p-6">Generating PDF...</p>}
      </div>
    </div>
  );
}
