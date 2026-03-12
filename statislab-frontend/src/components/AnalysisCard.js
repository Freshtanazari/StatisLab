import React, { useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";

const IMAGE_KEYS = ["saved_path", "plot_path", "image", "image_path"];
const HIGHLIGHT_KEYS = [
  "test",
  "statistic",
  "p_value",
  "mean",
  "median",
  "std",
  "count",
  "n",
  "missing",
];
const COMPACT_LIMIT = 8;
const EXPANDED_LIMIT = 30;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const toTitle = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return String(value);
    }
    return Number.isInteger(value) ? value.toString() : value.toFixed(4);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
};

const getImageFileName = (result) => {
  if (!isPlainObject(result)) {
    return null;
  }
  const imagePathValue = IMAGE_KEYS.map((key) => result[key]).find(
    (value) => typeof value === "string" && /\.(png|jpg|jpeg|svg)$/i.test(value),
  );

  if (!imagePathValue) {
    return null;
  }
  return imagePathValue.split(/[\\/]/).pop();
};

const getPValueStatus = (value) => {
  if (typeof value !== "number") {
    return null;
  }
  if (value < 0.05) {
    return {
      label: "Significant",
      chipClass: "bg-green-100 text-green-700 border-green-200",
      valueClass: "text-green-700",
    };
  }
  return {
    label: "Not Significant",
    chipClass: "bg-amber-100 text-amber-700 border-amber-200",
    valueClass: "text-amber-700",
  };
};

const ResultSection = ({ title, children }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
      {title}
    </p>
    {children}
  </div>
);

