const FitParser = require('fit-file-parser').default
const { syncBuiltinESMExports } = require('module');

var fs = require('fs');

function readFit(fitFile, callback) {
    let fitData;
    fs.readFile(fitFile, function (err, content) {
        var fitParser = new FitParser({
            force: true,
            speedUnit: 'km/h',
            lengthUnit: 'm',
            temperatureUnit: 'celsius',
            elapsedRecordField: false,
            mode: 'both',
        });
        fitParser.parse(content, function (error, fitData) {
            if (error) {
                console.log(error);
            } else {
                let fitString = JSON.stringify(fitData);
                //console.log("fitString has been created");
                callback(fitData);
            }

        });

    });
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function printFit(fitData) {
    let fitString = JSON.stringify(fitData);
    console.log(fitString);
    console.log("Print Fit has run");
    // callback('./example.fit');
}

function streamFit(fitData) {
    let timeDelay = 1000;
    let oldTime = fitData.activity.sessions[0].laps[0].records[0].timestamp;
    fitData.activity.sessions[0].laps[0].records.forEach((record, index) => {
        timeDelay = (record.timestamp - oldTime);
        sleep(timeDelay);
        oldTime = record.timestamp;
        console.log('time: %d', record.timestamp.getSeconds());
        console.log('power: %d', record.power);
        console.log('cadence: %d', record.cadence);
        console.log('heart rate: %d', record.heart_rate);
       /* var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://smartspin2k.local/targetwattsslider" + record.power, true);
        xhr.send();
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://smartspin2k.local/cadslider?value=" + record.cadence, true);
        xhr.send();
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://smartspin2k.local/hrSlider?value=" + record.heart_rate, true);
        xhr.send();
        */
    });
    console.log("Stream Fit has run");
}

//streamFit();
//printFit(readFit);
//console.log("end of program!");
readFit('./example.fit', streamFit);






