import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../AdminLayout/AdminLayout';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const AdminSubscriptions = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paidAlumni, setPaidAlumni] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [manualPaymentForm, setManualPaymentForm] = useState({
        year: new Date().getFullYear(),
        amount: 1000,
        paymentMethod: 'mpesa',
        transactionId: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch subscription stats
    const fetchStats = async (year) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/alumni/admin/subscription-stats/${year}`
            );
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();

            // Handle nested response structure
            if (data.data && data.data.stats) {
                setStats(data.data.stats);
                setPaidAlumni(data.data.paidAlumni || []);
            } else if (data.stats) {
                setStats(data.stats);
                setPaidAlumni(data.paidAlumni || []);
            }
        } catch (error) {
            toast.error('Error fetching subscription stats');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats when year changes
    useEffect(() => {
        fetchStats(selectedYear);
    }, [selectedYear]);

    // Search alumni
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/alumni/admin/search-alumni?query=${encodeURIComponent(query)}`
            );
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            // Handle nested response structure
            const results = data.data || [];
            setSearchResults(Array.isArray(results) ? results : []);
        } catch (error) {
            toast.error('Error searching alumni');
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    // Handle alumni selection from search
    const handleSelectAlumni = (alumni) => {
        setSelectedAlumni(alumni);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Handle manual payment form change
    const handleManualPaymentChange = (field, value) => {
        setManualPaymentForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Submit manual payment
    const handleSubmitManualPayment = async (e) => {
        e.preventDefault();

        if (!selectedAlumni) {
            toast.error('Please select an alumni member');
            return;
        }

        if (!manualPaymentForm.amount || parseFloat(manualPaymentForm.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/alumni/${selectedAlumni._id}/admin/subscription-payment`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        year: manualPaymentForm.year,
                        amount: parseFloat(manualPaymentForm.amount),
                        paymentMethod: manualPaymentForm.paymentMethod,
                        transactionId: manualPaymentForm.transactionId,
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to record payment');

            toast.success('Payment recorded successfully');
            setSelectedAlumni(null);
            setManualPaymentForm({
                year: new Date().getFullYear(),
                amount: 1000,
                paymentMethod: 'mpesa',
                transactionId: '',
            });
            fetchStats(selectedYear);
        } catch (error) {
            toast.error('Error recording payment');
            console.error('Payment error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const years = Array.from({ length: 10 }, (_, i) =>
        new Date().getFullYear() - i
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscription Management</h1>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-semibold text-gray-700">Select Year:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-16">
                        <p className="text-gray-600 text-lg">Loading subscription statistics...</p>
                    </div>
                )}

                {/* Stats Section */}
                {!loading && stats && (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Paid Subscriptions</div>
                                <div className="text-4xl font-bold text-green-500">{stats.paid || 0}</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Pending Payments</div>
                                <div className="text-4xl font-bold text-yellow-500">{stats.pending || 0}</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Never Paid</div>
                                <div className="text-4xl font-bold text-red-500">{stats.expired || 0}</div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Total Revenue (KSh)</div>
                                <div className="text-4xl font-bold text-yellow-500">{(stats.totalRevenue || 0).toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        {stats.revenueByMethod && Object.keys(stats.revenueByMethod).length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-yellow-500">Revenue Breakdown by Payment Method</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {Object.entries(stats.revenueByMethod).map(([method, amount]) => (
                                        <div key={method} className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-600/50">
                                            <div className="text-sm font-medium text-gray-600 capitalize mb-1">{method.replace('_', ' ')}</div>
                                            <div className="text-lg font-bold text-[#2b2520]">KSh {(amount || 0).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Paid Alumni Table */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-yellow-500">
                                Paid Alumni - {selectedYear} ({paidAlumni.length})
                            </h2>
                            {paidAlumni.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-100 border-b-2 border-yellow-500">
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Phone</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Payment Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Method</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Transaction ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paidAlumni.map((alumni, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-gray-800">{alumni.firstName} {alumni.lastName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{alumni.email}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{alumni.phone}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">
                                                        {alumni.paymentDate
                                                            ? new Date(alumni.paymentDate).toLocaleDateString()
                                                            : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800 capitalize">{alumni.paymentMethod || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">KSh {(alumni.amount || 0).toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{alumni.transactionId || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-600">
                                    No paid subscriptions for {selectedYear}
                                </div>
                            )}
                        </div>

                        {/* Record Payment Manually Section */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-yellow-500">Record Payment Manually</h2>
                            <form onSubmit={handleSubmitManualPayment} className="space-y-6">
                                {/* Search Alumni */}
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search Alumni</label>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Type name, email, or phone..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                                            {searchResults.map((alumni) => (
                                                <div
                                                    key={alumni._id}
                                                    onClick={() => handleSelectAlumni(alumni)}
                                                    className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-sm"
                                                >
                                                    <div className="font-semibold text-gray-900">{alumni.firstName} {alumni.lastName}</div>
                                                    <div className="text-gray-600">{alumni.email} • {alumni.phone}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Alumni Display */}
                                {selectedAlumni && (
                                    <div className="flex items-center justify-between bg-blue-50 border border-yellow-500 rounded-lg p-4">
                                        <span className="text-sm font-medium text-gray-700">
                                            Selected: <strong>{selectedAlumni.firstName} {selectedAlumni.lastName}</strong>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedAlumni(null);
                                                setSearchQuery('');
                                            }}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                                {/* Payment Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                                        <select
                                            value={manualPaymentForm.year}
                                            onChange={(e) =>
                                                handleManualPaymentChange('year', parseInt(e.target.value))
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            {years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (KSh)</label>
                                        <input
                                            type="number"
                                            value={manualPaymentForm.amount}
                                            onChange={(e) =>
                                                handleManualPaymentChange('amount', parseFloat(e.target.value))
                                            }
                                            placeholder="Enter amount"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                                        <select
                                            value={manualPaymentForm.paymentMethod}
                                            onChange={(e) =>
                                                handleManualPaymentChange('paymentMethod', e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            <option value="mpesa">M-Pesa</option>
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="paypal">PayPal</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={manualPaymentForm.transactionId}
                                            onChange={(e) =>
                                                handleManualPaymentChange('transactionId', e.target.value)
                                            }
                                            placeholder="e.g., TXN123456"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting || !selectedAlumni}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-colors ${submitting || !selectedAlumni
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                                        }`}
                                >
                                    {submitting ? 'Recording Payment...' : 'Record Payment'}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminSubscriptions;
