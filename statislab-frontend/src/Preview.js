import React, { useState } from "react";

const Preview = ({ data }) => {
  const [dataReady, setDataReady] = useState(false);

  if (!data || data.length === 0) {
    return <p className="text-gray-500 italic">No data to preview</p>; // safe fallback
  }

  const { dataset, totalCols, totalRows, missingPercentage, dataTypes, sessionId } = data;
  const columns = Object.keys(dataset[0]);

  return (
    <div className=" ">
      <div className="preview space-y-6">
        {/* Summary Cards */}
        <div className="summaryCards grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 bg-white shadow rounded-lg flex flex-col items-center">
            <span className="text-gray-500">Total Rows</span>
            <span className="numbers text-lg font-bold">{totalRows}</span>
          </div>
          <div className="card p-4 bg-white shadow rounded-lg flex flex-col items-center">
            <span className="text-gray-500">Total Columns</span>
            <span className="numbers text-lg font-bold">{totalCols}</span>
          </div>
          <div className="card p-4 bg-white shadow rounded-lg flex flex-col items-center">
            <span className="text-gray-500">Missing Cells</span>
            <span className="numbers text-lg font-bold">
              {missingPercentage}%
            </span>
          </div>
          <div className="card p-4 bg-white shadow rounded-lg flex flex-col items-center">
            <span className="text-gray-500">Data Types</span>
            <span className="text-green-600">
              {Object.entries(dataTypes).map(([col, type]) => (
                <p key={col}>
                  {col}: {type}
                </p>
              ))}
            </span>
          </div>
        </div>

        {/* Data Preview */}
        <div className="dataFramePreview bg-white p-4 shadow rounded-lg overflow-auto">
          <span className="dataframeHeader font-semibold mb-2 block">
            Raw Data Preview{" "}
            <span className="text-gray-400 ">(First 5 rows)</span>
          </span>
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden ">
            <thead className="bg-gray-800 text-white">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-2 text-left border-b border-gray-300"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.map((obj, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  {Object.values(obj).map((cell, cidx) => (
                    <td
                      key={cidx}
                      className="px-4 py-2 border-b border-gray-200"
                    >
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <span className="wideView text-blue-600 mt-2 inline-block cursor-pointer hover:underline">
            View all {totalRows} rows
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preview;
