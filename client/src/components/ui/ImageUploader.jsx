import React, { useState, useRef } from 'react';
import { Upload, X, Image, Loader2, Plus } from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const ImageUploader = ({
  images = [],
  onImagesChange,
  maxImages = 8,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileSelect = async (files) => {
    if (!files?.length) return;

    const filesToUpload = Array.from(files).slice(0, maxImages - images.length);
    if (filesToUpload.length === 0) {
      toast.warning(`Maximum ${maxImages} images allowed`);
      return;
    }

    for (const file of filesToUpload) {
      // Validate file
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPG, PNG, and WEBP images are allowed');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        continue;
      }

      setUploading(true);
      setUploadingIndex(images.length);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.success) {
          const newImage = { url: res.data.data.url, publicId: res.data.data.publicId };
          onImagesChange([...images, newImage]);
        }
      } catch (err) {
        toast.error('Image upload failed. Please try a different file.');
      } finally {
        setUploading(false);
        setUploadingIndex(null);
      }
    }
  };

  const handleRemove = async (index, publicId) => {
    if (publicId) {
      try {
        await api.delete('/api/upload/image', { data: { publicId } });
      } catch (err) {
        console.warn('Image delete failed:', err.message);
      }
    }
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            disabled
              ? 'cursor-not-allowed opacity-50 border-brand-border'
              : 'cursor-pointer border-brand-border hover:border-brand-red hover:bg-red-50/30'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
              <p className="text-sm text-brand-muted">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Upload className="w-6 h-6 text-brand-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-dark">
                  Drop images here or <span className="text-brand-red">browse</span>
                </p>
                <p className="text-xs text-brand-muted mt-1">
                  JPG, PNG, WEBP up to 5MB • {images.length}/{maxImages} uploaded
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled}
      />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden aspect-[4/3] bg-gray-100">
              <img
                src={typeof img === 'string' ? img : img.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleRemove(index, typeof img === 'object' ? img.publicId : null)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-brand-dark/80 text-white text-xs px-2 py-0.5 rounded-full">
                  Main
                </span>
              )}
            </div>
          ))}

          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="aspect-[4/3] border-2 border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center gap-1 text-brand-muted hover:border-brand-red hover:text-brand-red transition-all"
              aria-label="Add more images"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Add</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
