import React, { useState } from "react";
import ResultRenderer from "./components/ResultRenderer";
import { useReports } from "./hooks/useReports";
import { deleteReportItem, reorderReportItem } from "./services/reportAPI";

const Report = ({ sessionId }) => {
  const { reports, loading, error, refreshReports } = useReports(sessionId);
  const [actionError, setActionError] = useState("");
  const [busyIndex, setBusyIndex] = useState(null);

  const exportReport = () => {
    window.print();
  };

  const handleDelete = async (index) => {
    if (!sessionId) return;
    try {
      setBusyIndex(index);
      setActionError("");
      await deleteReportItem(sessionId, index);
      await refreshReports();
    } catch (e) {
      setActionError(e?.message || "Failed to delete analysis.");
    } finally {
      setBusyIndex(null);
    }
  };

  const handleMove = async (fromIndex, toIndex) => {
    if (!sessionId || toIndex < 0 || toIndex >= reports.length) return;
    try {
      setBusyIndex(fromIndex);
      setActionError("");
      await reorderReportItem(sessionId, fromIndex, toIndex);
      await refreshReports();
    } catch (e) {
      setActionError(e?.message || "Failed to reorder analysis.");
    } finally {
      setBusyIndex(null);
    }
  };

  const isVisualizationReport = (reportItem) => {
    if (!reportItem || typeof reportItem !== "object") return false;
    if (reportItem.section === "Data Visualization") return true;

    const result = reportItem.result ?? reportItem;
    return Boolean(
      result &&
      typeof result === "object" &&
      (result.plot_url || result.saved_path || result.plot_name)
    );
  };

  const groupedReports = [];
  for (let i = 0; i < reports.length; i += 1) {
    const current = reports[i];
    const next = reports[i + 1];

    if (isVisualizationReport(current) && isVisualizationReport(next)) {
      groupedReports.push([
        { item: current, index: i },
        { item: next, index: i + 1 },
      ]);
      i += 1;
    } else {
      groupedReports.push([{ item: current, index: i }]);
    }
  }

  return (
    <div className="screen-shell reportScreen report-print-root">
      <div className="panel-block px-4 py-3 mb-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Analysis Report</h2>
            <p className="muted-help mt-1">{loading ? "Loading report..." : error ? "Report unavailable" : `${reports.length} analyses included`}</p>
          </div>
          {!loading && !error && reports.length > 0 && (
            <p className="text-xs text-slate-500">Compact view enabled for better page usage.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {loading && (
          <div className="panel-block px-4 py-3">
            <p className="text-slate-600">Loading report results from backend...</p>
          </div>
        )}

        {error && (
          <div className="panel-block px-4 py-3 border-l-4 border-l-red-500">
            <p className="text-red-700 font-medium">Failed to load report data</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {actionError && (
          <div className="panel-block px-4 py-3 border-l-4 border-l-red-500">
            <p className="text-red-700 font-medium">Action failed</p>
            <p className="text-red-600 text-sm mt-1">{actionError}</p>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="panel-block px-4 py-3 border-l-4 border-l-slate-300">
            <p className="text-slate-700">No analysis results found in backend for this session.</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="panel-block overflow-hidden">
            {groupedReports.map((group, groupIndex) => (
              <div key={`report-group-${groupIndex}`}>
                {groupIndex > 0 && <div className="border-t border-slate-200" />}
                <div className={`px-3 py-2 md:px-4 md:py-3 ${group.length === 2 ? "report-viz-pair-grid grid grid-cols-1 md:grid-cols-2 gap-4" : ""}`}>
                  {group.map(({ item: reportItem, index }) => (
                    <div key={`report-item-${index}`} className="report-analysis-item">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                              #{index + 1}
                            </span>
                            {reportItem?.section && (
                              <span className="rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-[11px] text-teal-700">
                                {reportItem.section}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-800 leading-tight">
                            {reportItem?.name || reportItem?.action || `Analysis #${index + 1}`}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 report-no-print">
                          <button
                            type="button"
                            onClick={() => handleMove(index, index - 1)}
                            className="ghost-button"
                            disabled={index === 0 || busyIndex !== null}
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(index, index + 1)}
                            className="ghost-button"
                            disabled={index === reports.length - 1 || busyIndex !== null}
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            className="ghost-button"
                            disabled={busyIndex !== null}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <ResultRenderer
                        result={reportItem?.result ?? reportItem}
                        variant="report"
                        sessionId={reportItem?.sessionId || sessionId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end report-no-print">
          <button type="button" onClick={exportReport} className="brand-button">
            Download / Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Report;
