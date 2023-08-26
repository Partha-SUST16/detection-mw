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
      userId: null
    };
    this.popupInterval = null;
    this.isPrevousDataReceived = true;
    this.getDataFromLocalStorage.bind(this);
    this.startTracking.bind(this);
    this.addData.bind(this);
  }
  getDataFromLocalStorage() {
    const existingEmail = localStorage.getItem("Email");
    const existingName = localStorage.getItem("Name");
    const existingGender = localStorage.getItem("Gender");
    const isGlass = localStorage.getItem("Glass");
    const userId = parseInt(localStorage.getItem("UserId"));
    this.dataToBeSent.email = existingEmail;
    this.dataToBeSent.name = existingName;
    this.dataToBeSent.gender = existingGender;
    this.dataToBeSent.doesWearGlass = isGlass;
    this.dataToBeSent.userId = userId;
    this.dataToBeSent.data = [];
  }
  async componentDidMount() {
    this.getDataFromLocalStorage();
    this.startTracking();
    // this.sendPopupQuery(50000, 60000);
    // this.sendNotificationForButton();
    this.sendDataToBackend();
  }
  componentWillUnmount() {
    this.popupInterval?.clear();
  }
  shouldComponentUpdate() {
    return true;
  }

  sendPopupQuery = (maxDelay, minDelay) => {
    const randomTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;;
    setTimeout(()=>{
      // eslint-disable-next-line no-undef
    chrome.tabs.query({ url: "*://meet.google.com/*"}, async(tabs) => {
        if(tabs.length === 0) {
          console.log("no active tab");
          return;
        }
        // eslint-disable-next-line no-undef
        const port = chrome.tabs.connect(tabs[0].id, {name: "openModal"});
        // eslint-disable-next-line no-undef
        port.onMessage.addListener((userChoice)=>{
          console.log(`received response ${JSON.stringify(userChoice)}`);
          if (userChoice && userChoice.val == "yes") {
            console.log(`changed object size: ${this.dataToBeSent.data.length}`);
            for(let i = 0; i < this.dataToBeSent.data.length; i++) {
              const item = this.dataToBeSent.data[i];
              console.log(`changed object: ${Math.abs(item.Timestamp - userChoice.timeStamp)/1000}`)
              if (Math.abs(item.Timestamp - userChoice.timeStamp)/1000 <= 3.0) {
                item.isMindWandered = true;
                console.log('changed')
              }
            }

            console.log(`changed object: ${this.dataToBeSent.data.length} ; ${this.dataToBeSent.data.filter((item)=>{
              return item.isMindWandered;
            }).length}`);
            this.sendPopupQuery(80000, 90000);
          } else {
            this.sendPopupQuery(85000, 90000);
          }
          this.isPrevousDataReceived = true;
        });
        if (this.isPrevousDataReceived) {
          // eslint-disable-next-line no-undef
          port.postMessage({message: "openModal", timeStamp: Date.now()});
          this.isPrevousDataReceived = false;
        }
    });
    }, randomTime);
  }

  sendNotificationForButton = () => {
    // eslint-disable-next-line no-undef
    chrome.tabs.query({url: "*://meet.google.com/*"}, async(tabs) => {
        if(tabs.length === 0) {
          console.log("no active tab");
          return;
        }
        // eslint-disable-next-line no-undef
        const buttonPort = chrome.tabs.connect(tabs[0].id, {name: "showButton"});
        // eslint-disable-next-line no-undef
        buttonPort.onMessage.addListener((userChoice)=>{
            console.log(`received response ${JSON.stringify(userChoice)}`);
            console.log(`changed object size: ${this.dataToBeSent.data.length}`);
            for(let i = 0; i < this.dataToBeSent.data.length; i++) {
              const item = this.dataToBeSent.data[i];
              if (Math.abs(item.Timestamp - userChoice.timeStamp)/1000 <= 3.0) {
                item.isMindWandered = true;
              }
            }

            console.log(`changed object: ${this.dataToBeSent.data.length} ; ${this.dataToBeSent.data.filter((item)=>{
              return item.isMindWandered;
            }).length}`);
          
        })
        // eslint-disable-next-line no-undef
        buttonPort.postMessage({message: "showButton"});
      });
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
    try {
      webgazer
        .setRegression("ridge")
        .setGazeListener(function (data, elapsedTime) {
          if (data == null) {
            return;
          }
          let timeStamp = Date.now();
          let dataText = `${data.x},${data.y},${timeStamp}`;
          try {
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
    obj.student_id = this.dataToBeSent.userId;
    obj.GazeAOI = -1;
    obj.isMindWandered = false;
    obj.batchNo = 0;
    if (!data.eyeFeatures.left.blink) {
      obj.PupilLeft = data.eyeFeatures.left.pupil[1];
      obj.PupilRight = data.eyeFeatures.right.pupil[1];
      obj.Blink = 0;
    }
    return obj;
  }
  setRandomInterval = (intervalFunction, minDelay, maxDelay) => {
    let timeout;
  
    const runInterval = () => {
      const timeoutFunction = () => {
        intervalFunction();
        runInterval();
      };
  
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  
      timeout = setTimeout(timeoutFunction, delay);
    };
  
    runInterval();
  
    return {
      clear() { clearTimeout(timeout) },
    };
  };
  sendQueryForPopUP = ()=>{
    // eslint-disable-next-line no-undef
    chrome.tabs.query({ url: "*://meet.google.com/*"}, async(tabs) => {
      if(tabs.length === 0) {
        console.log("no active tab");
        return;
      }
      // eslint-disable-next-line no-undef
      const port = chrome.tabs.connect(tabs[0].id, {name: "openModal"});
      // eslint-disable-next-line no-undef
      port.onMessage.addListener((userChoice)=>{
        console.log(`received response ${JSON.stringify(userChoice)}`);
        if (userChoice && userChoice.val == "yes") {
          console.log(`changed object size: ${this.dataToBeSent.data.length}`);
          for(let i = 0; i < this.dataToBeSent.data.length; i++) {
            const item = this.dataToBeSent.data[i];
            console.log(`changed object: ${Math.abs(item.Timestamp - userChoice.timeStamp)/1000}`)
            if (Math.abs(item.Timestamp - userChoice.timeStamp)/1000 <= 2.5) {
              item.isMindWandered = true;
              console.log('changed')
            }
          }

          console.log(`changed object: ${this.dataToBeSent.data.length} ; ${this.dataToBeSent.data.filter((item)=>{
            return item.isMindWandered;
          }).length}`);
        }
        this.isPrevousDataReceived = true;
      });
      if (this.isPrevousDataReceived) {
        // eslint-disable-next-line no-undef
        port.postMessage({message: "openModal", timeStamp: Date.now()});
        this.isPrevousDataReceived = false;
      }
  });
  }
  sendDataToBackend=()=> {
    setInterval(async () => {
      try {
       if (this.state.isPaused == false)
       {
          await fetch("http://20.197.16.87:8080/gaze", {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.dataToBeSent.data),
          }).then((res) => {
            console.log(res);
            if (res.ok)
              this.dataToBeSent.data = [];
          });
       }

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
