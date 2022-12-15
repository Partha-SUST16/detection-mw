import React, { useEffect, useState } from "react";
import $ from "jquery";
import swal from "sweetalert";
import "./calibration.png";
import "./web-calibration.css";

import webgazer from "webgazer";

function WebCalibration() {
  var PointCalibrate = 0;
  var CalibrationPoints = {};
  /*
   * Sets store_points to true, so all the occuring prediction
   * points are stored
   */
  function store_points_variable() {
    webgazer.params.storingPoints = true;
  }

  /*
   * Sets store_points to false, so prediction points aren't
   * stored any more
   */
  function stop_storing_points_variable() {
    webgazer.params.storingPoints = false;
  }

  function calculatePrecision(past50Array) {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    // Retrieve the last 50 gaze prediction points
    var x50 = past50Array[0];
    var y50 = past50Array[1];

    // Calculate the position of the point the user is staring at
    var staringPointX = windowWidth / 2;
    var staringPointY = windowHeight / 2;

    var precisionPercentages = new Array(50);
    calculatePrecisionPercentages(
      precisionPercentages,
      windowHeight,
      x50,
      y50,
      staringPointX,
      staringPointY
    );
    var precision = calculateAverage(precisionPercentages);

    // Return the precision measurement as a rounded percentage
    return Math.round(precision);
  }

  /*
   * Calculate percentage accuracy for each prediction based on distance of
   * the prediction point from the centre point (uses the window height as
   * lower threshold 0%)
   */
  function calculatePrecisionPercentages(
    precisionPercentages,
    windowHeight,
    x50,
    y50,
    staringPointX,
    staringPointY
  ) {
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
  }

  /*
   * Calculates the average of all precision percentages calculated
   */
  function calculateAverage(precisionPercentages) {
    var precision = 0;
    for (let x = 0; x < 50; x++) {
      precision += precisionPercentages[x];
    }
    precision = precision / 50;
    return precision;
  }
  useEffect(
    () =>
      async function () {
        var canvas = document.getElementById("plotting_canvas");
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.saveDataAcrossSessions = true;
        await webgazer
          .setRegression(
            "ridge"
          ) /* currently must set regression and tracker */
          //.setTracker('clmtrackr')
          .setGazeListener(function (data, clock) {
            if (data) {
              let timeStamp = Date.now();
              let dataText = `${data.x},${data.y},${timeStamp}`;
              //Timestamp	StimulusName  EventSource	GazeX GazeY GazeLeftx	GazeRightx	GazeLefty	GazeRighty	PupilLeft	PupilRight	FixationSeq	SaccadeSeq	Blink	GazeAOI
              try {
                if (data.eyeFeatures.left.blink) {
                  dataText = `${timeStamp},'stimulus_0','ET',${data.x},${
                    data.y
                  },${data.gazeLeft.x},${data.gazeRight.x},${data.gazeLeft.y},${
                    data.gazeRight.y
                  },${0.0},${0.0},${-1},${-1},${1},${-1}`;
                } else
                  dataText = `${timeStamp},'stimulus_0','ET',${data.x},${
                    data.y
                  },${data.gazeLeft.x},${data.gazeRight.x},${data.gazeLeft.y},${
                    data.gazeRight.y
                  },${data.eyeFeatures.left.pupil[1]},${
                    data.eyeFeatures.left.pupil[1]
                  },${-1},${-1},${0},${-1}`;
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
          .applyKalmanFilter(
            true
          ); /* Kalman Filter defaults to on. Can be toggled by user. */

        //Set up the webgazer video feedback.
        var setup = function () {
          //Set up the main canvas. The main canvas is used to calibrate the webgazer.
          var canvas = document.getElementById("plotting_canvas");
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          console.log(canvas.width);
          console.log(canvas.height);
          canvas.style.position = "fixed";
        };
        setup();
      }
  );
  function Restart() {
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
  }
  function PopUpInstruction() {
    ClearCanvas();
    swal({
      title: "Calibration",
      text: "Please click on each of the 9 points on the screen. You must click on each point 5 times till it goes yellow. This will calibrate your eye movements.",
      buttons: {
        cancel: false,
        confirm: true,
      },
    }).then((isConfirm) => {
      ShowCalibrationPoint();
    });
  }
  function ShowCalibrationPoint() {
    $(".Calibration").show();
    $("#Pt5").hide(); // initially hides the middle button
  }

  /**
   * This function clears the calibration buttons memory
   */
  function ClearCalibration() {
    // Clear data from WebGazer

    $(".Calibration").css("background-color", "red");
    $(".Calibration").css("opacity", 0.2);
    $(".Calibration").prop("disabled", false);

    CalibrationPoints = {};
    PointCalibrate = 0;
  }
  function ClearCanvas() {
    $(".Calibration").hide();
    var canvas = document.getElementById("plotting_canvas");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }
  function helpModalShow() {
    $(document).ready(function() {
     // $("#helpModal").modal("show");

    })
  }
  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  useEffect(
    () =>
      function () {
        ClearCanvas();
        helpModalShow();
        $(".Calibration").click(function () {
          // click event on the calibration buttons

          var id = $(this).attr("id");

          if (!CalibrationPoints[id]) {
            // initialises if not done
            CalibrationPoints[id] = 0;
          }
          CalibrationPoints[id]++; // increments values

          if (CalibrationPoints[id] == 5) {
            //only turn to yellow after 5 clicks
            $(this).css("background-color", "yellow");
            $(this).prop("disabled", true); //disables the button
            PointCalibrate++;
          } else if (CalibrationPoints[id] < 5) {
            //Gradually increase the opacity of calibration points when click to give some indication to user.
            var opacity = 0.2 * CalibrationPoints[id] + 0.2;
            $(this).css("opacity", opacity);
          }

          //Show the middle calibration point after all other points have been clicked.
          if (PointCalibrate == 8) {
            $("#Pt5").show();
          }

          if (PointCalibrate >= 9) {
            // last point is calibrated
            //using jquery to grab every element in Calibration class and hide them except the middle point.
            $(".Calibration").hide();
            $("#Pt5").show();

            // clears the canvas
            var canvas = document.getElementById("plotting_canvas");
            canvas
              .getContext("2d")
              .clearRect(0, 0, canvas.width, canvas.height);

            // notification for the measurement process
            swal({
              title: "Calculating measurement",
              text: "Please don't move your mouse & stare at the middle dot for the next 5 seconds. This will allow us to calculate the accuracy of our predictions.",
              closeOnEsc: false,
              allowOutsideClick: false,
              closeModal: true,
            }).then((isConfirm) => {
              // makes the variables true for 5 seconds & plots the points
              $(document).ready(function () {
                store_points_variable(); // start storing the prediction points

                sleep(5000).then(() => {
                  stop_storing_points_variable(); // stop storing the prediction points
                  var past50 = webgazer.getStoredPoints(); // retrieve the stored points
                  var precision_measurement = calculatePrecision(past50);
                  var accuracyLabel =
                    "<a>Accuracy | " + precision_measurement + "%</a>";
                  document.getElementById("Accuracy").innerHTML = accuracyLabel; // Show the accuracy in the nav bar.
                  swal({
                    title:
                      "Your accuracy measure is " + precision_measurement + "%",
                    allowOutsideClick: false,
                    buttons: {
                      cancel: "Recalibrate",
                      confirm: true,
                    },
                  }).then((isConfirm) => {
                    if (isConfirm) {
                      //clear the calibration & hide the last middle button
                      ClearCanvas();
                    } else {
                      //use restart function to restart the calibration
                      document.getElementById("Accuracy").innerHTML =
                        "<a>Not yet Calibrated</a>";
                      webgazer.clearData();
                      ClearCalibration();
                      ClearCanvas();
                      ShowCalibrationPoint();
                    }
                  });
                });
              });
            });
          }
        });
      }
  );
  return (
    <div className="test">
      <canvas
        id="plotting_canvas"
        width="500"
        height="500"
        style={{ cursor: "crosshair" }}
      ></canvas>
      <div className="calibrationDiv">
        <input type="button" className="Calibration" id="Pt1"></input>
        <input type="button" className="Calibration" id="Pt2"></input>
        <input type="button" className="Calibration" id="Pt3"></input>
        <input type="button" className="Calibration" id="Pt4"></input>
        <input type="button" className="Calibration" id="Pt5"></input>
        <input type="button" className="Calibration" id="Pt6"></input>
        <input type="button" className="Calibration" id="Pt7"></input>
        <input type="button" className="Calibration" id="Pt8"></input>
        <input type="button" className="Calibration" id="Pt9"></input>
      </div>

      <div id="helpModal" className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <img
                src="./calibration.png"
                width="100%"
                height="100%"
                alt="webgazer demo instructions"
              ></img>
            </div>
            <div className="modal-footer">
              <button
                id="closeBtn"
                type="button"
                className="btn btn-default"
                data-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                id="start_calibration"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={Restart }
              >
                Calibrate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
//export default WebCalibration;
