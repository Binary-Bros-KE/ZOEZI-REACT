import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { 
  FaUsers, FaUserPlus, FaUserGraduate, FaChalkboardTeacher, 
  FaUserCheck, FaUserClock, FaTrash, FaExchangeAlt, FaPlus, 
  FaFilter, FaSearch, FaSort, FaEye, FaListUl 
} from 'react-icons/fa'

const API = import.meta.env.VITE_SERVER_URL

export default function MyStudents({ userData }) {
    const [groups, setGroups] = useState([])
    const [myStudents, setMyStudents] = useState([])
    const [tutorCourses, setTutorCourses] = useState([])
    const [loading, setLoading] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupCourse, setNewGroupCourse] = useState('')
    const [creating, setCreating] = useState(false)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCourse, setSelectedCourse] = useState('all')

    const tutorId = userData?._id
    const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

    useEffect(() => { fetchAll() }, [tutorId])

    const fetchAll = async () => {
        if (!tutorId) return
        setLoading(true)
        try {
            // Fetch groups
            const gRes = await fetch(`${API}/groups?tutorId=${tutorId}`, { headers: authHeader() })
            const gData = await gRes.json()
            if (!gRes.ok) throw new Error(gData.message || 'Failed to load groups')
            setGroups(gData.data.groups || [])

            // Fetch tutor record with myStudents and courses
            const tRes = await fetch(`${API}/tutors/${tutorId}`, { headers: authHeader() })
            const tData = await tRes.json()
            if (!tRes.ok) throw new Error(tData.message || 'Failed to load tutor data')

            const tutor = tData.data?.tutor
            if (tutor) {
                setMyStudents(tutor.myStudents || [])
                setTutorCourses(tutor.courses || [])
            } else {
                setMyStudents([])
                setTutorCourses([])
            }
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const unassignedStudents = myStudents.filter(s => !s.isAssignedToGroup)
    const assignedStudents = myStudents.filter(s => s.isAssignedToGroup)

    // Filter students based on search and course
    const filteredUnassignedStudents = unassignedStudents.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCourse = selectedCourse === 'all' || 
            student.courses?.[0]?.courseId === selectedCourse
        return matchesSearch && matchesCourse
    })

    // Stats
    const stats = {
        totalStudents: myStudents.length,
        totalGroups: groups.length,
        pendingAssignments: unassignedStudents.length,
        organizedStudents: assignedStudents.length,
        averageGroupSize: groups.length > 0 ? 
            Math.round(myStudents.length / groups.length) : 0
    }

    const createGroup = async () => {
        if (!newGroupName.trim()) return toast.error('Enter a group name')
        if (!newGroupCourse) return toast.error('Select a course')
        setCreating(true)
        try {
            const r = await fetch(`${API}/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ name: newGroupName, tutorId, courseId: newGroupCourse })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)
            setNewGroupName('')
            setNewGroupCourse('')
            await fetchAll()
            toast.success('Group created successfully')
            setActiveTab('groups')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setCreating(false)
        }
    }

    const deleteGroup = async (groupId) => {
        if (!confirm('Delete this group? Students will be unassigned from this group.')) return
        try {
            const r = await fetch(`${API}/groups/${groupId}`, {
                method: 'DELETE',
                headers: authHeader()
            })
            if (!r.ok) throw new Error('Failed to delete')
            await fetchAll()
            toast.success('Group deleted')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const addStudentToGroup = async (groupId, studentId) => {
        const student = myStudents.find(s => String(s.studentId) === String(studentId))
        if (!student) return toast.error('Student not found')

        try {
            const r = await fetch(`${API}/groups/${groupId}/add-student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ studentId, name: student.name })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)
            await fetchAll()
            toast.success('Student added to group')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const removeStudentFromGroup = async (groupId, studentId) => {
        if (!confirm('Remove student from this group?')) return
        try {
            const r = await fetch(`${API}/groups/${groupId}/remove-student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ studentId })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)
            await fetchAll()
            toast.success('Student removed')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const transferStudent = async (fromGroupId, toGroupId, studentId) => {
        try {
            const r = await fetch(`${API}/groups/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ fromGroupId, toGroupId, studentId })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)
            await fetchAll()
            toast.success('Student transferred')
        } catch (err) {
            toast.error(err.message)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading student data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2">Student Management</h1>
                <p className="text-gray-600">Organize and manage your students efficiently</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FaUsers className="text-blue-600 text-lg" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-brand-dark">{stats.totalStudents}</p>
                            <p className="text-xs text-gray-500">Total Students</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <FaChalkboardTeacher className="text-green-600 text-lg" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-brand-dark">{stats.totalGroups}</p>
                            <p className="text-xs text-gray-500">Groups</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <FaUserClock className="text-orange-600 text-lg" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-brand-dark">{stats.pendingAssignments}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <FaUserCheck className="text-purple-600 text-lg" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-brand-dark">{stats.organizedStudents}</p>
                            <p className="text-xs text-gray-500">Organized</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Tabs Navigation */}
            <div className="mb-8 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-3 rounded-t-lg font-medium flex items-center gap-2 transition-all ${activeTab === 'dashboard' ? 'bg-white border-t border-l border-r border-gray-200 text-brand-gold' : 'text-gray-600 hover:text-brand-gold'}`}
                    >
                        <FaUsers /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-3 rounded-t-lg font-medium flex items-center gap-2 transition-all ${activeTab === 'students' ? 'bg-white border-t border-l border-r border-gray-200 text-brand-gold' : 'text-gray-600 hover:text-brand-gold'}`}
                    >
                        <FaUserGraduate /> Students ({myStudents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`px-4 py-3 rounded-t-lg font-medium flex items-center gap-2 transition-all ${activeTab === 'groups' ? 'bg-white border-t border-l border-r border-gray-200 text-brand-gold' : 'text-gray-600 hover:text-brand-gold'}`}
                    >
                        <FaChalkboardTeacher /> Groups ({groups.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-3 rounded-t-lg font-medium flex items-center gap-2 transition-all ${activeTab === 'create' ? 'bg-white border-t border-l border-r border-gray-200 text-brand-gold' : 'text-gray-600 hover:text-brand-gold'}`}
                    >
                        <FaPlus /> Create Group
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Pending Assignments */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-brand-dark">Pending Assignments</h3>
                                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                        {unassignedStudents.length} students
                                    </span>
                                </div>
                                
                                {unassignedStudents.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                                        <FaUserCheck className="text-4xl text-green-500 mx-auto mb-3" />
                                        <p className="text-lg font-medium text-gray-700">All students assigned!</p>
                                        <p className="text-gray-500">Every student has been organized into a group</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {unassignedStudents.slice(0, 5).map(student => (
                                            <div key={student.studentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                                <div>
                                                    <p className="font-medium text-gray-900">{student.name}</p>
                                                    <p className="text-sm text-gray-500">Ready for assignment</p>
                                                </div>
                                                <select
                                                    defaultValue=""
                                                    onChange={e => e.target.value && addStudentToGroup(e.target.value, student.studentId)}
                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none cursor-pointer"
                                                >
                                                    <option value="">Assign to...</option>
                                                    {groups.map(g => (
                                                        <option key={g._id} value={g._id}>{g.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                        {unassignedStudents.length > 5 && (
                                            <p className="text-center text-gray-500 text-sm">
                                                + {unassignedStudents.length - 5} more students pending assignment
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <h3 className="text-xl font-semibold text-brand-dark mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="w-full p-4 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2"
                                    >
                                        <FaPlus /> Create New Group
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('students')}
                                        className="w-full p-4 border-2 border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold hover:text-white transition flex items-center justify-center gap-2"
                                    >
                                        <FaUserGraduate /> View All Students
                                    </button>
                                    {groups.length > 0 && (
                                        <button
                                            onClick={() => setActiveTab('groups')}
                                            className="w-full p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-brand-gold hover:text-brand-gold transition flex items-center justify-center gap-2"
                                        >
                                            <FaChalkboardTeacher /> Manage Groups
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search students by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-64">
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none cursor-pointer"
                                >
                                    <option value="all">All Courses</option>
                                    {tutorCourses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUnassignedStudents.map(student => {
                                const course = tutorCourses.find(c => c._id === student.courses?.[0]?.courseId)
                                return (
                                    <div key={student.studentId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                                {course && (
                                                    <p className="text-sm text-gray-600 mt-1">{course.name}</p>
                                                )}
                                            </div>
                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                                Pending
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            {student.courses?.[0]?.paymentStatus && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Payment:</span>
                                                    <span className={`font-medium ${student.courses[0].paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {student.courses[0].paymentStatus}
                                                    </span>
                                                </div>
                                            )}
                                            {student.email && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Email:</span>
                                                    <span className="text-gray-900">{student.email}</span>
                                                </div>
                                            )}
                                            {student.phone && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Phone:</span>
                                                    <span className="text-gray-900">{student.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        {groups.length > 0 ? (
                                            <select
                                                defaultValue=""
                                                onChange={e => e.target.value && addStudentToGroup(e.target.value, student.studentId)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none cursor-pointer"
                                            >
                                                <option value="">Add to Group</option>
                                                {groups.map(g => (
                                                    <option key={g._id} value={g._id}>{g.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <button
                                                onClick={() => setActiveTab('create')}
                                                className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-gold hover:text-brand-gold transition"
                                            >
                                                Create a group first
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {filteredUnassignedStudents.length === 0 && (
                            <div className="text-center py-12">
                                <FaUserCheck className="text-5xl text-green-500 mx-auto mb-4 opacity-50" />
                                <p className="text-lg text-gray-700 mb-2">No students found</p>
                                <p className="text-gray-500">Try adjusting your search or filter</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Groups Tab */}
                {activeTab === 'groups' && (
                    <div className="p-6">
                        {groups.length === 0 ? (
                            <div className="text-center py-12">
                                <FaChalkboardTeacher className="text-5xl text-gray-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-700 mb-2">No groups yet</p>
                                <p className="text-gray-500 mb-6">Create your first group to start organizing students</p>
                                <button
                                    onClick={() => setActiveTab('create')}
                                    className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition"
                                >
                                    Create First Group
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groups.map(group => (
                                    <div key={group._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-brand-dark">{group.name}</h3>
                                                    <p className="text-gray-600">
                                                        {group.students?.length || 0} students • Created {new Date(group.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => deleteGroup(group._id)}
                                                        className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6">
                                            {group.students && group.students.length > 0 ? (
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-700 mb-3">Students in this group:</h4>
                                                    {group.students.map(student => (
                                                        <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-white text-sm">
                                                                    {student.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{student.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Added {new Date(student.addedAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => removeStudentFromGroup(group._id, student.studentId)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                    title="Remove from group"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                                {groups.length > 1 && (
                                                                    <select
                                                                        defaultValue=""
                                                                        onChange={e => e.target.value && transferStudent(group._id, e.target.value, student.studentId)}
                                                                        className="p-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
                                                                        title="Transfer to another group"
                                                                    >
                                                                        <option value="">Transfer</option>
                                                                        {groups.filter(g => g._id !== group._id).map(g => (
                                                                            <option key={g._id} value={g._id}>{g.name}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-gray-500 mb-4">No students in this group yet</p>
                                                </div>
                                            )}
                                            
                                            {unassignedStudents.length > 0 && (
                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <select
                                                        defaultValue=""
                                                        onChange={e => e.target.value && addStudentToGroup(group._id, e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-gold transition cursor-pointer"
                                                    >
                                                        <option value="">+ Add student to this group</option>
                                                        {unassignedStudents.map(s => (
                                                            <option key={s.studentId} value={s.studentId}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Create Group Tab */}
                {activeTab === 'create' && (
                    <div className="p-6">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-2xl font-semibold text-brand-dark mb-2">Create New Group</h3>
                            <p className="text-gray-600 mb-8">Organize your students by creating study groups</p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Morning Batch, Advanced Class, Nov 20 Class"
                                        value={newGroupName}
                                        onChange={e => setNewGroupName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Give your group a descriptive name</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course
                                    </label>
                                    <select
                                        value={newGroupCourse}
                                        onChange={e => setNewGroupCourse(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none cursor-pointer"
                                    >
                                        <option value="">Select a course</option>
                                        {tutorCourses.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">Select the course this group will focus on</p>
                                </div>
                                
                                <div className="pt-4">
                                    <button
                                        onClick={createGroup}
                                        disabled={creating || !newGroupName.trim() || !newGroupCourse}
                                        className="w-full px-6 py-4 bg-brand-gold text-white font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {creating ? 'Creating Group...' : 'Create Group'}
                                    </button>
                                </div>
                            </div>
                            
                            {groups.length > 0 && (
                                <div className="mt-12">
                                    <h4 className="text-lg font-medium text-gray-700 mb-4">Existing Groups</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {groups.slice(0, 4).map(group => (
                                            <div key={group._id} className="p-4 border border-gray-200 rounded-lg">
                                                <p className="font-medium text-gray-900">{group.name}</p>
                                                <p className="text-sm text-gray-500">{group.students?.length || 0} students</p>
                                            </div>
                                        ))}
                                    </div>
                                    {groups.length > 4 && (
                                        <p className="text-center text-gray-500 text-sm mt-4">
                                            ...and {groups.length - 4} more groups
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}