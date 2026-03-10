import React, { useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";

// --- 1. SUB-COMPONENT: A single Analysis Card ---
const AnalysisCard = ({
  selectedAnalysis,
  setSelectedAnalysis,
  sessionId,
  columns,
}) => {
  // set the parameters values for selected analysis
  const [paramValues, setParamValues] = useState({});

  const handleParamChange = (instanceId, param, value) => {
    setParamValues((prev) => ({
      ...prev,
      [instanceId]: {
        ...prev[instanceId],
        [param]: value,
      },
    }));
  };

  const deleteAnalysis = (id) => {
    setSelectedAnalysis((prev) =>
      prev.filter((instance) => instance.id !== id),
    );
    // Optionally remove param values for this instance
    setParamValues((prev) => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
    //note: remove the analysis from backend too
  };

  const runAnalysis = async (instance) => {
    const selectedParams = paramValues[instance.id] || {};

    const payload = {
      sessionId: sessionId,
      action: instance.action,
      params: selectedParams,
    };
    const sectionsAPIPoints = {"Data Visualization" : "visualizer", "Statistical Tests" : "Stest", "Descriptive Analysis": "descriptive"}
    const apiEndPoint = sectionsAPIPoints[instance.section]
    try {
      console.log("sending to the backend: ", payload);

      const response = await axios.post(
        apiUrl(`/${apiEndPoint}`),
        payload,
      );
      console.log(response.data);
      const result = response.data.data;

      // store the result
      setSelectedAnalysis((prev) =>
        prev.map((item) =>
          item.id === instance.id ? { ...item, result: result } : item,
        ),
      );
    } catch (error) {
      console.error("an error occured: ", error);
    }
    console.log("the analysis is run and result is retrieved")
    console.log(selectedAnalysis);
  };
  return (
    <div className=" flex flex-col gap-3">
      {selectedAnalysis.map((instance) => (
        // <div className="flex justify-between">
        <div
          key={instance.id}
          className="bg-blue-50  p-4 rounded shadow relative hover:shadow-lg transition"
        >
          <button
            onClick={() => deleteAnalysis(instance.id)}
            className="absolute top-2 right-2 text-xl text-red-500 hover:text-red-700 font-bold"
          >
            &times;
          </button>

          <h5 className="font-semibold text-blue-700">{instance.name}</h5>
          {/* show all the parameters needed as input */}
          {instance.params.map((param, index) => (
            <div key={index} className="mb-2">
              <label className="block text-gray-700">{instance.parametersNames[index]}</label>
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

          {/* for each instance */}
          <button  className="bg-blue-500 text-white p-1 rounded-lg hover:bg-blue-700 transition" onClick={() => runAnalysis(instance)}>Run Analysis</button>

          {/* if result is available show it */}
          {instance.result && (
            <div className="mt-4 p-3 bg-white border border-blue-200 rounded shadow-sm">
              {/* <h6 className="text-sm font-bold text-gray-700 mb-2">
                Analysis Result:
              </h6> */}

              {typeof instance.result.saved_path === "string" &&
              instance.result.saved_path.includes(".png") ? (
                <div className="flex justify-center">
                <img
                  src={apiUrl(`/static_plots/${instance.result.saved_path.split(/[\\/]/).pop()}`)}
                  alt="Analysis Plot"
                  className="w-full sm:w-64 md:w-80 h-auto rounded"
                />
                </div>
              ) : (
                <pre className="text-xs text-gray-800 bg-gray-50 p-2 overflow-x-auto">
                  {JSON.stringify(instance.result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      // </div>
    ))}
    </div>
  );
};

export default AnalysisCard;
