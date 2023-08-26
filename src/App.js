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
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("1/1, Software Engineering, BSc");
  const [doesWearGlass, setGlass] = useState("false");
  const [isFormValid, setValidity] = useState(true);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [existingAccuracy, setExistingAcuraccy] = useState(0.0);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    chrome.tabs?.query({ active: true, currentWindow: true }, ([{ url }]) => {
      setUri(url);
      setIsOnMeet(url?.includes("meet.google.com"));
      setisOnCalibrationPage(
        url?.includes("calibration") || url?.includes("track")
      );
    });
    // eslint-disable-next-line no-undef
    if (!chrome.tabs) {
      setisOnCalibrationPage(true);
    }
  }, []);
 
  const getItemFromLocalStorage = (key) => {
    const item = localStorage.getItem(key);
    return item ? item : null;
  };

  const setItemToState = (key, setState) => {
    const existingItem = getItemFromLocalStorage(key);
    if (existingItem) {
      setState(existingItem);
    }
  };

  const setGlassToState = () => {
    const isGlass = getItemFromLocalStorage("Glass");
    if (isGlass) {
      const glassValue = isGlass.toLocaleLowerCase().includes("true")
        ? "true"
        : "false";
      setGlass(glassValue);
    }
  };

  const setAccuracyToState = () => {
    const existingAccuracy = localStorage.getItem("Accuracy");
    if (existingAccuracy) {
      setExistingAcuraccy(parseFloat(existingAccuracy));
      setIsCalibrated(true);
    }
  };

  useEffect(() => {
    setItemToState("Email", setEmail);
    setItemToState("Name", setName);
    setItemToState("Gender", setGender);
    setGlassToState();
    setItemToState("Age", setAge);
    setItemToState("Education", setEducation);
    setAccuracyToState();

    const isFormValid =
      getItemFromLocalStorage("Email") &&
      getItemFromLocalStorage("Gender") &&
      getItemFromLocalStorage("Name") &&
      getItemFromLocalStorage("Glass") &&
      getItemFromLocalStorage("Age") &&
      getItemFromLocalStorage("Education") &&
      isCalibrated;

    setValidity(isFormValid);
  }, []);

  const updateEmail = (event) => {
    event.preventDefault();
    if (
      !email ||
      email == null ||
      doesWearGlass == null ||
      gender == null ||
      education == null ||
      age == null
    )
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
      if (
        localStorage.getItem("Accuracy") == null ||
        localStorage.getItem("Accuracy") == undefined
      ) {
        window.alert("Calibration required");
        return;
      }
      localStorage.setItem("Email", email.trim());
      localStorage.setItem("Name", name.trim());
      localStorage.setItem("Glass", doesWearGlass);
      localStorage.setItem("Gender", gender);
      localStorage.setItem("Age", age.trim());
      localStorage.setItem("Education", education.trim());
      setValidity(true);
      postIdentificationDataToServer();
    } catch (error) {
      console.log(error);
    }
  };

  const postIdentificationDataToServer = async () => {
    const requestBode = {
      name: name,
      email: email,
      gender: gender,
      useGlass: doesWearGlass == "true",
      age: age,
      education: education,
      displayWidth: window.screen.width,
      displayHeight: window.screen.height,
      accuracy: parseFloat(
        localStorage.getItem("Accuracy")
          ? localStorage.getItem("Accuracy")
          : "0.0"
      ),
    };
    try {
      await fetch("http://20.197.16.87:8080/students", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin" : '*'
        },
        body: JSON.stringify(requestBode),
      }).then(async (res) => {
        if (res && res.ok) {
          const resposne = await res.json();
          const userId = resposne.id;
          localStorage.setItem("UserId", userId);
          window.alert("Registration Successful");
        } else {
          window.alert("Something went wrong!");
        }
      });
    } catch (error) {
      window.alert("Something went wrong!");
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
              <form onSubmit={updateEmail} className="form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name ?? ""}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="Email"
                    id="email"
                    value={email ?? ""}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender" className="form-label">
                    Gender:
                  </label>
                  <select
                    id="gender"
                    value={gender ?? ""}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className="form-control"
                  >
                    <option value="">--Please select--</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="glass" className="form-label">
                    Do you wear glasses?
                  </label>
                  <select
                    id="glass"
                    value={doesWearGlass ?? ""}
                    onChange={(e) => setGlass(e.target.value)}
                    required
                    className="form-control"
                  >
                    <option value="">--Please select--</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="age" className="form-label">
                    Age (Years):
                  </label>
                  <input
                    type="text"
                    name="Age"
                    id="age"
                    value={age ?? ""}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="education" className="form-label">
                    Education:
                  </label>
                  <textarea
                    name="Education"
                    id="education"
                    value={education ?? ""}
                    onChange={(e) => setEducation(e.target.value)}
                    required
                    rows="5"
                    style={{ height: "auto" }}
                    className="form-control"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            )}
            {isOnMeet && (
              <>
                <button>
                  <Link target={"_blank"} to="/calibration">
                    Calibration
                  </Link>
                </button>
                <button disabled={existingAccuracy < 50}>
                  {existingAccuracy < 50 ? (
                    "Acuraccy should be minimum 50%"
                  ) : (
                    <Link target={"_blank"} to="/track">
                      Start Tracking
                    </Link>
                  )}
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
