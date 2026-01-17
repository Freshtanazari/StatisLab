import './App.css';
import Navbar from "./components/Navbar.js";
import UploadStep from "./UploadStep.js";
import Preview from "./Preview.js";
import Processing from "./Processing.js"
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

      </main>
    </div>
  );
}

export default App;
