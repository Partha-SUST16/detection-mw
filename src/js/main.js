window.onload = async function() {

    //start the webgazer tracker
    await webgazer.setRegression('ridge') /* currently must set regression and tracker */
        //.setTracker('clmtrackr')
        .setGazeListener(function(data, clock) {
             if (data) {
                let timeStamp = Date.now();
                let dataText = `${data.x},${data.y},${timeStamp}`;
                //Timestamp	StimulusName  EventSource	GazeX GazeY GazeLeftx	GazeRightx	GazeLefty	GazeRighty	PupilLeft	PupilRight	FixationSeq	SaccadeSeq	Blink	GazeAOI
                try {
                    if(data.eyeFeatures.left.blink) {
                        dataText = `${timeStamp},'stimulus_0','ET',${data.x},${data.y},${data.gazeLeft.x},${data.gazeRight.x},${data.gazeLeft.y},${data.gazeRight.y},${0.0},${0.0},${-1},${-1},${1},${-1}`
                    } else 
                        dataText = `${timeStamp},'stimulus_0','ET',${data.x},${data.y},${data.gazeLeft.x},${data.gazeRight.x},${data.gazeLeft.y},${data.gazeRight.y},${data.eyeFeatures.left.pupil[1]},${data.eyeFeatures.left.pupil[1]},${-1},${-1},${0},${-1}`;
                    console.log(dataText);
                } catch (error) {
                   console.log(`eyeBlink: ${data.eyeFeatures.left.blink}`);
                }

                // writeReport(dataText);
                /**
                console.log(`prediction: ${data.x} - ${data.y}`);
                console.log(`gazeLeft: ${data.gazeLeft.x} - ${data.gazeLeft.y}`);
                console.log(`gazeRight: ${data.gazeRight.x} - ${data.gazeRight.y}`);
                console.log(`eyeBlink: ${data.eyeFeatures.left.blink}`);
                console.log(` Left Imagex: ${data.eyeFeatures.left.imagex}- Imagey: ${data.eyeFeatures.left.imagey}`);
                console.log(` right Imagex: ${data.eyeFeatures.right.imagex}- Imagey: ${data.eyeFeatures.right.imagey}`);
                console.log(`LeftPupil: ${JSON.stringify(data.eyeFeatures.left.pupil)}`);
                console.log(`RightPupil: ${JSON.stringify(data.eyeFeatures.right.pupil)}`);
                **/
             } /* data is an object containing an x and y key which are the x and y prediction coordinates (no bounds limiting) */
            //  console.log(clock); /* elapsed time in milliseconds since webgazer.begin() was called */
        })
        .saveDataAcrossSessions(true)
        .begin();
        webgazer.showVideoPreview(true) /* shows all video previews */
            .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Kalman Filter defaults to on. Can be toggled by user. */

    //Set up the webgazer video feedback.
    var setup = function() {

        //Set up the main canvas. The main canvas is used to calibrate the webgazer.
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(canvas.width);
        console.log(canvas.height);
        canvas.style.position = 'fixed';
    };
    setup();

};

// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function() {
    webgazer.end();
}



/**
 * Restart the calibration process by clearing the local storage and reseting the calibration point
 */
function Restart(){
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
}
