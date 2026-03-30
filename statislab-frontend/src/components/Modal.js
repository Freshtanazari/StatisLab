import React, { useState } from "react";
import axios from "axios";
import { apiUrl, API_REQUEST_CONFIG } from "../config/api";

const formatResultMessage = (value) => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "Action completed";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

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

      const res = await axios.post(
        apiUrl("/preprocess/action"),
        {
          sessionId,
          action: finalAction,
          params: finalParams,
        },
        API_REQUEST_CONFIG,
      );

      const data = res.data;

      setResult(formatResultMessage(data?.message));
      setStage("result");
    } catch (err) {
      console.error("Error running action:", err);
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";
      setResult(errorMessage);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-[620px] max-w-[95vw]">
        {stage === "confirm" && (
          <>
            {selection ? (
              <>
                <p className="mb-2">{message}</p>
                <select
                  className="border border-slate-300 p-2 my-2 rounded-lg w-full"
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
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 mb-4 text-sm"
                  placeholder="Enter value..."
                />
              </>
            ) : (
              <p className="mb-2">{message}</p>
            )}

            <div className="flex justify-between">
              <button
                className="bg-slate-200 px-3 py-1.5 rounded-md text-sm"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="bg-teal-700 text-white px-3 py-1.5 rounded-md text-sm disabled:opacity-50"
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
            <h2 className="text-sm text-center mb-4 font-semibold text-slate-700 uppercase tracking-wide">
              Result
            </h2>
            <div className="bg-slate-100 p-3 rounded-xl max-h-64 overflow-y-auto text-sm border border-slate-200 whitespace-pre-wrap break-words">
              {result}
            </div>
            <div className="flex justify-end mt-3">
              <button
                className="bg-slate-200 px-3 py-1.5 rounded-md text-sm"
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