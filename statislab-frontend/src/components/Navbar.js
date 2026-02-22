import React from "react";

// Step component
const Step = ({ number, label, active }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center text-white transition-colors duration-300
          ${active ? "bg-green-500" : "bg-blue-500"}`}
      >
        {number}
      </div>
      <span>{label}</span>
    </div>
  );
};

// Navbar with steps
const Navbar = ({ steps, currentStep }) => {
  return (
    <div className="bg-white shadow-sm py-1 px-2 flex items-center justify-between">
      {/* App name */}
      <div className="text-sm font-semibold">StatisLab</div>

      {/* Step progress */}
      <div className="flex space-x-4 items-center">
        {steps.map((step, index) => (
          <Step
            key={index}
            number={step.number}
            label={step.label}
            active={currentStep >= step.number}
          />
        ))}
      </div>
    </div>
  );
};

// Example usage
export default function App() {
  const steps = [
    { number: 1, label: "Upload" },
    { number: 2, label: "Inspect" },
    { number: 3, label: "Process" },
    { number: 4, label: "Visualize" },
    { number: 5, label: "Report" },
  ];

  const currentStep = 2; // dynamically set based on user progress

  return <Navbar steps={steps} currentStep={currentStep} />;
}
