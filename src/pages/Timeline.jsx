import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { FileText, ClipboardList, Eye, ChevronLeft, Calendar, FileQuestion } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { motion } from 'motion/react';

export default function Timeline() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecords(data);
      } catch (error) {
        console.error(error);
        handleFirestoreError(error, OperationType.LIST, 'records');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRecords();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={20} /> Dashboard
      </button>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <FileQuestion size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No records found. Start by uploading one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-4 px-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {record.type === 'prescription' ? <FileText size={20} /> : <ClipboardList size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">{record.type}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(record.createdAt).toLocaleDateString()}</span>
                      <span>{record.fileName}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={record.fileURL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="View Record"
                >
                  <Eye size={20} />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
