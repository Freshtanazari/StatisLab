import React, { useEffect, useMemo } from "react";

const Preview = ({ data, setColumns }) => {
  const dataset = data?.dataset ?? [];
  const columns = useMemo(
    () => Object.keys(data?.dataset?.[0] ?? {}),
    [data?.dataset],
  );
  const totalCols = data?.totalCols;
  const totalRows = data?.totalRows;
  const missingPercentage = data?.missingPercentage;
  const dataTypes = data?.dataTypes || {};

  useEffect(() => {
    if (setColumns && columns.length > 0) {
      setColumns(columns);
    }
  }, [setColumns, columns]); 

  if (!data || dataset.length === 0) {
    return <p className="text-gray-500 italic">No data to preview</p>; // safe fallback
  }





  return (
    <div className="screen-shell">
      <div className="preview space-y-5">
        {/* Summary Cards */}
        <div className="summaryCards grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="panel-block p-4 flex flex-col items-center">
            <span className="text-slate-500 text-sm">Total Rows</span>
            <span className="numbers text-2xl font-bold text-slate-800">{totalRows}</span>
          </div>
          <div className="panel-block p-4 flex flex-col items-center">
            <span className="text-slate-500 text-sm">Total Columns</span>
            <span className="numbers text-2xl font-bold text-slate-800">{totalCols}</span>
          </div>
          <div className="panel-block p-4 flex flex-col items-center">
            <span className="text-slate-500 text-sm">Missing Cells</span>
            <span className="numbers text-2xl font-bold text-orange-600">
              {missingPercentage}%
            </span>
          </div>
          <div className="panel-block p-4">
            <span className="text-slate-500 text-sm block mb-2">Data Types</span>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
              {Object.entries(dataTypes).map(([col, type]) => (
                <p key={col} className="text-xs text-slate-700">
                  <span className="font-semibold">{col}</span>: {type}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="panel-block dataFramePreview p-4 overflow-auto">
          <span className="dataframeHeader font-semibold mb-3 block text-slate-800">
            Raw Data Preview{" "}
            <span className="text-slate-400">(First 5 rows)</span>
          </span>
          <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 text-left border-b border-slate-600"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.map((obj, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  {Object.values(obj).map((cell, cidx) => (
                    <td
                      key={cidx}
                      className="px-4 py-2 border-b border-slate-200"
                    >
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <span className="wideView text-teal-700 mt-3 inline-block cursor-default text-sm">
            Showing sample preview from {totalRows} rows
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preview;
