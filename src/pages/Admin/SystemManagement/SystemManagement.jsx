import React from 'react';
import AdminLayout from '../AdminLayout/AdminLayout';
import { MdSettings } from 'react-icons/md';

export default function SystemManagement() {
  return (
    <AdminLayout>
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-3xl font-bold" style={{ color: '#2b2520' }}>
            ⚙️ System Management
          </h2>
          <p className="text-gray-600 mt-1">Manage system settings and configurations.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <MdSettings size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500">System Management</h3>
          <p className="text-gray-400 mt-2">This section is under development.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
