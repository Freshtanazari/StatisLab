import React, {useState} from "react";


const Preview = ({data})=>{
    let [dataReady, setDataReady] = useState(false);
     if (!data || data.length === 0) {
    return <p>No data to preview</p>; // safe fallback
  }
const {dataset, totalCols, totalRows} = data;
  // getting the columns
let columns = Object.keys(dataset[0])

    return(
        <div >
            <div className="preview">
               
                <div className="summaryCards">
                    <div className="card">
                        Total rows
                        <span className="numbers">{totalRows}</span>
                    </div>
                    <div className="card">
                        Total columns
                        <span className="numbers">{totalCols}</span>
                    </div>
                    <div className="card">
                        Missing Cells
                        <span className="numbers">4.2%</span>
                    </div>
                    <div className="card">
                        Data Health
                        Good quality 
                        <div ><span className="numbers">86</span></div>
                    </div>
                </div>

                <div className="dataFramePreview">
                    <span className="dataframeHeader" >Raw Data Preview <span style={{"opacity" : 0.7}}>(First 10 rows)</span></span>
                    <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden text-sm">
                        {/* adding the columns */}
                        <thead className="bg-gray-800 text-white">
                        <tr>
                            {columns.map((data, dataindex)=>(
                                <th key={dataindex} className="px-4 py-2 text-left border-b border-gray-300">{data}</th>
                            ))
                            }
                        </tr>
                        </thead>
                        {/* adding the rows */}
                        <tbody>
                        {dataset.map((obj, objIndex) => (
                            <tr key={objIndex}>
                                {Object.values(obj).map((cell, cellIndex)=> (
                                    <td key={cellIndex} className="px-4 py-2 border-b border-gray-200">{String(cell)}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <span className="wideView">View all 1000 rows</span>
                </div>

            </div>
        </div>

    );
};

export default Preview;