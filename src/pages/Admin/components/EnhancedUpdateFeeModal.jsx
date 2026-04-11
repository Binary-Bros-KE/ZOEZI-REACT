import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaCashRegister, FaMobileAlt, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import MpesaPayment from '../../../components/MpesaPayment';

export const EnhancedUpdateFeeModal = ({ student, isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'mpesa'
    const [loading, setLoading] = useState(false);
    const [mpesaModalOpen, setMpesaModalOpen] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [manualPaymentData, setManualPaymentData] = useState({
        amount: '',
        paymentMethod: 'cash',
        operation: 'add', // 'add' or 'deduct'
        notes: ''
    });
    const [loggedInUser, setLoggedInUser] = useState('');

    useEffect(() => {
        // Get logged in user from localStorage
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            setLoggedInUser(authData?.username || 'Admin');
        } catch {
            setLoggedInUser('Admin');
        }

        // Fetch payment history if student exists
        if (student && isOpen) {
            fetchPaymentHistory();
        }
    }, [student, isOpen]);

    const fetchPaymentHistory = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/students/${student._id}/payment-history`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const data = await response.json();
            if (response.ok && data.data) {
                setPaymentHistory(data.data);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
        }
    };

    const handleManualPayment = async (e) => {
        e.preventDefault();

        if (!manualPaymentData.amount || isNaN(manualPaymentData.amount) || parseFloat(manualPaymentData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (manualPaymentData.operation === 'deduct' && parseFloat(manualPaymentData.amount) > (student.upfrontFee || 0)) {
            toast.error('Deduction amount cannot exceed current upfront fee');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amount: parseFloat(manualPaymentData.amount),
                paymentMethod: manualPaymentData.paymentMethod,
                operation: manualPaymentData.operation,
                recordedBy: loggedInUser,
                notes: manualPaymentData.notes,
                transactionType: 'manual'
            };

            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/students/${student._id}/record-payment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to record payment');
            }

            toast.success('Payment recorded successfully!');
            setManualPaymentData({
                amount: '',
                paymentMethod: 'cash',
                operation: 'add',
                notes: ''
            });
            fetchPaymentHistory(); // Refresh history
            onSuccess();
        } catch (error) {
            console.error('Record payment error:', error);
            toast.error(error.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const handleMpesaPaymentSuccess = async (paymentData) => {
        try {
            // Record M-PESA payment
            const payload = {
                amount: paymentData.amount,
                paymentMethod: 'mpesa',
                recordedBy: loggedInUser,
                transactionId: paymentData.transactionId,
                phone: paymentData.phone,
                checkoutRequestId: paymentData.checkoutRequestId,
                transactionType: 'mpesa'
            };

            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/students/${student._id}/record-payment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to record M-PESA payment');
            }

            toast.success('M-PESA payment recorded successfully!');
            setMpesaModalOpen(false);
            fetchPaymentHistory(); // Refresh history
            onSuccess();
        } catch (error) {
            console.error('Record M-PESA payment error:', error);
            toast.error(error.message || 'Failed to record M-PESA payment');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'complete': return 'text-green-600 bg-green-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (!isOpen || !student) return null;

    const currentBalance = Math.max(0, (student.courseFee || 0) - (student.upfrontFee || 0));

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-999 p-4">
                <div
                    className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b-2" style={{ borderColor: '#d4a644', backgroundColor: '#f5f5f3' }}>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: '#2b2520' }}>
                                Fee Management - {student.firstName} {student.lastName}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Adm: {student.admissionNumber} | Current Balance: 
                                <span className={`font-bold ml-2 ${currentBalance === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    KES {currentBalance.toLocaleString()}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            disabled={loading}
                        >
                            <IoClose size={24} style={{ color: '#d32f2f' }} />
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Side - Payment Form */}
                        <div className="w-2/5 p-6 border-r border-gray-200 overflow-y-auto">
                            {/* Tab Navigation */}
                            <div className="flex mb-6 border-b">
                                <button
                                    onClick={() => setActiveTab('manual')}
                                    className={`flex-1 py-3 font-semibold text-center transition-colors flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'text-primary-gold border-b-2 border-primary-gold' : 'text-gray-600'}`}
                                >
                                    <FaCashRegister /> Manual Payment
                                </button>
                                <button
                                    onClick={() => setActiveTab('mpesa')}
                                    className={`flex-1 py-3 font-semibold text-center transition-colors flex items-center justify-center gap-2 ${activeTab === 'mpesa' ? 'text-primary-gold border-b-2 border-primary-gold' : 'text-gray-600'}`}
                                >
                                    <FaMobileAlt /> M-PESA STK
                                </button>
                            </div>

                            {/* Recorded By Info */}
                            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Payment will be recorded by:</p>
                                <p className="font-bold text-blue-700 capitalize">{loggedInUser}</p>
                            </div>

                            {/* Manual Payment Form */}
                            {activeTab === 'manual' && (
                                <form onSubmit={handleManualPayment} className="space-y-4">
                                    {/* Operation Type */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>
                                            Operation Type *
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setManualPaymentData({...manualPaymentData, operation: 'add'})}
                                                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${manualPaymentData.operation === 'add' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                Add Payment
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setManualPaymentData({...manualPaymentData, operation: 'deduct'})}
                                                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${manualPaymentData.operation === 'deduct' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                Deduct Amount
                                            </button>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>
                                            Amount {manualPaymentData.operation === 'add' ? 'to Add' : 'to Deduct'} *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 font-semibold" style={{ color: '#d4a644' }}>
                                                KES
                                            </span>
                                            <input
                                                type="number"
                                                value={manualPaymentData.amount}
                                                onChange={(e) => setManualPaymentData({...manualPaymentData, amount: e.target.value})}
                                                placeholder={`Enter amount to ${manualPaymentData.operation === 'add' ? 'add' : 'deduct'}`}
                                                className="w-full pl-12 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                                                style={{ borderColor: '#d4a644' }}
                                                disabled={loading}
                                                step="0.01"
                                                min="0"
                                                max={manualPaymentData.operation === 'deduct' ? student.upfrontFee || 0 : 999999999}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {manualPaymentData.operation === 'deduct' 
                                                ? `Maximum deduction: KES ${(student.upfrontFee || 0).toLocaleString()}`
                                                : 'Enter payment amount'}
                                        </p>
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>
                                            Payment Method *
                                        </label>
                                        <select
                                            value={manualPaymentData.paymentMethod}
                                            onChange={(e) => setManualPaymentData({...manualPaymentData, paymentMethod: e.target.value})}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                                            style={{ borderColor: '#d4a644' }}
                                            disabled={loading}
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="paypal">PayPal</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={manualPaymentData.notes}
                                            onChange={(e) => setManualPaymentData({...manualPaymentData, notes: e.target.value})}
                                            placeholder="Additional notes about this payment..."
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                                            style={{ borderColor: '#d4a644' }}
                                            rows="3"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Preview */}
                                    {manualPaymentData.amount && !isNaN(manualPaymentData.amount) && (
                                        <div className="p-3 rounded-lg bg-gray-50">
                                            <p className="text-sm text-gray-600">Payment Preview:</p>
                                            <p className="font-bold mt-1">
                                                {manualPaymentData.operation === 'add' ? 'Adding' : 'Deducting'}: 
                                                <span className={manualPaymentData.operation === 'add' ? 'text-green-600' : 'text-red-600'}>
                                                    KES {parseFloat(manualPaymentData.amount).toLocaleString()}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Method: {manualPaymentData.paymentMethod}
                                            </p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || !manualPaymentData.amount}
                                        className="w-full py-3 rounded-lg font-semibold text-white transition-colors"
                                        style={{
                                            backgroundColor: loading || !manualPaymentData.amount ? '#ccc' : '#d4a644',
                                            cursor: loading || !manualPaymentData.amount ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {loading ? 'Processing...' : `Record ${manualPaymentData.operation === 'add' ? 'Payment' : 'Deduction'}`}
                                    </button>
                                </form>
                            )}

                            {/* M-PESA STK Section */}
                            {activeTab === 'mpesa' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <h3 className="font-semibold text-green-800 mb-2">Send M-PESA STK Push</h3>
                                        <p className="text-sm text-green-700 mb-4">
                                            Send an STK push to the student's phone number for payment.
                                        </p>
                                        <button
                                            onClick={() => setMpesaModalOpen(true)}
                                            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                        >
                                            Open M-PESA Payment Modal
                                        </button>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p className="font-semibold mb-2">Note:</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>STK push will be sent to the phone number you provide</li>
                                            <li>Payment will be automatically recorded upon success</li>
                                            <li className='capitalize'>Payment recorded by: {loggedInUser}</li>
                                            <li>Transaction details (ID, phone) will be saved</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Side - Payment History */}
                        <div className="w-3/5 p-6 overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#2b2520' }}>
                                    <FaHistory /> Payment History
                                </h3>
                                <button
                                    onClick={fetchPaymentHistory}
                                    className="px-3 py-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>

                            {paymentHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No payment history found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {paymentHistory.map((payment, index) => (
                                        <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(payment.status)}`}>
                                                            {payment.status?.toUpperCase() || 'COMPLETE'}
                                                        </span>
                                                        <span className="font-bold">
                                                            KES {payment.amount?.toLocaleString()}
                                                        </span>
                                                        {payment.operation === 'deduct' && (
                                                            <span className="text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded">
                                                                DEDUCTION
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {payment.paymentMethod?.toUpperCase()} • 
                                                        {payment.transactionType === 'mpesa' ? ' M-PESA' : ' Manual'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Recorded by: <span className="font-semibold">{payment.recordedBy}</span> • 
                                                        {new Date(payment.createdAt).toLocaleDateString()} {new Date(payment.createdAt).toLocaleTimeString()}
                                                    </p>
                                                    {payment.notes && (
                                                        <p className="text-xs text-gray-600 mt-2 italic">"{payment.notes}"</p>
                                                    )}
                                                </div>
                                                {payment.transactionType === 'mpesa' && (
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-600">M-PESA Details:</p>
                                                        <p className="text-xs font-mono">Transaction Id: {payment.transactionId || 'N/A'}</p>
                                                        <p className="text-xs">Phone: {payment.phone || 'N/A'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* M-PESA Modal */}
            {mpesaModalOpen && (
                <MpesaPayment
                    onClose={() => setMpesaModalOpen(false)}
                    onSuccess={handleMpesaPaymentSuccess}
                    amount={0} // Let admin enter amount
                    userId={student._id}
                />
            )}
        </>
    );
};