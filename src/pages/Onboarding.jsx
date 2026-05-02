import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { motion } from 'motion/react';

export default function Onboarding() {
  const { user, userData, setUserData } = useAuth();
  const navigate = useNavigate();
  const role = sessionStorage.getItem('intended_role') || 'patient';

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    degree: '',
  });

  useEffect(() => {
    if (userData) {
      navigate(userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    }
  }, [userData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      uid: user.uid,
      role: role,
      name: formData.name,
      email: formData.email,
      address: formData.address,
      createdAt: new Date().toISOString(),
      ...(role === 'patient' ? {
        age: formData.age,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        isSharingEnabled: true
      } : {
        degree: formData.degree
      })
    };

    try {
      await setDoc(doc(db, 'users', user.uid), data);
      setUserData(data);
      navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h2>
        <p className="text-gray-500 mb-8 capitalize">Registering as a {role}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                readOnly
                value={formData.email}
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 outline-none"
              />
            </div>

            {role === 'patient' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {role === 'doctor' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Degree / Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBBS, Cardiologist"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea
              required
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Create Profile
          </button>
        </form>
      </motion.div>
    </div>
  );
}
