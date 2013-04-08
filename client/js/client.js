/////////////////////////////////////////
// Client Main JavaScript ///////////////
/////////////////////////////////////////


// Starting Camera


//// read Camerainformations

//// process Camerainformations

//// create Colorpalette
var colorPalette = [];


// Start / Change Module

// Read Options, execute Options




// Sandbox:
// http://www.kirupa.com/html5/accessing_your_webcam_in_html5.htm
var video = document.querySelector("#videoElement");

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, handleVideo, videoError);
}

function handleVideo(stream) {
    video.src = window.URL.createObjectURL(stream);
}

function videoError(e) {
    // do something
}
