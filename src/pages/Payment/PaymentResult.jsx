import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const FALLBACK_BINARY_BASE = `${import.meta.env.VITE_SERVER_URL || ''}/binary`;
const BINARY_SERVER_URL =
    import.meta.env.VITE_BINARY_SERVER_URL ||
    import.meta.env.BINARY_SERVER_URL ||
    FALLBACK_BINARY_BASE;

const toneMap = {
    COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    FAILED: 'border-rose-200 bg-rose-50 text-rose-800',
    REVERSED: 'border-amber-200 bg-amber-50 text-amber-800',
    INVALID: 'border-slate-200 bg-slate-100 text-slate-700',
    ERROR: 'border-rose-200 bg-rose-50 text-rose-800'
};

export default function PaymentResult() {
    const [params] = useSearchParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const status = useMemo(() => (params.get('status') || 'UNKNOWN').toUpperCase(), [params]);
    const trackingId = params.get('trackingId') || '';
    const reference = params.get('ref') || '';
    const base = useMemo(() => String(BINARY_SERVER_URL || '').replace(/\/$/, ''), []);

    useEffect(() => {
        const run = async () => {
            if (!trackingId) return;
            try {
                setLoading(true);
                const response = await fetch(`${base}/pesapal/status/${trackingId}`);
                const result = await response.json();
                if (response.ok) setDetails(result?.data || null);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [base, trackingId]);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_42%,#e2e8f0_100%)] px-4 py-16">
            <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">Payment Result</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-950">Pesapal checkout update</h1>
                <div className={`mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${toneMap[status] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                    {status}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Merchant Reference</p>
                        <p className="mt-2 break-all text-sm text-slate-900">{reference || '-'}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tracking ID</p>
                        <p className="mt-2 break-all text-sm text-slate-900">{trackingId || '-'}</p>
                    </div>
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Latest Known Transaction Data</p>
                    {loading ? (
                        <p className="mt-3 text-sm text-slate-500">Checking Pesapal status...</p>
                    ) : details ? (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">Payment Method</p>
                                <p className="text-sm font-medium text-slate-900">{details.payment_method || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Amount</p>
                                <p className="text-sm font-medium text-slate-900">{details.currency || 'KES'} {Number(details.amount || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Status</p>
                                <p className="text-sm font-medium text-slate-900">{details.payment_status || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Confirmation Code</p>
                                <p className="text-sm font-medium text-slate-900">{details.confirmation_code || '-'}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-slate-500">No extra status details were returned yet.</p>
                    )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/admin/trylist" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                        Back To Trylist
                    </Link>
                    <Link to="/" className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
