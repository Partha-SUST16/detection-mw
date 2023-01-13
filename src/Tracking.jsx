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
    this.addData.bind(this);
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
      webgazer.resume();
    } else {
      webgazer.pause();
      this.setState({ isPaused: true });
    }
  };
  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  addData(data) {
    if (!data) return;
    this.dataToBeSent.data.push(data);
  }
  startTracking() {
    const self = this;
    debugger
    try {
      this.sendDataToBackend();
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
            self.addData(self.transformToObject(data));
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
  transformToObject=(data)=>{
    //Timestamp	StimulusName  EventSource	GazeX GazeY GazeLeftx	GazeRightx	GazeLefty	GazeRighty	
    // PupilLeft	PupilRight	FixationSeq	SaccadeSeq	Blink	GazeAOI
    const obj = {};
    obj.Timestamp = Date.now();
    obj.GazeX = data.x;
    obj.GazeY = data.y;
    obj.GazeLeftx = data.gazeLeft.x;
    obj.GazeLefty = data.gazeLeft.y;
    obj.GazeRightx = data.gazeRight.x;
    obj.GazeRighty = data.gazeRight.y;
    obj.PupilLeft = 0.0;
    obj.PupilRight = 0.0;
    obj.FixationSeq = -1;
    obj.SaccadeSeq = -1;
    obj.Blink = 1;
    obj.student_id = 1;
    obj.GazeAOI = -1;
    if (!data.eyeFeatures.left.blink) {
      obj.PupilLeft = data.eyeFeatures.left.pupil[1];
      obj.PupilRight = data.eyeFeatures.right.pupil[1];
      obj.Blink = 0;
    }
    return obj;
  }
  sendDataToBackend=()=> {
    setInterval(async () => {
      try {
        await fetch("https://2716-27-147-234-160.in.ngrok.io/gaze", {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(this.dataToBeSent.data),
        }).then((res) => {
          console.log(res);
          if (res.ok)
            this.dataToBeSent.data = [];
        });
      } catch (error) {
        console.log(error);
      }
    }, 5000);
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
