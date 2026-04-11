import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaPlus, FaEdit, FaTrash, FaSearch, FaImage } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import toast from 'react-hot-toast';
import AdminLayout from '../AdminLayout/AdminLayout';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export default function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '',
    email: '',
    kraPin: '',
    profilePic: null,
    courses: []
  });

  const [profilePreview, setProfilePreview] = useState(null);

  // Fetch tutors and available courses
  useEffect(() => {
    fetchTutors();
    fetchCourses();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tutors`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tutors');
      }

      // FIX: Access the nested tutors array
      setTutors(data.data?.tutors || []);
    } catch (error) {
      console.error('Fetch tutors error:', error);
      toast.error(error.message || 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      const data = await response.json();

      if (response.ok) {
        setCourses(data.data?.courses || []);
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTutors();
  };

  const handleCreate = () => {
    setSelectedTutor(null);
    setFormData({
      firstName: '',
      lastName: '',
      role: '',
      phone: '',
      email: '',
      kraPin: '',
      profilePic: null,
      courses: []
    });
    setProfilePreview(null);
    setModalOpen(true);
  };

  const handleEdit = (tutor) => {
    setSelectedTutor(tutor);
    setFormData({
      firstName: tutor.firstName,
      lastName: tutor.lastName,
      role: tutor.role,
      phone: tutor.phone,
      email: tutor.email,
      kraPin: tutor.kraPin || '',
      profilePic: null,
      courses: tutor.courses?.map(course => course._id) || []
    });
    setProfilePreview(tutor.profilePicture?.url || null);
    setModalOpen(true);
  };

  const handleDeleteClick = (tutor) => {
    setSelectedTutor(tutor);
    setDeleteModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePic: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profilePic: null }));
    setProfilePreview(null);
  };

  const handleCourseToggle = (courseId) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('kraPin', formData.kraPin);
      formDataToSend.append('courses', JSON.stringify(formData.courses));

      if (formData.profilePic) {
        formDataToSend.append('profilePicture', formData.profilePic);
      }

      const url = selectedTutor
        ? `${API_BASE_URL}/tutors/${selectedTutor._id}`
        : `${API_BASE_URL}/tutors`;

      const method = selectedTutor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${selectedTutor ? 'update' : 'create'} tutor`);
      }

      toast.success(`Tutor ${selectedTutor ? 'updated' : 'created'} successfully!`);
      setModalOpen(false);
      fetchTutors();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || `Failed to ${selectedTutor ? 'update' : 'create'} tutor`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tutors/${selectedTutor._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete tutor');
      }

      toast.success('Tutor deleted successfully!');
      setDeleteModalOpen(false);
      fetchTutors();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete tutor');
    } finally {
      setActionLoading(false);
    }
  };

  // FIX: Add safe filtering with optional chaining
  const filteredTutors = (tutors || []).filter(tutor =>
    `${tutor.firstName || ''} ${tutor.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.phone?.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-brand-dark">
            <FaChalkboardTeacher /> Tutors Management
          </h2>
          <p className="text-sm text-secondary">Manage tutors, their profiles, and course assignments</p>
        </div>

        {/* Actions Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <form onSubmit={handleSearch} className="flex gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light" />
                <input
                  type="text"
                  placeholder="Search tutors by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-semibold text-white transition-colors bg-brand-gold hover:bg-brand-yellow"
              >
                Search
              </button>
            </form>

            <button
              onClick={handleCreate}
              className="px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2 bg-brand-dark hover:bg-brand-brown"
            >
              <FaPlus /> Add Tutor
            </button>
          </div>
        </div>

        {/* Tutors Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-secondary text-lg">Loading tutors...</p>
            </div>
          ) : filteredTutors.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-secondary text-lg">
                {searchTerm ? 'No tutors found matching your search' : 'No tutors found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-brand-dark">
                    <th className="px-6 py-4 text-left text-white font-semibold">Tutor</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Contact</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Courses</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTutors.map((tutor) => (
                    <tr key={tutor._id} className="hover:bg-secondary transition-colors">
                      <td className="px-6 py-4">
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
                            <p className="font-semibold text-primary">
                              {tutor.firstName} {tutor.lastName} <br />
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-brand-gold text-white">
                                {tutor.role || 'Tutor'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-primary">{tutor.email}</p>
                        <p className="text-sm text-secondary">{tutor.phone}</p>
                        <p className="text-sm text-secondary">KRA: {tutor.kraPin || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary"></td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {tutor.courses && tutor.courses.length > 0 ? (
                            tutor.courses.slice(0, 2).map((course, index) => (
                              <span
                                key={course._id || index}
                                className="px-2 py-1 text-xs rounded-full bg-secondary text-primary"
                              >
                                {course.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-light">No courses</span>
                          )}
                          {tutor.courses && tutor.courses.length > 2 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-brand-gold text-white">
                              +{tutor.courses.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(tutor)}
                            className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50 border border-blue-200"
                            title="Edit Tutor"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tutor)}
                            className="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 border border-red-200"
                            title="Delete Tutor"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between p-6 border-b-2 border-brand-gold bg-white">
                <h2 className="text-2xl font-bold text-brand-dark">
                  {selectedTutor ? 'Edit Tutor' : 'Add New Tutor'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={actionLoading}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <IoMdClose size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {profilePreview ? (
                        <div className="relative">
                          <img
                            src={profilePreview}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full object-cover border-2 border-brand-gold"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <IoMdClose size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-brand-gold">
                          <FaImage className="text-light text-2xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profilePic"
                      />
                      <label
                        htmlFor="profilePic"
                        className="cursor-pointer px-4 py-2 rounded-lg font-semibold transition-colors border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white inline-block"
                      >
                        Choose Image
                      </label>
                      <p className="text-xs text-light mt-2">
                        Recommended: Square image, max 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="e.g., Senior Tutor, Course Instructor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      KRA Pin
                    </label>
                    <input
                      type="text"
                      value={formData.kraPin}
                      onChange={(e) => setFormData(prev => ({ ...prev, kraPin: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="Enter KRA PIN"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Course Assignments */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-3">
                    Assigned Courses
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-secondary rounded-lg">
                    {courses.map((course) => (
                      <label key={course._id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.courses.includes(course._id)}
                          onChange={() => handleCourseToggle(course._id)}
                          className="rounded border-brand-gold text-brand-gold focus:ring-brand-gold"
                        />
                        <span className="text-primary">{course.name}</span>
                      </label>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-light text-sm col-span-2">No courses available</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
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
                    {actionLoading ? 'Saving...' : selectedTutor ? 'Update Tutor' : 'Create Tutor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && selectedTutor && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Confirm Deletion</h3>
              <p className="text-secondary mb-6">
                Are you sure you want to delete tutor <strong>{selectedTutor.firstName} {selectedTutor.lastName}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}