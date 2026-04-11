import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  FaUsers, FaPlus, FaEdit, FaTrash, FaChevronUp, FaChevronDown,
  FaChevronRight, FaBook, FaCalendarAlt, FaClipboardCheck, FaGraduationCap,
  FaDownload, FaUpload, FaCheck, FaTimes, FaClock, FaPaperclip,
  FaComment, FaEye, FaLock, FaLockOpen, FaReply, FaSave, FaUndo,
  FaRegCheckCircle, FaRegCircle, FaCalendar, FaHourglassEnd
} from 'react-icons/fa'
import AttachmentPreview from '../../components/AttachmentPreview'

const API = import.meta.env.VITE_SERVER_URL

const ITEM_TYPES = {
  lesson: {
    label: 'Lesson',
    color: 'bg-blue-600',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    icon: FaBook
  },
  event: {
    label: 'Event',
    color: 'bg-green-600',
    lightBg: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-600',
    icon: FaCalendarAlt
  },
  cat: {
    label: 'CAT',
    color: 'bg-orange-600',
    lightBg: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600',
    icon: FaClipboardCheck
  },
  exam: {
    label: 'Exam',
    color: 'bg-red-600',
    lightBg: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-600',
    icon: FaGraduationCap
  }
}

const ATTACHMENT_TYPES = [
  { value: 'none', label: 'No Attachment', icon: FaTimes },
  { value: 'youtube', label: 'YouTube Video', icon: FaDownload },
  { value: 'vimeo', label: 'Vimeo Video', icon: FaDownload },
  { value: 'mp4', label: 'MP4 Video', icon: FaDownload },
  { value: 'pdf', label: 'PDF Document', icon: FaDownload },
  { value: 'article', label: 'Article', icon: FaDownload },
  { value: 'document', label: 'Document', icon: FaDownload }
]

