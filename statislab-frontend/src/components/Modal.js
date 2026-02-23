import React, { useState } from "react";

const Modal = ({
  isOpen,
  onClose,
  action,
  params,
  needInput,
  sessionId,
  message,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [stage, setStage] = useState("confirm");
  const [result, setResult] = useState(null);
  // const [selection, setSelection] = useState(false);
  const selection = action === "handleMissing";

  if (!isOpen) return null;

  const runAction = async () => {
    if (!action) return;

    const finalParams = { ...params };

    if (action === "renameCol") {
      finalParams.newName = inputValue || finalParams.colName; // use colName as fallback
    }

    if (action === "changeDtype") {
      finalParams.dType = inputValue || finalParams.dType; // match backend param
    }
    if (action === "handleMissing") {
      // setSelection(true);
      action = inputValue
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/preprocess/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action,
          params: finalParams,
        }),
      });
      const data = await res.json();

      setResult(data.message || "Action completed");
      setStage("result"); // move to result stage
    } catch (err) {
      console.error("Error running action:", err);
      setResult("Error occurred");
      setStage("result");
    }
  };

  const handleClose = () => {
    setStage("confirm");
    setInputValue("");
    setResult(null);
    // setSelection(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        {stage === "confirm" && (
          <>
            {selection && (
              <>
                <p className="mb-2">{message}</p>
                <select className="border p-2 my-2 rounded"
                value={inputValue} 
                onChange = { (e) => setInputValue(e.target.value)}>
                  <option
                    value=""
                  >
                    Select a Method
                  </option>
                  <option
                    value="dropNullsFromCol"
                  >
                    Drop
                  </option>
                  <option
                    value="ImputeMeanNumeric"
                  >
                    Mean Imputation (Numeric columns only)
                  </option>
                  <option
                    value="ImputeMedianNumeric"
                  >
                    Median Imputation (Numeric Columns only)
                  </option>
                  <option value="ImputeByMode">Mode Imputation (categorical)</option>
                  <option value="ImputeByConstant">Constant Imputation</option>
                  <option value="ImputeBybfill">Backward fill Imputation</option>
                  <option value="ImputeByffill">Forward fill Imputation</option>
                </select>
              </>
            )}
            {needInput && (
              <>
                <p className="mb-2">{message}</p>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-4"
                  placeholder="Enter value..."
                />
              </>
            )}
            {!needInput && <p className="mb-2">{message}</p>}
            <div className="flex justify-between">
              <button
                className="bg-gray-300 px-2 py-1 rounded"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={runAction}
              >
                Confirm
              </button>
            </div>
          </>
        )}

        {stage === "result" && (
          <>
            <h2 className="text-sm text-center mb-4">Result</h2>
            <pre className="bg-gray-100 p-2 rounded w-auto overflow-y-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            <div className="flex justify-end mt-2">
              <button
                className="bg-gray-300 px-2 py-1 rounded"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
