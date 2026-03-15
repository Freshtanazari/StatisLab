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

  return (
    <div className="screen-shell reportScreen report-print-root">
      <div className="panel-block p-5 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Analysis Report</h2>
          <p className="muted-help mt-1">{loading ? "Loading report..." : error ? "Report unavailable" : `${reports.length} analyses included`}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading && (
          <div className="panel-block p-5">
            <p className="text-slate-600">Loading report results from backend...</p>
          </div>
        )}

        {error && (
          <div className="panel-block p-5 border-l-4 border-l-red-500">
            <p className="text-red-700 font-medium">Failed to load report data</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {actionError && (
          <div className="panel-block p-5 border-l-4 border-l-red-500">
            <p className="text-red-700 font-medium">Action failed</p>
            <p className="text-red-600 text-sm mt-1">{actionError}</p>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="panel-block p-5 border-l-4 border-l-slate-300">
            <p className="text-slate-700">No analysis results found in backend for this session.</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="panel-block overflow-hidden">
            {reports.map((reportItem, index) => (
              <div key={`report-item-${index}`}>
                {index > 0 && <div className="border-t border-slate-200" />}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {reportItem?.name || reportItem?.action || `Analysis #${index + 1}`}
                    </h3>
                    <div className="flex items-center gap-2 report-no-print">
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
                  <ResultRenderer result={reportItem?.result ?? reportItem} />
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
