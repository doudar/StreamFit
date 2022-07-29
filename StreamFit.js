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
   const progress = document.createElement('input');
   const digitalProgress = document.createElement('div');

   blankDiv1.textContent = '\u200c';
   blankDiv2.textContent = '\u200c';
   status.textContent = '\u200c';
   digitalProgress.textContent = '0/0';
   progress.value = '0';
   progress.setAttribute('class', 'slider1');
   progress.setAttribute('type', 'range');
   progress.setAttribute('min', '0');

   var i = 0;

   progress.onclick = function () { updateFromSlider(this.value); };

   cadence.parentNode.insertBefore(progress, cadence.nextSibling);
   cadence.parentNode.insertBefore(digitalProgress, progress.nextSibling);
   heart_rate.parentNode.insertBefore(blankDiv1, heart_rate);
   progress.parentNode.insertBefore(blankDiv2, progress);



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

     progress.setAttribute("max", `${recordsLength}`);

     refreshIntervalId = setInterval(function () {
       if (i < (recordsLength + 1)) {
         digitalProgress.textContent = `${i}/${recordsLength}`;
         progress.value = `${i}`;
         record = fitData.activity.sessions[0].laps[0].records[i]
         timeDelay = (record.timestamp - oldTime);
         oldTime = record.timestamp;
         console.log(record.timestamp);
         power.textContent = `power: ${record.power}`;
         cadence.textContent = `cadence: ${record.cadence}`;
         heart_rate.textContent = `heart rate: ${record.heart_rate}`;
         let xhr = new XMLHttpRequest();
         xhr.open("GET", "/wattsslider?value=" + record.power, true);
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

   ///////////////////// End Normal Script //////////////////////
