import './App.css';
import Navbar from "./components/Navbar.js"
import UploadStep from "./UploadStep.js"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar></Navbar>
      </header>
      <main>
        <UploadStep/>
      </main>
    </div>
  );
}

export default App;
