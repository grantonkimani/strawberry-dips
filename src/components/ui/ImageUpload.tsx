'use client';

import { useState, useRef } from 'react';
import { Button } from './Button';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, onError, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value || '');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      onError?.('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onError?.('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads/gift-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const newImageUrl = data.imageUrl;
        setImageUrl(newImageUrl);
        onChange(newImageUrl);
        setShowUrlInput(false);
      } else {
        onError?.(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError?.('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setImageUrl(urlInput.trim());
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {imageUrl && (
        <div className="relative">
          <div className="aspect-square max-w-xs bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Gift product"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-gift.svg';
              }}
            />
          </div>
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-3">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload from Device'}
          </Button>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="w-full"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {showUrlInput ? 'Cancel URL Input' : 'Add Image URL'}
          </Button>

          {showUrlInput && (
            <div className="space-y-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Use This URL
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Recommended size: 800x800px or larger</p>
      </div>
    </div>
  );
}
