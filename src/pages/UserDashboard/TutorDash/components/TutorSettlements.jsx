import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const API = import.meta.env.VITE_SERVER_URL

export default function TutorSettlements({ userData }) {
    const [myStudents, setMyStudents] = useState([])
    const [certifiedStudents, setCertifiedStudents] = useState([])
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        totalEarned: 0,
        pendingAmount: 0,
        totalStudents: 0,
        paidStudents: 0,
        pendingStudents: 0
    })

    const tutorId = userData?._id
    const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

    useEffect(() => {
        if (tutorId) {
            fetchSettlementData()
        }
    }, [tutorId])

    const fetchSettlementData = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API}/tutors/${tutorId}`, { 
                headers: authHeader() 
            })
            const data = await response.json()
            
            if (!response.ok) throw new Error(data.message || 'Failed to load settlement data')

            const tutor = data.data?.tutor
            if (tutor) {
                setMyStudents(tutor.myStudents || [])
                setCertifiedStudents(tutor.certifiedStudents || [])
                calculateStats(tutor.myStudents || [], tutor.certifiedStudents || [])
            }
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Failed to load settlement data')
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (currentStudents, certifiedStudents) => {
        const allStudents = [...currentStudents, ...certifiedStudents]
        
        let totalEarned = 0
        let pendingAmount = 0
        let paidStudents = 0
        let pendingStudents = 0

        allStudents.forEach(student => {
            const settlement = student.settlement || {}
            const courseFee = student.courseFee || getCourseFee(student.courseId) // You'll need to implement getCourseFee
            
            if (settlement.status === 'PAID' && settlement.amount) {
                totalEarned += settlement.amount
                paidStudents++
            } else {
                // Calculate 15% of course fee for pending settlements
                const tutorShare = courseFee * 0.15
                pendingAmount += tutorShare
                pendingStudents++
            }
        })

        setStats({
            totalEarned,
            pendingAmount,
            totalStudents: allStudents.length,
            paidStudents,
            pendingStudents
        })
    }

    // Helper function to get course fee - you'll need to implement this based on your data structure
    const getCourseFee = (courseId) => {
        // This should fetch course fee from your courses data
        // For now, return a placeholder - you'll need to implement this properly
        return 10000 // Example fee
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PAID': { color: 'bg-green-100 text-green-800', text: 'Paid' },
            'PENDING': { color: 'bg-orange-100 text-orange-800', text: 'Pending' },
            'FAILED': { color: 'bg-red-100 text-red-800', text: 'Failed' }
        }
        const config = statusConfig[status] || statusConfig.PENDING
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>
    }

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-64">
                <div className="text-gray-500">Loading settlement data...</div>
            </div>
        )
    }

    const allStudents = [...myStudents, ...certifiedStudents]

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-dark">Payment Settlements</h1>
                <div className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Earned</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(stats.totalEarned)}
                            </p>
                        </div>
                        <div className="text-green-500 text-2xl">💰</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(stats.pendingAmount)}
                            </p>
                        </div>
                        <div className="text-orange-500 text-2xl">⏳</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Paid Students</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.paidStudents}
                            </p>
                        </div>
                        <div className="text-blue-500 text-2xl">✅</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Students</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.pendingStudents}
                            </p>
                        </div>
                        <div className="text-purple-500 text-2xl">📋</div>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Student Settlement Records</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Showing {allStudents.length} students across all courses
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student & Course
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course Fee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Your Share (15%)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                allStudents.map((student, index) => {
                                    const courseFee = student.courseFee || getCourseFee(student.courseId)
                                    const tutorShare = courseFee * 0.15
                                    const settlement = student.settlement || {}
                                    const isCertified = student.certificationDate // Check if this is a certified student

                                    return (
                                        <tr key={student.studentId || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.name || student.studentName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex flex-col">
                                                        {student.courseName}
                                                        {isCertified && (
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0 rounded w-fit mt-1 font-bold">
                                                                Certified
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(courseFee)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(tutorShare)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(settlement.status || 'PENDING')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {settlement.timeOfPayment 
                                                    ? formatDate(settlement.timeOfPayment)
                                                    : 'Not paid yet'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {settlement.transactionId || '-'}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}