import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaUsers, FaChalkboardTeacher, FaWallet, FaExchangeAlt, FaSearch, FaFilter } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import toast from 'react-hot-toast';
import AdminLayout from '../AdminLayout/AdminLayout';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export default function AdminFinance() {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalPaidToTutors: 0,
        totalPendingToTutors: 0,
        adminRevenue: 0,
        totalStudents: 0,
        totalTutors: 0
    });

    // Payment form state
    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        phone: '',
        transactionId: '',
        notes: ''
    });

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const authHeader = () => ({ 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
    });

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            // Fetch all tutors with their students
            const response = await fetch(`${API_BASE_URL}/tutors`, { 
                headers: authHeader() 
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch finance data');
            }

            const tutorsData = data.data?.tutors || [];
            setTutors(tutorsData);
            calculateStats(tutorsData);
        } catch (error) {
            console.error('Fetch finance data error:', error);
            toast.error(error.message || 'Failed to load finance data');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (tutorsData) => {
        let totalRevenue = 0;
        let totalPaidToTutors = 0;
        let totalPendingToTutors = 0;
        let totalStudents = 0;
        let adminRevenue = 0;

        tutorsData.forEach(tutor => {
            // Process current students
            (tutor.myStudents || []).forEach(student => {
                const courseFee = student.courseFee || 10000; // Default course fee
                totalRevenue += courseFee;
                
                const settlement = student.settlement || {};
                const tutorShare = courseFee * 0.15;
                
                if (settlement.status === 'PAID' && settlement.amount) {
                    totalPaidToTutors += settlement.amount;
                    adminRevenue += (courseFee - settlement.amount);
                } else {
                    totalPendingToTutors += tutorShare;
                    adminRevenue += (courseFee - tutorShare);
                }
                
                totalStudents++;
            });

            // Process certified students
            (tutor.certifiedStudents || []).forEach(student => {
                const courseFee = student.courseFee || 10000;
                totalRevenue += courseFee;
                
                const settlement = student.settlement || {};
                const tutorShare = courseFee * 0.15;
                
                if (settlement.status === 'PAID' && settlement.amount) {
                    totalPaidToTutors += settlement.amount;
                    adminRevenue += (courseFee - settlement.amount);
                } else {
                    totalPendingToTutors += tutorShare;
                    adminRevenue += (courseFee - tutorShare);
                }
                
                totalStudents++;
            });
        });

        setStats({
            totalRevenue,
            totalPaidToTutors,
            totalPendingToTutors,
            adminRevenue,
            totalStudents,
            totalTutors: tutorsData.length
        });
    };

    const handleProcessPayment = (tutor, student) => {
        setSelectedTutor({ tutor, student });
        const courseFee = student.courseFee || 10000;
        const tutorShare = courseFee * 0.15;
        
        setPaymentForm({
            amount: tutorShare,
            phone: tutor.phone || '',
            transactionId: '',
            notes: `Payment to ${tutor.firstName} ${tutor.lastName} for student ${student.name || student.studentName}`
        });
        setPaymentModalOpen(true);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!selectedTutor) return;

        setActionLoading(true);
        try {
            const { tutor, student } = selectedTutor;
            
            // Find the tutor and update the settlement
            const tutorResponse = await fetch(`${API_BASE_URL}/tutors/${tutor._id}`, {
                headers: authHeader()
            });
            const tutorData = await tutorResponse.json();
            
            if (!tutorResponse.ok) throw new Error(tutorData.message || 'Failed to fetch tutor');

            const currentTutor = tutorData.data?.tutor;
            if (!currentTutor) throw new Error('Tutor not found');

            // Update settlement in both myStudents and certifiedStudents
            let updated = false;
            
            // Check myStudents
            const updatedMyStudents = (currentTutor.myStudents || []).map(s => {
                if (String(s.studentId) === String(student.studentId)) {
                    updated = true;
                    return {
                        ...s,
                        settlement: {
                            status: 'PAID',
                            amount: paymentForm.amount,
                            phone: paymentForm.phone,
                            transactionId: paymentForm.transactionId,
                            timeOfPayment: new Date().toISOString()
                        }
                    };
                }
                return s;
            });

            // Check certifiedStudents
            const updatedCertifiedStudents = (currentTutor.certifiedStudents || []).map(s => {
                if (String(s.studentId) === String(student.studentId)) {
                    updated = true;
                    return {
                        ...s,
                        settlement: {
                            status: 'PAID',
                            amount: paymentForm.amount,
                            phone: paymentForm.phone,
                            transactionId: paymentForm.transactionId,
                            timeOfPayment: new Date().toISOString()
                        }
                    };
                }
                return s;
            });

            if (!updated) {
                throw new Error('Student not found in tutor records');
            }

            // Update tutor with new settlement data
            const updateResponse = await fetch(`${API_BASE_URL}/tutors/${tutor._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader()
                },
                body: JSON.stringify({
                    myStudents: updatedMyStudents,
                    certifiedStudents: updatedCertifiedStudents
                })
            });

            const updateData = await updateResponse.json();
            
            if (!updateResponse.ok) {
                throw new Error(updateData.message || 'Failed to process payment');
            }

            toast.success('Payment processed successfully!');
            setPaymentModalOpen(false);
            setSelectedTutor(null);
            fetchFinanceData(); // Refresh data
        } catch (error) {
            console.error('Process payment error:', error);
            toast.error(error.message || 'Failed to process payment');
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PAID': { color: 'bg-green-100 text-green-800', text: 'Paid' },
            'PENDING': { color: 'bg-orange-100 text-orange-800', text: 'Pending' },
            'FAILED': { color: 'bg-red-100 text-red-800', text: 'Failed' }
        };
        const config = statusConfig[status] || statusConfig.PENDING;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
    };

    // Filter tutors based on search
    const filteredTutors = tutors.filter(tutor =>
        `${tutor.firstName} ${tutor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="w-full space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-brand-dark">
                        <FaMoneyBillWave /> Finance & Tutor Settlements
                    </h2>
                    <p className="text-sm text-secondary">
                        Manage tutor payments and track financial metrics
                    </p>
                </div>

                {/* Financial Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.totalRevenue)}
                                </p>
                            </div>
                            <div className="text-blue-500 text-2xl">💰</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Paid to Tutors</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.totalPaidToTutors)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">15% of course fees</p>
                            </div>
                            <div className="text-green-500 text-2xl">✅</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending to Tutors</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.totalPendingToTutors)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
                            </div>
                            <div className="text-orange-500 text-2xl">⏳</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Admin Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.adminRevenue)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">85% of course fees</p>
                            </div>
                            <div className="text-purple-500 text-2xl">🏢</div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex gap-3 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light" />
                                <input
                                    type="text"
                                    placeholder="Search tutors by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                                />
                            </div>
                            <button className="px-4 py-2 rounded-lg font-semibold transition-colors border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white flex items-center gap-2">
                                <FaFilter /> Filter
                            </button>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold">{stats.totalTutors}</span> tutors • 
                            <span className="font-semibold"> {stats.totalStudents}</span> students
                        </div>
                    </div>
                </div>

                {/* Tutors List */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Tutor Settlement Records</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage payments for {filteredTutors.length} tutors
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <p className="text-secondary text-lg">Loading finance data...</p>
                        </div>
                    ) : filteredTutors.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-secondary text-lg">
                                {searchTerm ? 'No tutors found matching your search' : 'No tutors found'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredTutors.map((tutor) => {
                                const allStudents = [...(tutor.myStudents || []), ...(tutor.certifiedStudents || [])];
                                const paidStudents = allStudents.filter(s => s.settlement?.status === 'PAID');
                                const pendingStudents = allStudents.filter(s => !s.settlement || s.settlement.status !== 'PAID');
                                const totalTutorShare = allStudents.reduce((sum, student) => {
                                    const courseFee = student.courseFee || 10000;
                                    return sum + (courseFee * 0.15);
                                }, 0);
                                const paidAmount = paidStudents.reduce((sum, student) => sum + (student.settlement?.amount || 0), 0);

                                return (
                                    <div key={tutor._id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {tutor.profilePicture?.url ? (
                                                    <img
                                                        src={tutor.profilePicture.url}
                                                        alt={`${tutor.firstName} ${tutor.lastName}`}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-brand-gold"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-white font-semibold">
                                                        {tutor.firstName?.[0]}{tutor.lastName?.[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {tutor.firstName} {tutor.lastName}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">{tutor.email}</p>
                                                    <p className="text-sm text-gray-600">{tutor.phone}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-brand-dark">
                                                    {formatCurrency(paidAmount)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Paid of {formatCurrency(totalTutorShare)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Students List */}
                                        {allStudents.length > 0 && (
                                            <div className="mt-4 border rounded-lg overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Student & Course
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Tutor Share
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Status
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Last Payment
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {allStudents.map((student, index) => {
                                                            const courseFee = student.courseFee || 10000;
                                                            const tutorShare = courseFee * 0.15;
                                                            const settlement = student.settlement || {};

                                                            return (
                                                                <tr key={student.studentId || index} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-3">
                                                                        <div>
                                                                            <p className="font-medium text-gray-900">
                                                                                {student.name || student.studentName}
                                                                            </p>
                                                                            <p className="text-sm text-gray-600">
                                                                                {student.courseName}
                                                                            </p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                        {formatCurrency(tutorShare)}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {getStatusBadge(settlement.status)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                                        {settlement.timeOfPayment 
                                                                            ? formatDate(settlement.timeOfPayment)
                                                                            : 'Not paid yet'
                                                                        }
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        {settlement.status !== 'PAID' && (
                                                                            <button
                                                                                onClick={() => handleProcessPayment(tutor, student)}
                                                                                className="px-3 py-1 bg-brand-gold text-white text-sm rounded-lg hover:bg-brand-yellow transition-colors"
                                                                            >
                                                                                Pay Now
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {paymentModalOpen && selectedTutor && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Process Tutor Payment</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Pay {selectedTutor.tutor.firstName} {selectedTutor.tutor.lastName} for {selectedTutor.student.name || selectedTutor.student.studentName}
                            </p>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (KES)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tutor's Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={paymentForm.phone}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                                    placeholder="e.g., 254712345678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction ID
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={paymentForm.transactionId}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                                    placeholder="Enter M-Pesa transaction ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                                    rows="3"
                                    placeholder="Additional payment notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModalOpen(false)}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-brand-gold hover:bg-brand-yellow disabled:opacity-50"
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}