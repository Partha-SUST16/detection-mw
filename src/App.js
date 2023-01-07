import React, { useCallback, useEffect, useState } from "react";
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

function App() {
  const [uri, setUri] = useState("");
  const [isOnMeet, setIsOnMeet] = useState(false);
  const [isOnCalibrationPage, setisOnCalibrationPage] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("M");
  const [doesWearGlass, setGlass] = useState("false");
  const [isFormValid, setValidity] = useState(true);
  useEffect(() => {
    const queryInfo = { active: true, currentWindow: true };
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
  }, []);
  useEffect(() => {
    const existingEmail = localStorage.getItem("Email");
    if (existingEmail) {
      setEmail(existingEmail);
    }
    const existingName = localStorage.getItem("Name");
    if (existingName) {
      setName(existingName);
    }
    const existingGender = localStorage.getItem("Gender");
    if (existingGender) {
      setGender(existingGender);
    }
    const isGlass = localStorage.getItem("Glass");
    if (isGlass && isGlass.toLocaleLowerCase().includes("true")) {
      setGlass("true");
    } else if (isGlass && isGlass.toLocaleLowerCase().includes("false")) {
      setGlass("false");
    }
    if (
      existingEmail == null ||
      existingEmail.length <= 0 ||
      existingGender == null ||
      existingGender.length <= 0 ||
      existingName == null ||
      existingName.length <= 0 ||
      doesWearGlass == null ||
      doesWearGlass.length <= 0
    ) {
      setValidity(false);
    }
  }, []);

  const updateEmail = (event) => {
    event.preventDefault();
    if (!email || email == null || doesWearGlass == null || gender == null)
      return;
    try {
      console.log(
        "Email: " +
          email +
          " Name: " +
          name +
          " Gender: " +
          gender +
          " Glass:" +
          doesWearGlass
      );
      //localStorage.removeItem("Email");
      localStorage.setItem("Email", email);
      localStorage.setItem("Name", name);
      localStorage.setItem("Glass", doesWearGlass);
      localStorage.setItem("Gender", gender);
      setValidity(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <Router>
        {!isOnCalibrationPage && (
          // <header className="App-header">

          // </header>
          <>
            {!isOnMeet && <p>You are not in meet.google.com</p>}

            {isOnMeet && (
              <form onSubmit={updateEmail}>
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={name ?? ""}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    name="Email"
                    value={email ?? ""}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label>
                  {" "}
                  Gender:
                  <select
                    value={gender ?? ""}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </label>
                <label>
                  {" "}
                  Do you wear glass:
                  <select
                    value={doesWearGlass ?? ""}
                    onChange={(e) => setGlass(e.target.value)}
                    required
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>
                <input type="submit" value="Submit" />
              </form>
            )}
            {isOnMeet && isFormValid && (
              <>
                <button>
                  <Link target={"_blank"} to="/calibration">
                    Calibration
                  </Link>
                </button>
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
