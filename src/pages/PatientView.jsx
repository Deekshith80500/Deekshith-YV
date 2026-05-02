import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ShieldOff, User, Calendar, Droplet, MapPin, FileText, ClipboardList, Eye, ChevronLeft, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { motion } from 'motion/react';

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const patientData = docSnap.data();
          if (patientData.role !== 'patient') {
            setError('Invalid Patient ID');
          } else if (!patientData.isSharingEnabled) {
            setError('Access Denied: Patient has disabled data sharing');
          } else {
            setPatient(patientData);
            // Fetch records
            const q = query(
              collection(db, 'records'),
              where('patientId', '==', id),
              orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            setRecords(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        } else {
          setError('Patient not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 mt-12 text-center space-y-6">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-red-50 p-12 rounded-3xl border border-red-100 flex flex-col items-center">
          <ShieldOff size={64} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-8 max-w-xs mx-auto">{error}</p>
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-white shadow-sm transition-all"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 py-8 md:py-12">
      <button onClick={() => navigate('/doctor/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all font-bold text-sm uppercase tracking-widest">
        <ChevronLeft size={20} /> Back to Search
      </button>

      {/* Patient Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-100 flex flex-col md:flex-row gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[4rem] -mr-8 -mt-8"></div>
        
        <div className="w-40 h-40 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 flex-shrink-0 shadow-inner">
          <User size={64} />
        </div>
        
        <div className="space-y-6 flex-1 z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{patient.name}</h1>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Verified Profile</span>
            </div>
            <p className="text-gray-400 font-mono text-xs mt-2 bg-gray-50 w-max px-3 py-1 rounded-full uppercase tracking-tighter shadow-inner">ID: {id}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-6 border-t border-gray-100">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Demographics</p>
              <p className="text-gray-900 font-bold flex items-center gap-2"><User size={14} className="text-blue-500" /> {patient.age}y, {patient.gender}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Vital Group</p>
              <p className="text-rose-600 font-black flex items-center gap-2"><Droplet size={14} /> {patient.bloodGroup}</p>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Location</p>
              <p className="text-gray-900 font-bold flex items-center gap-2 truncate"><MapPin size={14} className="text-blue-500" /> {patient.address}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Records Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Medical Timeline
            <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-lg font-black">{records.length} ITEMS</span>
          </h3>
        </div>

        {records.length === 0 ? (
          <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center text-gray-400 font-medium">
            No medical records found for this patient.
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft flex items-center justify-between hover:border-blue-400 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl shadow-sm ${record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {record.type === 'prescription' ? <FileText size={28} /> : <ClipboardList size={28} />}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 tracking-tight capitalize">{record.type}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 font-bold">
                      <span className="flex items-center gap-1 uppercase tracking-widest"><Calendar size={14} /> {new Date(record.createdAt).toLocaleDateString()}</span>
                      <span className="truncate max-w-[150px] opacity-60 font-mono italic">{record.fileName}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={record.fileURL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                  <Eye size={18} /> OPEN
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
