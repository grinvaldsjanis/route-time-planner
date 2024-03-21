import React from 'react';
import './FileUploader.css';

interface FileUploaderProps {
  onFileUploaded: (fileContent: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        onFileUploaded(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="file-uploader">
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

export default FileUploader;
