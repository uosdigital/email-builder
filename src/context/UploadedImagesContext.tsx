import React, { createContext, useState, ReactNode } from 'react';

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  type: 'image';
  fileType?: string;
}

interface UploadedImagesContextType {
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
}

export const UploadedImagesContext = createContext<UploadedImagesContextType>({
  uploadedImages: [],
  setUploadedImages: () => {},
});

export const UploadedImagesProvider = ({ children }: { children: ReactNode }) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  return (
    <UploadedImagesContext.Provider value={{ uploadedImages, setUploadedImages }}>
      {children}
    </UploadedImagesContext.Provider>
  );
}; 