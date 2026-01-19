import React, { useRef, useState } from "react";
import axios from "axios";



export default function UploadStep({setData}) {
  // choosing file
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [valid, setValid] = useState(false);
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
      setData(response.data);
      setValid(true);
    } catch (error) {
      let message = "Error uploading file";
      if(error.response){
            // Server responded with a status code outside 2xx
    message = `Server Error: ${error.response.status} - ${error.response.data?.detail || error.response.data || error.message}`;
      }
      if(error.request){
        // request was made but no reponse recieved
        message = "no response from server. please check you connection";
      }else{
         // Something else went wrong in setting up the request
      message = `Request Error: ${error.message}`;
      }

      console.error(error);
      alert(message);

    } finally {
      setLoading(false);
    }
  };

  // navigating to inspect page
 
  return (
    <div className="screens">
      <div className="uploader ">
        <h4>Upload Your Data</h4>
        <p>upload a CSV file to create a new Analysis job</p>

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

        {/* button */}

        <button onClick={handleUpload} disabled={loading} className="btn btn-primary">
          Upload
        </button>
        supported files: only CSV files

      </div>
    </div>

      // {stats && (
      //   <div className="result">
      //     <pre>{JSON.stringify(stats, null, 2)}</pre>
      //   </div>
      // )}
  );
}
