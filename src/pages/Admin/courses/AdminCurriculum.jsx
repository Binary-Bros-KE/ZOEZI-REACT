import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
    FaBook, FaPlus, FaEdit, FaTrash, FaChevronDown,
    FaChevronUp, FaYoutube, FaFilePdf, FaFileAlt, FaVideo, FaLink,
    FaImage, FaFile, FaCalendarAlt, FaClipboardCheck, FaGraduationCap,
    FaTimes, FaSave, FaUndo, FaPaperclip
} from 'react-icons/fa'
import AttachmentPreview from '../../../components/AttachmentPreview'
import AdminLayout from '../AdminLayout/AdminLayout'

const API = import.meta.env.VITE_SERVER_URL

const ITEM_TYPES = {
    lesson: {
        label: 'Lesson',
        color: 'bg-blue-500',
        lightBg: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: FaBook
    },
    event: {
        label: 'Event',
        color: 'bg-green-500',
        lightBg: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: FaCalendarAlt
    },
    cat: {
        label: 'CAT',
        color: 'bg-orange-500',
        lightBg: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: FaClipboardCheck
    },
    exam: {
        label: 'Exam',
        color: 'bg-red-500',
        lightBg: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: FaGraduationCap
    }
}

const ATTACHMENT_TYPES = [
    { value: 'none', label: 'No Attachment', icon: FaTimes },
    { value: 'youtube', label: 'YouTube Video', icon: FaYoutube },
    { value: 'vimeo', label: 'Vimeo Video', icon: FaVideo },
    { value: 'mp4', label: 'MP4 Video', icon: FaVideo },
    { value: 'pdf', label: 'PDF Document', icon: FaFilePdf },
    { value: 'article', label: 'Article', icon: FaFileAlt },
    { value: 'document', label: 'Document', icon: FaFile },
    { value: 'image', label: 'Image', icon: FaImage },
    { value: 'link', label: 'External Link', icon: FaLink }
]

export default function AdminCurriculum() {
    const [curriculums, setCurriculums] = useState([])
    const [allCourses, setAllCourses] = useState([])
    const [currentCurriculum, setCurrentCurriculum] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingItemId, setEditingItemId] = useState(null)
    const [expandedItems, setExpandedItems] = useState({})
    const [attachments, setAttachments] = useState([{ type: 'none', url: '', title: '' }])
    const [selectedCourseForCreate, setSelectedCourseForCreate] = useState('')

    const [formData, setFormData] = useState({
        type: 'lesson',
        name: '',
        description: '',
    })

useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch all curriculums
            const cRes = await fetch(`${API}/curriculums`)
            const cData = await cRes.json()

            if (cRes.ok) {
                setCurriculums(cData.data.curriculums || [])
            }

            // Fetch all courses
            const coRes = await fetch(`${API}/curriculums/courses/all`)
            const coData = await coRes.json()
            if (coRes.ok) {
                setAllCourses(coData.data.courses || [])
            }
        } catch (err) {
            toast.error(err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNewCurriculum = async () => {
        if (!selectedCourseForCreate) {
            return toast.error('Please select a course')
        }

        try {
            const r = await fetch(`${API}/curriculums`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: selectedCourseForCreate })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)

            setCurriculums([...curriculums, d.data.curriculum])
            setCurrentCurriculum(d.data.curriculum)
            setSelectedCourseForCreate('')
            setShowCreateModal(false)
            toast.success('Curriculum created for ' + (getCourseName(selectedCourseForCreate) || 'course'))
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleAddItem = async () => {
        if (!currentCurriculum) return toast.error('No curriculum selected')
        if (!formData.name.trim()) return toast.error('Item name is required')

        const validAttachments = attachments.filter(att =>
            att.type !== 'none' && att.url.trim() && att.title.trim()
        )

        const itemData = {
            ...formData,
            attachments: validAttachments
        }

        try {
            const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)

            setCurrentCurriculum(d.data.curriculum)
            setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
            resetForm()
            toast.success('Item added')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleUpdateItem = async (itemId) => {
        if (!currentCurriculum) return

        const validAttachments = attachments.filter(att =>
            att.type !== 'none' && att.url.trim() && att.title.trim()
        )

        const itemData = {
            ...formData,
            attachments: validAttachments
        }

        try {
            const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)

            setCurrentCurriculum(d.data.curriculum)
            setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
            resetForm()
            toast.success('Item updated')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Delete this item?')) return
        if (!currentCurriculum) return

        try {
            const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/items/${itemId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)

            setCurrentCurriculum(d.data.curriculum)
            setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
            toast.success('Item deleted')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const moveItemUp = async (itemId) => {
        if (!currentCurriculum) return

        const items = [...currentCurriculum.items]
        const currentIndex = items.findIndex(i => i._id === itemId)

        if (currentIndex <= 0) return

        try {
            [items[currentIndex], items[currentIndex - 1]] = [items[currentIndex - 1], items[currentIndex]]

            items.forEach((item, index) => {
                item.position = index
            })

            const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemOrder: items.map(i => i._id) })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)

            setCurrentCurriculum(d.data.curriculum)
            setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
            toast.success('Item moved up')
        } catch (err) {
            toast.error('Failed to move item: ' + err.message)
        }
    }

    const moveItemDown = async (itemId) => {
        if (!currentCurriculum) return

        const items = [...currentCurriculum.items]
        const currentIndex = items.findIndex(i => i._id === itemId)

        if (currentIndex >= items.length - 1) return

        try {
            [items[currentIndex], items[currentIndex + 1]] = [items[currentIndex + 1], items[currentIndex]]

            items.forEach((item, index) => {
                item.position = index
            })

            const r = await fetch(`${API}/curriculums/${currentCurriculum._id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemOrder: items.map(i => i._id) })
            })
            const d = await r.json()
            if (!r.ok) throw new Error(d.message)

            setCurrentCurriculum(d.data.curriculum)
            setCurriculums(curriculums.map(c => String(c._id) === String(currentCurriculum._id) ? d.data.curriculum : c))
            toast.success('Item moved down')
        } catch (err) {
            toast.error('Failed to move item: ' + err.message)
        }
    }

    const openEditForm = (item) => {
        setEditingItemId(item._id)
        setFormData({
            type: item.type,
            name: item.name,
            description: item.description,
        })
        setAttachments(item.attachments?.length > 0 ? item.attachments : [{ type: 'none', url: '', title: '' }])
        setShowForm(true)
    }

    const resetForm = () => {
        setFormData({
            type: 'lesson',
            name: '',
            description: '',
        })
        setAttachments([{ type: 'none', url: '', title: '' }])
        setShowForm(false)
        setEditingItemId(null)
    }

    const addAttachmentField = () => {
        setAttachments([...attachments, { type: 'none', url: '', title: '' }])
    }

    const removeAttachmentField = (index) => {
        if (attachments.length > 1) {
            const newAttachments = attachments.filter((_, i) => i !== index)
            setAttachments(newAttachments)
        }
    }

    const updateAttachment = (index, field, value) => {
        const newAttachments = [...attachments]
        newAttachments[index] = { ...newAttachments[index], [field]: value }
        setAttachments(newAttachments)
    }

    const toggleExpandItem = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }))
    }

    const getCourseName = (courseId) => {
        const course = allCourses.find(c => String(c._id) === String(courseId))
        return course ? course.name : 'Unknown Course'
    }

    const getAvailableCourses = () => {
        const curriculumCourseIds = curriculums.map(c => String(c.courseId))
        return allCourses.filter(c => !curriculumCourseIds.includes(String(c._id)))
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading curriculum...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white p-4 md:p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2">Curriculum Management</h1>
                            <p className="text-gray-600">Manage course curriculum and content</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={getAvailableCourses().length === 0}
                            className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            <FaPlus /> Create Curriculum
                        </button>
                    </div>
                </div>

                {/* Create Curriculum Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 z-99999 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-brand-dark">Create New Curriculum</h2>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        setSelectedCourseForCreate('')
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Course
                                </label>
                                {getAvailableCourses().length === 0 ? (
                                    <p className="text-gray-600">All courses already have curriculums</p>
                                ) : (
                                    <select
                                        value={selectedCourseForCreate}
                                        onChange={(e) => setSelectedCourseForCreate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                                    >
                                        <option value="">Choose a course...</option>
                                        {getAvailableCourses().map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCreateNewCurriculum}
                                    disabled={!selectedCourseForCreate}
                                    className="flex-1 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        setSelectedCourseForCreate('')
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Curriculums List */}
                {curriculums.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaBook className="text-5xl text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-700 mb-2">No curriculum yet</p>
                        <p className="text-gray-500 mb-6">Create a curriculum for a course to get started</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition flex items-center gap-2 mx-auto"
                        >
                            <FaPlus /> Create First Curriculum
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Column: Curriculums List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-brand-dark flex items-center gap-2">
                                        <FaBook /> Curriculums
                                        <span className="ml-auto px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                            {curriculums.length}
                                        </span>
                                    </h3>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {curriculums.map(curriculum => (
                                        <button
                                            key={curriculum._id}
                                            onClick={() => setCurrentCurriculum(curriculum)}
                                            className={`w-full text-left p-4 border-b border-gray-100 transition ${String(currentCurriculum?._id) === String(curriculum._id)
                                                    ? 'bg-brand-gold/10 border-l-4 border-l-brand-gold'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {curriculum.courseName}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {curriculum.items?.length || 0} items
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Curriculum Details */}
                        <div className="lg:col-span-3">
                            {currentCurriculum ? (
                                <div className="space-y-6">
                                    {/* Info Card */}
                                    <div className="bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 rounded-lg p-4 border border-gray-200">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-brand-dark">
                                                    {currentCurriculum.courseName}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    {currentCurriculum.items?.length || 0} curriculum items •
                                                    Last updated {new Date(currentCurriculum.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Items List */}
                                        <div className="lg:col-span-2">
                                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                                <div className="p-6 border-b border-gray-200">
                                                    <h3 className="text-xl font-semibold text-brand-dark flex items-center gap-2">
                                                        Curriculum Items
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                            {currentCurriculum.items?.length || 0}
                                                        </span>
                                                    </h3>
                                                </div>

                                                <div className="p-6">
                                                    {currentCurriculum.items && currentCurriculum.items.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {currentCurriculum.items
                                                                .sort((a, b) => a.position - b.position)
                                                                .map((item, index) => {
                                                                    const type = ITEM_TYPES[item.type]
                                                                    const TypeIcon = type.icon
                                                                    const isExpanded = expandedItems[item._id]
                                                                    const hasAttachments = item.attachments?.length > 0

                                                                    return (
                                                                        <div
                                                                            key={item._id}
                                                                            className="group border rounded-lg transition-all duration-200 border-gray-200 hover:border-brand-gold hover:shadow-sm"
                                                                        >
                                                                            {/* Item Header */}
                                                                            <div className={`p-4 rounded-t-lg ${type.lightBg} border-l-4 ${type.borderColor}`}>
                                                                                <div className="flex items-start gap-3">
                                                                                    {/* Move Controls */}
                                                                                    <div className="flex flex-col items-center gap-1">
                                                                                        <button
                                                                                            onClick={() => moveItemUp(item._id)}
                                                                                            disabled={index === 0}
                                                                                            className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-brand-gold hover:bg-gray-100'}`}
                                                                                            title="Move up"
                                                                                        >
                                                                                            <FaChevronUp />
                                                                                        </button>
                                                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                                                                                            <span className="text-sm font-semibold text-gray-700">{index + 1}</span>
                                                                                        </div>
                                                                                        <button
                                                                                            onClick={() => moveItemDown(item._id)}
                                                                                            disabled={index === currentCurriculum.items.length - 1}
                                                                                            className={`p-1 rounded ${index === currentCurriculum.items.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-brand-gold hover:bg-gray-100'}`}
                                                                                            title="Move down"
                                                                                        >
                                                                                            <FaChevronDown />
                                                                                        </button>
                                                                                    </div>

                                                                                    {/* Content */}
                                                                                    <div className="flex-1">
                                                                                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className={`${type.color} text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1`}>
                                                                                                    <TypeIcon /> {type.label}
                                                                                                </span>
                                                                                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                                                            </div>

                                                                                            {hasAttachments && (
                                                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                                                                                                    <FaPaperclip size={10} /> {item.attachments.length}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>

                                                                                        <div className="flex items-center gap-4 mt-2">
                                                                                            <button
                                                                                                onClick={() => toggleExpandItem(item._id)}
                                                                                                className="text-sm text-gray-600 hover:text-brand-gold transition flex items-center gap-1"
                                                                                            >
                                                                                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                                                                {isExpanded ? 'Show Less' : 'Show More'}
                                                                                            </button>
                                                                                            <span className="text-xs text-gray-500">
                                                                                                {new Date(item.createdAt).toLocaleDateString()}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Actions */}
                                                                                    <div className="flex items-center gap-2">
                                                                                        <button
                                                                                            onClick={() => openEditForm(item)}
                                                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                                            title="Edit"
                                                                                        >
                                                                                            <FaEdit />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleDeleteItem(item._id)}
                                                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                                            title="Delete"
                                                                                        >
                                                                                            <FaTrash />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Expanded Content */}
                                                                            {isExpanded && (
                                                                                <div className="p-4 border-t border-gray-100">
                                                                                    {item.description && (
                                                                                        <div className="mb-4">
                                                                                            <p className="text-gray-700">{item.description}</p>
                                                                                        </div>
                                                                                    )}

                                                                                    {hasAttachments && (
                                                                                        <div className="mt-4">
                                                                                            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                                                <FaPaperclip /> Attachments ({item.attachments.length})
                                                                                            </h5>
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                                {item.attachments.map((attachment, idx) => (
                                                                                                    <AttachmentPreview
                                                                                                        key={idx}
                                                                                                        type={attachment.type}
                                                                                                        url={attachment.url}
                                                                                                        title={attachment.title}
                                                                                                        className="h-full"
                                                                                                    />
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
                                                            <p className="text-lg text-gray-700 mb-2">No curriculum items yet</p>
                                                            <p className="text-gray-500 mb-6">Start by adding your first curriculum item</p>
                                                            <button
                                                                onClick={() => setShowForm(true)}
                                                                className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition flex items-center gap-2 mx-auto"
                                                            >
                                                                <FaPlus /> Add First Item
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Form or Stats */}
                                        <div>
                                            {showForm ? (
                                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                                                    <div className="p-6 border-b border-gray-200">
                                                        <h3 className="text-lg font-semibold text-brand-dark flex items-center justify-between">
                                                            <span>{editingItemId ? 'Edit Item' : 'Add New Item'}</span>
                                                            <button
                                                                onClick={resetForm}
                                                                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </h3>
                                                    </div>

                                                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                                                        <div className="space-y-6">
                                                            {/* Item Type */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-3">Item Type</label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {Object.entries(ITEM_TYPES).map(([key, val]) => {
                                                                        const Icon = val.icon
                                                                        return (
                                                                            <button
                                                                                key={key}
                                                                                type="button"
                                                                                onClick={() => setFormData({ ...formData, type: key })}
                                                                                className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center gap-1 ${formData.type === key
                                                                                    ? `${val.color} text-white border-transparent`
                                                                                    : `${val.lightBg} text-gray-700 border-gray-300 hover:border-${val.color}`
                                                                                    }`}
                                                                            >
                                                                                <Icon size={16} />
                                                                                <span className="text-xs font-medium">{val.label}</span>
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Name */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Item Name *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={formData.name}
                                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                                    placeholder="e.g., Introduction to Algebra"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none text-sm"
                                                                    required
                                                                />
                                                            </div>

                                                            {/* Description */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Description
                                                                </label>
                                                                <textarea
                                                                    value={formData.description}
                                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                                    placeholder="Add any notes or description..."
                                                                    rows="3"
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none text-sm"
                                                                />
                                                            </div>

                                                            {/* Attachments */}
                                                            <div>
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <label className="block text-sm font-medium text-gray-700">Attachments</label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={addAttachmentField}
                                                                        className="text-xs text-brand-gold hover:text-brand-dark flex items-center gap-1"
                                                                    >
                                                                        <FaPlus size={12} /> Add
                                                                    </button>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {attachments.map((attachment, index) => (
                                                                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="text-xs font-medium text-gray-700">Attachment {index + 1}</span>
                                                                                {attachments.length > 1 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeAttachmentField(index)}
                                                                                        className="text-red-500 hover:text-red-700"
                                                                                    >
                                                                                        <FaTrash size={12} />
                                                                                    </button>
                                                                                )}
                                                                            </div>

                                                                            {/* Type */}
                                                                            <div className="mb-2">
                                                                                <select
                                                                                    value={attachment.type}
                                                                                    onChange={(e) => updateAttachment(index, 'type', e.target.value)}
                                                                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none text-xs"
                                                                                >
                                                                                    {ATTACHMENT_TYPES.map(opt => (
                                                                                        <option key={opt.value} value={opt.value}>
                                                                                            {opt.label}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>

                                                                            {/* Title */}
                                                                            <div className="mb-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={attachment.title}
                                                                                    onChange={(e) => updateAttachment(index, 'title', e.target.value)}
                                                                                    placeholder="Title"
                                                                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none text-xs"
                                                                                />
                                                                            </div>

                                                                            {/* URL */}
                                                                            {attachment.type !== 'none' && (
                                                                                <input
                                                                                    type="url"
                                                                                    value={attachment.url}
                                                                                    onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                                                                                    placeholder="https://example.com/file"
                                                                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none text-xs"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex gap-3 pt-4 border-t">
                                                                <button
                                                                    type="button"
                                                                    onClick={editingItemId ? () => handleUpdateItem(editingItemId) : handleAddItem}
                                                                    disabled={!formData.name.trim()}
                                                                    className="flex-1 px-3 py-2 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm"
                                                                >
                                                                    <FaSave size={14} /> {editingItemId ? 'Update' : 'Add'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={resetForm}
                                                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                                                                >
                                                                    <FaUndo size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {/* Stats */}
                                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                                                        <h3 className="text-lg font-semibold text-brand-dark mb-4">Stats</h3>
                                                        <div className="space-y-3">
                                                            {Object.entries(ITEM_TYPES).map(([key, val]) => {
                                                                const Icon = val.icon
                                                                const count = currentCurriculum.items?.filter(i => i.type === key).length || 0
                                                                return (
                                                                    <div key={key} className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`p-2 rounded-lg ${val.lightBg}`}>
                                                                                <Icon className={`${val.color.replace('bg-', 'text-')}`} />
                                                                            </div>
                                                                            <span className="text-sm text-gray-700">{val.label}</span>
                                                                        </div>
                                                                        <span className="font-semibold text-sm">{count}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                                        <button
                                                            onClick={() => {
                                                                setEditingItemId(null)
                                                                resetForm()
                                                                setShowForm(true)
                                                            }}
                                                            className="w-full p-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <FaPlus /> Add Item
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <FaBook className="text-5xl text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg text-gray-700 mb-2">Select a curriculum to manage</p>
                                    <p className="text-gray-500">Choose from the list on the left</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
