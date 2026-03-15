import React from "react";

const Navbar = ({
  steps = [],
  currentStep = 1,
  mode = "workspace",
  onNavigateHome,
  onNavigateWorkspace,
}) => {
  const isLanding = mode === "landing";

  return (
    <div className="top-nav">
      <button
        type="button"
        className={`brand-block brand-link ${isLanding ? "is-static" : ""}`}
        onClick={isLanding ? undefined : onNavigateHome}
        disabled={isLanding || !onNavigateHome}
      >
        <p className="brand-name">StatisLab</p>
        <p className="brand-subtitle">Data Workflow Studio</p>
      </button>

      {isLanding ? (
        <div className="nav-cta-wrap">
          <button type="button" className="brand-button" onClick={onNavigateWorkspace}>
            Open Workspace
          </button>
        </div>
      ) : (
        <div className="stepper-wrap" aria-label="Workflow Steps">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className={`step-pill ${currentStep >= step.number ? "active" : ""}`}>
                <span>{step.number}</span>
              </div>
            </div>
          ))}
          <button type="button" className="ghost-button nav-home-button" onClick={onNavigateHome}>
            Landing Page
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
