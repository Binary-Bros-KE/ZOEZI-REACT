import React, { useState, useEffect } from 'react';
import { FaUsers, FaGraduationCap } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { StudentDetailModal } from '../components/StudentDetailModal';
import AdminLayout from '../AdminLayout/AdminLayout';
import { LuScanEye } from 'react-icons/lu';
import { GiGraduateCap } from 'react-icons/gi';
import { PiStudentBold } from 'react-icons/pi';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const GRADE_OPTIONS = [
  { value: '', label: 'Select Grade' },
  { value: 'Distinction', label: 'Distinction' },
  { value: 'Merit', label: 'Merit' },
  { value: 'Credit', label: 'Credit' },
  { value: 'Pass', label: 'Pass' },
  { value: 'Fail', label: 'Fail' }
];

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [graduateModalOpen, setGraduateModalOpen] = useState(false);
  const [gradesState, setGradesState] = useState({});
  const [updatingGrades, setUpdatingGrades] = useState(false);
  const [graduating, setGraduating] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, skip: 0 });

  useEffect(() => {
    fetchStudents();
  }, [pagination.skip]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        limit: pagination.limit,
        skip: pagination.skip,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_BASE_URL}/students?${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      setStudents(data.data.students);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Fetch students error:', error);
      toast.error(error.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, skip: 0 });
    fetchStudents();
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);
  };

  const handleGraduateClick = (student) => {
    setSelectedStudent(student);
    // Initialize grades state for this student
    const initialGrades = {};
    student.exams.forEach((exam, idx) => {
      initialGrades[idx] = exam.score || '';
    });
    setGradesState(initialGrades);
    setGraduateModalOpen(true);
  };

  const handleGradeChange = (examIndex, value) => {
    setGradesState((prev) => ({
      ...prev,
      [examIndex]: value
    }));
  };

  const handleUpdateGrades = async () => {
    setUpdatingGrades(true);
    try {
      const examGrades = Object.entries(gradesState).map(([index, score]) => ({
        examIndex: parseInt(index),
        score
      }));

      const response = await fetch(
        `${API_BASE_URL}/students/${selectedStudent._id}/update-exam-grades`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examGrades })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update grades');

      toast.success('Exam grades updated successfully!');
      // Refresh student data
      const updatedStudent = await fetch(`${API_BASE_URL}/students`).then(r => r.json());
      if (updatedStudent.status === 'success') {
        setStudents(updatedStudent.data.students);
      }
    } catch (error) {
      console.error('Update grades error:', error);
      toast.error(error.message || 'Failed to update grades');
    } finally {
      setUpdatingGrades(false);
    }
  };

  const handleGraduate = async () => {
    // First update grades, then graduate
    setUpdatingGrades(true);
    try {
      const examGrades = Object.entries(gradesState).map(([index, score]) => ({
        examIndex: parseInt(index),
        score
      }));

      // Update grades first
      const gradeResponse = await fetch(
        `${API_BASE_URL}/students/${selectedStudent._id}/update-exam-grades`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examGrades })
        }
      );

      if (!gradeResponse.ok) {
        throw new Error('Failed to update grades before graduation');
      }

      setUpdatingGrades(false);
      setGraduating(true);

      // Then graduate
      const graduateResponse = await fetch(
        `${API_BASE_URL}/students/${selectedStudent._id}/graduate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const graduateData = await graduateResponse.json();
      if (!graduateResponse.ok) {
        throw new Error(graduateData.message || 'Failed to graduate student');
      }

      toast.success('Student graduated successfully!');
      setGraduateModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Graduation error:', error);
      toast.error(error.message || 'Failed to graduate student');
    } finally {
      setUpdatingGrades(false);
      setGraduating(false);
    }
  };

  const checkFeeCompletion = (student) => {
    return (student.upfrontFee || 0) >= (student.courseFee || 0);
  };

  const checkAllGradesComplete = (student) => {
    return (
      student.exams &&
      student.exams.length > 0 &&
      student.exams.every(exam => exam.score && exam.score !== null && exam.score !== '')
    );
  };

  const canGraduate = (student) => {
    return checkFeeCompletion(student) && checkAllGradesComplete(student);
  };

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: '#2b2520' }}>
              <PiStudentBold /> Students
            </h2>
            <p className="text-sm text-gray-600">Manage student records and graduate students</p>
          </div>
          <div className='flex gap-2'>
            <Link
              className='bg-primary-gold text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-yellow transition-colors'
              to="/admin/students">
              Students
            </Link>
            <Link
              className='bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors'
              to="/admin/applications">
              Applications
            </Link>
            <Link
              className='bg-green-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors'
              to="/admin/admissions">
              Admissions
            </Link>
            <Link
              className='bg-red-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-500 transition-colors'
              to="/admin/update-fee">
              Update Fee
            </Link>
            <Link
              className='bg-purple-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-500 transition-colors'
              to="/admin/details">
              Details
            </Link>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, email, phone, or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
              style={{ borderColor: '#d4a644' }}
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: '#d4a644' }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No students found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#2b2520' }}>
                      <th className="px-6 py-4 text-left text-white font-semibold">Student</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Course</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Fee Status</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Grades</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => {
                      const feeComplete = checkFeeCompletion(student);
                      const gradesComplete = checkAllGradesComplete(student);
                      return (
                        <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {student.profilePicture && (
                                <img
                                  src={student.profilePicture}
                                  alt={student.firstName}
                                  className="w-10 h-10 rounded-full object-cover border"
                                  style={{ borderColor: '#d4a644' }}
                                />
                              )}
                              <div>
                                <p className="font-semibold" style={{ color: '#2b2520' }}>
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-gray-500">Adm: {student.admissionNumber}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{student.course || 'N/A'}</td>
                          <td className="px-0 py-4 text-center">
                            <span
                              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                              style={{
                                backgroundColor: feeComplete ? '#2b8a3e' : '#d32f2f'
                              }}
                            >
                              {feeComplete ? '✓ Complete' : '✗ Pending'}
                            </span>
                          </td>
                          <td className="px-0 py-4 text-center">
                            <span
                              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                              style={{
                                backgroundColor: gradesComplete ? '#2b8a3e' : '#d4a644'
                              }}
                            >
                              {gradesComplete ? '✓ Complete' : '✗ Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleViewDetails(student)}
                                className="px-3 py-1 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 text-[#3b82f6] border-2 border-[#3b82f6]/50"
                              >
                                <LuScanEye />
                                View
                              </button>
                              <button
                                onClick={() => handleGraduateClick(student)}
                                disabled={!feeComplete}
                                className="px-3 py-1 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                style={{
                                  backgroundColor: feeComplete ? '#2b8a3e' : '#ccc',
                                  cursor: feeComplete ? 'pointer' : 'not-allowed'
                                }}
                                title={!feeComplete ? 'Student fees must be complete' : 'Graduate student'}
                              >
                                <GiGraduateCap size={20} />
                                Graduate
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t" style={{ borderColor: '#d4a644' }}>
                <p className="text-sm text-gray-600">
                  Showing {Math.min(pagination.skip + 1, pagination.total)} to{' '}
                  {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} students
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, skip: Math.max(0, pagination.skip - pagination.limit) })}
                    disabled={pagination.skip === 0}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: pagination.skip === 0 ? '#ccc' : '#d4a644',
                      color: 'white'
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, skip: pagination.skip + pagination.limit })}
                    disabled={pagination.skip + pagination.limit >= pagination.total}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: pagination.skip + pagination.limit >= pagination.total ? '#ccc' : '#d4a644',
                      color: 'white'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modals */}
        <StudentDetailModal
          student={selectedStudent}
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
        />

        {/* Graduate Modal */}
        {graduateModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-6 border-b-2" style={{ borderColor: '#d4a644', backgroundColor: '#f5f5f3' }}>
                <h2 className="text-2xl font-bold" style={{ color: '#2b2520' }}>
                  Graduate Student
                </h2>
                <button
                  onClick={() => setGraduateModalOpen(false)}
                  disabled={updatingGrades || graduating}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f3' }}>
                  <h3 className="font-bold" style={{ color: '#2b2520' }}>
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">Admission #: {selectedStudent.admissionNumber}</p>
                  <p className="text-sm text-gray-600">Course: {selectedStudent.course}</p>
                </div>

                {/* Fee Requirement */}
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#2b2520' }}>
                    📋 Graduation Checklist
                  </h4>

                  {/* Fee Requirement */}
                  <div className="p-4 rounded-lg mb-4 border-l-4" style={{
                    borderColor: checkFeeCompletion(selectedStudent) ? '#2b8a3e' : '#d32f2f',
                    backgroundColor: checkFeeCompletion(selectedStudent) ? '#f0f9f7' : '#fff5f5'
                  }}>
                    <div className="flex items-center gap-3">
                      <span style={{ color: checkFeeCompletion(selectedStudent) ? '#2b8a3e' : '#d32f2f', fontSize: '1.5rem' }}>
                        {checkFeeCompletion(selectedStudent) ? '✓' : '✗'}
                      </span>
                      <div>
                        <p className="font-semibold" style={{ color: '#2b2520' }}>Fee Payment Complete</p>
                        <p className="text-sm text-gray-600">
                          Course Fee: KES {(selectedStudent.courseFee || 0).toLocaleString()} | Paid: KES {(selectedStudent.upfrontFee || 0).toLocaleString()}
                        </p>
                        <p className="text-sm font-semibold" style={{ color: checkFeeCompletion(selectedStudent) ? '#2b8a3e' : '#d32f2f' }}>
                          {checkFeeCompletion(selectedStudent) ? 'Balance: KES 0' : `Pending: KES ${((selectedStudent.courseFee || 0) - (selectedStudent.upfrontFee || 0)).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exams & Grades */}
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: '#2b2520' }}>Enter Exam Grades</h4>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      {selectedStudent.exams && selectedStudent.exams.length > 0 ? (
                        selectedStudent.exams.map((exam, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <label className="flex-1 font-medium text-sm" style={{ color: '#2b2520' }}>
                              {exam.name}
                            </label>
                            <select
                              value={gradesState[idx] || ''}
                              onChange={(e) => handleGradeChange(idx, e.target.value)}
                              disabled={updatingGrades || graduating}
                              className="px-3 py-2 rounded-lg border-2 font-semibold"
                              style={{ borderColor: '#d4a644', minWidth: '150px' }}
                            >
                              {GRADE_OPTIONS.map((grade) => (
                                <option key={grade.value} value={grade.value}>
                                  {grade.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-sm">No exams configured for this student</p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="p-3 rounded-lg mt-4" style={{ backgroundColor: canGraduate(selectedStudent) ? '#f0f9f7' : '#fff5f5' }}>
                    <p className="text-sm font-semibold" style={{ color: canGraduate(selectedStudent) ? '#2b8a3e' : '#d32f2f' }}>
                      {canGraduate(selectedStudent) ? '✓ Ready to Graduate' : '✗ Cannot Graduate - Missing Requirements'}
                    </p>
                    {!checkFeeCompletion(selectedStudent) && (
                      <p className="text-sm text-gray-600">• Student fees not fully paid</p>
                    )}
                    {!checkAllGradesComplete(selectedStudent) && (
                      <p className="text-sm text-gray-600">• Not all exam grades entered</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setGraduateModalOpen(false)}
                    disabled={updatingGrades || graduating}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors border-2"
                    style={{
                      borderColor: '#2b2520',
                      color: '#2b2520',
                      backgroundColor: 'transparent',
                      opacity: updatingGrades || graduating ? 0.5 : 1,
                      cursor: updatingGrades || graduating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGraduate}
                    disabled={!canGraduate(selectedStudent) || updatingGrades || graduating}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
                    style={{
                      backgroundColor: canGraduate(selectedStudent) && !updatingGrades && !graduating ? '#2b8a3e' : '#ccc',
                      cursor: canGraduate(selectedStudent) && !updatingGrades && !graduating ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {updatingGrades ? 'Updating Grades...' : graduating ? 'Graduating...' : 'Confirm Graduation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
