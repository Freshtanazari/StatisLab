import React from "react";

const Report = () => {
  // Hardcoded example analysis results
  const analysisInstances = [
    {
      id: 1,
      step: "Age Column Analysis",
      summary: {
        count: 100,
        mean: 32.6,
        median: 31,
        missing: 5,
        std: 12.4,
      },
      visualization: "📊 Placeholder for histogram of age",
      tests: ["No extreme outliers", "Data normally distributed"],
    },
    {
      id: 2,
      step: "Income Column Analysis",
      summary: {
        count: 100,
        mean: 54000,
        median: 52000,
        missing: 2,
        std: 21000,
      },
      visualization: "📊 Placeholder for boxplot of income",
      tests: ["High variance detected", "No missing critical values"],
    },
  ];

  return (
    <div className="reportScreen min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Analysis Report</h2>

      <div className="flex flex-col gap-6">
        {analysisInstances.map((instance) => (
          <div
            key={instance.id}
            className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600"
          >
            {/* Step Title */}
            <h3 className="text-xl font-semibold text-blue-700 mb-4">{instance.step}</h3>

            {/* Summary Statistics */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Summary Statistics:</h4>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 text-sm">
                <li><strong>Count:</strong> {instance.summary.count}</li>
                <li><strong>Mean:</strong> {instance.summary.mean}</li>
                <li><strong>Median:</strong> {instance.summary.median}</li>
                <li><strong>Missing:</strong> {instance.summary.missing}</li>
                <li><strong>Std:</strong> {instance.summary.std}</li>
              </ul>
            </div>

            {/* Visualization */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Visualization:</h4>
              <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-500 rounded border border-gray-200">
                {instance.visualization}
              </div>
            </div>

            {/* Tests / Results */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Tests / Checks:</h4>
              <ul className="list-disc list-inside text-gray-700 text-sm">
                {instance.tests.map((test, idx) => (
                  <li key={idx}>{test}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Report;
