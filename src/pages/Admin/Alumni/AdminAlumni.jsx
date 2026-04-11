import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { StudentDetailModal } from '../components/StudentDetailModal';
import AdminLayout from '../AdminLayout/AdminLayout';
import { LuScanEye } from 'react-icons/lu';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, skip: 0 });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAlumni();
  }, [pagination.skip]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        limit: pagination.limit,
        skip: pagination.skip,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_BASE_URL}/alumni/list?${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch alumni');
      }

      setAlumni(data.data.alumni);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Fetch alumni error:', error);
      toast.error(error.message || 'Failed to fetch alumni');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/alumni/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete alumni');
      }

      // Remove deleted alumni from state
      setAlumni(alumni.filter(alumnus => alumnus._id !== id));

      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));

      toast.success('Alumni deleted successfully');
    } catch (error) {
      console.error('Delete alumni error:', error);
      toast.error(error.message || 'Failed to delete alumni');
    } finally {
      setDeletingId(null);
    }
  };



  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, skip: 0 });
    fetchAlumni();
  };

  const handleViewDetails = (alumnus) => {
    setSelectedAlumnus(alumnus);
    setDetailModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2b2520' }}>
            🎓 Alumni Directory
          </h2>
          <p className="text-sm text-gray-600">View graduated students and their academic records</p>
        </div>

        {/* Search Section */}
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

        {/* Alumni Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">Loading alumni...</p>
            </div>
          ) : alumni.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No alumni found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#2b2520' }}>
                      <th className="px-6 py-4 text-left text-white font-semibold">Alumnus</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Course</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Graduation Date</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">GPA</th>
                      <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {alumni.map((alumnus) => {
                      // Calculate average grade
                      const exams = alumnus.exams || [];
                      const gradeToPoint = {
                        'Distinction': 4.0,
                        'Merit': 3.5,
                        'Credit': 3.0,
                        'Pass': 2.0,
                        'Fail': 0.0
                      };
                      const avgGrade =
                        exams.length > 0
                          ? (exams.reduce((sum, exam) => sum + (gradeToPoint[exam.score] || 0), 0) / exams.length).toFixed(2)
                          : 'N/A';

                      return (
                        <tr key={alumnus._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {alumnus.profilePicture && (
                                <img
                                  src={alumnus.profilePicture}
                                  alt={alumnus.firstName}
                                  className="w-10 h-10 rounded-full object-cover border"
                                  style={{ borderColor: '#d4a644' }}
                                />
                              )}
                              <div>
                                <p className="font-semibold" style={{ color: '#2b2520' }}>
                                  {alumnus.firstName} {alumnus.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{alumnus.email}</p>
                                <p className="text-xs text-gray-500">Adm: {alumnus.admissionNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{alumnus.course || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm">
                            {alumnus.graduationDate
                              ? new Date(alumnus.graduationDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                              style={{ backgroundColor: '#d4a644' }}
                            >
                              {avgGrade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleViewDetails(alumnus)}
                                className="px-4 py-1 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer"
                              >
                                <LuScanEye />
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(alumnus._id)}
                                disabled={deletingId === alumnus._id}
                                className="px-4 py-1 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 text-red-600 border border-red-600 hover:bg-red-600 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === alumnus._id ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
                                )}
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
                  {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total} alumni
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

        {/* Detail Modal */}
        <StudentDetailModal
          student={selectedAlumnus}
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
