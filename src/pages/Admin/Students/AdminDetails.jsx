import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaEye, FaCheck } from 'react-icons/fa';
import { CiSearch } from "react-icons/ci";
import AdminLayout from '../AdminLayout/AdminLayout';
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

const GRADE_OPTIONS = [
    { value: '', label: 'Select Grade' },
    { value: 'Distinction', label: 'Distinction' },
    { value: 'Merit', label: 'Merit' },
    { value: 'Credit', label: 'Credit' },
    { value: 'Pass', label: 'Pass' },
    { value: 'Fail', label: 'Fail' }
];

const SECTIONS = {
    info: 'Information',
    personal: 'Personal Details',
    academic: 'Academic Details',
    financial: 'Financial Details',
    profile: 'Profile Picture',
    exams: 'Exam Results',
    cpd: 'CPD Records'
};

const ITEMS_PER_PAGE = 50;

export default function AdminDetails() {
    const [dataType, setDataType] = useState('students'); // 'students' or 'alumni'
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [newExamName, setNewExamName] = useState('');
    const [newExamScore, setNewExamScore] = useState('');
    const [newCpdYear, setNewCpdYear] = useState(new Date().getFullYear());
    const [newCpdDate, setNewCpdDate] = useState('');
    const [newCpdResult, setNewCpdResult] = useState('pass');
    const [newCpdScore, setNewCpdScore] = useState('');
    const [newCpdRemarks, setNewCpdRemarks] = useState('');

    // Fetch all data on component mount and when dataType changes
    useEffect(() => {
        fetchAllData();
    }, [dataType]);

    // Filter students when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(student =>
                student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.phone?.includes(searchQuery) ||
                student.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredStudents(filtered);
        }
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, students]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const endpoint = dataType === 'students' ? '/students' : '/alumni/list';
            const query = new URLSearchParams({
                limit: 1000,
                skip: 0
            });

            const response = await fetch(`${API_BASE_URL}${endpoint}?${query}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch data');
            }

            const results = dataType === 'students' ? data.data.students : data.data.alumni;
            setStudents(results || []);
            setFilteredStudents(results || []);
            toast.success(`Loaded ${results.length} ${dataType}`);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(error.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setEditData({
            // Info tab
            admissionNumber: student.admissionNumber,
            // Personal tab
            firstName: student.firstName,
            lastName: student.lastName,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            // Contact info
            email: student.email,
            phone: student.phone,
            // Academic tab
            qualification: student.qualification,
            course: student.course,
            trainingMode: student.trainingMode,
            courseDuration: student.courseDuration,
            // Financial tab
            courseFee: student.courseFee,
            upfrontFee: student.upfrontFee,
            // Exams tab
            exams: (student.exams && Array.isArray(student.exams)) ? student.exams : [],
            // CPD tab
            cpdRecords: (student.cpdRecords && Array.isArray(student.cpdRecords)) ? student.cpdRecords : []
        });
        setProfileImagePreview(student.profilePicture);
        setActiveTab('info');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
        setEditData({});
        setProfileImageFile(null);
        setProfileImagePreview(null);
    };

    const handleInputChange = (field, value) => {
        setEditData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleExamChange = (index, field, value) => {
        const updatedExams = [...editData.exams];
        updatedExams[index] = { ...updatedExams[index], [field]: value };
        setEditData((prev) => ({
            ...prev,
            exams: updatedExams
        }));
    };

    const handleAddExam = () => {
        if (!newExamName.trim()) {
            toast.error('Please enter exam name');
            return;
        }
        const updatedExams = [...editData.exams, { name: newExamName, score: newExamScore }];
        setEditData((prev) => ({
            ...prev,
            exams: updatedExams
        }));
        setNewExamName('');
        setNewExamScore('');
        toast.success('Exam added!');
    };

    const handleRemoveExam = (index) => {
        const updatedExams = editData.exams.filter((_, idx) => idx !== index);
        setEditData((prev) => ({
            ...prev,
            exams: updatedExams
        }));
        toast.success('Exam removed!');
    };

    const handleCpdChange = (index, field, value) => {
        const updatedCpd = [...editData.cpdRecords];
        updatedCpd[index] = { ...updatedCpd[index], [field]: value };
        setEditData((prev) => ({
            ...prev,
            cpdRecords: updatedCpd
        }));
    };

    const handleAddCpd = () => {
        if (!newCpdDate.trim()) {
            toast.error('Please select a date');
            return;
        }
        const updatedCpd = [...editData.cpdRecords, {
            year: newCpdYear,
            dateTaken: newCpdDate,
            result: newCpdResult,
            score: newCpdScore ? Number(newCpdScore) : null,
            remarks: newCpdRemarks
        }];
        setEditData((prev) => ({
            ...prev,
            cpdRecords: updatedCpd
        }));
        setNewCpdYear(new Date().getFullYear());
        setNewCpdDate('');
        setNewCpdResult('pass');
        setNewCpdScore('');
        setNewCpdRemarks('');
        toast.success('CPD record added!');
    };

    const handleRemoveCpd = (index) => {
        const updatedCpd = editData.cpdRecords.filter((_, idx) => idx !== index);
        setEditData((prev) => ({
            ...prev,
            cpdRecords: updatedCpd
        }));
        toast.success('CPD record removed!');
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveChanges = async () => {
        if (!selectedStudent || !selectedStudent._id) {
            toast.error('No student selected');
            return;
        }

        setSaving(true);
        try {
            const endpoint = dataType === 'students' ? '/students' : '/alumni';
            const updateUrl = `${API_BASE_URL}${endpoint}/${selectedStudent._id}/update`;

            // Handle profile picture separately if it's being updated
            if (activeTab === 'profile' && profileImageFile) {
                const formData = new FormData();
                formData.append('file', profileImageFile);
                formData.append('section', 'profile');

                const imageResponse = await fetch(updateUrl, {
                    method: 'PUT',
                    body: formData
                });

                if (!imageResponse.ok) {
                    throw new Error('Failed to upload profile picture');
                }

                const imageData = await imageResponse.json();
                toast.success('Profile picture updated!');

                // Update the student in the list
                setStudents(prev => prev.map(s =>
                    s._id === selectedStudent._id ? imageData.data : s
                ));
                setSelectedStudent(imageData.data);
                setProfileImageFile(null);
                return;
            }

            // Prepare update data based on active tab
            let updatePayload = {};
            let section = '';

            switch (activeTab) {
                case 'info':
                    updatePayload = { admissionNumber: editData.admissionNumber };
                    section = 'info';
                    break;
                case 'personal':
                    updatePayload = {
                        firstName: editData.firstName,
                        lastName: editData.lastName,
                        dateOfBirth: editData.dateOfBirth,
                        gender: editData.gender,
                        email: editData.email,
                        phone: editData.phone
                    };
                    section = 'personal';
                    break;
                case 'academic':
                    updatePayload = {
                        qualification: editData.qualification,
                        course: editData.course,
                        trainingMode: editData.trainingMode,
                        courseDuration: editData.courseDuration
                    };
                    section = 'academic';
                    break;
                case 'financial':
                    updatePayload = {
                        courseFee: editData.courseFee,
                        upfrontFee: editData.upfrontFee
                    };
                    section = 'financial';
                    break;
                case 'exams':
                    updatePayload = { exams: editData.exams };
                    section = 'exams';
                    break;
                case 'cpd':
                    updatePayload = { cpdRecords: editData.cpdRecords };
                    section = 'cpd';
                    break;
            }

            // Regular data update
            const response = await fetch(updateUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: section,
                    data: updatePayload
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Update failed');
            }

            // Update the student in the list
            setStudents(prev => prev.map(s =>
                s._id === selectedStudent._id ? result.data : s
            ));
            setSelectedStudent(result.data);
            toast.success('Changes saved successfully!');

        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };


    const handleQuickVerify = async (alumniId) => {
        if (dataType !== 'alumni') return;

        try {
            const response = await fetch(`${API_BASE_URL}/alumni/${alumniId}/verify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Verification failed');
            }

            // Update the student in the list
            setStudents(prev => prev.map(s =>
                s._id === alumniId ? result.data : s
            ));

            toast.success('Alumni verified successfully!');
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(error.message || 'Failed to verify alumni');
        }
    };

    const handleVerifyInModal = async (alumniId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni/${alumniId}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Verification failed');
    }

    // Update the student in the list and modal
    setStudents(prev => prev.map(s => 
      s._id === alumniId ? result.data : s
    ));
    setSelectedStudent(result.data);
    
    toast.success('Alumni verified successfully!');
  } catch (error) {
    console.error('Verification error:', error);
    toast.error(error.message || 'Failed to verify alumni');
  }
};

    return (
        <AdminLayout>
            <div className="w-full">
                {/* Header */}
                <div className="mb-6">
                    <div className='flex gap-2 mb-4'>
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
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#2b2520' }}>
                        📋 Manage {dataType === 'students' ? 'Students' : 'Alumni'}
                    </h2>
                    <p className="text-sm text-gray-600">View and edit student/alumni information</p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDataType('students')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${dataType === 'students' ? 'bg-primary-gold text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                Students ({students.filter(s => !s.isAlumni).length})
                            </button>
                            <button
                                onClick={() => setDataType('alumni')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${dataType === 'alumni' ? 'bg-primary-gold text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                Alumni ({students.filter(s => s.isAlumni).length})
                            </button>
                        </div>

                        <button
                            onClick={fetchAllData}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            {loading ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>

                    <div className="relative">
                        <CiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or admission number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors"
                            style={{ borderColor: '#d4a644' }}
                        />
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Admission #</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Verification</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : paginatedStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No {dataType} found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={student.profilePicture || '/placeholder-profile.jpg'}
                                                            alt={student.firstName}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.firstName} {student.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {student.gender} • {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.admissionNumber || 'N/A'}
                                            </td>

                                            {/* Verification Status Column */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {dataType === 'alumni' ? (
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full mr-2 ${student.adminVerified === false ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                                                            }`}></div>
                                                        <span className={`text-sm font-medium ${student.adminVerified === false ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                            {student.adminVerified === false ? 'Pending' : 'Verified'}
                                                        </span>
                                                        {student.adminVerified === false && (
                                                            <button
                                                                onClick={() => handleQuickVerify(student._id)}
                                                                className="ml-3 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">N/A</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    className="text-primary-gold hover:text-primary-yellow px-3 py-1 rounded-md font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)}
                                    </span>{' '}
                                    of <span className="font-medium">{filteredStudents.length}</span> results
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded border disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-primary-gold text-white' : 'border'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded border disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-999">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b" style={{ backgroundColor: '#f5f5f3' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={profileImagePreview || selectedStudent.profilePicture || '/placeholder-profile.jpg'}
                                        alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                                        className="w-16 h-16 rounded-lg object-cover border-2"
                                        style={{ borderColor: '#d4a644' }}
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold" style={{ color: '#2b2520' }}>
                                            {selectedStudent.firstName} {selectedStudent.lastName}
                                        </h3>
                                        <p className="text-gray-600">Editing {dataType.slice(0, -1)} profile</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b">
                            <div className="flex overflow-x-auto">
                                {Object.entries(SECTIONS).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`px-6 py-3 font-semibold whitespace-nowrap ${activeTab === key ? 'border-b-2 text-primary-gold' : 'text-gray-600 hover:text-gray-900'}`}
                                        style={activeTab === key ? { borderColor: '#d4a644' } : {}}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            {/* Info Tab */}
                            {activeTab === 'info' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Admission Number
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.admissionNumber || ''}
                                            onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                            placeholder="Enter admission number"
                                        />
                                    </div>

                                    {/* In the Info tab section, after admission number field */}
                                    {dataType === 'alumni' && selectedStudent && (
                                        <div className="mt-6 p-4 border rounded-lg" style={{ borderColor: '#d4a644' }}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Admin Verification</h4>
                                                    <p className="text-xs text-gray-500">
                                                        {selectedStudent.adminVerified === false
                                                            ? 'This alumni needs verification'
                                                            : 'Alumni is verified'}
                                                    </p>
                                                </div>
                                                {selectedStudent.adminVerified === false ? (
                                                    <button
                                                        onClick={() => handleVerifyInModal(selectedStudent._id)}
                                                        className="px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <FaCheck /> Verify Now
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <FaCheck /> Verified
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Personal Tab */}
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.firstName || ''}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.lastName || ''}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={editData.dateOfBirth ? editData.dateOfBirth.split('T')[0] : ''}
                                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            value={editData.gender || ''}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={editData.email || ''}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={editData.phone || ''}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Academic Tab */}
                            {activeTab === 'academic' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Qualification
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.qualification || ''}
                                            onChange={(e) => handleInputChange('qualification', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Course
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.course || ''}
                                            onChange={(e) => handleInputChange('course', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Training Mode
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.trainingMode || ''}
                                            onChange={(e) => handleInputChange('trainingMode', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Course Duration
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.courseDuration || ''}
                                            onChange={(e) => handleInputChange('courseDuration', e.target.value)}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Financial Tab */}
                            {activeTab === 'financial' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Course Fee (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={editData.courseFee || ''}
                                            onChange={(e) => handleInputChange('courseFee', Number(e.target.value))}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Upfront Fee (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={editData.upfrontFee || ''}
                                            onChange={(e) => handleInputChange('upfrontFee', Number(e.target.value))}
                                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Profile Picture Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={profileImagePreview || '/placeholder-profile.jpg'}
                                            alt="Profile Preview"
                                            className="w-32 h-32 rounded-full object-cover border-4 mb-4"
                                            style={{ borderColor: '#d4a644' }}
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileImageChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-gold file:text-white hover:file:bg-primary-yellow"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Exams Tab - Reuse your existing exam editing logic */}
                            {activeTab === 'exams' && (
                                <div className="space-y-4">
                                    {/* Existing Exams */}
                                    {editData.exams && editData.exams.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>Existing Exams</h4>
                                            {editData.exams.map((exam, idx) => (
                                                <div key={idx} className="p-3 bg-gray-50 rounded border-l-4 flex gap-2 items-end mb-2" style={{ borderColor: '#d4a644' }}>
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Exam Name"
                                                            value={exam.name || ''}
                                                            onChange={(e) => handleExamChange(idx, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border-2 rounded text-sm"
                                                            style={{ borderColor: '#d4a644' }}
                                                        />
                                                        <select
                                                            value={exam.score || ''}
                                                            onChange={(e) => handleExamChange(idx, 'score', e.target.value)}
                                                            className="w-full px-3 py-2 border-2 rounded text-sm font-semibold"
                                                            style={{ borderColor: '#d4a644' }}
                                                        >
                                                            {GRADE_OPTIONS.map((grade) => (
                                                                <option key={grade.value} value={grade.value}>
                                                                    {grade.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveExam(idx)}
                                                        className="px-3 py-2 rounded bg-red-500 text-white font-semibold"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Exam */}
                                    <div className="p-3 bg-blue-50 rounded border-2" style={{ borderColor: '#d4a644' }}>
                                        <h4 className="text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>Add New Exam</h4>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Exam Name"
                                                value={newExamName}
                                                onChange={(e) => setNewExamName(e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                            />
                                            <select
                                                value={newExamScore}
                                                onChange={(e) => setNewExamScore(e.target.value)}
                                                className="w-full px-3 py-2 border-2 rounded text-sm font-semibold"
                                                style={{ borderColor: '#d4a644' }}
                                            >
                                                {GRADE_OPTIONS.map((grade) => (
                                                    <option key={grade.value} value={grade.value}>
                                                        {grade.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleAddExam}
                                                className="w-full px-3 py-2 rounded font-semibold text-white flex items-center gap-2 justify-center"
                                                style={{ backgroundColor: '#2b8a3e' }}
                                            >
                                                <FaPlus /> Add Exam
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CPD Tab - Reuse your existing CPD editing logic */}
                            {activeTab === 'cpd' && (
                                <div className="space-y-4">
                                    {/* Existing CPD Records */}
                                    {editData.cpdRecords && editData.cpdRecords.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>Existing CPD Records</h4>
                                            {editData.cpdRecords.map((cpd, idx) => (
                                                <div key={idx} className="p-3 bg-gray-50 rounded border-l-4 space-y-2 mb-2" style={{ borderColor: '#d4a644' }}>
                                                    <div className="flex gap-2 items-center justify-between">
                                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs font-semibold text-gray-600">Year</label>
                                                                <input
                                                                    type="number"
                                                                    min="2000"
                                                                    max={new Date().getFullYear() + 1}
                                                                    value={cpd.year || new Date().getFullYear()}
                                                                    onChange={(e) => handleCpdChange(idx, 'year', Number(e.target.value))}
                                                                    className="w-full px-2 py-1 border-2 rounded text-sm"
                                                                    style={{ borderColor: '#d4a644' }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-gray-600">Date Taken</label>
                                                                <input
                                                                    type="date"
                                                                    value={cpd.dateTaken ? cpd.dateTaken.split('T')[0] : ''}
                                                                    onChange={(e) => handleCpdChange(idx, 'dateTaken', e.target.value)}
                                                                    className="w-full px-2 py-1 border-2 rounded text-sm"
                                                                    style={{ borderColor: '#d4a644' }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveCpd(idx)}
                                                            className="px-3 py-2 rounded bg-red-500 text-white font-semibold h-fit"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-600">Result</label>
                                                            <select
                                                                value={cpd.result || 'pass'}
                                                                onChange={(e) => handleCpdChange(idx, 'result', e.target.value)}
                                                                className="w-full px-2 py-1 border-2 rounded text-sm font-semibold"
                                                                style={{ borderColor: '#d4a644' }}
                                                            >
                                                                <option value="pass">✅ Pass</option>
                                                                <option value="fail">❌ Fail</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-600">CPD Points</label>
                                                            <input
                                                                type="number"
                                                                placeholder="e.g., 3.5"
                                                                min="0"
                                                                max="100"
                                                                value={cpd.score || ''}
                                                                onChange={(e) => handleCpdChange(idx, 'score', e.target.value ? Number(e.target.value) : null)}
                                                                className="w-full px-2 py-1 border-2 rounded text-sm"
                                                                style={{ borderColor: '#d4a644' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600">Remarks</label>
                                                        <textarea
                                                            placeholder="Add any remarks..."
                                                            value={cpd.remarks || ''}
                                                            onChange={(e) => handleCpdChange(idx, 'remarks', e.target.value)}
                                                            className="w-full px-2 py-1 border-2 rounded text-sm"
                                                            style={{ borderColor: '#d4a644' }}
                                                            rows="2"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New CPD Record */}
                                    <div className="p-3 bg-blue-50 rounded border-2" style={{ borderColor: '#d4a644' }}>
                                        <h4 className="text-sm font-semibold mb-2" style={{ color: '#2b2520' }}>Add New CPD Record</h4>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600">Year</label>
                                                <input
                                                    type="number"
                                                    min="2000"
                                                    max={new Date().getFullYear() + 1}
                                                    value={newCpdYear}
                                                    onChange={(e) => setNewCpdYear(Number(e.target.value))}
                                                    className="w-full px-2 py-1 border-2 rounded text-sm"
                                                    style={{ borderColor: '#d4a644' }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600">Date Taken</label>
                                                <input
                                                    type="date"
                                                    value={newCpdDate}
                                                    onChange={(e) => setNewCpdDate(e.target.value)}
                                                    className="w-full px-2 py-1 border-2 rounded text-sm"
                                                    style={{ borderColor: '#d4a644' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600">Result</label>
                                                <select
                                                    value={newCpdResult}
                                                    onChange={(e) => setNewCpdResult(e.target.value)}
                                                    className="w-full px-2 py-1 border-2 rounded text-sm font-semibold"
                                                    style={{ borderColor: '#d4a644' }}
                                                >
                                                    <option value="pass">✅ Pass</option>
                                                    <option value="fail">❌ Fail</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600">CPD Points</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g., 3.5"
                                                    min="0"
                                                    max="100"
                                                    value={newCpdScore}
                                                    onChange={(e) => setNewCpdScore(e.target.value)}
                                                    className="w-full px-2 py-1 border-2 rounded text-sm"
                                                    style={{ borderColor: '#d4a644' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <label className="text-xs font-semibold text-gray-600">Remarks</label>
                                            <textarea
                                                placeholder="Add any remarks..."
                                                value={newCpdRemarks}
                                                onChange={(e) => setNewCpdRemarks(e.target.value)}
                                                className="w-full px-2 py-1 border-2 rounded text-sm"
                                                style={{ borderColor: '#d4a644' }}
                                                rows="2"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddCpd}
                                            className="w-full px-3 py-2 rounded font-semibold text-white flex items-center gap-2 justify-center"
                                            style={{ backgroundColor: '#2b8a3e' }}
                                        >
                                            <FaPlus /> Add CPD Record
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t bg-gray-50">
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-lg font-semibold border-2"
                                    style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveChanges}
                                    disabled={saving}
                                    className="px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2"
                                    style={{ backgroundColor: saving ? '#ccc' : '#2b8a3e' }}
                                >
                                    <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}