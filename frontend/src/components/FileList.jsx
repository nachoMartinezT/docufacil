import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FileText,
  Image,
  Trash2,
  Eye,
  GripVertical,
  Loader2,
  File,
  X
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Sortable Item Component
function SortableFileItem({ file, onDelete, onPreview, deleting, formatDate, formatFileSize, getFileIcon }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
        ${isDragging 
          ? 'bg-primary-900/30 border-primary-500 shadow-lg scale-[1.02]' 
          : 'bg-gray-800/80 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
        }
      `}
    >
      {/* Drag Handle - Larger touch target for mobile */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-3 -m-1 rounded-xl hover:bg-gray-700/50 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing touch-manipulation select-none"
        title="Arrastrar para reordenar"
      >
        <GripVertical className="w-6 h-6" />
      </div>

      {/* File Icon */}
      <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
        {getFileIcon(file.type)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0 px-2">
        <h3 className="text-sm font-medium text-white truncate">
          {file.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
          <span>{formatFileSize(file.size)}</span>
          <span className="text-gray-600">•</span>
          <span>{formatDate(file.uploadedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onPreview(file)}
          className="p-2.5 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors"
          title="Ver"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(file.storedName)}
          disabled={deleting === file.storedName}
          className="p-2.5 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
          title="Eliminar"
        >
          {deleting === file.storedName ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function FileList({ files, loading, year, month, onDeleteSuccess }) {
  const [items, setItems] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Initialize items when files prop changes
  useEffect(() => {
    // Sort by order field if it exists, otherwise keep default order
    const sortedFiles = [...files].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return new Date(a.uploadedAt) - new Date(b.uploadedAt);
    });
    setItems(sortedFiles);
  }, [files]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Configure sensors for mouse, touch, and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced for more responsive feel
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Slightly faster
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save order after state update
        setTimeout(() => saveOrder(newItems), 0);
        
        return newItems;
      });
    }
  };

  const saveOrder = async (itemsToSave) => {
    setSavingOrder(true);
    try {
      const orderedIds = itemsToSave.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      await axios.post(
        `${API_URL}/api/files/reorder/${year}/${month}`,
        { order: orderedIds }
      );
    } catch (error) {
      console.error('Error saving order:', error);
    }
    setSavingOrder(false);
  };

  const handleDelete = async (filename) => {
    if (!confirm('¿Seguro que querés eliminar este archivo?')) {
      return;
    }

    setDeleting(filename);
    try {
      await axios.delete(
        `${API_URL}/api/files/${year}/${month}/${filename}`
      );
      onDeleteSuccess();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error al eliminar el archivo');
    }
    setDeleting(null);
  };

  const handlePreview = async (file) => {
    setPreviewFile(file);
    setPreviewLoading(true);
    
    try {
      // Fetch the file with axios (includes JWT token)
      const response = await axios.get(
        `${API_URL}/api/files/preview/${year}/${month}/${file.storedName}`,
        {
          responseType: 'blob'
        }
      );
      
      // Create blob URL for preview
      const blob = new Blob([response.data], { type: file.type });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Error al cargar la vista previa');
    }
    
    setPreviewLoading(false);
  };

  const closePreview = () => {
    setPreviewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-400" />;
    } else if (type.startsWith('image/')) {
      return <Image className="w-6 h-6 text-green-400" />;
    }
    return <File className="w-6 h-6 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="card p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Archivos cargados
                <span className="bg-primary-600 text-white text-xs px-2.5 py-0.5 rounded-full">
                  {files.length}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Tocá y arrastrá <GripVertical className="w-3 h-3 inline mx-1" /> para reordenar
              </p>
            </div>
            {savingOrder && (
              <span className="text-xs text-gray-400 flex items-center gap-1.5 bg-gray-700/50 px-3 py-1.5 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                Guardando...
              </span>
            )}
          </div>
        </div>

        {files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay archivos cargados para este mes</p>
            <p className="text-sm mt-1">Subí archivos usando la zona de arriba</p>
          </div>
        ) : (
          <div className="p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((file) => (
                    <SortableFileItem
                      key={file.id}
                      file={file}
                      onDelete={handleDelete}
                      onPreview={handlePreview}
                      deleting={deleting}
                      formatDate={formatDate}
                      formatFileSize={formatFileSize}
                      getFileIcon={getFileIcon}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div
            className="bg-gray-800 rounded-2xl max-w-5xl max-h-[95vh] w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
              <h3 className="text-lg font-medium text-white truncate pr-4 flex items-center gap-2">
                {previewFile.type === 'application/pdf' ? (
                  <FileText className="w-5 h-5 text-red-400" />
                ) : (
                  <Image className="w-5 h-5 text-green-400" />
                )}
                {previewFile.name}
              </h3>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-0 flex items-center justify-center bg-gray-900 overflow-auto max-h-[80vh]">
              {previewLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                  <p className="text-gray-400">Cargando vista previa...</p>
                </div>
              ) : previewUrl ? (
                previewFile.type === 'application/pdf' ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[80vh]"
                    title={previewFile.name}
                  />
                ) : previewFile.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt={previewFile.name}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                ) : (
                  <div className="py-20 text-gray-500">
                    No se puede previsualizar este archivo
                  </div>
                )
              ) : (
                <div className="py-20 text-gray-500">
                  Error al cargar el archivo
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FileList;
