import React, { useState } from "react";
import analysisData from "./analysisData.json";
import AnalysisCard from "./components/AnalysisCard";

const Analysis = ({ columns, sessionId }) => {
  // to store analysisBoxes in one place
  const [selectedAnalysis, setSelectedAnalysis] = useState([]);
  const allAnalysis = analysisData;
  const sections = [...new Set(allAnalysis.map(instance => instance.section))];

  // // reset the sessionid, if the analysis data changed
  // useEffect(() => {
  //   const sessionId = dataset?.sessionId; // current sessionId
  //   setSession(sessionId);
  // }, [allAnalysis]);

  // handle if no columns avialable
  if (!columns || columns.length === 0) {
    return <p className="text-gray-500 italic">No columns available</p>;
  }

  // list instances of each section
  function groupInstance(section){
    return allAnalysis.filter(function(instance){
      return instance.section === section;
    })
  }

// add analysis to the state
  const addAnalysis = (instance) => {
    setSelectedAnalysis(function (prev){
      let newAnalysis = {
        id: Date.now() + Math.random(),
        name: instance.name,
        action: instance.action,
        params: instance.params || [],
        parametersNames : instance.parametersNames,
        section: instance.section,
      };
      let newAnalysisInstance = prev.slice(); // copying the old state
      newAnalysisInstance.push(newAnalysis);
      return newAnalysisInstance;
    }
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-3 gap-2">
      {/* Control Panel */}
      <div className="w-1/4 bg-white rounded-lg shadow-md p-5 overflow-y-auto">
        <h4 className="text-lg text-center font-semibold mb-4">Control Panel</h4>
        {sections.map((section) => (
          <fieldset
            key={section}
            className="mb-4 border border-gray-200 rounded p-3"
          >
            <legend className="font-semibold text-gray-700">{section}</legend>
            <div className="flex flex-col mt-2 gap-2">
              {groupInstance(section).map((instance) => (
                <button
                  key={instance.name}
                  onClick={() => addAnalysis(instance)}
                  className="text-left px-2 py-1 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
                >
                  {instance.name}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Analysis Lab */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
        <h4 className="text-lg text-center font-semibold mb-4">Analysis Lab</h4>
        {/* inform if no analysis box */}
        {selectedAnalysis.length === 0  && (<p className="text-gray-600 mb-4">
          Your analysis results will be displayed here
        </p>)
}
        <AnalysisCard selectedAnalysis = {selectedAnalysis} setSelectedAnalysis = {setSelectedAnalysis} sessionId = {sessionId} columns = {columns}></AnalysisCard>
      </div>
    </div>
  );
};

export default Analysis;
