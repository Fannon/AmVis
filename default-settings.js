/* global amvis */

/**
 * This are the default Settings the Client starts with and the Controller resets to by choosing "Default"
 */
amvis.settings = {};

/** Main Settings */
amvis.settings.main = {
    serverUrl: '/', // Default: '/' (Own Server)  Use absolute URL for Remote Server Control
    debug: true // Displays Frame Rate etc.
};

/** Available Programs */
amvis.settings.programs = [
    'simpleBackground',
    'colorpalette',
    'experimental'
];

amvis.settings.defaultProgram = 'colorpalette';

/** Visual Settings */
amvis.settings.visual = {
    analyzerInterval: 500,  // in ms
    interpolationInterval: 100, // in ms
    interpolationRate: 0.05, // How much Interpolation is applied each Interval
    analogAngle: 20,    // Rotation Degree for calculating analog palette
    maxBrightness: 100,   // 0 to 255
    minBrightness: 20,    // 0 to 255
    minColorfulness: 100,  // 0 to ~300
    saturation: 0,     // -1 to 1
    shiftHue: 0,    // 0 to 360
    motionScoreDegree: 1.0 // 0 to 1
};

/** Advanced Settings */
amvis.settings.advanced = {
    webcamoptions: {
        video:true,
        audio:false
    },
    controllerInterval: 200,
    tryAgainInterval: 3000, // New attempt to connect every ... ms
    antialias: true,
    currentValues: {}
};

