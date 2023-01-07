import React from "react";
import webgazer from "webgazer";

class Tracking extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      isPaused: false,
    };
    this.dataToBeSent = {
      email: "",
      name: "",
      gender: "",
      doesWearGlass: "",
      data: null,
    };
    this.getDataFromLocalStorage.bind(this);
    this.startTracking.bind(this);
    this.sendDataToBackEnd.bind(this);
  }
  getDataFromLocalStorage() {
    const existingEmail = localStorage.getItem("Email");
    const existingName = localStorage.getItem("Name");
    const existingGender = localStorage.getItem("Gender");
    const isGlass = localStorage.getItem("Glass");
    this.dataToBeSent.email = existingEmail;
    this.dataToBeSent.name = existingName;
    this.dataToBeSent.gender = existingGender;
    this.dataToBeSent.doesWearGlass = isGlass;
    this.dataToBeSent.data = [];
  }
  async componentDidMount() {
    // this.isPaused = false;
    this.getDataFromLocalStorage();
    this.startTracking();
  }
  shouldComponentUpdate() {
    return true;
  }
  stopTracking = () => {
    if (this.state.isPaused) {
      this.setState({ isPaused: false });
      // this.isPaused = false;
      webgazer.resume();
    } else {
      webgazer.pause();
      this.setState({ isPaused: true });
      // this.isPaused = true;
    }
  };
  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  sendDataToBackEnd(dataText) {
    if (!dataText) return;
    this.dataToBeSent.data.push(dataText);
    this.sleep(5000).then(async () => {
      console.log(`dataSize: ${this.dataToBeSent.data.length}`);
      await fetch("https://5e23-103-31-155-246.ap.ngrok.io/docs", {
        method: "POST",
        body: JSON.stringify(this.dataToBeSent),
      }).then((res) => {
        console.log(res);
        this.dataToBeSent.data = [];
      });
    });
  }
  startTracking() {
    const self = this;
    debugger
    try {
      webgazer
        .setRegression("ridge")
        .setGazeListener(function (data, elapsedTime) {
          if (data == null) {
            return;
          }
          let timeStamp = Date.now();
          let dataText = `${data.x},${data.y},${timeStamp}`;
          //Timestamp	StimulusName  EventSource	GazeX GazeY GazeLeftx	GazeRightx	GazeLefty	GazeRighty	PupilLeft	PupilRight	FixationSeq	SaccadeSeq	Blink	GazeAOI
          try {
            //console.log(JSON.stringify(data));
            if (data.eyeFeatures.left.blink) {
              dataText = `${timeStamp},'stimulus_0','ET',${data.x},${data.y},${
                data.gazeLeft.x
              },${data.gazeRight.x},${data.gazeLeft.y},${
                data.gazeRight.y
              },${0.0},${0.0},${-1},${-1},${1},${-1}`;
            } else dataText = `${timeStamp},'stimulus_0','ET',${data.x},${data.y},${data.gazeLeft.x},${data.gazeRight.x},${data.gazeLeft.y},${data.gazeRight.y},${data.eyeFeatures.left.pupil[1]},${data.eyeFeatures.left.pupil[1]},${-1},${-1},${0},${-1}`;
            console.log(dataText);
            self.sendDataToBackEnd(dataText);
          } catch (e) {
            console.log(`eyeBlink: ${data.eyeFeatures.left.blink}`);
          }
        })
        .begin();
      webgazer
        .showVideoPreview(true) /* shows all video previews */
        .showPredictionPoints(
          true
        ) /* shows a square every 100 milliseconds where current prediction is */
        .applyKalmanFilter(true);
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    return (
      <>
        <p>
          You can go back to your previsous tab.<br></br>Please do not close
          this window all long you attend the meeting
        </p>
        <button onClick={this.stopTracking} disabled={this.state.isPaused}>
          {"Pause"}
        </button>
        <button onClick={this.stopTracking} disabled={!this.state.isPaused}>
          {"Resume"}
        </button>
      </>
    );
  }
}

export default Tracking;
