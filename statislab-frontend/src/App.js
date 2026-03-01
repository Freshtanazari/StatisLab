import './App.css';
import React, { useState } from "react";
import Navbar from "./components/Navbar.js";
import UploadStep from "./UploadStep.js";
import Preview from "./Preview.js";
import Processing from "./Processing.js";
import Analysis from "./Analysis.js";
import Report from "./Report.js";

function App() {
  const [data, setData] = useState(null);
  const [step, setStep] = useState(1);
  const [columns, setColumns] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const displayNextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const displayPreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="App min-h-screen flex flex-col">
      <header className="App-header">
        <Navbar />
      </header>

      <main className="flex-1 py-3">
        {step === 1 && <UploadStep setData={setData} setSessionId = {setSessionId} />}
        {step === 2 && <Preview data={data} setColumns={setColumns}/>}
        {step === 3 && <Processing data ={data} />}
        {step === 4 && <Analysis  columns = {columns} dataset = {data} sessionId = {sessionId}/>}
        {step === 5 && <Report />}

        {/* Navigation buttons */}
        <div className="flex">
          {step > 1 && (
            <button
              onClick={displayPreviousStep}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mr-auto"
            >
              Back
            </button>
          )}

          {step < 5 && (
            <button
              onClick={displayNextStep}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ml-auto"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
