import React, { useRef, useState } from "react";

import axios from "axios";

export default function UploadStep() {
  // choosing file
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  // drag and drop
  const[isDragging, setIsDragging] = useState(false)
  
  const handleFileSelect = (selectedFile)=>{
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      alert("Only CSV files are allowed");
      return;
    }

    setFile(selectedFile);

  }
  const handleDrop= (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }

  const handleBrowse = ()=>{
    inputRef.current.click();
  }

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first");
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:8000/upload", formData);
      setStats(response.data);
    } catch (error) {
      console.error(error);
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="uploader">
        <h4>Upload Your Data</h4>
        upload a CSV file to create a new Analysis job
        {/* drag  and drop*/}
        <div className="dragDropUploader"
        onDragOver={(e)=> {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={()=>{
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        >drag and drop CSV or <span className="browseLink" onClick={handleBrowse}
       >click to browse</span>
        <input
          type="file"
          accept=".csv"
          style={{display: "none"}} // hide the actual element
          ref = {inputRef}
          onChange={(e) => setFile(e.target.files[0])}
        />
        </div>
        <button onClick={handleUpload} disabled={loading}>
          Upload
        </button>
        {/* {loading ? "uploading..." : "upload"} */}
      </div>

      {stats && (
        <div className="result">
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
