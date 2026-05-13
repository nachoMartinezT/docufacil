import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, File, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function FileUploader({ year, month, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    
    addFiles(files);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = ''; // Reset input
  };

  const addFiles = (files) => {
    const newFiles = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const updateFileName = (id, newName) => {
    setSelectedFiles(prev =>
      prev.map(f => f.id === id ? { ...f, name: newName } : f)
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      const names = {};
      
      selectedFiles.forEach((fileObj, index) => {
        formData.append('files', fileObj.file);
        names[index] = fileObj.name;
      });
      
      formData.append('names', JSON.stringify(names));

      await axios.post(
        `${API_URL}/api/files/upload/${year}/${month}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );

      // Clear selected files
      selectedFiles.forEach(fileObj => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
      setSelectedFiles([]);
      
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir archivos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-primary-500 bg-primary-500/10' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              Arrastrá archivos aquí
            </p>
            <p className="text-sm text-gray-400 mt-1">
              o hacé clic para seleccionar
            </p>
          </div>
          <p className="text-xs text-gray-500">
            PDF, JPG, JPEG (máx. 20MB)
          </p>
        </div>
      </div>

      {/* Camera Button (Mobile) */}
      <div className="flex justify-center sm:hidden">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-white text-sm"
        >
          <Camera className="w-4 h-4" />
          Tomar foto
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-300">
            Archivos seleccionados ({selectedFiles.length})
          </h3>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3"
              >
                {fileObj.preview ? (
                  <img
                    src={fileObj.preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    <File className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={fileObj.name}
                    onChange={(e) => updateFileName(fileObj.id, e.target.value)}
                    className="w-full bg-transparent border-b border-gray-600 focus:border-primary-500 text-sm text-white px-0 py-1 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(fileObj.file.size)}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileObj.id);
                  }}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirmar subida
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
