import React from 'react';
import { Camera, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: File[];
  previewUrls: string[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  submitStatus: 'idle' | 'success' | 'error';
  setSubmitStatus: React.Dispatch<React.SetStateAction<'idle' | 'success' | 'error'>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export default function ImageUploader({
  // images,
  previewUrls,
  // setImages,
  // setPreviewUrls,
  errors,
  // setErrors,
  // submitStatus,
  // setSubmitStatus,
  handleImageUpload,
  removeImage
}: ImageUploaderProps) {
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-3">Property Images</h3>
      <p className="text-sm text-gray-500 mb-4">Upload up to 5 images of your property. The first image will be used as the main image.</p>
      
      {/* Display error message for images */}
      {errors.images && (
        <div className="text-red-500 text-sm mb-3 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {errors.images}
        </div>
      )}
      
      {/* Image upload button */}
      <div className="mb-4">
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Camera className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5 images)</p>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
      
      {/* Image previews */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative h-32 w-full rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Main Image
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}