const ResultRenderer = ({ result }) => {
  const [showRaw, setShowRaw] = useState(false);
  const [compactMode, setCompactMode] = useState(true);

  if (!isPlainObject(result)) {
    return (
      <div className="text-sm text-gray-700">{formatValue(result)}</div>
    );
  }

  const imageFileName = getImageFileName(result);
  const primitiveEntries = Object.entries(result).filter(
    ([key, value]) =>
      !IMAGE_KEYS.includes(key) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"),
  );
  const nestedObjectEntries = Object.entries(result).filter(
    ([, value]) => isPlainObject(value),
  );
  const arrayEntries = Object.entries(result).filter(([, value]) =>
    Array.isArray(value),
  );

  const highlights = HIGHLIGHT_KEYS.filter((key) =>
    primitiveEntries.some(([entryKey]) => entryKey === key),
  ).map((key) => [key, result[key]]);

  const insightEntries = Object.entries(result).filter(
    ([key, value]) =>
      /insight|interpret|conclusion|recommend|note|message/i.test(key) &&
      (typeof value === "string" || Array.isArray(value)),
  );

  const detailEntries = compactMode
    ? primitiveEntries.slice(0, COMPACT_LIMIT)
    : primitiveEntries;

  const nestedSections = nestedObjectEntries.map(([sectionKey, sectionValue]) => [
    sectionKey,
    compactMode
      ? Object.entries(sectionValue).slice(0, COMPACT_LIMIT)
      : Object.entries(sectionValue),
    Object.entries(sectionValue).length,
  ]);

  const arrayItemLimit = compactMode ? COMPACT_LIMIT : EXPANDED_LIMIT;

  return (
    <div className="space-y-4">
      {(primitiveEntries.length > COMPACT_LIMIT ||
        nestedObjectEntries.some(([, value]) => Object.keys(value).length > COMPACT_LIMIT) ||
        arrayEntries.some(([, value]) => value.length > COMPACT_LIMIT)) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setCompactMode((prev) => !prev)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {compactMode ? "Show full result" : "Use compact view"}
          </button>
        </div>
      )}

      {highlights.length > 0 && (
        <ResultSection title="Highlights">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {highlights.map(([key, value]) => {
              const pValueStatus = key === "p_value" ? getPValueStatus(value) : null;
              return (
                <div key={key} className="rounded border border-gray-200 bg-gray-50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-500">{toTitle(key)}</p>
                    {pValueStatus && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${pValueStatus.chipClass}`}
                      >
                        {pValueStatus.label}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      pValueStatus ? pValueStatus.valueClass : "text-gray-800"
                    }`}
                  >
                    {formatValue(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </ResultSection>
      )}

      {imageFileName && (
        <div className="flex justify-center rounded border border-blue-100 bg-blue-50 p-2">
          <img
            src={apiUrl(`/static_plots/${imageFileName}`)}
            alt="Analysis Plot"
            className="w-full sm:w-64 md:w-80 h-auto rounded"
          />
        </div>
      )}

      {primitiveEntries.length > 0 && (
        <ResultSection title="Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {detailEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between rounded border border-gray-100 p-2">
                <span className="text-sm text-gray-600">{toTitle(key)}</span>
                <span className="text-sm font-medium text-gray-800 text-right">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
          {compactMode && primitiveEntries.length > COMPACT_LIMIT && (
            <p className="text-[11px] text-gray-500 mt-2">
              Showing {COMPACT_LIMIT} of {primitiveEntries.length} detail fields.
            </p>
          )}
        </ResultSection>
      )}

      {nestedSections.map(([sectionKey, sectionEntries, totalCount]) => (
        <ResultSection key={sectionKey} title={toTitle(sectionKey)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sectionEntries.map(([key, value]) => (
              <div key={`${sectionKey}-${key}`} className="flex justify-between rounded border border-gray-100 p-2">
                <span className="text-sm text-gray-600">{toTitle(key)}</span>
                <span className="text-sm font-medium text-gray-800 text-right">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
          {compactMode && totalCount > COMPACT_LIMIT && (
            <p className="text-[11px] text-gray-500 mt-2">
              Showing {COMPACT_LIMIT} of {totalCount} fields.
            </p>
          )}
        </ResultSection>
      ))}

      {arrayEntries.map(([key, value]) => {
        const hasObjectRows = value.length > 0 && isPlainObject(value[0]);
        if (hasObjectRows) {
          const columns = Object.keys(value[0]);
          return (
            <ResultSection key={key} title={toTitle(key)}>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      {columns.map((column) => (
                        <th key={column} className="px-2 py-2 text-left text-gray-600 font-semibold">
                          {toTitle(column)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {value.slice(0, arrayItemLimit).map((row, rowIndex) => (
                      <tr key={`${key}-${rowIndex}`} className="border-t border-gray-100">
                        {columns.map((column) => (
                          <td key={`${key}-${rowIndex}-${column}`} className="px-2 py-1.5 text-gray-700">
                            {formatValue(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {value.length > arrayItemLimit && (
                <p className="text-[11px] text-gray-500 mt-2">
                  Showing {arrayItemLimit} of {value.length} rows.
                </p>
              )}
            </ResultSection>
          );
        }

        return (
          <ResultSection key={key} title={toTitle(key)}>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {value.slice(0, arrayItemLimit).map((item, index) => (
                <li key={`${key}-${index}`}>{formatValue(item)}</li>
              ))}
            </ul>
            {value.length > arrayItemLimit && (
              <p className="text-[11px] text-gray-500 mt-2">
                Showing {arrayItemLimit} of {value.length} items.
              </p>
            )}
          </ResultSection>
        );
      })}

      {insightEntries.length > 0 && (
        <ResultSection title="Insights">
          <div className="space-y-2">
            {insightEntries.map(([key, value]) => (
              <div key={key} className="rounded border-l-4 border-blue-300 bg-blue-50 p-2">
                <p className="text-[11px] uppercase tracking-wide text-blue-700 font-semibold mb-1">
                  {toTitle(key)}
                </p>
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {value.map((entry, index) => (
                      <li key={`${key}-${index}`}>{formatValue(entry)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-700">{formatValue(value)}</p>
                )}
              </div>
            ))}
          </div>
        </ResultSection>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowRaw((prev) => !prev)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showRaw ? "Hide raw JSON" : "Show raw JSON"}
        </button>
        {showRaw && (
          <pre className="mt-2 text-xs text-gray-800 bg-gray-50 p-2 overflow-x-auto rounded border border-gray-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

// --- 1. SUB-COMPONENT: A single Analysis Card ---
const AnalysisCard = ({
  selectedAnalysis,
  setSelectedAnalysis,
  sessionId,
  columns,
}) => {
  // set the parameters values for selected analysis
  const [paramValues, setParamValues] = useState({});
  const [runState, setRunState] = useState({});

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
    setRunState((prev) => ({
      ...prev,
      [instance.id]: { loading: true, error: null },
    }));

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
          <button
            className="bg-blue-500 text-white p-1 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
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

          {/* if result is available show it */}
          {instance.result && (
            <div className="mt-4 p-3 bg-white border border-blue-200 rounded shadow-sm">
              <ResultRenderer result={instance.result} />
            </div>
          )}
        </div>
      // </div>
    ))}
    </div>
  );
};

export default AnalysisCard;
