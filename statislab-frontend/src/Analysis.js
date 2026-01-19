import React from "react";
import {useState} from "react";
import analysisData from "./analysisData.json";

const Analysis = () => {
    let ready, setReady = useState(false);
    let data = analysisData;
    let sections = [...new Set(data.map(item => item.section))];
  function listSteps(section){
    return data.filter(item => item.section === section);
  }

  return (

    <div className="analysisScreen">
      <div className="analysisControl">
       {/* this is  {sections} */}
       Control Panel configure your analysis setttings
       {sections.map(section => (
        <fieldset key={section}>
          <legend>{section}</legend>
        {listSteps(section).map(step => (
          <label  key={step.step}>
          <input type="checkbox" /> {step.step}
          </label>
        ))}
        </fieldset>
       ))}
    
      </div>

      <div className="analysisLab">Analysis Lab
        your analysis results will be displayed here
        <analysisBox code={ready}/>
      </div>

    </div>
  );
};

export default Analysis;
