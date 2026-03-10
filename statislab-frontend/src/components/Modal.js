import React, { useState } from "react";
import { apiUrl } from "../config/api";

const Modal = ({
  isOpen,
  onClose,
  action,
  params = {},
  needInput,
  sessionId,
  message,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [stage, setStage] = useState("confirm");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const selection = action === "handleMissing";

  if (!isOpen) return null;

  const runAction = async () => {
    if (!action || loading) return;

    // validation
    if (selection && !inputValue) {
      alert("Please select a method.");
      return;
    }

    if (needInput && !inputValue.trim()) {
      alert("Please enter a value.");
      return;
    }

    const finalParams = { ...params };
    const finalAction = selection ? inputValue : action;

    if (action === "renameCol") {
      finalParams.newName = inputValue || finalParams.colName;
    }

    if (action === "changeDtype") {
      finalParams.dType = inputValue || finalParams.dType;
    }

    try {
      setLoading(true);

      const res = await fetch(apiUrl("/preprocess/action"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: finalAction,
          params: finalParams,
        }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      setResult(JSON.stringify(data.message) || "Action completed");
      setStage("result");
    } catch (err) {
      console.error("Error running action:", err);
      setResult("Something went wrong.");
      setStage("result");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStage("confirm");
    setInputValue("");
    setResult(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded shadow-lg w-[600px] max-w-[90vw]">
        {stage === "confirm" && (
          <>
            {selection ? (
              <>
                <p className="mb-2">{message}</p>
                <select
                  className="border p-2 my-2 rounded w-full"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                >
                  <option value="">Select a Method</option>
                  <option value="dropNullsFromCol">Drop</option>
                  <option value="imputeMeanNumeric">
                    Mean Imputation (Numeric)
                  </option>
                  <option value="imputeMedianNumeric">
                    Median Imputation (Numeric)
                  </option>
                  <option value="imputeByMode">Mode Imputation</option>
                  <option value="imputeByConstant">Constant Imputation</option>
                  <option value="imputeBybfill">Backward Fill</option>
                  <option value="imputeByffill">Forward Fill</option>
                </select>
              </>
            ) : needInput ? (
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
            ) : (
              <p className="mb-2">{message}</p>
            )}

            <div className="flex justify-between">
              <button
                className="bg-gray-300 px-3 py-1 rounded"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
                onClick={runAction}
                disabled={
                  loading ||
                  (selection && !inputValue) ||
                  (needInput && !inputValue.trim())
                }
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </>
        )}

        {stage === "result" && (
          <>
            <h2 className="text-sm text-center mb-4 font-semibold">
              Result
            </h2>
            <pre className="bg-gray-100 p-2 rounded max-h-160 overflow-x-auto text-sm">
              {result}
            </pre>
            <div className="flex justify-end mt-3">
              <button
                className="bg-gray-300 px-3 py-1 rounded"
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