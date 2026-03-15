import './App.css';
import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar.js";
import LandingPage from "./components/LandingPage.js";
import UploadStep from "./UploadStep.js";
import Preview from "./Preview.js";
import Processing from "./Processing.js";
import Analysis from "./Analysis.js";
import Report from "./Report.js";

const STEPS = [
  { number: 1, label: "Upload", hint: "Bring your CSV into the lab." },
  { number: 2, label: "Preview", hint: "Check rows, columns, and types." },
  { number: 3, label: "Process", hint: "Clean and transform your data." },
  { number: 4, label: "Analyze", hint: "Run tests and visual analytics." },
  { number: 5, label: "Report", hint: "Summarize what you discovered." },
];

const getViewFromHash = () => (window.location.hash === "#/app" ? "workspace" : "landing");

function App() {
  const [data, setData] = useState(null);
  const [step, setStep] = useState(1);
  const [columns, setColumns] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [analysisBoxes, setAnalysisBoxes] = useState([]);
  const [view, setView] = useState(getViewFromHash);

  const openWorkspace = () => {
    window.location.hash = "/app";
  };

  const openLandingPage = () => {
    window.location.hash = "/";
  };

  const displayNextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const displayPreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled =
    (step === 1 && !data) ||
    (step === 2 && (!columns || columns.length === 0));

  useEffect(() => {
    if (!sessionId) {
      setAnalysisBoxes([]);
      return;
    }

    const storageKey = `analysis-boxes:${sessionId}`;

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) {
        setAnalysisBoxes([]);
        return;
      }

      const parsed = JSON.parse(stored);
      setAnalysisBoxes(Array.isArray(parsed) ? parsed : []);
    } catch {
      setAnalysisBoxes([]);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const storageKey = `analysis-boxes:${sessionId}`;
    sessionStorage.setItem(storageKey, JSON.stringify(analysisBoxes));
  }, [analysisBoxes, sessionId]);

  useEffect(() => {
    const onHashChange = () => {
      setView(getViewFromHash());
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (view !== "workspace") {
        return;
      }

      const tagName = event.target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        event.target?.isContentEditable;

      if (isTypingTarget) {
        return;
      }

      if (event.key === "ArrowLeft" && step > 1) {
        event.preventDefault();
        setStep((current) => (current > 1 ? current - 1 : current));
      }

      if (event.key === "ArrowRight" && step < 5 && !isNextDisabled) {
        event.preventDefault();
        setStep((current) => (current < 5 ? current + 1 : current));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step, isNextDisabled, view]);

  const activeStepMeta = STEPS.find((item) => item.number === step);
  const progress = (step / STEPS.length) * 100;

  const renderStep = () => {
    if (step === 1) return <UploadStep setData={setData} setSessionId={setSessionId} />;
    if (step === 2) return <Preview data={data} setColumns={setColumns} />;
    if (step === 3) return <Processing data={data} setColumns={setColumns} />;
    if (step === 4) {
      return (
        <Analysis
          columns={columns}
          dataset={data}
          sessionId={sessionId}
          selectedAnalysis={analysisBoxes}
          setSelectedAnalysis={setAnalysisBoxes}
        />
      );
    }
    return <Report sessionId={sessionId} />;
  };

  if (view === "landing") {
    return (
      <div className="app-shell marketing-shell">
        <Navbar mode="landing" onNavigateWorkspace={openWorkspace} />
        <LandingPage steps={STEPS} onEnterWorkspace={openWorkspace} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Navbar
          steps={STEPS}
          currentStep={step}
          mode="workspace"
          onNavigateHome={openLandingPage}
        />
      </header>

      <main className="app-main">
        <section className="stage-intro">
          <div>
            <p className="stage-eyebrow">Step {step} of {STEPS.length}</p>
            <h1 className="stage-title">{activeStepMeta?.label}</h1>
            <p className="stage-hint">{activeStepMeta?.hint}</p>
          </div>
          <div className="progress-wrap" aria-label="Progress">
            <div className="progress-track">
              <span className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="stage-surface">
          <div key={step} className="stage-transition">
            {renderStep()}
          </div>
        </section>

        <div className="nav-actions">
          {step > 1 && (
            <button
              onClick={displayPreviousStep}
              className="ghost-button"
            >
              Back (←)
            </button>
          )}

          {step < 5 && (
            <button
              onClick={displayNextStep}
              disabled={isNextDisabled}
              className="brand-button ml-auto"
            >
              Next (→)
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
