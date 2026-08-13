import React, { useState, useRef } from 'react';
import { Type, Image, Square, Minus, Space, Upload, X, Flag, FileText, CreditCard, Heading1 } from 'lucide-react';
import { UploadedImage } from '../types/email';

interface ComponentPaletteProps {
  onDragStart: (type: string, data?: any) => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onDragStart }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const components = [
    {
      type: 'banner', icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
          <path d="M144-744v-72h672v72H144Zm600 72q33 0 52.5 19.5T816-600v384q0 33-19.5 52.5T744-144H216q-33 0-52.5-19.5T144-216v-384q0-33 19.5-52.5T216-672h528Zm0 72H216v384h528v-384Zm-528 0v384-384Z" />
        </svg>
      ), label: 'Banner'
    },
    { type: 'title', icon: Heading1, label: 'Title' },
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'button', icon: Square, label: 'Button' },
    { type: 'footer', icon: FileText, label: 'Footer' },
    { type: 'content-card', icon: CreditCard, label: 'Content Card' },
    {
      type: 'two-columns-card', icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#1f1f1f">
          <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h4v4H7V7zm6 0h4v4h-4V7zM7 13h4v4H7v-4zm6 0h4v4h-4v-4z" />
        </svg>
      ), label: 'Two Columns Card'
    },
    { type: 'divider', icon: Minus, label: 'Divider' },
    { type: 'spacer', icon: Space, label: 'Spacer' },
  ];

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: `img-${Date.now()}-${Math.random()}`,
            name: file.name,
            url: e.target?.result as string,
            size: file.size,
            type: 'image',
          };
          setUploadedImages(prev => [newImage, ...prev]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageDragStart = (image: UploadedImage) => {
    // Set the uploaded image data as application/json for drag-and-drop
    const data = JSON.stringify({ src: image.url, alt: image.name, type: image.type });
    console.log('🔍 Palette: Starting drag with image data:', data);
    // Use a custom event to access the native event
    const dragHandler = (e: React.DragEvent) => {
      e.dataTransfer.setData('application/json', data);
      console.log('🔍 Palette: Set dataTransfer data:', data);
      onDragStart('uploaded-image', { src: image.url, alt: image.name });
    };
    // Return the handler for use in onDragStart
    return dragHandler;
  };

  return (
    <div className="w-full h-full bg-white p-4 pl-10 overflow-y-auto border-r border-grey-200">
      <h2 className="text-xl font-semibold text-grey-800 mb-3">Components</h2>
      <div className="space-y-3 mb-6">
        {components.map((component) => {
          const IconComponent = component.icon;
          return (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', component.type);
                // Set data attribute for button detection
                if (component.type === 'button') {
                  document.body.setAttribute('data-dragging-button', 'true');
                }
                onDragStart(component.type);
                window.dispatchEvent(new Event('palette-drag-start'));
              }}
              onDragEnd={() => {
                // Clean up data attribute
                document.body.removeAttribute('data-dragging-button');
              }}
              className="flex items-center space-x-2 p-1.5 hover:bg-grey-100 rounded cursor-move transition-colors"
            >
              {typeof IconComponent === 'function' && IconComponent.name === '' ? <IconComponent /> : <IconComponent className="w-5 h-5" />}
              <span className="text-sm font-medium text-grey-700">{component.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-grey-800 mb-3">Upload Images</h3>

        {uploadedImages.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-centre transition-colours cursor-pointer min-h-[120px] flex flex-col justify-center ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-grey-300'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-grey-400 mx-auto mb-2" />
            <p className="text-sm text-grey-600 mb-2 font-medium">
              Drop images here or click to upload
            </p>
            <p className="text-xs text-grey-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-2 text-centre transition-colours cursor-pointer mb-3 ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-grey-300'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5 text-grey-400 mx-auto" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        {uploadedImages.length > 0 && (
          <div className="space-y-1">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={handleImageDragStart(image)}
                onMouseDown={() => window.dispatchEvent(new Event('palette-drag-start'))}
                className="relative group bg-grey-50 rounded-lg p-1.5 cursor-move hover:bg-blue-50 transition-colours"
              >
                <div className="flex items-centre space-x-2">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-grey-700 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-grey-500">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-100 rounded transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentPalette;