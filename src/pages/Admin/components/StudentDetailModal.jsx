import React from 'react';
import { IoClose } from 'react-icons/io5';

export const StudentDetailModal = ({ student, isOpen, onClose }) => {
  if (!isOpen || !student) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateBalance = () => {
    const course = student.courseFee || 0;
    const upfront = student.upfrontFee || 0;
    return Math.max(0, course - upfront);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-999 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b-2" style={{ borderColor: '#d4a644', backgroundColor: '#f5f5f3' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#2b2520' }}>
            Student Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <IoClose size={24} style={{ color: '#d32f2f' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-6 pb-6 border-b" style={{ borderColor: '#d4a644' }}>
            {student.profilePicture && (
              <img
                src={student.profilePicture}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-24 h-24 rounded-lg object-cover border-2"
                style={{ borderColor: '#d4a644' }}
              />
            )}
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#2b2520' }}>
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-gray-600">Admission #: {student.admissionNumber || 'N/A'}</p>
              <p className="text-sm text-gray-600">Status: <span className="font-semibold" style={{ color: '#d4a644' }}>{student.status || 'active'}</span></p>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#2b2520' }}>
              📋 Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{student.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{formatDate(student.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{student.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Citizenship</p>
                <p className="font-medium">{student.citizenship || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID Number</p>
                <p className="font-medium">{student.idNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#2b2520' }}>
              🎓 Academic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Qualification</p>
                <p className="font-medium">{student.qualification || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">KCSE Grade</p>
                <p className="font-medium">{student.kcseGrade || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-medium">{student.course || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Training Mode</p>
                <p className="font-medium">{student.trainingMode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preferred Intake</p>
                <p className="font-medium">{student.preferredIntake || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preferred Start Date</p>
                <p className="font-medium">{student.preferredStartDate || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Admission Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#2b2520' }}>
              ✅ Admission Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Application Reference</p>
                <p className="font-medium">{student.applicationRef || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Actual Start Date</p>
                <p className="font-medium">{formatDate(student.startDate)}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f3' }}>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#2b2520' }}>
              💰 Financial Information
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Course Fee</p>
                <p className="font-bold text-lg" style={{ color: '#d4a644' }}>
                  KES {(student.courseFee || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Upfront Fee Paid</p>
                <p className="font-bold text-lg" style={{ color: '#2b2520' }}>
                  KES {(student.upfrontFee || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white border-l-4" style={{ borderColor: '#c9952f' }}>
              <p className="text-sm text-gray-600">Balance Due</p>
              <p className="font-bold text-xl" style={{ color: '#c9952f' }}>
                KES {calculateBalance().toLocaleString()}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fee Payer</p>
                <p className="font-medium">{student.feePayer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fee Payer Phone</p>
                <p className="font-medium">{student.feePayerPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* How They Found Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#2b2520' }}>
              🔍 How They Found Us
            </h4>
            <div>
              <p className="text-sm text-gray-600 mb-2">Sources</p>
              <div className="flex flex-wrap gap-2">
                {student.howHeardAbout && student.howHeardAbout.length > 0 ? (
                  student.howHeardAbout.map((source, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: '#d4a644' }}
                    >
                      {source}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">N/A</p>
                )}
              </div>
              {student.otherSource && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Other Source</p>
                  <p className="font-medium">{student.otherSource}</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#2b2520' }}>
              🆘 Next of Kin / Emergency Contact
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{student.nextOfKinName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relationship</p>
                <p className="font-medium">{student.nextOfKinRelationship || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{student.nextOfKinPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t" style={{ borderColor: '#d4a644' }}>
            <p className="text-xs text-gray-500">
              Admitted: {formatDate(student.createdAt)} • Last Updated: {formatDate(student.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
