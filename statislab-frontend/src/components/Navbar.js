import React from "react";

const Navbar = () => {
    return(
        <div className="navWrapper row py-3">
            <div className="appName col-7 fs-5 px-4"> StatisLab</div>
            <div className="col-5 d-flex flex-row justify-content-between">
                <div>
                    <span className="step mx-1 text-center rounded-circle">1</span>
                    Upload
                </div>
                <div>
                    <span className="step mx-1 text-center rounded-circle active">✓</span>
                    Inspect
                </div>
                
                <div>
                    <span className="step mx-1 text-center rounded-circle">3</span>
                    process
                </div>
                
                <div>
                    <span className="step mx-1 text-center rounded-circle">4</span>
                    visualize
                </div>
              
                <div >
                    <span className="step mx-1 text-center rounded-circle">5</span>
                    Report
                </div>
            </div>
        </div>
    )
}

export default Navbar;