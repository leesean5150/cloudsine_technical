import React, { useState, ChangeEvent } from "react";

import "./FileUpload.css";


interface FileUploadProps {
  onFileSelect: (file: File) => void;
  handleUploadClick: () => void;
  handleSaveFile: () => void;
  isPostRequestError: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, handleUploadClick, isPostRequestError, handleSaveFile }) => {
  const MAX_FILE_SIZE = 0.5 * 1024 * 1024;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage("File size exceeds the 0.5MB limit.");
        setSelectedFile(null);
        return;
      }
      setErrorMessage("");
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-card">
        <h2>File Upload</h2>
        <input type="file" accept=".js" onChange={handleFileChange} />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="button-row">
          <button
            onClick={handleUploadClick}
            disabled={!selectedFile || isPostRequestError}
            className="upload-button"
          >
            Upload
          </button>
          <button onClick={handleSaveFile}>
            <span className="save-icon" title="Save">&#128190;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
