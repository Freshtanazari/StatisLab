import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from "./components/Navbar.js";
import UploadStep from "./UploadStep.js";
import Preview from "./Preview.js";
import Processing from "./Processing.js"
import Analysis from "./Analysis.js";
import Report from "./Report.js";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar/>
      </header>
      <main>
        <UploadStep/>
        <Preview/>
        <Processing/>
        <Analysis/>
        <Report/>

      </main>
    </div>
  );
}

export default App;
