import React from "react";
import $ from "jquery";
import swal from "sweetalert";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Image from "./calibration.png";
import "./web-calibration.css";
import webgazer from "webgazer";
class WebCalibration extends React.Component {
  PointCalibrate = 0;
  CalibrationPoints = {};
  state = {
    openModal: false,
    existingAccuracy: 0.0,
  };
  
  routeToTrack = () => {
    try {
    } catch (error) {
      console.log(error);
    }
  };
  
  async componentDidMount() {
    await webgazer
      .setRegression("ridge")
      .setGazeListener(function (data, clock) {
        if (data) {
          // console.log(JSON.stringify(data.x) + ' ' + JSON.stringify(data.y));

          let timeStamp = Date.now();
          let dataText = `${data.x},${data.y},${timeStamp}`;
          //Timestamp	StimulusName  EventSource	GazeX GazeY GazeLeftx	GazeRightx	GazeLefty	GazeRighty	PupilLeft	PupilRight	FixationSeq	SaccadeSeq	Blink	GazeAOI
          try {
            //console.log(JSON.stringify(data));
            if (data.eyeFeatures.left?.blink) {
              dataText = `${timeStamp},'stimulus_0','ET',${data.x},${data.y},${data.gazeLeft.x
                },${data.gazeRight.x},${data.gazeLeft.y},${data.gazeRight.y
                },${0.0},${0.0},${-1},${-1},${1},${-1}`;
            } else
              dataText = `${timeStamp},'stimulus_0','ET',${data.x},${data.y},${data.gazeLeft.x
                },${data.gazeRight.x},${data.gazeLeft.y},${data.gazeRight.y},${data.eyeFeatures.left.pupil[1]
                },${data.eyeFeatures.left.pupil[1]},${-1},${-1},${0},${-1}`;
            console.log(dataText);
          } catch (error) {
            console.log(`eyeBlink: ${data.eyeFeatures.left.blink}`);
          }
        }
      })
      .saveDataAcrossSessions(true)
      .begin();
    webgazer
      .showVideoPreview(true) /* shows all video previews */
      .showPredictionPoints(
        true
      ) /* shows a square every 100 milliseconds where current prediction is */
      .applyKalmanFilter(true);

    var setup = function () {
      //Set up the main canvas. The main canvas is used to calibrate the webgazer.
      var canvas = document.getElementById("plotting_canvas");
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(canvas.width);
        console.log(canvas.height);
        canvas.style.position = "fixed";
      }
    };
    if (localStorage.getItem("Accuracy") != null || localStorage.getItem("Accuracy") != undefined) {
      this.setState({existingAccuracy: parseFloat(localStorage.getItem("Accuracy"))});
    }
    setup();
    this.extraSetup();
  }
  extraSetup = () => {
    this.ClearCanvas();
    this.helpModalShow();
  };

  calculatePrecision = (past50Array) => {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    // Retrieve the last 50 gaze prediction points
    var x50 = past50Array[0];
    var y50 = past50Array[1];

    // Calculate the position of the point the user is staring at
    var staringPointX = windowWidth / 2;
    var staringPointY = windowHeight / 2;

    var precisionPercentages = new Array(50);
    this.calculatePrecisionPercentages(
      precisionPercentages,
      windowHeight,
      x50,
      y50,
      staringPointX,
      staringPointY
    );
    var precision = this.calculateAverage(precisionPercentages);

    // Return the precision measurement as a rounded percentage
    return Math.round(precision);
  };

  /*
   * Calculate percentage accuracy for each prediction based on distance of
   * the prediction point from the centre point (uses the window height as
   * lower threshold 0%)
   */
  calculatePrecisionPercentages = (
    precisionPercentages,
    windowHeight,
    x50,
    y50,
    staringPointX,
    staringPointY
  ) => {
    for (let x = 0; x < 50; x++) {
      // Calculate distance between each prediction and staring point
      var xDiff = staringPointX - x50[x];
      var yDiff = staringPointY - y50[x];
      var distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

      // Calculate precision percentage
      var halfWindowHeight = windowHeight / 2;
      var precision = 0;
      if (distance <= halfWindowHeight && distance > -1) {
        precision = 100 - (distance / halfWindowHeight) * 100;
      } else if (distance > halfWindowHeight) {
        precision = 0;
      } else if (distance > -1) {
        precision = 100;
      }

      // Store the precision
      precisionPercentages[x] = precision;
    }
  };

  /*
   * Calculates the average of all precision percentages calculated
   */
  calculateAverage = (precisionPercentages) => {
    var precision = 0;
    for (let x = 0; x < 50; x++) {
      precision += precisionPercentages[x];
    }
    precision = precision / 50;
    return precision;
  };
  stop_storing_points_variable = () => {
    webgazer.params.storingPoints = false;
  };
  store_points_variable = () => {
    webgazer.params.storingPoints = true;
  };
  test = (id) => (e) => {
    e.preventDefault();
    // let id = "Pt1";
    if (!this.CalibrationPoints[id]) {
      this.CalibrationPoints[id] = 0;
    }
    let isMorethanFive = true;
    if (this.CalibrationPoints[id] < 5) {
      this.CalibrationPoints[id]++;
      isMorethanFive = false;
    }
    if (!isMorethanFive && this.CalibrationPoints[id] === 5) {
      document.getElementById(id).style.cssText = "background-color: yellow";
      this.PointCalibrate++;
    } else if (this.CalibrationPoints[id] < 5) {
      var opacity = 0.2 * this.CalibrationPoints[id] + 0.2;
      document.getElementById(id).style.opacity = opacity;
    }
    if (this.PointCalibrate === 8) {
      document.getElementById("Pt5").style.visibility = "visible";
    }
    if (this.PointCalibrate >= 9) {
      var points = document.getElementsByClassName("calibration");
      for (let i = 0; i < points.length; i++) {
        points[i].style.visibility = "hidden";
      }
      document.getElementById("Pt5").style.visibility = "visible";
      var canvas = document.getElementById("plotting_canvas");
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      swal({
        title: "Calculating measurement",
        text: "Please don't move your mouse & stare at the middle dot for the next 5 seconds. This will allow us to calculate the accuracy of our predictions.",
        closeOnEsc: false,
        allowOutsideClick: false,
        closeModal: true,
      }).then((isConfirm) => {
        this.store_points_variable(); // start storing the prediction points

        this.sleep(5000).then(() => {
          this.stop_storing_points_variable(); // stop storing the prediction points
          var past50 = webgazer.getStoredPoints(); // retrieve the stored points
          var precision_measurement = this.calculatePrecision(past50);
          var accuracyLabel =
            "<a>Accuracy | " + precision_measurement + "%</a>";
          document.getElementById("Accuracy").innerHTML = accuracyLabel; // Show the accuracy in the nav bar.
          swal({
            title: "Your accuracy measure is " + precision_measurement + "%",
            allowOutsideClick: false,
            buttons: {
              cancel: "Recalibrate",
              confirm: true,
            },
          }).then((isConfirm) => {
            if (isConfirm) {
              //clear the calibration & hide the last middle button
              localStorage.setItem("Accuracy", precision_measurement);
              this.ClearCanvas();
              this.routeToTrack();
            } else {
              //use restart function to restart the calibration
              document.getElementById("Accuracy").innerHTML =
                "<a>Not yet Calibrated</a>";
              webgazer.clearData();
              this.ClearCalibration();
              this.ClearCanvas();
              this.ShowCalibrationPoint();
            }
          });
        });
        // });
      });
    }
  };
  componentWillUnmount() {
    try {
      webgazer.end();
    } catch (error) { }
  }
  Restart = () => {
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    webgazer.clearData();
    this.ClearCalibration();
    this.PopUpInstruction();
  };
  onClickButton = (e) => {
    e.preventDefault();
    this.setState({ openModal: true });
  };
  ClearCanvas = () => {
    var points = document.getElementsByClassName("calibration");
    for (let i = 0; i < points.length; i++) {
      points[i].style.visibility = "hidden";
    }
    var canvas = document.getElementById("plotting_canvas");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };
  helpModalShow = () => {
    this.setState({ openModal: true });
    console.log(this.show);
  };
  /**
   * Show the Calibration Points
   */
  ShowCalibrationPoint = () => {
    var points = document.getElementsByClassName("calibration");
    for (let i = 0; i < points.length; i++) {
      points[i].style.visibility = "visible";
    }
    document.getElementById("Pt5").style.visibility = "hidden"; // initially hides the middle button
  };
  PopUpInstruction = () => {
    this.onCloseModal();
    this.ClearCanvas();
    swal({
      title: "Calibration",
      text: "Please click on each of the 9 points on the screen. You must click on each point 5 times till it goes yellow. This will calibrate your eye movements.",
      buttons: {
        cancel: false,
        confirm: true,
      },
    }).then((isConfirm) => {
      this.ShowCalibrationPoint();
    });
  };
  /**
   * This function clears the calibration buttons memory
   */
  ClearCalibration = () => {
    // Clear data from WebGazer
    var points = document.getElementsByClassName("calibration");
    for (let i = 0; i < points.length; i++) {
      try {
        const id = points[i].getAttribute("id");
        if (id) {
          document.getElementById(id).style.backgroundColor = "red";
          document.getElementById(id).style.opacity = 0.2;
        }
      } catch (error) {
        console.log(error);
      }
    }

    this.CalibrationPoints = {};
    this.PointCalibrate = 0;
  };

  sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  onCloseModal = () => {
    this.setState({ openModal: false });
  };
  render() {
    return (
      <div className="test">
        <canvas
          id="plotting_canvas"
          width="500"
          height="500"
          style={{ cursor: "crosshair" }}
        ></canvas>
        <nav
          id="webgazerNavbar"
          className="navbar navbar-default navbar-fixed-top"
        >
          <div className="collapse navbar-collapse" id="myNavbar">
            <ul className="nav navbar-nav">
              <li id="Accuracy">
                <a>Not yet Calibrated</a>
              </li>
              <li>
                <button>Recalibrate</button>
              </li>
              <li>
                <button>Toggle Kalman Filter</button>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li>
                <button
                  className="helpBtn"
                  data-toggle="modal"
                  data-target="#helpModal"
                >
                  <a data-toggle="modal">
                    <span className="glyphicon glyphicon-cog"></span> Help
                  </a>
                </button>
              </li>
            </ul>
          </div>
        </nav>
        <div className="calibrationDiv">
          <button
            className="calibration"
            id="Pt1"
            onClick={this.test("Pt1")}
          ></button>
          <input
            type="button"
            className="calibration"
            id="Pt2"
            onClick={this.test("Pt2")}
          ></input>
          <input
            type="button"
            className="calibration"
            id="Pt3"
            onClick={this.test("Pt3")}
          ></input>
          <input
            type="button"
            className="calibration"
            id="Pt4"
            onClick={this.test("Pt4")}
          ></input>
          <input
            type="button"
            className="calibration"
            id="Pt5"
            onClick={this.test("Pt5")}
          ></input>
          <input
            type="button"
            className="calibration"
            id="Pt6"
            onClick={this.test("Pt6")}
          ></input>
          <input
            type="button"
            className="calibration"
            id="Pt7"
            onClick={this.test("Pt7")}
          ></input>
          <input
            type="button"
            className="calibration"
            id="Pt8"
            onClick={this.test("Pt8")}
          ></input>
          <input
            type="button"
            className="calibration"
            id="Pt9"
            onClick={this.test("Pt9")}
          ></input>
        </div>
        <Button
          variant="primary"
          onClick={this.onClickButton}
          style={{ visibility: "hidden" }}
        >
          Launch static backdrop modal
        </Button>
        <Modal
          show={this.state.openModal}
          onClose={this.onCloseModal}
          backdrop="static"
        >
          <Modal.Body>
            <div className="modal-body">
              <img
                src={Image}
                width="100%"
                height="100%"
                alt="webgazer demo instructions"
              ></img>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="modal-footer">
              <Button variant="secondary" onClick={this.onCloseModal}>
                Close & load saved model
              </Button>
              <Button variant="primary" onClick={this.Restart}>
                Calibration
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
export default WebCalibration;
