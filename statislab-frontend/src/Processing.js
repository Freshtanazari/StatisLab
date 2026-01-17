import React from "react";
import Table from "react-bootstrap/Table";

const Processing = () => {
  const logReports = [
    {
      id: 1,
      time: "09:12",
      details: 'You deleted the column "age"',
    },
    {
      id: 2,
      time: "09:18",
      details: 'You renamed column "income" to "salary"',
    },
    {
      id: 3,
      time: "09:25",
      details: "You removed 12 duplicate rows",
    },
    {
      id: 4,
      time: "09:41",
      details: 'You filled missing values in "education"',
    },
    {
      id: 5,
      time: "10:03",
      details: "You filtered rows where score < 50",
    },
  ];

  const columnReports = [
    {
      name: "age",
      type: "numeric",
      health: {
        status: "error",
        message: "Outlier detected",
      },
      actions: {
        uniqueValues: 47,
        mean: 32.6,
        std: 12.4,
      },
    },
    {
      name: "income",
      type: "numeric",
      health: {
        status: "warning",
        message: "High variance",
      },
      actions: {
        uniqueValues: 120,
        mean: 54000,
        std: 21000,
      },
    },
    {
      name: "score",
      type: "numeric",
      health: {
        status: "ok",
        message: "No issues detected",
      },
      actions: {
        uniqueValues: 89,
        mean: 76.3,
        std: 8.9,
      },
    },
  ];

  return (
    <div className="processingScreen">
      <div className="inspectionWrapper">
        <div className="inspection">
          <h4>Column Inspection</h4>
          Review and fix data quality issues
          <Table  striped bordered hover>
            <thead>
              <tr>
                <td>Names & Type</td>
                <td>Heath Status</td>
                <td>Quick Actions</td>
              </tr>
            </thead>
            <tbody>
              {columnReports.map((col, index) => (
                <tr key={index}>
                  <td>
                    <strong>{col.name}</strong>
                    <div style={{ opacity: 0.7 }}>{col.type}</div>
                  </td>

                  <td>
                    {col.health.status}
                    <div style={{ fontSize: "0.75rem" }}>
                      {col.health.message}
                    </div>
                  </td>

                  <td>
                    <div>Unique: {col.actions.uniqueValues}</div>
                    <div>Mean: {col.actions.mean}</div>
                    <div>Std: {col.actions.std}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="loggings">
          <h6>Proccessing logs:</h6>
          <ul>
            {logReports.map((data, index) => (
              <div>
                <li key={index}>{data.time}</li>
                {data.details}
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Processing;