export default function GroupCurriculum({ userData }) {
  const [groups, setGroups] = useState([])
  const [curriculums, setCurriculums] = useState([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingItemId, setEditingItemId] = useState(null)
  const [expandedItemId, setExpandedItemId] = useState(null)
  const [importMode, setImportMode] = useState('curriculum')
  const [selectedCurriculumId, setSelectedCurriculumId] = useState('')
  const [selectedImportItemId, setSelectedImportItemId] = useState('')
  const [tutorRemarkText, setTutorRemarkText] = useState('')
  const [replying, setReplying] = useState(null)
  const [attachments, setAttachments] = useState([{ type: 'none', url: '', title: '' }])

  const [formData, setFormData] = useState({
    type: 'lesson',
    name: '',
    description: '',
    releaseDate: '',
    releaseTime: '00:00',
    dueDate: '',
    dueTime: '23:59'
  })

  const tutorId = userData?._id
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  useEffect(() => {
    fetchData()
  }, [tutorId])

  useEffect(() => {
    // Select first group by default when groups load
    if (groups.length > 0 && !selectedGroupId) {
      handleGroupSelect(groups[0]._id)
    }
  }, [groups])

  const fetchData = async () => {
    if (!tutorId) return
    setLoading(true)
    try {
      // Fetch groups
      const gRes = await fetch(`${API}/groups?tutorId=${tutorId}`, { headers: authHeader() })
      const gData = await gRes.json()
      if (gRes.ok) setGroups(gData.data.groups || [])

      // Fetch curriculums
      const cRes = await fetch(`${API}/curriculums?tutorId=${tutorId}`, { headers: authHeader() })
      const cData = await cRes.json()
      if (cRes.ok) setCurriculums(cData.data.curriculums || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupSelect = async (groupId) => {
    setSelectedGroupId(groupId)
    try {
      const r = await fetch(`${API}/group-curriculum/${groupId}`, { headers: authHeader() })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)
      setSelectedGroup(d.data.group)
      setExpandedItemId(null) // Collapse any expanded items when switching groups
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleAddItem = async () => {
    if (!selectedGroup) return toast.error('No group selected')
    if (!formData.name.trim()) return toast.error('Item name is required')

    // Filter out empty attachments
    const validAttachments = attachments.filter(att =>
      att.type !== 'none' && att.url.trim() && att.title.trim()
    )

    const itemData = {
      ...formData,
      attachments: validAttachments
    }

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(itemData)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      resetForm()
      toast.success('Item added')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleUpdateItem = async (itemId) => {
    if (!selectedGroup) return

    // Filter out empty attachments
    const validAttachments = attachments.filter(att =>
      att.type !== 'none' && att.url.trim() && att.title.trim()
    )

    const itemData = {
      ...formData,
      attachments: validAttachments
    }

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(itemData)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      resetForm()
      toast.success('Item updated')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return
    if (!selectedGroup) return

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items/${itemId}`, {
        method: 'DELETE',
        headers: authHeader()
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      toast.success('Item deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const moveItemUp = async (itemId) => {
    if (!selectedGroup) return

    const items = [...selectedGroup.curriculumItems]
    const currentIndex = items.findIndex(i => i._id === itemId)

    if (currentIndex <= 0) return // Already at the top

    try {
      // Swap positions
      [items[currentIndex], items[currentIndex - 1]] = [items[currentIndex - 1], items[currentIndex]]

      // Update positions
      items.forEach((item, index) => {
        item.position = index
      })

      // Send to API
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ itemOrder: items.map(i => i._id) })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      toast.success('Item moved up')
    } catch (err) {
      toast.error('Failed to move item: ' + err.message)
    }
  }

  const moveItemDown = async (itemId) => {
    if (!selectedGroup) return

    const items = [...selectedGroup.curriculumItems]
    const currentIndex = items.findIndex(i => i._id === itemId)

    if (currentIndex >= items.length - 1) return // Already at the bottom

    try {
      // Swap positions
      [items[currentIndex], items[currentIndex + 1]] = [items[currentIndex + 1], items[currentIndex]]

      // Update positions
      items.forEach((item, index) => {
        item.position = index
      })

      // Send to API
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ itemOrder: items.map(i => i._id) })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      toast.success('Item moved down')
    } catch (err) {
      toast.error('Failed to move item: ' + err.message)
    }
  }

  const handleImportCurriculum = async () => {
    if (!selectedCurriculumId) return toast.error('Select a curriculum to import')
    if (!selectedGroup) return

    try {
      const r = await fetch(
        `${API}/group-curriculum/${selectedGroup._id}/import-curriculum/${selectedCurriculumId}`,
        { method: 'POST', headers: authHeader() }
      )
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      setShowImportModal(false)
      setSelectedCurriculumId('')
      toast.success('Curriculum imported')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleImportItem = async () => {
    if (!selectedCurriculumId) return toast.error('Select a curriculum')
    if (!selectedImportItemId) return toast.error('Select an item to import')
    if (!selectedGroup) return

    try {
      const r = await fetch(
        `${API}/group-curriculum/${selectedGroup._id}/import-item/${selectedCurriculumId}/${selectedImportItemId}`,
        { method: 'POST', headers: authHeader() }
      )
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      setShowImportModal(false)
      setSelectedCurriculumId('')
      setSelectedImportItemId('')
      toast.success('Item imported')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const openEditForm = (item) => {
    setEditingItemId(item._id)
    setFormData({
      type: item.type,
      name: item.name,
      description: item.description,
      releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '',
      releaseTime: item.releaseTime || '00:00',
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      dueTime: item.dueTime || '23:59'
    })
    setAttachments(item.attachments?.length > 0 ? item.attachments : [{ type: 'none', url: '', title: '' }])
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      type: 'lesson',
      name: '',
      description: '',
      releaseDate: '',
      releaseTime: '00:00',
      dueDate: '',
      dueTime: '23:59'
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

  const isItemReleased = (item) => {
    if (!item.releaseDate) return true
    const releaseDateTime = new Date(`${item.releaseDate}T${item.releaseTime}`)
    return releaseDateTime <= new Date()
  }

  const isItemDue = (item) => {
    if (!item.dueDate) return false
    const dueDateTime = new Date(`${item.dueDate}T${item.dueTime}`)
    return dueDateTime <= new Date()
  }

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'

      const dateOnly = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      const time = timeString || '00:00'
      return `${dateOnly} at ${time}`
    } catch (err) {
      return 'Invalid Date'
    }
  }

  const handleMarkItemComplete = async (itemId) => {
    if (!selectedGroup) return

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          isCompleted: true
        })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      toast.success('Item marked as complete')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleUnmarkItemComplete = async (itemId) => {
    if (!selectedGroup) return

    try {
      const r = await fetch(`${API}/group-curriculum/${selectedGroup._id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          isCompleted: false
        })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      toast.success('Item marked as incomplete')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleAddTutorRemark = async (itemId, responseId) => {
    if (!tutorRemarkText.trim()) {
      toast.error('Please enter a remark')
      return
    }

    if (!selectedGroup) return

    try {
      const r = await fetch(`${API}/student-curriculum/${selectedGroup._id}/items/${itemId}/responses/${responseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          tutorRemark: tutorRemarkText
        })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message)

      setSelectedGroup(d.data.group)
      setTutorRemarkText('')
      setReplying(null)
      toast.success('Remark added')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const toggleExpandItem = (itemId) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading curriculum data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2">Timetable Management</h1>
        <p className="text-gray-600">Manage curriculum for specific student groups</p>
      </div>

      {/* Group Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-brand-dark mb-4 flex items-center gap-2">
          <FaUsers /> Select Group
        </h2>

        {groups.length === 0 ? (
          <div className="text-center py-8">
            <FaUsers className="text-4xl text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700">No groups created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map(group => (
              <button
                key={group._id}
                onClick={() => handleGroupSelect(group._id)}
                className={`p-4 rounded-lg border transition-all duration-200 flex items-center gap-3 ${String(selectedGroupId) === String(group._id)
                    ? 'border-brand-gold bg-brand-gold text-white shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-900 hover:border-brand-gold hover:shadow-sm'
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${String(selectedGroupId) === String(group._id)
                    ? 'bg-white/20'
                    : 'bg-brand-gold/10'
                  }`}>
                  <FaUsers className={String(selectedGroupId) === String(group._id) ? 'text-white' : 'text-brand-gold'} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm opacity-80 mt-1">
                    {group.students?.length || 0} students
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Group Info */}
      {selectedGroup && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 rounded-lg p-4 border border-brand-gold/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-dark">
                  {selectedGroup.name}
                </h3>
                <p className="text-gray-600">
                  {selectedGroup.curriculumItems?.length || 0} curriculum items •
                  {selectedGroup.students?.length || 0} students
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingItemId(null)
                    resetForm()
                    setShowForm(true)
                  }}
                  className="px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition flex items-center gap-2"
                >
                  <FaPlus /> Add Item
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 border border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold hover:text-white transition flex items-center gap-2"
                >
                  <FaDownload /> Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-brand-dark flex items-center gap-2">
                <FaDownload /> Import Content
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Import Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setImportMode('curriculum')
                        setSelectedImportItemId('')
                      }}
                      className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${importMode === 'curriculum'
                          ? 'bg-brand-gold text-white border-transparent'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                    >
                      <FaUpload /> Full Curriculum
                    </button>
                    <button
                      onClick={() => {
                        setImportMode('item')
                        setSelectedImportItemId('')
                      }}
                      className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${importMode === 'item'
                          ? 'bg-brand-gold text-white border-transparent'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                    >
                      <FaDownload /> Single Item
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course Curriculum
                  </label>
                  <select
                    value={selectedCurriculumId}
                    onChange={e => setSelectedCurriculumId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                  >
                    <option value="">Select a curriculum</option>
                    {curriculums.map(curr => (
                      <option key={curr._id} value={curr._id}>{curr.courseName}</option>
                    ))}
                  </select>
                </div>

                {importMode === 'item' && selectedCurriculumId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Item
                    </label>
                    <select
                      value={selectedImportItemId}
                      onChange={e => setSelectedImportItemId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                    >
                      <option value="">Select an item</option>
                      {curriculums
                        .find(c => c._id === selectedCurriculumId)
                        ?.items?.map(item => {
                          const type = ITEM_TYPES[item.type]
                          const Icon = type?.icon || FaBook
                          return (
                            <option key={item._id} value={item._id}>
                              <Icon /> {type?.label} - {item.name}
                            </option>
                          )
                        })}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    importMode === 'curriculum' ? handleImportCurriculum() : handleImportItem()
                  }}
                  className="flex-1 px-4 py-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2"
                >
                  <FaUpload /> Import
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setSelectedCurriculumId('')
                    setSelectedImportItemId('')
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Curriculum Items */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-brand-dark flex items-center gap-2">
                  Curriculum Items
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {selectedGroup.curriculumItems?.length || 0}
                  </span>
                </h3>
              </div>

              <div className="p-6">
                {selectedGroup.curriculumItems && selectedGroup.curriculumItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedGroup.curriculumItems
                      .sort((a, b) => a.position - b.position)
                      .map((item, index) => {
                        const type = ITEM_TYPES[item.type]
                        const TypeIcon = type.icon
                        const isExpanded = expandedItemId === item._id
                        const hasAttachments = item.attachments?.length > 0
                        const hasResponses = item.responses?.length > 0
                        const released = isItemReleased(item)
                        const due = isItemDue(item)

                        console.log('New hasAttachments:', hasAttachments);

                        return (
                          <div
                            key={item._id}
                            className={`border rounded-lg transition-all duration-200 border-gray-200 hover:border-brand-gold hover:shadow-sm`}
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
                                    disabled={index === selectedGroup.curriculumItems.length - 1}
                                    className={`p-1 rounded ${index === selectedGroup.curriculumItems.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-brand-gold hover:bg-gray-100'}`}
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

                                    <div className="flex items-center gap-2">
                                      {hasAttachments && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                                          <FaPaperclip size={10} /> {item.attachments.length}
                                        </span>
                                      )}
                                      {item.isCompleted && (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                          <FaCheck size={10} /> Completed
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Badges */}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {item.releaseDate && (
                                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${released ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        <FaCalendar size={10} />
                                        {released ? 'Released' : `${formatDateTime(item.releaseDate, item.releaseTime)}`}
                                      </span>
                                    )}
                                    {item.dueDate && (
                                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${due ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        <FaHourglassEnd size={10} />
                                        {due ? 'Overdue' : `Due ${formatDateTime(item.dueDate, item.dueTime)}`}
                                      </span>
                                    )}
                                    {hasResponses && (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                                        <FaComment size={10} /> {item.responses.length}
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
                                      Position: {index + 1}
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
                                {/* Description */}
                                {item.description && (
                                  <div className="mb-4">
                                    <p className="text-gray-700">{item.description}</p>
                                  </div>
                                )}

                                {/* Attachments */}
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

                                {/* Student Responses */}
                                {hasResponses && (
                                  <div className="mt-6">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                      <FaComment /> Student Responses ({item.responses.length})
                                    </h5>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                      {item.responses.map((response, ridx) => (
                                        <div key={ridx} className="bg-gray-50 rounded-lg p-4">
                                          <div className="flex justify-between items-start mb-2">
                                            <div>
                                              <p className="font-semibold text-sm text-gray-900">{response.studentName}</p>
                                              <div className="flex gap-2 mt-1">
                                                {response.isQuestion && (
                                                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                                    <FaComment /> QUESTION
                                                  </span>
                                                )}
                                                {response.isPublic ? (
                                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                                    <FaLockOpen /> PUBLIC
                                                  </span>
                                                ) : (
                                                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                                    <FaLock /> PRIVATE
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                              {new Date(response.createdAt).toLocaleString()}
                                            </span>
                                          </div>

                                          <p className="text-sm text-gray-700 mb-3">{response.responseText}</p>
                                          {response.attachments?.length > 0 && (
                                            <div className="mb-3">
                                              <h6 className="text-sm font-semibold text-gray-700 mb-2">Student Attachments</h6>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {response.attachments.map((attachment, idx) => (
                                                  <AttachmentPreview
                                                    key={idx}
                                                    type={attachment.type}
                                                    url={attachment.url}
                                                    title={attachment.title}
                                                    className="max-w-xs"
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {response.tutorRemark ? (
                                            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 mt-3">
                                              <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Your Remark:</p>
                                              <p className="text-sm text-gray-700">{response.tutorRemark}</p>
                                              <p className="text-xs text-gray-500 mt-1">
                                                {new Date(response.tutorRemarkAt).toLocaleString()}
                                              </p>
                                            </div>
                                          ) : (
                                            <div className="mt-3">
                                              {replying?.responseId === response._id ? (
                                                <div className="bg-orange-50 p-3 rounded-lg">
                                                  <textarea
                                                    value={tutorRemarkText}
                                                    onChange={(e) => setTutorRemarkText(e.target.value)}
                                                    placeholder="Type your feedback..."
                                                    className="w-full text-sm p-2 border border-orange-300 rounded focus:border-orange-500 focus:outline-none resize-none"
                                                    rows="3"
                                                  />
                                                  <div className="flex gap-2 mt-2">
                                                    <button
                                                      onClick={() => handleAddTutorRemark(item._id, response._id)}
                                                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
                                                    >
                                                      <FaSave /> Send Remark
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        setReplying(null)
                                                        setTutorRemarkText('')
                                                      }}
                                                      className="flex-1 px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition flex items-center justify-center gap-2"
                                                    >
                                                      <FaUndo /> Cancel
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <button
                                                  onClick={() => setReplying({ itemId: item._id, responseId: response._id })}
                                                  className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition flex items-center gap-2"
                                                >
                                                  <FaReply /> Add Remark
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Mark Complete/Incomplete */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  {item.isCompleted ? (
                                    <button
                                      onClick={() => handleUnmarkItemComplete(item._id)}
                                      className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2"
                                    >
                                      <FaRegCircle /> Mark Incomplete
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleMarkItemComplete(item._id)}
                                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    >
                                      <FaRegCheckCircle /> Mark Complete
                                    </button>
                                  )}
                                </div>
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
                    <p className="text-gray-500 mb-6">Start by adding items or importing from curriculum</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setEditingItemId(null)
                          resetForm()
                          setShowForm(true)
                        }}
                        className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition flex items-center gap-2"
                      >
                        <FaPlus /> Add First Item
                      </button>
                      <button
                        onClick={() => setShowImportModal(true)}
                        className="px-6 py-3 border border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold hover:text-white transition flex items-center gap-2"
                      >
                        <FaDownload /> Import Content
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FaUsers className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-700 mb-2">Select a group to manage curriculum</p>
              <p className="text-gray-500">Choose from your groups above</p>
            </div>
          )}
        </div>

        {/* Right Column: Add/Edit Form or Stats */}
        <div>
          {showForm ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-brand-dark flex items-center justify-between">
                  <span>{editingItemId ? 'Edit Item' : 'Add New Item'}</span>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <FaTimes />
                  </button>
                </h3>
              </div>

              <div className="p-6">
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
                            className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${formData.type === key
                                ? `${val.color} text-white border-transparent`
                                : `${val.lightBg} text-gray-700 border-gray-300 hover:border-${val.color}`
                              }`}
                          >
                            <Icon />
                            <span className="text-sm font-medium">{val.label}</span>
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
                      placeholder="e.g., Chapter 1 Assignment"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
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
                      placeholder="Add instructions or content description..."
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  {/* Release Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaCalendar className="inline mr-1" /> Release Date
                      </label>
                      <input
                        type="date"
                        value={formData.releaseDate}
                        onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaClock className="inline mr-1" /> Release Time
                      </label>
                      <input
                        type="time"
                        value={formData.releaseTime}
                        onChange={e => setFormData({ ...formData, releaseTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Due Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaHourglassEnd className="inline mr-1" /> Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaClock className="inline mr-1" /> Due Time
                      </label>
                      <input
                        type="time"
                        value={formData.dueTime}
                        onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">Attachments</label>
                      <button
                        type="button"
                        onClick={addAttachmentField}
                        className="text-sm text-brand-gold hover:text-brand-dark flex items-center gap-1"
                      >
                        <FaPlus /> Add Attachment
                      </button>
                    </div>

                    <div className="space-y-4">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Attachment {index + 1}</span>
                            {attachments.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAttachmentField(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>

                          {/* Attachment Type */}
                          <div className="mb-3">
                            <select
                              value={attachment.type}
                              onChange={(e) => updateAttachment(index, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none text-sm"
                            >
                              {ATTACHMENT_TYPES.map(opt => {
                                const Icon = opt.icon
                                return (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                )
                              })}
                            </select>
                          </div>

                          {/* Title */}
                          <div className="mb-3">
                            <input
                              type="text"
                              value={attachment.title}
                              onChange={(e) => updateAttachment(index, 'title', e.target.value)}
                              placeholder="Attachment title"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none text-sm"
                            />
                          </div>

                          {/* URL */}
                          {attachment.type !== 'none' && (
                            <div>
                              <input
                                type="url"
                                value={attachment.url}
                                onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                                placeholder="https://example.com/file"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-brand-gold focus:outline-none text-sm"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={editingItemId ? () => handleUpdateItem(editingItemId) : handleAddItem}
                      disabled={!formData.name.trim()}
                      className="flex-1 px-4 py-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      <FaSave /> {editingItemId ? 'Update Item' : 'Add Item'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <FaUndo /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedGroup ? (
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">Group Stats</h3>
                <div className="space-y-4">
                  {Object.entries(ITEM_TYPES).map(([key, val]) => {
                    const Icon = val.icon
                    const count = selectedGroup.curriculumItems?.filter(i => i.type === key).length || 0
                    const completedCount = selectedGroup.curriculumItems?.filter(i => i.type === key && i.isCompleted).length || 0
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${val.lightBg}`}>
                            <Icon className={val.textColor} />
                          </div>
                          <div>
                            <span className="text-gray-700">{val.label}</span>
                            <div className="text-xs text-gray-500">
                              {completedCount} of {count} completed
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setEditingItemId(null)
                      resetForm()
                      setShowForm(true)
                    }}
                    className="w-full p-3 bg-brand-gold text-white rounded-lg hover:bg-opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <FaPlus /> Add New Item
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="w-full p-3 border border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold hover:text-white transition flex items-center justify-center gap-2"
                  >
                    <FaDownload /> Import Content
                  </button>
                  <button
                    onClick={fetchData}
                    className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <FaUndo /> Refresh
                  </button>
                </div>
              </div>

              {/* Group Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">Group Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Group Name</p>
                    <p className="font-medium">{selectedGroup.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Students</p>
                    <p className="font-medium">{selectedGroup.students?.length || 0} students</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Curriculum Items</p>
                    <p className="font-medium">{selectedGroup.curriculumItems?.length || 0} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{new Date(selectedGroup.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}