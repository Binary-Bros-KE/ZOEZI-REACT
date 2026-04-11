import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { MdDelete } from 'react-icons/md'

const GRADES = ['Distinction', 'Merit', 'Credit', 'Pass', 'Fail']

const TutorCertification = ({ userData }) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedStudentId, setExpandedStudentId] = useState(null)
  const [examForms, setExamForms] = useState({}) // { studentId: { examName, grade } }
  const [submitting, setSubmitting] = useState({}) // { studentId: boolean }

  const tutorId = userData?._id
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
  const API = import.meta.env.VITE_SERVER_URL

  useEffect(() => {
    if (tutorId) fetchStudents()
  }, [tutorId])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/certification/students`, { headers: authHeader() })
      const d = await r.json()
      if (r.ok) {
        setGroups(d.data.groups || [])
      } else {
        toast.error(d.message || 'Failed to fetch students')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExam = async (studentId, courseId) => {
    const form = examForms[studentId]
    if (!form?.examName || !form?.grade) {
      toast.error('Please enter exam name and select grade')
      return
    }

    setSubmitting(prev => ({ ...prev, [studentId]: true }))
    try {
      const r = await fetch(`${API}/certification/${studentId}/${courseId}/exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(form)
      })
      const d = await r.json()
      if (r.ok) {
        toast.success('Exam added')
        fetchStudents()
        setExamForms(prev => ({ ...prev, [studentId]: { examName: '', grade: '' } }))
      } else {
        toast.error(d.message)
      }
    } catch (err) {
      toast.error('Failed to add exam')
    } finally {
      setSubmitting(prev => ({ ...prev, [studentId]: false }))
    }
  }

  const handleDeleteExam = async (studentId, courseId, examId) => {
    if (!confirm('Delete this exam?')) return

    try {
      const r = await fetch(`${API}/certification/${studentId}/${courseId}/exam/${examId}`, {
        method: 'DELETE',
        headers: authHeader()
      })
      const d = await r.json()
      if (r.ok) {
        toast.success('Exam deleted')
        fetchStudents()
      } else {
        toast.error(d.message)
      }
    } catch (err) {
      toast.error('Failed to delete exam')
    }
  }

  const handleGraduate = async (studentId, courseId, groupId, studentName) => {
    if (!confirm(`Graduate ${studentName}?`)) return

    try {
      const r = await fetch(`${API}/certification/${studentId}/${courseId}/graduate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ groupId })
      })
      const d = await r.json()
      if (r.ok) {
        toast.success(`${studentName} graduated successfully!`)
        fetchStudents()
      } else {
        toast.error(d.message)
      }
    } catch (err) {
      toast.error('Failed to graduate student')
    }
  }

  const canGraduate = (student) => {
    return (
      student.completionPercentage === 100 &&
      student.paymentStatus === 'PAID' &&
      student.exams.length > 0 &&
      !student.exams.some(e => e.grade === 'Fail') &&
      student.certificationStatus !== 'GRADUATED'
    )
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <h1 className="font-bold text-2xl md:text-3xl text-primary-dark">🎓 Student Certification</h1>

      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <p>No groups available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.groupId} className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="border-b border-gray-300 pb-3">
                <h2 className="font-bold text-lg text-primary-dark">{group.groupName}</h2>
                <p className="text-sm text-gray-600">{group.courseName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {group.students.length} student{group.students.length !== 1 ? 's' : ''}
                </p>
              </div>

              {group.students.length === 0 ? (
                <p className="text-sm text-gray-500">No students in this group</p>
              ) : (
                <div className="space-y-3">
                  {group.students.map((student) => {
                    const isExpanded = expandedStudentId === student.studentId
                    const canGrad = canGraduate(student)

                    return (
                      <div key={student.studentId} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        {/* Student Header */}
                        <div
                          onClick={() => setExpandedStudentId(isExpanded ? null : student.studentId)}
                          className="flex justify-between items-start cursor-pointer hover:bg-gray-100 -m-4 p-4 rounded"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-primary-dark">{student.studentName}</p>
                            <p className="text-xs text-gray-600">{student.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{student.completionPercentage}%</p>
                            <p className="text-xs text-gray-600">Completed</p>
                          </div>
                        </div>

                        {/* Checklist */}
                        <div className="mt-3 space-y-2 ml-0">
                          <div className={`text-xs p-2 rounded flex items-center gap-2 ${
                            student.completionPercentage === 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.completionPercentage === 100 ? '✓' : '✗'} Completion: {student.completedItems}/{student.totalItems} items
                          </div>
                          <div className={`text-xs p-2 rounded flex items-center gap-2 ${
                            student.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.paymentStatus === 'PAID' ? '✓' : '✗'} Payment: {student.paymentStatus}
                          </div>
                          <div className={`text-xs p-2 rounded flex items-center gap-2 ${
                            student.exams.length > 0 && !student.exams.some(e => e.grade === 'Fail') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.exams.length > 0 && !student.exams.some(e => e.grade === 'Fail') ? '✓' : '✗'} Exams: {student.exams.length} exam{student.exams.length !== 1 ? 's' : ''}
                            {student.exams.some(e => e.grade === 'Fail') && ' (Has Fail)'}
                          </div>
                          <div className={`text-xs p-2 rounded flex items-center gap-2 ${
                            student.certificationStatus === 'GRADUATED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            📜 Status: {student.certificationStatus}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 space-y-4 pt-4 border-t border-gray-300">
                            {/* Exams List */}
                            {student.exams.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-primary-dark mb-2">Exams & Grades</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {student.exams.map((exam, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border-2 border-blue-300 text-sm">
                                      <div>
                                        <p className="font-medium">{exam.examName}</p>
                                        <p className={`text-xs font-bold ${
                                          exam.grade === 'Distinction' ? 'text-green-600' :
                                          exam.grade === 'Merit' ? 'text-blue-600' :
                                          exam.grade === 'Credit' ? 'text-amber-600' :
                                          exam.grade === 'Pass' ? 'text-gray-600' :
                                          'text-red-600'
                                        }`}>
                                          {exam.grade}
                                        </p>
                                      </div>
                                      {student.certificationStatus !== 'GRADUATED' && (
                                        <button
                                          onClick={() => handleDeleteExam(student.studentId, group.courseId, exam._id)}
                                          className="text-red-500 hover:text-red-700 cursor-pointer bg-red-100 p-2 rounde"
                                        >
                                          <MdDelete size={18} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-300 text-sm">
                                  <p className="text-gray-700"><span className="font-semibold">GPA:</span> {student.gpa}</p>
                                  <p className="text-gray-700"><span className="font-semibold">Final Grade:</span> {student.finalGrade}</p>
                                </div>
                              </div>
                            )}

                            {/* Add Exam Form */}
                            {student.certificationStatus !== 'GRADUATED' && (
                              <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-2">
                                <p className="text-sm font-semibold text-primary-dark">Add Exam</p>
                                <input
                                  type="text"
                                  placeholder="Exam name"
                                  value={examForms[student.studentId]?.examName || ''}
                                  onChange={(e) => setExamForms(prev => ({
                                    ...prev,
                                    [student.studentId]: {
                                      ...prev[student.studentId],
                                      examName: e.target.value
                                    }
                                  }))}
                                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:border-primary-gold focus:outline-none"
                                />
                                <select
                                  value={examForms[student.studentId]?.grade || ''}
                                  onChange={(e) => setExamForms(prev => ({
                                    ...prev,
                                    [student.studentId]: {
                                      ...prev[student.studentId],
                                      grade: e.target.value
                                    }
                                  }))}
                                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:border-primary-gold focus:outline-none"
                                >
                                  <option value="">Select grade</option>
                                  {GRADES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAddExam(student.studentId, group.courseId)}
                                  disabled={submitting[student.studentId]}
                                  className="w-full text-sm px-3 py-1 bg-primary-gold text-white rounded font-semibold hover:bg-opacity-90 disabled:opacity-50 cursor-pointer"
                                >
                                  {submitting[student.studentId] ? 'Adding...' : 'Add Exam'}
                                </button>
                              </div>
                            )}

                            {/* Graduation Button */}
                            {student.certificationStatus !== 'GRADUATED' && (
                              <button
                                onClick={() => handleGraduate(student.studentId, group.courseId, group.groupId, student.studentName)}
                                disabled={!canGrad}
                                className={`w-full px-4 py-2 rounded font-semibold text-white transition ${
                                  canGrad
                                    ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                                    : 'bg-gray-400 cursor-not-allowed opacity-50'
                                }`}
                              >
                                🎓 Graduate Student
                              </button>
                            )}

                            {student.certificationStatus === 'GRADUATED' && (
                              <div className="bg-green-100 border border-green-300 p-3 rounded text-center">
                                <p className="text-sm font-semibold text-green-800">✓ Student Graduated</p>
                                <p className="text-xs text-green-700">
                                  {new Date(student.certificationDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TutorCertification
