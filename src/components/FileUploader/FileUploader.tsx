import React from "react";
import "./FileUploader.css";
import { FaUpload } from "react-icons/fa6";

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
      <input
        className="inputfile"
        type="file"
        id="file"
        name="gpx_uploads"
        accept=".gpx"
        onChange={handleFileChange}
      />
      <label htmlFor="file"><FaUpload /><strong>Upload GPX</strong></label>
    </div>
  );
};

export default FileUploader;
