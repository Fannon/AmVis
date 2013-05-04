/* global amvis */

/**
 * This are the default Settings the Client starts with and the Controller resets to by choosing "Default"
 */
amvis.settings = {};

/** Main Settings */
amvis.settings.main = {
    serverUrl: '/' // Default: '/' (Own Server)  Use absolute URL for Remote Server Control
};

/** Available Programs */
amvis.settings.programs = [
    'simpleBackground',
    'colorpalette'
];

/** Visual Settings */
amvis.settings.visual = {
    interval: 250,  // in ms
    analogAngle: 20,    // Rotation Degree for calculating analog palette
    maxBrightness: 100,   // 0 to 255
    minBrightness: 20,    // 0 to 255
    minColorfulness: 100,  // 0 to ~300
    saturation: 0,     // -1 to 1
    shiftHue: 0    // 0 to 360
};

/** Advanced Settings */
amvis.settings.advanced = {
    defaultColorArray: [[0,0,0], [0,0,0], [0,0,0], [0,0,0]],
    webcamoptions: {
        video:true,
        audio:false
    },
    tryAgainInterval: 3000, // New attempt to connect every ... ms
    currentValues: {}
};

