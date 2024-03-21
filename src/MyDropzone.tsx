import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import parseGPX from "./utils/parseGPX";

interface MyDropzoneProps {
  onFileUploaded: (data: any) => void;
}

const MyDropzone: React.FC<MyDropzoneProps> = ({ onFileUploaded }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target !== null) {
            const fileContent = e.target.result as string;
            const gpxData = parseGPX(fileContent);
            onFileUploaded(gpxData);
          } else {
            console.error("FileReader onload event target was null");
          }
        };
        reader.readAsText(file);
      }
    },
    [onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
};

export default MyDropzone;
