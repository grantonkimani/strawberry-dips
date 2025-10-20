'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove?: () => void;
  productType?: string;
  className?: string;
}

export function ImageUpload({ 
  currentImageUrl, 
  onImageUpload, 
  onImageRemove,
  productType = 'wine-liquor',
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productType', productType);

      const response = await fetch('/api/upload-wine-liquor-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        onImageUpload(result.imageUrl);
        setError(null);
      } else {
        setError(result.error || 'Failed to upload image');
        setPreview(currentImageUrl || null);
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  }, [currentImageUrl, onImageUpload, productType]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleRemoveImage = async () => {
    if (currentImageUrl && onImageRemove) {
      try {
        // Delete from server
        await fetch(`/api/upload-wine-liquor-image?imageUrl=${currentImageUrl}&productType=${productType}`, {
          method: 'DELETE',
        });
        
        onImageRemove();
        setPreview(null);
        setError(null);
      } catch (err) {
        setError('Failed to remove image');
      }
    } else {
      setPreview(null);
      onImageRemove?.();
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-red-400 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={preview}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Replace Image Button */}
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Replace Image'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              {isUploading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              ) : (
                <ImageIcon className="h-12 w-12" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {isUploading ? 'Uploading...' : 'Upload Product Image'}
              </p>
              <p className="text-sm text-gray-600">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>

            <Button
              type="button"
              onClick={openFileDialog}
              disabled={isUploading}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">Uploading image...</span>
          </div>
        </div>
      )}
    </div>
  );
}
