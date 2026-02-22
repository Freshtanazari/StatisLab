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

  if (!isOpen) return null;

  const runAction = async () => {
    if (!action) return;

    const finalParams = { ...params };

    if (action === "renameCol") {
      finalParams.newName = inputValue || finalParams.colName; // use colName as fallback
    }

    if (action === "changeType") {
      finalParams.newType = inputValue || finalParams.newType; // match backend param
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        {stage === "confirm" && (
          <>
            <h2 className="text-lg font-bold mb-4">Action</h2>
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
            {!needInput && <p className="mb-4">{message}</p>}
            <div className="flex justify-end gap-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={runAction}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {stage === "result" && (
          <>
            <h2 className="text-lg font-bold mb-4">Result</h2>
            <pre className="bg-gray-100 p-2 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
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
