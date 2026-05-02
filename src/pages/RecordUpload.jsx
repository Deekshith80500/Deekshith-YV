import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { FileUp, FileText, ClipboardList, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { motion } from 'motion/react';

export default function RecordUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [type, setType] = useState('prescription');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `records/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'records'), {
        patientId: user.uid,
        fileURL,
        type,
        fileName: file.name,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 2000);
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.CREATE, 'records');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={20} /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Medical Record</h2>

        {success ? (
          <div className="flex flex-col items-center py-12 space-y-4">
            <CheckCircle2 size={64} className="text-green-500" />
            <h3 className="text-xl font-semibold">Upload Successful!</h3>
            <p className="text-gray-500">Your record has been stored securely.</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Record Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('prescription')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    type === 'prescription' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <FileText size={20} />
                  <span className="font-medium">Prescription</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('report')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    type === 'report' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <ClipboardList size={20} />
                  <span className="font-medium">Report</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">File (PDF/Image)</label>
              <div className="relative group">
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`p-12 border-2 border-dashed rounded-3xl flex flex-col items-center gap-4 transition-all ${
                  file ? 'border-blue-600 bg-blue-50' : 'border-gray-200 group-hover:border-blue-300'
                }`}>
                  <FileUp size={40} className={file ? 'text-blue-600' : 'text-gray-400'} />
                  <div className="text-center">
                    <p className="font-medium text-gray-900">
                      {file ? file.name : 'Click or drag to upload'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Maximum file size: 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
            >
              {uploading ? 'Uploading...' : 'Complete Upload'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
