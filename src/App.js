import React, { useEffect, useState } from "react";
import "./App.css";
import {
  HashRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import WebCalibration from "./web-calibration.js";
import Tracking from "./Tracking.jsx";
import webgazer from "webgazer";

function App() {
  const [uri, setUri] = useState("");
  const [isOnMeet, setIsOnMeet] = useState(true);
  const [isOnCalibrationPage, setisOnCalibrationPage] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => {
    const queryInfo = { active: true, lastFocusedWindow: true };
    // eslint-disable-next-line no-undef
    chrome.tabs && chrome.tabs.query(queryInfo, (tabs) => {
        if (tabs) {
          const url = tabs[0].url;
          setUri(url);
          if (url && url.includes("meet.google.com")) {
            setIsOnMeet(true);
            console.log(`is on meet.com ${true}`);
          }
          if (url && (url.includes("calibration") || url.includes("track"))) {
            setisOnCalibrationPage(true);
            console.log(`is on meet.com ${false}`);
          }
        }
      });
    // eslint-disable-next-line no-undef
    if (!chrome.tabs) {
      setisOnCalibrationPage(true);
    }
    console.log(uri);
  }, []);
  useEffect(() => {
    const existingEmail = localStorage.getItem("Email");
    if (existingEmail) {
      setEmail(existingEmail);
    }
  }, []);


  return (
    <div className="App">
      <Router>
        {!isOnCalibrationPage && (
          // <header className="App-header">

          // </header>
          <>
            {!isOnMeet && <p>You are not in meet.google.com</p>}

            {isOnMeet && (
              <button>
                <Link target={"_blank"} to="/calibration">
                  Calibration
                </Link>
              </button>
            )}
            {isOnMeet && (
              <>
                <button>
                  <Link target={"_blank"} to="/track">
                    Start Tracking
                  </Link>
                </button>
              </>
            )}
          </>
        )}
        <Routes>
          <Route path="/calibration" element={<WebCalibration />} />
          <Route path="/track" element={<Tracking />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
