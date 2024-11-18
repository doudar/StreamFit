////////////////////////////////Begin Normal Script //////////////////////////////////

const FitParser = require('fit-file-parser').default
const { syncBuiltinESMExports } = require('module');

const status = document.getElementById('status');
const heart_rate = document.getElementById('heart_rate');
const power = document.getElementById('power');
const cadence = document.getElementById('cadence');
const stopBTN = document.getElementById('stopBTN');

const blankDiv1 = document.createElement('div');
const blankDiv2 = document.createElement('div');
const blankDiv3 = document.createElement('div');
const progress = document.createElement('input');
const digitalProgress = document.createElement('div');
const simulateCheckboxText = document.createElement('div');
const simulateCheckbox = document.createElement('input');

blankDiv1.textContent = '\u200c';
blankDiv2.textContent = '\u200c';
blankDiv3.textContent = '\u200c';
status.textContent = '\u200c';
digitalProgress.textContent = '0/0';
progress.value = '0';
progress.setAttribute('class', 'slider1');
progress.setAttribute('type', 'range');
progress.setAttribute('min', '0');
simulateCheckboxText.textContent = 'Simulate watts using incline feedback:';
simulateCheckbox.setAttribute('type', 'checkbox');

stopBTN.parentNode.insertBefore(progress, stopBTN);
stopBTN.parentNode.insertBefore(digitalProgress, stopBTN);
stopBTN.parentNode.insertBefore(blankDiv3, stopBTN.nextSibling);
stopBTN.parentNode.insertBefore(simulateCheckboxText, blankDiv3.nextSibling);
simulateCheckboxText.parentNode.insertBefore(simulateCheckbox, simulateCheckboxText.nextSibling);

progress.onclick = function () { updateFromSlider(this.value); };
var i = 0;
var currentIncline = 0;
var content;

const reader = new FileReader();

function readFile(file) {
  reader.addEventListener('load', (event) => {
    const result = event.target.result;
    console.log('result is loaded');
    readFit(result, streamFit);
  });

  reader.addEventListener('progress', (event) => {
    if (event.loaded && event.total) {
      const percent = (event.loaded / event.total) * 100;
      status.textContent = (`Progress: ${Math.round(percent)}`);
    }
  });
  reader.readAsArrayBuffer(file);
  console.log('reading file');
  content = reader.result;
}

if (window.FileList && window.File && window.FileReader) {
  document.getElementById('file-selector').addEventListener('change', event => {
    status.textContent = '';
    const file = event.target.files[0];
    console.log(file);
    console.log(file.name.split('.').pop());
    if (!(file.name.split('.').pop() == "fit")) {
      status.setAttribute("color", "yellow");
      status.textContent = 'Not a fit file.';
      return;
    } else {
      status.textContent = `${file.name} is loading`;
      readFile(file);
    }
  });
}
var refreshIntervalId;

stopBTN.onclick = function () {
  clearInterval(refreshIntervalId);
  status.setAttribute("style", "color:yellow");
  status.textContent = 'Stop Button Pressed';
  heart_rate.textContent = 'heart rate:';
  power.textContent = 'power:';
  cadence.textContent = 'cadence:';
  enableSliders(false);
  i = 0;
  reader.value = '';
};

function readFit(fitFile, callback) {

  var fitParser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: false,
    mode: 'both',
  });
  fitParser.parse(fitFile, function (error, fitData) {
    if (error) {
      console.log('error:');
      console.log(error);
    } else {
      let fitString = JSON.stringify(fitData);
      console.log('parse complete');
      callback(fitData);
      status.textContent = '\u200c';
    }
  });
}

function updateFromSlider(x) {
  i = x;
}

function enableSliders(enable) {
  let value = 'disable';
  if (enable == true) {
    value = 'enable';
  }

  var xhr = new XMLHttpRequest();
  xhr.open("GET", `/wattsslider?value=${value}`, true);
  xhr.send();
  var xhr2 = new XMLHttpRequest();
  xhr2.open("GET", `/cadslider?value=${value}`, true);
  xhr2.send();
  var xhr3 = new XMLHttpRequest();
  xhr3.open("GET", `/hrslider?value=${value}`, true);
  xhr3.send();
}

function streamFit(fitData) {

  enableSliders(true);
  let timeDelay = 1000;
  let oldTime = fitData.activity.sessions[0].laps[0].records[0].timestamp;
  let recordsLength = fitData.activity.sessions[0].laps[0].records.length;
  let record = fitData.activity.sessions[0].laps[0].records[0];
  let powerOutput = 0;

  progress.setAttribute("max", `${recordsLength}`);

  refreshIntervalId = setInterval(function () {
    if (i < (recordsLength + 1)) {
      digitalProgress.textContent = `${i}/${recordsLength}`;
      progress.value = `${i}`;
      record = fitData.activity.sessions[0].laps[0].records[i]
      timeDelay = (record.timestamp - oldTime);
      oldTime = record.timestamp;
      console.log(record.timestamp);
      if (simulateCheckbox.checked) {
        requestConfigValues();
        if (currentIncline < 0) {
          currentIncline = 0;
        }
        powerOutput = 0.00001 * currentIncline ** 2 + 0.0092 * currentIncline + 16.8039;
        powerOutput = Math.round(powerOutput * (record.cadence / 90));
        power.textContent = `power: ${powerOutput} incline was: ${currentIncline}`;
      } else {
        powerOutput = record.power;
        power.textContent = `power: ${powerOutput}`;
      }
      cadence.textContent = `cadence: ${record.cadence}`;
      heart_rate.textContent = `heart rate: ${record.heart_rate}`;
      let xhr = new XMLHttpRequest();
      xhr.open("GET", "/wattsslider?value=" + powerOutput, true);
      xhr.send();
      let xhr2 = new XMLHttpRequest();
      xhr2.open("GET", "/cadslider?value=" + record.cadence, true);
      xhr2.send();
      let xhr3 = new XMLHttpRequest();
      xhr3.open("GET", "/hrslider?value=" + record.heart_rate, true);
      xhr3.send();
    } else {
      clearInterval(refreshIntervalId);
    }
    i++;
  }, timeDelay);
  console.log("Stream Fit has run");
}

//read the json from rtdata
function requestConfigValues() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText);
      currentIncline = obj.currentIncline;
    }
  };
  xhttp.open("GET", "/runtimeConfigJSON", true);
  xhttp.send();
}

///////////////////// End Normal Script //////////////////////