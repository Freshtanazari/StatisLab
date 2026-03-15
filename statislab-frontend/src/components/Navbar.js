import React from "react";

const Navbar = ({ steps = [], currentStep = 1 }) => {
  return (
    <div className="top-nav">
      <div className="brand-block">
        <p className="brand-name">StatisLab</p>
        <p className="brand-subtitle">Data Workflow Studio</p>
      </div>

      <div className="stepper-wrap" aria-label="Workflow Steps">
        {steps.map((step, index) => (
          <div key={index} className="step-item">
            <div className={`step-pill ${currentStep >= step.number ? "active" : ""}`}>
              <span>{step.number}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
