import { useState } from "react";

import analysisData from "./analysisData.json";
import AnalysisCard from "./components/AnalysisCard";
import { resetReportItems } from "./services/reportAPI";


const Analysis = ({ columns, dataset, sessionId, selectedAnalysis, setSelectedAnalysis }) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [resetState, setResetState] = useState({ loading: false, error: "" });
  const allAnalysis = analysisData;
  const sections = [...new Set(allAnalysis.map((instance) => instance.section))];
  const [activeSection, setActiveSection] = useState(sections[0] || "");



  // handle if no columns avialable
  if (!columns || columns.length === 0) {
    return <p className="text-gray-500 italic">No columns available</p>;
  }

  // list instances of each section
  function groupInstance(section) {
    return allAnalysis.filter(function (instance) {
      return instance.section === section;
    });
  }

  const filteredInstances = groupInstance(activeSection).filter((instance) =>
    instance.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addAnalysis = (instance) => {
    setSelectedAnalysis((prev) => {
      const alreadySelected = prev.some((item) => item.action === instance.action);
      if (alreadySelected) {
        return prev;
      }

      return [
        ...prev,
        {
          ...instance,
          id: `${instance.action}-${Date.now()}`,
        },
      ];
    });
  };

  const removeSelectedAnalysis = (instanceId) => {
    setSelectedAnalysis((prev) => prev.filter((item) => item.id !== instanceId));
  };

  const setAnalysisResult = (instanceId, result) => {
    setSelectedAnalysis((prev) =>
      prev.map((item) =>
        item.id === instanceId ? { ...item, result } : item,
      ),
    );
  };

  const handleResetAnalysis = async () => {
    if (!sessionId || resetState.loading) {
      return;
    }

    const confirmed = window.confirm(
      "This will remove all analysis boxes and previous report results for this session. Continue?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setResetState({ loading: true, error: "" });
      await resetReportItems(sessionId);
      setSelectedAnalysis([]);
      setResetState({ loading: false, error: "" });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset analysis state.";
      setResetState({ loading: false, error: errorMessage });
    }
  };

  return (
    <div className="screen-shell flex flex-col xl:flex-row gap-4">
      {/* Control Panel */}
      <div className="w-full xl:w-72 panel-block p-3 overflow-y-auto text-sm">
        <h4 className="text-sm font-semibold mb-1 text-slate-800">Analysis Tools</h4>
        <p className="text-[11px] text-slate-500 mb-3">Compact toolbox view</p>

        <div className="mb-2">
          <label className="text-[11px] text-slate-600 mb-1">Section</label>
          <select
            value={activeSection}
            onChange={(e) => {
              setActiveSection(e.target.value);
              setSearchTerm("");
            }}
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
          >
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search methods..."
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="space-y-1.5">
          {filteredInstances.map((instance) => (
            <button
              key={instance.name}
              type="button"
              onClick={() => addAnalysis(instance)}
              className="w-full text-left px-2.5 py-2 rounded border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <p className="text-sm font-medium text-slate-800 leading-snug">{instance.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {instance.params?.length > 0
                  ? `${instance.params.length} parameter(s) required`
                  : "No parameters"}
              </p>
            </button>
          ))}

          {filteredInstances.length === 0 && (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-[11px] text-slate-500">
              No methods matched your search.
            </div>
          )}
        </div>
      </div>

      {/* Analysis Lab */}
      <div className="flex-1 panel-block p-6 overflow-y-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h4 className="text-lg font-semibold text-slate-800">Analysis Lab</h4>
          <button
            type="button"
            onClick={handleResetAnalysis}
            disabled={resetState.loading || !sessionId}
            className="ghost-button text-red-700 border-red-200 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resetState.loading ? "Resetting..." : "Reset Analysis"}
          </button>
        </div>

        {resetState.error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {resetState.error}
          </div>
        )}

        <AnalysisCard
          selectedAnalysis={selectedAnalysis}
          sessionId={sessionId}
          columns={columns}
          dataTypes={dataset?.dataTypes || {}}
          onRemoveAnalysis={removeSelectedAnalysis}
          onAnalysisResult={setAnalysisResult}
        />
      </div>
    </div>
  );
};

export default Analysis;
