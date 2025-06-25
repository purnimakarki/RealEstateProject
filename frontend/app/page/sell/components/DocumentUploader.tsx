import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

interface DocumentUploaderProps {
  documents: File[];
  setDocuments: React.Dispatch<React.SetStateAction<File[]>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  submitStatus: 'idle' | 'success' | 'error';
  setSubmitStatus: React.Dispatch<React.SetStateAction<'idle' | 'success' | 'error'>>;
  handleDocumentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeDocument: (index: number) => void;
}

export default function DocumentUploader({
  documents,
  errors,
  handleDocumentUpload,
  removeDocument
}: DocumentUploaderProps) {
  return (
    <div>
      <h3 className="sell-glass-section-title">Property Documents</h3>
      <p className="text-gray-300 mb-4">Upload legal documents (PDF, images, etc.) that prove the property is legitimate. These will be visible to buyers before purchase.</p>
      {/* Display error message for documents */}
      {errors.documents && (
        <div className="text-red-400 text-sm mb-3 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {errors.documents}
        </div>
      )}
      {/* Document upload button */}
      <div className="mb-4">
        <label
          htmlFor="document-upload"
          className="sell-glass-image-uploader flex flex-col items-center justify-center w-full h-32 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileText className="w-8 h-8 mb-3 text-gray-300" />
            <p className="mb-2 text-sm text-gray-300">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">PDF, PNG, JPG, JPEG (multiple allowed)</p>
          </div>
          <input
            id="document-upload"
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={handleDocumentUpload}
            className="hidden"
          />
        </label>
      </div>
      {/* Document list */}
      {documents.length > 0 && (
        <ul className="mb-4">
          {documents.map((file, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2 mb-2">
              <span className="truncate max-w-xs text-gray-200">{file.name}</span>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 