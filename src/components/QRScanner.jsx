import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render((decodedText) => {
      // Assuming scanned text is a patient ID or a full MedVault URL
      // If it's a URL, we extract the ID
      let patientId = decodedText;
      if (decodedText.includes('/doctor/patient/')) {
        patientId = decodedText.split('/doctor/patient/').pop();
      }
      onScan(patientId);
      scanner.clear();
      onClose();
    }, (error) => {
      // handle scan error
    });

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={32} />
      </button>
      
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 text-center border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Scan Patient QR</h3>
          <p className="text-sm text-gray-500">Align the QR code within the frame</p>
        </div>
        <div id="reader" className="w-full"></div>
      </div>

      <p className="mt-8 text-white/60 text-sm font-medium animate-pulse">
        Waiting for camera access...
      </p>
    </div>
  );
}
