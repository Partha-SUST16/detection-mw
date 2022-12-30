import util from "./util.mjs";

const defaultWindowSize = 8;
const equalizeStep = 5;
const threshold = 80;
const minCorrelation = 0.78;
const maxCorrelation = 0.85;

/**
     * Constructor for BlinkDetector
     * @param blinkWindow
     * @constructor
     */
const BlinkDetector = function(blinkWindow) {
    //determines number of previous eyeObj to hold onto
    this.blinkWindow = blinkWindow || defaultWindowSize;
    this.blinkData = new util.DataWindow(this.blinkWindow);
};

BlinkDetector.prototype.extractBlinkData = function(eyesObj) {
    const eye = eyesObj.right;
    const grayscaled = util.grayscale(eye.patch.data, eye.width, eye.height);
    const equalized = util.equalizeHistogram(grayscaled, equalizeStep, grayscaled);
    const thresholded = util.threshold(equalized, threshold);
    return {
        data: thresholded,
        width: eye.width,
        height: eye.height,
    };
}

BlinkDetector.prototype.isSameEye = function(oldEye, newEye) {
    return Math.abs(oldEye.width - newEye.width) <= 3 && Math.abs(oldEye.height - newEye.height) <= 3;
}

BlinkDetector.prototype.isBlink = function(oldEye, newEye) {
    let correlation = 0;
    // console.log(`this blinkWindow: ${this.blinkWindow}`);
    for (let i = 0; i < this.blinkWindow; i++) {
        const data = this.blinkData.get(i);
        const nextData = this.blinkData.get(i + 1);
        if (!this.isSameEye(data, nextData)) {
            return false;
        }
        // console.log('hola');
        correlation += util.correlation(data.data, nextData.data);
    }
    correlation /= this.blinkWindow;
    return correlation > minCorrelation && correlation < maxCorrelation;
}

/**
 *
 * @param eyesObj
 * @returns {*}
 */
BlinkDetector.prototype.detectBlink = function(eyesObj) {
    if (!eyesObj) {
        return eyesObj;
    }

    const data = this.extractBlinkData(eyesObj);
    this.blinkData.push(data);

    eyesObj.left.blink = false;
    eyesObj.right.blink = false;

    if (this.blinkData.length < this.blinkWindow) {
        return eyesObj;
    }

    if (this.isBlink()) {
        eyesObj.left.blink = true;
        eyesObj.right.blink = true;
    }

    return eyesObj;
};

/**
 *
 * @param value
 * @returns {webgazer.BlinkDetector}
 */
function isInt(a) {
    return a % 1 === 0;
}
BlinkDetector.prototype.setBlinkWindow = function(value) {
    if (isInt(value) && value > 0) {
        this.blinkWindow = value;
    }
    return this;
}

const blinkDetector = new BlinkDetector();

export default blinkDetector;