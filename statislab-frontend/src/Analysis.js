import React, { useState } from "react";
import analysisData from "./analysisData.json";

const Analysis = ({ columns }) => {
  const [analysisInstances, setAnalysisInstances] = useState([]);
  const [paramValues, setParamValues] = useState({});
  const data = analysisData;
  const sections = [...new Set(data.map((item) => item.section))];

  if (!columns || columns.length === 0) {
    return <p className="text-gray-500 italic">No columns available</p>;
  }

  const handleParamChange = (instanceId, param, value) => {
    setParamValues((prev) => ({
      ...prev,
      [instanceId]: {
        ...prev[instanceId],
        [param]: value,
      },
    }));
  };

  const listSteps = (section) => data.filter((item) => item.section === section);

  const addAnalysis = (step) => {
    setAnalysisInstances((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        step: step.step,
        params: step.params || [],
      },
    ]);
  };

  const deleteAnalysis = (id) => {
    setAnalysisInstances((prev) => prev.filter((instance) => instance.id !== id));
    // Optionally remove param values for this instance
    setParamValues((prev) => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-6 gap-6">
      {/* Control Panel */}
      <div className="w-1/3 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
        <h4 className="text-lg font-semibold mb-4">Control Panel</h4>
        <p className="text-gray-600 mb-4">Configure your analysis settings</p>
        {sections.map((section) => (
          <fieldset key={section} className="mb-4 border border-gray-200 rounded p-3">
            <legend className="font-semibold text-gray-700">{section}</legend>
            <div className="flex flex-col mt-2 gap-2">
              {listSteps(section).map((step) => (
                <button
                  key={step.step}
                  onClick={() => addAnalysis(step)}
                  className="text-left px-2 py-1 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
                >
                  {step.step}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Analysis Lab */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
        <h4 className="text-lg font-semibold mb-4">Analysis Lab</h4>
        <p className="text-gray-600 mb-4">
          Your analysis results will be displayed here
        </p>

        <div className="flex flex-col gap-4">
          {analysisInstances.map((instance) => (
            <div
              key={instance.id}
              className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded shadow relative hover:shadow-lg transition"
            >
              <button
                onClick={() => deleteAnalysis(instance.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
              >
                &times;
              </button>
              <h5 className="font-semibold text-blue-700">{instance.step}</h5>
              <p className="text-gray-600 text-sm mt-1">
                Analysis content for <strong>{instance.step}</strong> will appear here.
              </p>
              <p>Enter the required parameters</p>

              {instance.params.map((param, index) => (
                <div key={index} className="mb-2">
                  <label className="block text-gray-700">{param}</label>
                  <select
                    value={paramValues[instance.id]?.[param] || ""}
                    onChange={(e) =>
                      handleParamChange(instance.id, param, e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded"
                  >
                    <option value="">Select column</option>
                    {columns.map((column, i) => (
                      <option key={i} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analysis;