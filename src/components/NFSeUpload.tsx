import React from 'react';
import { Upload } from 'lucide-react';

interface NFSeUploadProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  selectedFile: File | null;
  isUploading: boolean;
}

export function NFSeUpload({ onFileChange, onUpload, selectedFile, isUploading }: NFSeUploadProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Importar XML da NFSe</h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept=".xml,application/xml"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Arquivo selecionado: {selectedFile.name}
            </p>
          )}
        </div>
        <button
          onClick={onUpload}
          disabled={!selectedFile || isUploading}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md text-white transition-colors
            ${isUploading || !selectedFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Importando...' : 'Importar XML'}
        </button>
      </div>
    </div>
  );
}