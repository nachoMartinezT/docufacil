import React, { useState } from 'react';
import { FileDown, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function GenerateButton({ year, month, fileCount }) {
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (fileCount === 0) {
      alert('No hay archivos para generar el PDF');
      return;
    }

    setGenerating(true);
    setSuccess(false);

    try {
      const response = await axios.post(
        `${API_URL}/api/files/generate-pdf/${year}/${month}`,
        { sortBy: 'custom' },
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobantes-${year}-${String(month).padStart(2, '0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Generate PDF error:', error);
      alert('Error al generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 z-20">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={handleGenerate}
          disabled={generating || fileCount === 0}
          className={`
            w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3
            transition-all duration-200
            ${success 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-primary-600 hover:bg-primary-700 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg shadow-primary-600/30
          `}
        >
          {generating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generando PDF...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-6 h-6" />
              ¡PDF descargado!
            </>
          ) : (
            <>
              <FileDown className="w-6 h-6" />
              Generar PDF del mes
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">
                {months[month - 1]} {year}
              </span>
              {fileCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {fileCount} archivo{fileCount !== 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default GenerateButton;
