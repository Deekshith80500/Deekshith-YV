import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, Stethoscope, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import QRScanner from '../components/QRScanner';

export default function DoctorDashboard() {
  const [patientId, setPatientId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  const onScanSuccess = (id) => {
    setPatientId(id);
    navigate(`/doctor/patient/${id}`);
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-8 py-12">
      {showScanner && (
        <QRScanner onScan={onScanSuccess} onClose={() => setShowScanner(false)} />
      )}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg">
          <Stethoscope size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Doctor Panel</h2>
        <p className="text-gray-500">Access patient records securely via their unique Patient ID</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
      >
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Patient Identification</label>
            <div className="relative">
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient ID..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-mono"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <button
            type="submit"
            disabled={!patientId.trim()}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg flex items-center justify-center gap-2"
          >
            Access Record
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400">Quick Tools</span>
          </div>
        </div>

        <button 
          onClick={() => setShowScanner(true)}
          className="w-full py-4 border border-blue-100 rounded-2xl flex items-center justify-center gap-3 text-blue-600 hover:bg-blue-50 transition-all font-medium"
        >
          <Camera size={20} />
          Scan Patient QR Code
        </button>
      </motion.div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h4 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
          Privacy Note
        </h4>
        <p className="text-blue-700 text-sm leading-relaxed">
          You can only access medical data for patients who have enabled <strong>Global Sharing</strong>. 
          Patients can revoke access instantly from their dashboard.
        </p>
      </div>
    </div>
  );
}
