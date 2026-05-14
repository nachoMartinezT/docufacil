import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MonthSelector from '../components/MonthSelector';
import FileUploader from '../components/FileUploader';
import FileList from '../components/FileList';
import GenerateButton from '../components/GenerateButton';
import { LogOut, FileText, User, Calendar } from 'lucide-react';
import axios from 'axios';

// Use relative API URL for Docker deployment with nginx proxy
const API_BASE = '/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/files/${selectedDate.year}/${selectedDate.month}`
      );
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedDate]);

  const handleDateChange = (year, month) => {
    setSelectedDate({ year, month });
  };

  const handleUploadSuccess = () => {
    fetchFiles();
  };

  const handleDeleteSuccess = () => {
    fetchFiles();
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Docufacil</h1>
                <p className="text-xs text-gray-400">Generador de PDF Mensual</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                <User className="w-4 h-4" />
                <span>{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Month Selector */}
        <MonthSelector 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {/* Upload Area */}
        <FileUploader 
          year={selectedDate.year}
          month={selectedDate.month}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* File List */}
        <FileList 
          files={files}
          loading={loading}
          year={selectedDate.year}
          month={selectedDate.month}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </main>

      {/* Sticky Generate Button */}
      <GenerateButton 
        year={selectedDate.year}
        month={selectedDate.month}
        fileCount={files.length}
      />
    </div>
  );
}

export default Dashboard;
