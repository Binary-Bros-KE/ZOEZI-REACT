import React, { useEffect, useState } from 'react'
import AdminLayout from '../AdminLayout/AdminLayout'
import toast from 'react-hot-toast'
import { FaRegCheckSquare, FaUserPlus, FaUserTimes } from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { IoMdCloseCircleOutline } from 'react-icons/io'

const API_BASE = import.meta.env.VITE_SERVER_URL

export default function AdminAssignments() {
    const [courses, setCourses] = useState([])
    const [tutors, setTutors] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [selectedTutor, setSelectedTutor] = useState(null)
    const [cancelling, setCancelling] = useState(false)
    const [cancelReason, setCancelReason] = useState('')

    useEffect(() => { fetchData() }, [])

    const adminHeader = () => {
        const pwd = localStorage.getItem('adminPassword')
        return pwd ? { 'x-admin-password': pwd } : {}
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/admin/assignments`, { headers: { ...adminHeader() } })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to fetch assignments')
            setCourses(data.data.courses || [])
            setTutors(data.data.tutors || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load assignments')
        } finally { setLoading(false) }
    }

    const openAssign = (course, student) => {
        setSelectedCourse(course)
        setSelectedStudent(student)
        setSelectedTutor(null)
        setShowAssignModal(true)
    }

    const doAssign = async () => {
        if (!selectedTutor) return toast.error('Select a tutor')
        setAssigning(true)
        try {
            const res = await fetch(`${API_BASE}/admin/assign`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', ...adminHeader() },
                body: JSON.stringify({ tutorId: selectedTutor, courseId: selectedCourse._id, studentId: selectedStudent.studentId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Assign failed')
            toast.success('Student assigned')
            setShowAssignModal(false)
            await fetchData()
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Assign failed')
        } finally { setAssigning(false) }
    }

    const openCancel = (course, student) => {
        setSelectedCourse(course)
        setSelectedStudent(student)
        setCancelReason('')
    }

    const doCancel = async () => {
        if (!cancelReason) return toast.error('Enter a reason')
        setCancelling(true)
        try {
            const res = await fetch(`${API_BASE}/admin/cancel`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', ...adminHeader() },
                body: JSON.stringify({ courseId: selectedCourse._id, studentId: selectedStudent.studentId, reason: cancelReason })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Cancel failed')
            toast.success('Student cancelled')
            setCancelReason('')
            await fetchData()
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Cancel failed')
        } finally { setCancelling(false) }
    }

    const renderStudentLists = (course) => {
        const pending = (course.enrolledStudents || []).filter(s => s.assignmentStatus === 'PENDING')
        const assigned = (course.enrolledStudents || []).filter(s => s.assignmentStatus === 'ASSIGNED')
        const cancelled = (course.enrolledStudents || []).filter(s => s.assignmentStatus === 'CANCELLED')

        return (
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-yellow-600 flex items-center gap-2">
                        <MdPendingActions />
                        Pending Students
                    </h4>
                    {pending.length === 0 ? <p className="text-sm text-gray-500">No pending students</p> : (
                        <div className="grid gap-3 mt-2">
                            {pending.map(s => (
                                <div key={s.studentId} className="p-3 bg-white rounded-lg shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{s.name}</div>
                                        <div className="text-xs text-gray-500">{s.email} • {s.phone}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openAssign(course, s)} className="px-3 py-1 rounded bg-green-500 text-white cursor-pointer">Assign</button>
                                        <button onClick={() => { openCancel(course, s); document.getElementById('cancel-reason-input')?.focus() }} className="cursor-pointer px-3 py-1 rounded bg-red-500 text-white">Cancel</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h4 className="font-semibold text-green-600 flex items-center gap-2">
                        <FaRegCheckSquare />
                        Assigned Students
                    </h4>
                    {assigned.length === 0 ? <p className="text-sm text-gray-500">No assigned students</p> : (
                        <div className="grid gap-3 mt-2">
                            {assigned.map(s => (
                                <div key={s.studentId} className="p-3 bg-white rounded-lg shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{s.name}</div>
                                        <div className="text-xs text-gray-500">Tutor: {s.tutor?.name || '—'}</div>
                                    </div>
                                    <div className="text-sm text-gray-600">{s.payment?.status || s.paymentStatus}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h4 className="font-semibold text-red-600 flex items-center gap-2">
                        <IoMdCloseCircleOutline />
                        Cancelled Students
                    </h4>
                    {cancelled.length === 0 ? <p className="text-sm text-gray-500">No cancelled students</p> : (
                        <div className="grid gap-3 mt-2">
                            {cancelled.map(s => (
                                <div key={s.studentId} className="p-3 bg-white rounded-lg shadow-sm">
                                    <div className="font-semibold">{s.name}</div>
                                    <div className="text-xs text-gray-500">Admin note: {s.adminNotes || '—'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <AdminLayout>
            <div className="w-full">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Allotment</h2>
                    <div>
                        <button onClick={fetchData} className="px-4 py-2 rounded bg-blue-500 text-white cursor-pointer">Refresh</button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <aside className="col-span-1">
                        <div className="bg-white rounded-lg p-4 shadow border-2 border-gray-400">
                            <h3 className="text-primary font-bold mb-3">Courses</h3>
                            {loading ? <p>Loading...</p> : courses.length === 0 ? <p className="text-sm text-gray-500">No courses</p> : (
                                <div className="space-y-2">
                                    {courses.map(course => (
                                        <button
                                            key={course._id}
                                            onClick={() => setSelectedCourse(course)}
                                            className={`cursor-pointer w-full text-left p-3 rounded ${selectedCourse?._id === course._id ? 'bg-gray-300' : 'hover:bg-gray-100'}`}>
                                            <div className="font-semibold">{course.name}</div>
                                            <div className="text-xs text-gray-500">{(course.enrolledStudents || []).length} students</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    <main className="col-span-2">
                        {selectedCourse ? (
                            <div className="bg-white rounded-lg p-4 shadow">
                                <h3 className="font-bold mb-4 text-gray-600 text-xl">{selectedCourse.name}</h3>
                                {renderStudentLists(selectedCourse)}

                                {/* Cancel reason box */}
                                <div className="mt-4">
                                    <input id="cancel-reason-input" placeholder="Cancel reason (for selected student)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full p-2 border-2 border-gray-300 rounded mb-2 outline-none focus:outline-none focus:border-red-600" />
                                    <div className="flex gap-2">
                                        <button onClick={async () => { if (!selectedStudent) return toast.error('Select a student to cancel'); await doCancel() }} className="px-4 py-2 bg-red-500 text-white rounded">Confirm Cancel</button>
                                        <button onClick={() => { setCancelReason(''); setSelectedStudent(null) }} className="px-4 py-2 bg-gray-200 rounded">Clear</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg p-8 shadow text-center">Select a course to manage assignments</div>
                        )}
                    </main>
                </div>

                {/* Assign Modal */}
                {showAssignModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-999">
                        <div className="bg-white p-6 rounded-lg w-2/3 max-w-2xl">
                            <h3 className="font-semibold mb-4">Assign {selectedStudent?.name} to Tutor</h3>
                            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-auto">
                                {tutors.map(t => (
                                    <label key={t._id} className={`p-3 border border-gray-400 rounded cursor-pointer ${selectedTutor === t._id ? 'border-blue-500 bg-blue-50' : ''}`}>
                                        <input type="radio" name="tutor" value={t._id} checked={selectedTutor === t._id} onChange={() => setSelectedTutor(t._id)} className="mr-2" />
                                        <span className="font-semibold">{t.name}</span>
                                        <div className="text-xs text-gray-500">{t.email} • {t.phone}</div>
                                        <div className="text-xs text-gray-500">Assigned: {t.assignedCount || 0}</div>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded bg-gray-200 cursor-pointer">Close</button>
                                <button onClick={doAssign} className="px-4 py-2 rounded bg-green-600 text-white cursor-pointer">{assigning ? 'Assigning...' : 'Assign'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
