import React, { useEffect, useState } from "react";
import "./App.css";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import WebCalibration from "./web-calibration.js";
// import {
//   Router,
//   Link,
//   goBack,
//   goTo,
//   popToTop
// } from "react-chrome-extension-router";

function App() {
  const [url, setUrl] = useState("");
  const [isOnMeet, setIsOnMeet] = useState(false);
  const [isOnCalibrationPage, setisOnCalibrationPage] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => {
    const queryInfo = { active: true, lastFocusedWindow: true };
    // eslint-disable-next-line no-undef
    chrome.tabs && chrome.tabs.query(queryInfo, (tabs) => {
        if (tabs) {
          const url = tabs[0].url;
          setUrl(url);
          if (url && url.includes("meet.google.com")) {
            setIsOnMeet(true);
          }
          if (url && url.includes("calibration")) {
            setisOnCalibrationPage(true);
          }
        }
      });
  });
  // useEffect(()=>{
  //   const existingEmail = localStorage.getItem('Email');
  //   if (existingEmail) {
  //     setEmail(existingEmail);
  //   }
  // });

  return (
    
    <div className="App">
      <Router>
        {!isOnCalibrationPage && (
          <header className="App-header">
            {!isOnMeet && <p>You are not in meet.google.com</p>}
            {isOnMeet && (
              <button>
                <Link target={"_blank"} to="/calibration">
                  Calibration
                </Link>
              </button>
            )}
          </header>
        )}
        <Routes>
          <Route path="/calibration" element={<WebCalibration />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
