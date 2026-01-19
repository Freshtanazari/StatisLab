import './App.css';
import React, {useState} from "react";
// import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "./components/Navbar.js";
import UploadStep from "./UploadStep.js";
import Preview from "./Preview.js";
import Processing from "./Processing.js"
import Analysis from "./Analysis.js";
import Report from "./Report.js";
function App() {
  let [data, setData] = useState(null);
  let [processingData, setProcessingData] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <Navbar/>
      </header>
      <main>
        <UploadStep setData={setData}/>
        {data && <Preview data={data}/>}
        {/* <Processing/> */}
        {/* <Analysis/> */}
        {/* <Report/> */}

      </main>
    </div>
  );
}

export default App;
