import React, { useRef, useState } from "react";
import axios from "axios";
import { apiUrl } from "./config/api";

export default function UploadStep({ setData, setSessionId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      alert("Only CSV files are allowed");
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
      const response = await axios.post(apiUrl("/upload"), formData);
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
    <div className="flex justify-center items-center  bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-semibold mb-2 text-gray-800">Upload Your Data</h4>
        <p className="text-gray-600 mb-4">
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
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
          }`}
        >
          Drag and drop CSV or{" "}
          <span
            className="text-blue-500 underline cursor-pointer"
            onClick={handleBrowse}
          >
            click to browse
          </span>
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            ref={inputRef}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
        <p className="text-gray-500 text-sm mt-2">Supported files: only CSV files</p>
      </div>
    </div>
  );
}
