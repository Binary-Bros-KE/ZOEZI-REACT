import "./ApplicationDetailModal.css"

export default function ApplicationDetailModal({ application, onClose }) {
  if (!application) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Application Details</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Personal Information */}
          <div className="detail-section">
            <h3 className="section-title">👤 Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">First Name</span>
                <span className="detail-value">{application.firstName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Name</span>
                <span className="detail-value">{application.lastName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{application.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{application.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">{formatDate(application.dateOfBirth)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{application.gender}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Citizenship</span>
                <span className="detail-value">{application.citizenship}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ID/Passport</span>
                <span className="detail-value">{application.idNumber}</span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="detail-section">
            <h3 className="section-title">🎓 Academic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Qualification</span>
                <span className="detail-value">{application.qualification}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">KCSE Grade</span>
                <span className="detail-value">{application.kcseGrade}</span>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="detail-section">
            <h3 className="section-title">📚 Course Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Course</span>
                <span className="detail-value">{application.course}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Training Mode</span>
                <span className="detail-value">{application.trainingMode}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Preferred Intake</span>
                <span className="detail-value">{application.preferredIntake}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Preferred Start Date</span>
                <span className="detail-value">{formatDate(application.preferredStartDate)}</span>
              </div>
            </div>
          </div>

          {/* How They Found Us */}
          <div className="detail-section">
            <h3 className="section-title">📍 How They Found Us</h3>
            <div className="detail-grid">
              <div className="detail-item full-width">
                <span className="detail-label">Sources</span>
                <div className="sources-list">
                  {application.howHeardAbout?.map((source, idx) => (
                    <span key={idx} className="source-badge">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
              {application.otherSource && (
                <div className="detail-item full-width">
                  <span className="detail-label">Other Source</span>
                  <span className="detail-value">{application.otherSource}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="detail-section">
            <h3 className="section-title">💳 Financial Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Fee Payer</span>
                <span className="detail-value">{application.feePayer}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fee Payer Phone</span>
                <span className="detail-value">{application.feePayerPhone}</span>
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div className="detail-section">
            <h3 className="section-title">👨‍👩‍👧 Next of Kin</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Name</span>
                <span className="detail-value">{application.nextOfKinName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Relationship</span>
                <span className="detail-value">{application.nextOfKinRelationship}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{application.nextOfKinPhone}</span>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div className="detail-section">
            <h3 className="section-title">📊 Application Status</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Application Number</span>
                <span className="detail-value">{application.applicationNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className={`status-badge status-${application.status}`}>
                  {application.status?.toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Sent</span>
                <span className={application.emailSent ? "status-badge status-sent" : "status-badge status-pending"}>
                  {application.emailSent ? "✓ Sent" : "✗ Failed"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted</span>
                <span className="detail-value">{formatDate(application.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
