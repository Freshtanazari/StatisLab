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
  };

  const isVisualizationAnalysis = (instance) =>
    instance?.section === "Data Visualization";

  const groupedAnalysis = [];
  for (let i = 0; i < selectedAnalysis.length; i += 1) {
    const current = selectedAnalysis[i];
    const next = selectedAnalysis[i + 1];

    if (isVisualizationAnalysis(current) && isVisualizationAnalysis(next)) {
      groupedAnalysis.push([current, next]);
      i += 1;
    } else {
      groupedAnalysis.push([current]);
    }
  }

  const getCardClassName = (instance) => {
    const base = "bg-teal-50 rounded shadow relative hover:shadow-lg transition";
    if (isVisualizationAnalysis(instance)) {
      return `${base} px-2.5 py-1.5`;
    }
    return `${base} px-4 py-3`;
  };

  return (
    <div className=" flex flex-col gap-3">
      {groupedAnalysis.map((group, groupIndex) => (
        <div
          key={`analysis-group-${groupIndex}`}
          className={group.length === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-3" : ""}
        >
          {group.map((instance) => (
            <div
              key={instance.id}
              className={getCardClassName(instance)}
            >
              <button
                onClick={() => deleteAnalysis(instance.id)}
                className="absolute top-2 right-2 text-xl text-red-500 hover:text-red-700 font-bold"
              >
                &times;
              </button>

              <h5 className={`font-semibold text-teal-800 ${isVisualizationAnalysis(instance) ? "text-sm pr-6" : "pr-6"}`}>
                {instance.name}
              </h5>
              {/* show all the parameters needed as input */}
              {instance.params.map((param, index) => (
                <div key={index} className={isVisualizationAnalysis(instance) ? "mb-1.5" : "mb-2"}>
                  {(() => {
                    const allowedColumns = getAllowedColumns(instance, param);
                    return (
                      <>
                  <label className={`block text-gray-700 ${isVisualizationAnalysis(instance) ? "text-xs" : ""}`}>
                    {instance.parametersNames[index]}
                  </label>
                  <select
                    value={paramValues[instance.id]?.[param] || ""}
                    onChange={(e) =>
                      handleParamChange(instance.id, param, e.target.value)
                    }
                    className={`mt-1 block w-full border-gray-300 rounded ${isVisualizationAnalysis(instance) ? "text-xs py-1" : ""}`}
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
                className={` bg-teal-700 text-white rounded-md hover:bg-teal-800 transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  isVisualizationAnalysis(instance) ? "px-2 py-1 text-xs" : "px-2.5 py-1 text-sm"
                }`}
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
                <div className={isVisualizationAnalysis(instance) ? "mt-2" : "mt-4"}>
                  <p className={`uppercase tracking-wide text-slate-500 ${isVisualizationAnalysis(instance) ? "text-[10px] mb-1" : "text-xs mb-2"}`}>
                    Latest Result
                  </p>
                  <ResultRenderer result={instance.result} sessionId={sessionId} />
                </div>
              )}
            </div>
          ))}
        </div>
    ))}
    </div>
  );
};

export default AnalysisCard;
