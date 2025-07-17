import React, { useRef, useState } from 'react';
import { allowedScormUserIds } from "@/data/allowedScormUsers";
import { currentUserId } from "@/data/currentUser";

const ScormPage = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    // Here you would handle the upload logic
  };

  const isAllowed = allowedScormUserIds.includes(currentUserId);

  return (
    <div style={{ padding: 24 }}>
      <h1>SCORM Content Management</h1>
      <p>This page is only accessible to specific users.</p>
      {isAllowed && (
        <>
          <button
            onClick={handleButtonClick}
            style={{ marginTop: 16, padding: 10, background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Add SCORM
          </button>
          <input
            type="file"
            accept=".zip"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {selectedFile && (
            <div style={{ marginTop: 16 }}>
              <strong>Selected file:</strong> {selectedFile.name}
            </div>
          )}
        </>
      )}
      {/* Add SCORM upload/management UI here */}
    </div>
  );
};

export default ScormPage; 