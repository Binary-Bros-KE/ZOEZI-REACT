import { useState } from "react"
import toast from "react-hot-toast"

const API_BASE_URL = import.meta.env.VITE_SERVER_URL

export default function AcceptModal({ open, applicationNumber, onClose, onAccepted }) {
    const [admissionNumber, setAdmissionNumber] = useState("")
    const [startDate, setStartDate] = useState("")
    const [courseFee, setCourseFee] = useState("")
    const [upfrontFee, setUpfrontFee] = useState("")
    const [courseDuration, setCourseDuration] = useState("")
    const [exams, setExams] = useState([])
    const [examInput, setExamInput] = useState("")
    const [adminNote, setAdminNote] = useState("")
    const [file, setFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    if (!open) return null

    const handleAddExam = () => {
        if (!examInput.trim()) {
            toast.error('Please enter exam name')
            return
        }
        setExams([...exams, { name: examInput, score: 0 }])
        setExamInput("")
    }

    const handleRemoveExam = (index) => {
        setExams(exams.filter((_, i) => i !== index))
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)
        if (selectedFile) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(selectedFile)
        } else {
            setImagePreview(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            const form = new FormData()
            if (admissionNumber) form.append('admissionNumber', admissionNumber)
            if (startDate) form.append('startDate', startDate)
            if (courseFee) form.append('courseFee', courseFee)
            if (upfrontFee) form.append('upfrontFee', upfrontFee)
            if (courseDuration) form.append('courseDuration', courseDuration)
            if (adminNote) form.append('adminNote', adminNote)
            form.append('adminName', 'Admin')
            if (file) form.append('profilePicture', file)
            
            // Append exams array
            exams.forEach((exam, index) => {
                form.append(`exams[${index}][name]`, exam.name)
                form.append(`exams[${index}][score]`, exam.score || 0)
            })

            const resp = await fetch(`${API_BASE_URL}/applications/${applicationNumber}/accept`, {
                method: 'POST',
                body: form
            })

            const data = await resp.json()
            console.log('Accept response data', data);
            if (!resp.ok) throw new Error(data.message || 'Failed to accept application')

            // success
            toast.success('Applicant admitted successfully')
            onAccepted && onAccepted()
            onClose()
        } catch (err) {
            toast.error('Failed to admit applicant')
            console.error('Accept error', err)
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 my-8">
                <h3 className="text-lg font-bold mb-4">Admit Applicant {applicationNumber}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Two-column layout: form on left, preview on right */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Form fields */}
                        <div className="col-span-2 space-y-3">
                            <div>
                                <label className="block text-sm font-medium">Admission Number *</label>
                                <input type="text" value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} placeholder="e.g., ADM-2025-001" className="w-full border border-gray-300 px-2 py-1 rounded" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Start Date</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-300 px-2 py-1 rounded" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Course Fee</label>
                                <input type="number" value={courseFee} onChange={(e) => setCourseFee(e.target.value)} placeholder="0" className="w-full border border-gray-300 px-2 py-1 rounded" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Upfront Fee</label>
                                <input type="number" value={upfrontFee} onChange={(e) => setUpfrontFee(e.target.value)} placeholder="0" className="w-full border border-gray-300 px-2 py-1 rounded" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Course Duration</label>
                                <input type="text" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)} placeholder="e.g., 3 months, 6 months" className="w-full border border-gray-300 px-2 py-1 rounded" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Expected Exams</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={examInput} onChange={(e) => setExamInput(e.target.value)} placeholder="Enter exam name" className="flex-1 border border-gray-300 px-2 py-1 rounded text-sm" />
                                    <button type="button" onClick={handleAddExam} className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium">Add</button>
                                </div>
                                {exams.length > 0 && (
                                    <div className="space-y-1 mb-2">
                                        {exams.map((exam, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded text-sm">
                                                <span>{exam.name}</span>
                                                <button type="button" onClick={() => handleRemoveExam(idx)} className="text-red-600 font-bold">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Profile Picture</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-gray-300 px-2 py-1 rounded" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Admin Note</label>
                                <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="w-full border border-gray-300 px-2 py-1 rounded text-sm" rows="3" />
                            </div>
                        </div>

                        {/* Image Preview */}
                        <div className="col-span-1 flex flex-col items-center justify-start">
                            <p className="text-sm font-medium mb-2">Profile Picture</p>
                            {imagePreview ? (
                                <img src={imagePreview} alt="preview" className="w-32 h-32 rounded-lg object-cover border border-gray-300" />
                            ) : (
                                <div className="w-32 h-32 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center">
                                    No image selected
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-sm">{error}</div>}

                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-green-600 text-white">
                            {submitting ? 'Admitting...' : 'Admit Applicant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
