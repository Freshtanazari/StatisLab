import React, { useRef, useState } from "react";
import axios from "axios";
import { apiUrl, API_REQUEST_CONFIG } from "./config/api";

const MAX_CSV_SIZE_BYTES = Number(process.env.REACT_APP_MAX_CSV_SIZE_BYTES || 10 * 1024 * 1024);

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${bytes} bytes`;
}

export default function UploadStep({ setData, setSessionId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setFile(null);
      alert("Only CSV files are allowed");
      return;
    }

    if (selectedFile.size > MAX_CSV_SIZE_BYTES) {
      setFile(null);
      alert(`File is too large. Maximum allowed size is ${formatFileSize(MAX_CSV_SIZE_BYTES)}.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleBrowse = () => {
    inputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first");
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const response = await axios.post(apiUrl("/upload"), formData, API_REQUEST_CONFIG);
      setData(response.data);
      setSessionId(response.data.sessionId)
    } catch (error) {
      let message = "Error uploading file";
      if (error.response) {
        message = `Server Error: ${error.response.status} - ${
          error.response.data?.detail || error.response.data || error.message
        }`;
      }
      if (error.request) {
        message = "No response from server. Please check your connection";
      } else {
        message = `Request Error: ${error.message}`;
      }

      console.error(error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-shell">
      <div className="panel-block w-full max-w-2xl mx-auto p-8">
        <h4 className="text-2xl font-semibold mb-2 text-slate-800">Upload Your Data</h4>
        <p className="muted-help mb-5">
          Upload a CSV file to create a new Analysis job
        </p>

        {/* drag and drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-slate-50"
          }`}
        >
          <p className="text-slate-700 font-medium">
            Drag and drop CSV or{" "}
          </p>
          <span
            className="text-teal-700 underline cursor-pointer"
            onClick={handleBrowse}
          >
            click to browse
          </span>
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            ref={inputRef}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          {file && (
            <p className="mt-3 text-sm text-slate-600">
              Selected: <span className="font-semibold">{file.name}</span>
            </p>
          )}
        </div>

        {/* button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`mt-5 w-full py-2 px-3 rounded-md text-sm font-medium text-white transition ${
            loading ? "bg-slate-400 cursor-not-allowed" : "bg-teal-700 hover:bg-teal-800"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        <p className="muted-help mt-3">
          Supported files: CSV only, up to {formatFileSize(MAX_CSV_SIZE_BYTES)}
        </p>
      </div>
    </div>
  );
}
