import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaExchangeAlt } from "react-icons/fa"; // FontAwesome icons
import { FaEye } from "react-icons/fa"; // FontAwesome eye icon
import Modal from "./components/Modal";

const Processing = ({ data }) => {
  let [sessionId, setSessionId] = useState(null);
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const columnsArray = tableData ? Object.values(tableData) : [];
  const [needInput, setNeedInput] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);
  // const [inputValue, setInputValue] = useState("");

// every time the data changes update the sessionId --> initial session / dataset load
useEffect(() => {
  // we use optional chaining to safely acces sessionID if data is not null or undefined
  // bad alternative data.sessionId
  if (data?.sessionId) {
    setSessionId(data.sessionId);
  }
}, [data]);

// every time the sessionId or refreshTrigger changes, fetch the table data to keep it updated
//refreshtrigger is used to update the table after changes the user make
useEffect(() => {
  const fetchTableData = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch("http://localhost:8000/preprocess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          action: "tableData",
          params: null,
        }),
      });

      if (!response.ok) {
        console.log("Request failed");
        return;
      }

      const message = await response.json();
      setTableData(message);
      console.log("Updated table data:", message);
    } catch (err) {
      console.error("Error fetching table data:", err);
    }
  };

  fetchTableData();
}, [sessionId, refreshTrigger]);


  const logReports = [
    { id: 1, time: "09:12", details: 'You deleted the column "age"' },
  ];
  // staging action
  function stageAction(
    action,
    params = {},
    prompt = "are you sure you want to apply the action?",
  ) {
    setPendingAction({ action, params });
    setModalData(prompt);
    setInputValue("");
    setOpen(true);
  }

  return (
    <div className=" bg-gray-100 ">
      <Modal
        isOpen={open}
        sessionId={sessionId}
        action={pendingAction?.action}
        params={pendingAction?.params}
        needInput={needInput}
        message={modalData}
        onClose={() => {
          setOpen(false);
          setPendingAction(null);
          setRefreshTrigger((prev) => prev + 1); // refresh table after action
        }}
      />

      <h4 className="text-sm font-semibold text-gray-800">Column Inspection</h4>
      <p className="text-gray-600 ">Review and fix data quality issues</p>

      {/* Dataset-level actions */}
      <div className="bg-white p-4 rounded-md shadow-sm my-2">
        Dataset level Actions
        <div className="flex gap-4 mt-2">
          {[
            {
              label: "Drop Null Values",
              onClick: () => {
                stageAction("dropAllNulls");
                setOpen(true);
                setNeedInput(false);
              },
            },
            {
              label: "Interpolate Missing",
              onClick: () => {
                stageAction("interpolateMissing", {
                  method: "linear",
                });
                setOpen(true);
                setNeedInput(false);
              },
            },
            {
              label: "Drop Duplicates",
              onClick: () => {
                stageAction("dropDuplicates");
                setOpen(true);
                setNeedInput(false);
              },
            },
            {
              label: "Convert to Numeric",
              onClick: () => {
                stageAction("allToNumeric");
                setOpen(true);
                setNeedInput(false);
              },
            },
            {
              label: "Display Info",
              onClick: () => {
                stageAction("displayInfo");
                setOpen(true);
                setNeedInput(false);
              },
            },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className=" flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Column-level cards */}
      <div className="bg-white p-4 rounded-md shadow-sm my-2">
        Column-level Actions
        {/* Table */}
        <div className="overflow-x-auto bg-white my-2 border ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Name & Types
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Missing %
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Display Unique
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Describe
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Quick Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {columnsArray.map((col, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">
                    <strong>{col.name}</strong>
                    <div className="text-gray-500 ">{col.type}</div>
                  </td>
                  <td className="px-4 py-2">
                    {col.missing}%
                    <button className="bg-yellow-200 text-yellow-800 rounded-sm px-2 ml-2 cursor-pointer">
                      Fix
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {col.nUnique.toString()}
                    <FaEye
                      className="text-black-500 cursor-pointer"
                      onClick={() => {
                        stageAction("displayUnique", { colName: col.name });
                        setOpen(true);
                        setNeedInput(false);
                      }}
                    ></FaEye>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        stageAction(col.describe.toString(), {
                          colName: col.name,
                        })
                      }
                    >
                      {col.describe}
                    </button>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <FaTrash
                      className="text-red-500 cursor-pointer"
                      onClick={() => {
                        stageAction("dropCol", { colName: col.name });
                        setOpen(true);
                      }}
                    />
                    <FaEdit
                      className="text-yellow-500 cursor-pointer"
                      onClick={() => {
                        stageAction("renameCol", { colName: col.name });
                        setOpen(true);
                        setNeedInput(true);
                      }}
                    />
                    <FaExchangeAlt
                      className="text-blue-500 cursor-pointer"
                      onClick={() => {
                        stageAction("changeType", { colName: col.name });
                        setOpen(true);
                        setNeedInput(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loggings */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md ">
        <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
          &larr;
        </button>
        <div className="flex-1 mx-4 overflow-x-auto whitespace-nowrap text-center">
          {logReports.map((log) => (
            <span key={log.id} className="inline-block mx-2 text-gray-700">
              {log.time}: {log.details}
            </span>
          ))}
        </div>
        <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
          &rarr;
        </button>
        <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Export Logs
        </button>
      </div>
    </div>
  );
};

export default Processing;
