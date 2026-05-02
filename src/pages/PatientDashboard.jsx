import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Clock, Shield, ShieldOff, User, MapPin, Droplet, Bell, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function PatientDashboard() {
  const { user, userData, setUserData } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', time: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'reminders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const toggleSharing = async () => {
    const newVal = !userData.isSharingEnabled;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isSharingEnabled: newVal
      });
      setUserData({ ...userData, isSharingEnabled: newVal });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.time) return;
    try {
      await addDoc(collection(db, 'reminders'), {
        userId: user.uid,
        title: newReminder.title,
        time: newReminder.time,
        isActive: true,
        createdAt: newAlpha()
      });
      setNewReminder({ title: '', time: '' });
      setShowAddReminder(false);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await deleteDoc(doc(db, 'reminders', id));
    } catch (error) {
      console.error(error);
    }
  };

  const newAlpha = () => new Date().toISOString();

  if (!userData) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-6 shadow-soft border border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start"
      >
        <div className="w-32 h-32 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
          <User size={48} />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{userData.name}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-600 text-white uppercase ml-0 md:ml-2 w-max mx-auto md:mx-0">
              Personal ID
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1"><User size={14} className="text-blue-500" /> {userData.age}y, {userData.gender}</span>
            <span className="flex items-center gap-1 text-red-600"><Droplet size={14} /> {userData.bloodGroup}</span>
            <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-500" /> {userData.address}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-100 flex flex-col items-center gap-6"
        >
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Medical Passport</h3>
            <p className="text-sm text-gray-500 font-medium">Instant access for authorized doctors</p>
          </div>
          
          <div className="p-5 bg-white border-[12px] border-gray-50 rounded-[2rem] shadow-inner">
            <QRCodeSVG 
              value={`${window.location.origin}/doctor/patient/${user.uid}`} 
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <button 
            onClick={toggleSharing}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95 ${
              userData.isSharingEnabled 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200' 
              : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200'
            }`}
          >
            {userData.isSharingEnabled ? <Shield size={20} /> : <ShieldOff size={20} />}
            Sharing {userData.isSharingEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </motion.div>

        {/* Reminders Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-gray-100 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <Bell size={20} />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Reminders</h3>
            </div>
            <button 
              onClick={() => setShowAddReminder(true)}
              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2">
            {reminders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-sm text-gray-400 font-medium">No reminders set</p>
              </div>
            ) : (
              reminders.map(rem => (
                <div key={rem.id} className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <div>
                      <p className="font-bold text-gray-900 leading-none mb-1">{rem.title}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{rem.time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteReminder(rem.id)}
                    className="p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddReminder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl space-y-6"
            >
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Add Reminder</h3>
              <form onSubmit={addReminder} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pill / Event Name</label>
                  <input 
                    type="text"
                    required
                    value={newReminder.title}
                    onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                    placeholder="e.g. Paracetamol"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time</label>
                  <input 
                    type="time"
                    required
                    value={newReminder.time}
                    onChange={e => setNewReminder({...newReminder, time: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddReminder(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all font-sans"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-sans"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/patient/upload')}
          className="group relative flex flex-col items-center justify-center gap-3 p-8 bg-blue-600 text-white rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2 bg-white/10 rounded-bl-2xl">
            <Plus size={16} />
          </div>
          <Upload size={32} className="group-hover:-translate-y-1 transition-transform" />
          <span className="font-black text-lg tracking-tight">Upload Record</span>
        </button>
        <button 
          onClick={() => navigate('/patient/timeline')}
          className="flex flex-col items-center justify-center gap-3 p-8 bg-white text-gray-900 rounded-[2.5rem] border border-gray-100 hover:bg-gray-50 transition-all shadow-soft active:scale-95"
        >
          <Clock size={32} className="text-blue-600" />
          <span className="font-black text-lg tracking-tight">View Timeline</span>
        </button>
      </div>
    </div>
  );
}
