StreamFit allows you to replay a .fit file to a local esp32 running [SS2K](https://github.com/doudar/SmartSpin2k/). You can then use this to test fitness apps that communicate over BLE by providing them with a large set of real world data in a realistic fashion.  

### Installing
The resulting style.css, index.js and index.html can be placed on any webserver and run. The browser will communicate via a SS2K using http://SmartSpin2k.local . 

To build from scratch, you'll need node.js, NPM and browerserify. To edit the script directly, goto line ~2028 of index.js. 