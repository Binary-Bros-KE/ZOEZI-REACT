import React, { useState, useEffect } from 'react';
import { FaBook, FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaClock, FaCertificate } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import toast from 'react-hot-toast';
import AdminLayout from '../AdminLayout/AdminLayout';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [tutorsList, setTutorsList] = useState([]);
  const [assignCourseId, setAssignCourseId] = useState(null);
  const [assignSelectedTutors, setAssignSelectedTutors] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseType: 'online',
    courseTier: 'basic',
    duration: '',
    durationType: 'months',
    courseFee: '',
    offerPrice: '',
    status: 'active',
    certificationAvailable: false,
    coverImage: null,
    secondaryImages: []
  });

  const [imagePreviews, setImagePreviews] = useState({
    cover: null,
    secondary: []
  });

  // Course type options
  const courseTypeOptions = [
    { value: 'online', label: 'Online' },
    { value: 'physical', label: 'Physical' },
    { value: 'both', label: 'Physical & Online' }
  ];

  // Course tier options
  const courseTierOptions = [
    { value: 'basic', label: 'Basic' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'elite', label: 'Elite' }
  ];

  // Duration type options
  const durationTypeOptions = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' }
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch courses');
      }

      setCourses(data.data?.courses || []);
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error(error.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setFormData({
      name: '',
      description: '',
      courseType: 'online',
      courseTier: 'basic',
      duration: '',
      durationType: 'months',
      courseFee: '',
      offerPrice: '',
      status: 'active',
      certificationAvailable: false,
      coverImage: null,
      secondaryImages: []
    });
    setImagePreviews({
      cover: null,
      secondary: []
    });
    setModalOpen(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      courseType: course.courseType,
      courseTier: course.courseTier,
      duration: course.duration,
      durationType: course.durationType,
      courseFee: course.courseFee,
      offerPrice: course.offerPrice || '',
      status: course.status,
      certificationAvailable: course.certificationAvailable || false,
      coverImage: null,
      secondaryImages: []
    });
    setImagePreviews({
      cover: course.coverImage?.url || null,
      secondary: course.secondaryImages?.map(img => img.url) || []
    });
    setModalOpen(true);
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setDeleteModalOpen(true);
  };

  // Image handling
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, cover: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSecondaryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      toast.error('Maximum 4 secondary images allowed');
      return;
    }

    const newSecondaryImages = [...formData.secondaryImages, ...files].slice(0, 4);
    setFormData(prev => ({ ...prev, secondaryImages: newSecondaryImages }));

    // Create previews for new files
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreviews(prev => ({
            ...prev,
            secondary: [...prev.secondary, ...newPreviews].slice(0, 4)
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCoverImage = () => {
    setFormData(prev => ({ ...prev, coverImage: null }));
    setImagePreviews(prev => ({ ...prev, cover: null }));
  };

  const removeSecondaryImage = (index) => {
    const newSecondaryImages = formData.secondaryImages.filter((_, i) => i !== index);
    const newSecondaryPreviews = imagePreviews.secondary.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, secondaryImages: newSecondaryImages }));
    setImagePreviews(prev => ({ ...prev, secondary: newSecondaryPreviews }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('courseType', formData.courseType);
      formDataToSend.append('courseTier', formData.courseTier);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('durationType', formData.durationType);
      formDataToSend.append('courseFee', formData.courseFee);
      formDataToSend.append('offerPrice', formData.offerPrice);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('certificationAvailable', formData.certificationAvailable);
      
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      formData.secondaryImages.forEach((image, index) => {
        formDataToSend.append(`secondaryImages`, image);
      });

      const url = selectedCourse 
        ? `${API_BASE_URL}/courses/${selectedCourse._id}`
        : `${API_BASE_URL}/courses`;
      
      const method = selectedCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${selectedCourse ? 'update' : 'create'} course`);
      }

      toast.success(`Course ${selectedCourse ? 'updated' : 'created'} successfully!`);
      setModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || `Failed to ${selectedCourse ? 'update' : 'create'} course`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${selectedCourse._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete course');
      }

      toast.success('Course deleted successfully!');
      setDeleteModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCertification = async (course) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${course._id}/certification`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update certification');
      toast.success(`Certification ${data.data.certificationAvailable ? 'enabled' : 'disabled'} for "${course.name}"`);
      fetchCourses();
    } catch (error) {
      toast.error(error.message || 'Failed to update certification');
    }
  };

  const filteredCourses = (courses || []).filter(course => 
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'elite': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'online': return 'bg-brand-gold text-white';
      case 'native': return 'bg-brand-dark text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch tutors for assign modal
  const fetchTutors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tutors?limit=500`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch tutors');
      setTutorsList(json.data?.tutors || []);
      if (assignCourseId) {
        const course = courses.find(c => c._id === assignCourseId);
        const courseTutorIds = (course?.tutors || []).map(t => (typeof t === 'string' ? t : (t._id || t)));
        setAssignSelectedTutors(courseTutorIds);
      }
    } catch (err) {
      console.error('Fetch tutors error:', err);
      toast.error(err.message || 'Failed to load tutors');
    }
  };

  const handleAssignCourseChange = (courseId) => {
    setAssignCourseId(courseId);
    const course = courses.find(c => c._id === courseId);
    const courseTutorIds = (course?.tutors || []).map(t => (typeof t === 'string' ? t : (t._id || t)));
    setAssignSelectedTutors(courseTutorIds);
  };

  const toggleAssignTutor = (tutorId) => {
    setAssignSelectedTutors(prev => {
      if (prev.includes(tutorId)) return prev.filter(id => id !== tutorId);
      return [...prev, tutorId];
    });
  };

  const handleAssignSubmit = async () => {
    if (!assignCourseId) return toast.error('Please select a course');
    setAssignLoading(true);
    try {
      // Update course -> set tutors array
      const resCourse = await fetch(`${API_BASE_URL}/courses/${assignCourseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutors: assignSelectedTutors })
      });
      const jsonCourse = await resCourse.json();
      if (!resCourse.ok) throw new Error(jsonCourse.message || 'Failed to update course tutors');

      // Update each tutor's courses list accordingly
      await Promise.all(tutorsList.map(async (tutor) => {
        const tid = tutor._id;
        const currentCourses = (tutor.courses || []).map(c => (c._id || c));
        const shouldHaveCourse = assignSelectedTutors.includes(tid);
        const hasCourse = currentCourses.includes(assignCourseId);

        let updatedCourses = currentCourses.slice();
        if (shouldHaveCourse && !hasCourse) {
          updatedCourses.push(assignCourseId);
        } else if (!shouldHaveCourse && hasCourse) {
          updatedCourses = updatedCourses.filter(cid => cid !== assignCourseId);
        } else {
          // no change
          return;
        }

        // tutorRoutes expects courses as JSON string in body parsing
        const resTutor = await fetch(`${API_BASE_URL}/tutors/${tid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courses: JSON.stringify(updatedCourses) })
        });
        const jsonTutor = await resTutor.json();
        if (!resTutor.ok) throw new Error(jsonTutor.message || `Failed to update tutor ${tid}`);
      }));

      toast.success('Assignments updated successfully');
      setAssignModalOpen(false);
      // refresh data
      fetchCourses();
    } catch (err) {
      console.error('Assign error:', err);
      toast.error(err.message || 'Failed to update assignments');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-brand-dark">
            <FaBook /> Courses Management
          </h2>
          <p className="text-sm text-secondary">Create and manage courses for your e-learning platform</p>
        </div>

        {/* Actions Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <form onSubmit={handleSearch} className="flex gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light" />
                <input
                  type="text"
                  placeholder="Search courses by name or description..."
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
              onClick={() => {
                // open assign modal and set default course
                const defaultCourseId = (courses && courses[0]) ? courses[0]._id : null;
                setAssignCourseId(defaultCourseId);
                setAssignModalOpen(true);
                // fetch tutors when opening
                fetchTutors();
              }}
              className="px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2 bg-brand-dark hover:bg-brand-brown"
            >
              Assign
            </button>

            <button
              onClick={handleCreate}
              className="px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2 bg-brand-dark hover:bg-brand-brown"
            >
              <FaPlus /> Create Course
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-secondary text-lg">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-secondary text-lg">
                {searchTerm ? 'No courses found matching your search' : 'No courses found'}
              </p>
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-2 rounded-lg font-semibold text-white transition-colors bg-brand-gold hover:bg-brand-yellow"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredCourses.map((course) => (
                <div key={course._id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-brand-gold">
                  {/* Course Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {course.coverImage?.url ? (
                      <img
                        src={course.coverImage.url}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-gold to-brand-yellow flex items-center justify-center">
                        <FaBook className="text-white text-4xl" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(course.courseType)}`}>
                        {course.courseType}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierBadgeColor(course.courseTier)}`}>
                        {course.courseTier}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2">
                      {course.name}
                    </h3>
                    <p className="text-sm text-secondary mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-secondary mb-3">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-brand-gold" />
                        <span>{course.duration} {course.durationType}</span>
                      </div>
                      <div className="text-right">
                        {course.offerPrice ? (
                          <>
                            <span className="line-through text-light">KES {course.courseFee?.toLocaleString()}</span>
                            <span className="font-bold text-brand-gold ml-2">KES {course.offerPrice?.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="font-bold text-brand-gold">KES {course.courseFee?.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Certification Toggle */}
                    <div className="flex items-center justify-between py-2 mb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <FaCertificate className={course.certificationAvailable ? 'text-brand-gold' : 'text-gray-300'} />
                        Certification
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleCertification(course)}
                        className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          course.certificationAvailable ? 'bg-brand-gold' : 'bg-gray-300'
                        }`}
                        title={course.certificationAvailable ? 'Disable certification' : 'Enable certification'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            course.certificationAvailable ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(course)}
                        className="flex-1 px-3 py-2 rounded-lg font-semibold transition-colors border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm"
                      >
                        <FaEdit className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(course)}
                        className="flex-1 px-3 py-2 rounded-lg font-semibold transition-colors border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm"
                      >
                        <FaTrash className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-999 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between p-6 border-b-2 border-brand-gold bg-white">
                <h2 className="text-2xl font-bold text-brand-dark">
                  {selectedCourse ? 'Edit Course' : 'Create New Course'}
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
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="Enter course name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Course Type *
                    </label>
                    <select
                      value={formData.courseType}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseType: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                    >
                      {courseTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                    placeholder="Enter course description"
                  />
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Course Tier *
                    </label>
                    <select
                      value={formData.courseTier}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseTier: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                    >
                      {courseTierOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Duration *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Duration Type *
                    </label>
                    <select
                      value={formData.durationType}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationType: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                    >
                      {durationTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Course Fee (KES) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.courseFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseFee: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="Enter course fee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Offer Price (KES)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, offerPrice: e.target.value }))}
                      className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                      placeholder="Enter offer price (optional)"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Certification Toggle */}
                <div className="flex items-center justify-between p-4 border-2 border-brand-gold rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <FaCertificate className="text-brand-gold" />
                      Certification Available
                    </div>
                    <p className="text-xs text-secondary mt-1">Students who complete this course can receive a certificate</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, certificationAvailable: !prev.certificationAvailable }))}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      formData.certificationAvailable ? 'bg-brand-gold' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        formData.certificationAvailable ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Images Section */}
                <div className="space-y-6">
                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-3">
                      Cover Image *
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {imagePreviews.cover ? (
                          <div className="relative">
                            <img
                              src={imagePreviews.cover}
                              alt="Cover preview"
                              className="w-32 h-32 rounded-lg object-cover border-2 border-brand-gold"
                            />
                            <button
                              type="button"
                              onClick={removeCoverImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <IoMdClose size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-lg bg-secondary flex items-center justify-center border-2 border-dashed border-brand-gold">
                            <FaImage className="text-light text-2xl" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          className="hidden"
                          id="coverImage"
                        />
                        <label
                          htmlFor="coverImage"
                          className="cursor-pointer px-4 py-2 rounded-lg font-semibold transition-colors border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white inline-block"
                        >
                          Choose Cover Image
                        </label>
                        <p className="text-xs text-light mt-2">
                          Recommended: 16:9 ratio, max 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Images */}
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-3">
                      Secondary Images (Max 4)
                    </label>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {imagePreviews.secondary.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Secondary ${index + 1}`}
                            className="w-24 h-24 rounded-lg object-cover border-2 border-brand-gold"
                          />
                          <button
                            type="button"
                            onClick={() => removeSecondaryImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <IoMdClose size={12} />
                          </button>
                        </div>
                      ))}
                      {imagePreviews.secondary.length < 4 && (
                        <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center border-2 border-dashed border-brand-gold cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleSecondaryImagesChange}
                            className="hidden"
                            id="secondaryImages"
                          />
                          <label htmlFor="secondaryImages" className="cursor-pointer text-center">
                            <FaPlus className="text-light text-xl mx-auto mb-1" />
                            <span className="text-xs text-light">Add Image</span>
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-light">
                      Add up to 4 additional images to showcase the course
                    </p>
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
                    {actionLoading ? 'Saving...' : selectedCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && selectedCourse && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Confirm Deletion</h3>
              <p className="text-secondary mb-6">
                Are you sure you want to delete the course <strong>"{selectedCourse.name}"</strong>? 
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
                  {actionLoading ? 'Deleting...' : 'Delete Course'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {assignModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-999 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between p-6 border-b-2 border-brand-gold bg-white">
                <h2 className="text-2xl font-bold text-brand-dark">Assign Course To Tutors</h2>
                <button onClick={() => setAssignModalOpen(false)} className="p-2 hover:bg-secondary rounded-full">
                  <IoMdClose size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Select Course</label>
                  <select
                    value={assignCourseId || ''}
                    onChange={(e) => handleAssignCourseChange(e.target.value)}
                    className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors border-brand-gold"
                  >
                    <option value="">-- Select course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Select Tutors (check to assign)</label>
                  <div className="max-h-64 overflow-y-auto border-2 border-gray-100 rounded-lg p-3">
                    {tutorsList.length === 0 ? (
                      <p className="text-secondary">No tutors available</p>
                    ) : (
                      tutorsList.map(t => {
                        const tid = t._id;
                        const checked = assignSelectedTutors.includes(tid);
                        return (
                          <label key={tid} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                            <input type="checkbox" checked={checked} onChange={() => toggleAssignTutor(tid)} className="w-4 h-4" />
                            <div>
                              <div className="font-semibold text-primary">{t.firstName} {t.lastName}</div>
                              <div className="text-xs text-secondary">{t.email}</div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setAssignModalOpen(false)} className="px-6 py-3 rounded-lg border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white">Cancel</button>
                  <button onClick={handleAssignSubmit} disabled={assignLoading} className="px-6 py-3 rounded-lg bg-brand-gold text-white font-semibold disabled:opacity-50">
                    {assignLoading ? 'Saving...' : 'Save Assignments'}
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