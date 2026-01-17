import React from "react";
import Table from 'react-bootstrap/Table';

const Preview = ()=>{
    const csvColumns = ["ID", "Age", "Gender", "Income", "Education", "Country", "Score", "Enrolled"]
    const CsvRows = [
  [1, 23, "Male", 42000, "Bachelor", "Pakistan", 78, true],
  [2, 29, "Female", 61000, "Master", "Pakistan", 85, true],
  [3, null, "Male", 50000, "Bachelor", "India", 72, false],
  [4, 35, "Female", "unknown", "PhD", "UK", 91, true],
  [5, 35, "Female", 72000, "PhD", "UK", 91, true],
  [6, 18, "Male", 15000, "High School", "Pakistan", 40, false],
  [6, 18, "Male", 15000, "High School", "Pakistan", 40, false] // duplicate row
];


    return(
        <div >
            <div className="preview">
               
                <div className="summaryCards">
                    <div className="card">
                        Total rows
                        <span className="numbers">1000</span>
                    </div>
                    <div className="card">
                        Total columns
                        <span className="numbers">10</span>
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
                            {csvColumns.map((data, index)=>(
                                <th key={index}>{data}</th>
                            ))
                            }
                        </tr>
                        </thead>
                        {/* adding the rows */}
                        <tbody>
                        {CsvRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex)=> (
                                    <td key="cellIndex">{String(cell)}</td>
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