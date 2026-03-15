import React, { useState } from "react";
import axios from "axios";
import { apiUrl, API_REQUEST_CONFIG } from "../config/api";
import ResultRenderer from "./ResultRenderer";

const AnalysisCard = ({
  selectedAnalysis,
  onRemoveAnalysis,
  onAnalysisResult,
  sessionId,
  columns,
  dataTypes,
}) => {
  // set the parameters values for selected analysis
  const [paramValues, setParamValues] = useState({});
  const [runState, setRunState] = useState({});

  const columnTypeMap = dataTypes || {};

  const isNumericColumn = (columnName) => {
    const dtype = String(columnTypeMap[columnName] || "").toLowerCase();
    return /int|float|double|number|decimal|numeric|long|short|byte/.test(dtype);
  };

  const isCategoricalColumn = (columnName) => {
    const dtype = String(columnTypeMap[columnName] || "").toLowerCase();
    return /object|string|category|bool/.test(dtype) || !isNumericColumn(columnName);
  };

  const getRequiredColumnKind = (instance, param) => {
    const action = instance.action;

    if (["histogram", "boxplot", "kde", "numerical_distribution", "get_summary_statistics"].includes(action)) {
      return "numeric";
    }

    if (["barplot", "pieChart", "categorical_distribution", "ChiSquareTest"].includes(action)) {
      return "categorical";
    }

    if (["scatterplot", "lineplot", "WilcoxonSignedRankTest", "PairedTTest"].includes(action)) {
      return "numeric";
    }

    if (["IndependentTTest", "MannWhitneyUTest", "OneWayANOVA"].includes(action)) {
      if (param === "valueCol") return "numeric";
      if (param === "groupCol") return "categorical";
    }

    if (action === "violinplot") {
      if (param === "numericCol") return "numeric";
      if (param === "categoricCol") return "categorical";
    }

    if (instance.section === "Data Visualization") {
      if (["xcol", "ycol", "numericCol", "valueCol"].includes(param)) return "numeric";
      if (["categoricCol", "groupCol"].includes(param)) return "categorical";
    }

    return "any";
  };

  const getAllowedColumns = (instance, param) => {
    const neededKind = getRequiredColumnKind(instance, param);

    let filtered = columns;
    if (neededKind === "numeric") {
      filtered = columns.filter(isNumericColumn);
    } else if (neededKind === "categorical") {
      filtered = columns.filter(isCategoricalColumn);
    }

    // For paired inputs, avoid selecting the same column twice.
    const currentParams = paramValues[instance.id] || {};
    const usedCols = Object.entries(currentParams)
      .filter(([key, value]) => key !== param && value)
      .map(([, value]) => value);

    return filtered.filter((col) => !usedCols.includes(col));
  };

  const handleParamChange = (instanceId, param, value) => {
    setParamValues((prev) => ({
      ...prev,
      [instanceId]: {
        ...prev[instanceId],
        [param]: value,
      },
    }));  };

  const deleteAnalysis = (id) => {
    setParamValues((prev) => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });

    if (typeof onRemoveAnalysis === "function") {
      onRemoveAnalysis(id);
    }
  };

  const runAnalysis = async (instance) => {
    const selectedParams = paramValues[instance.id] || {};
    setRunState((prev) => ({
      ...prev,
      [instance.id]: { loading: true, error: null },
    }));

    const payload = {
      sessionId: sessionId,
      action: instance.action,
      params: selectedParams,
      name: instance.name,
      section: instance.section,
      parametersNames: instance.parametersNames || [],
    };
    const sectionsAPIPoints = {"Data Visualization" : "visualizer", "Statistical Tests" : "Stest", "Descriptive Analysis": "descriptive"}
    const apiEndPoint = sectionsAPIPoints[instance.section]
    try {
      console.log("sending to the backend: ", payload);

      const response = await axios.post(
        apiUrl(`/${apiEndPoint}`),
        payload,
        API_REQUEST_CONFIG,
      );
      const result = response.data.data;

      if (result && typeof onAnalysisResult === "function") {
        onAnalysisResult(instance.id, result);
      }

      setRunState((prev) => ({
        ...prev,
        [instance.id]: { loading: false, error: null },
      }));
    } catch (error) {
      console.error("an error occured: ", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to run analysis.";
      setRunState((prev) => ({
        ...prev,
        [instance.id]: { loading: false, error: errorMessage },
      }));
    }
    console.log("the analysis is run and result is retrieved")
    console.log(selectedAnalysis);
  };
  return (
    <div className=" flex flex-col gap-3">
      {selectedAnalysis.map((instance) => (
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
              {(() => {
                const allowedColumns = getAllowedColumns(instance, param);
                return (
                  <>
              <label className="block text-gray-700">{instance.parametersNames[index]}</label>
              <select
                value={paramValues[instance.id]?.[param] || ""}
                onChange={(e) =>
                  handleParamChange(instance.id, param, e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded"
                disabled={allowedColumns.length === 0}
              >
                <option value="">Select column</option>
                {allowedColumns.map((column, i) => (
                  <option key={i} value={column}>
                    {column}
                  </option>
                ))}
              </select>
              {allowedColumns.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  No valid columns found for this input type.
                </p>
              )}
                  </>
                );
              })()}
            </div>
          ))}

          {/* for each instance */}
          <button
            className="bg-blue-500 text-white px-2.5 py-1 rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => runAnalysis(instance)}
            disabled={runState[instance.id]?.loading}
          >
            {runState[instance.id]?.loading ? "Analyzing..." : "Run Analysis"}
          </button>

          {runState[instance.id]?.error && (
            <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {runState[instance.id]?.error}
            </div>
          )}

          {instance.result && (
            <div className="mt-4 p-3 bg-white border border-blue-200 rounded shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Latest Result</p>
              <ResultRenderer result={instance.result} />
            </div>
          )}
        </div>
    ))}
    </div>
  );
};

export default AnalysisCard;
