import React, {useState} from "react";
import Table from 'react-bootstrap/Table';

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
                    <Table striped bordered hover>
                        {/* adding the columns */}
                        <thead>
                        <tr>
                            {columns.map((data, dataindex)=>(
                                <th key={dataindex}>{data}</th>
                            ))
                            }
                        </tr>
                        </thead>
                        {/* adding the rows */}
                        <tbody>
                        {dataset.map((obj, objIndex) => (
                            <tr key={objIndex}>
                                {Object.values(obj).map((cell, cellIndex)=> (
                                    <td key={cellIndex}>{String(cell)}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <span className="wideView">View all 1000 rows</span>
                </div>

            </div>
        </div>

    );
};

export default Preview;