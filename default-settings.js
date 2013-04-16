/**
 * This are the default Settings the Client starts with and the Controller resets to by choosing "Default"
 */

var settings = {};

// Main Settings
settings.set               = true;
settings.serverUrl         = '/'; // Default: '/' (Own Server)  Use absolute URL for Remote Server Control

// Visual Settings
settings.interval          = 250;  // in ms
settings.analogAngle       = 20;    // Rotation Degree for calculating analog palette
settings.maxBrightness     = 100;   // 0 to 255
settings.minBrightness     = 20;    // 0 to 255
settings.minColorfulness   = 100;   // 0 to ~300
settings.saturation        = 0;     // -1 to 1
settings.shiftHue          = 0;    // 0 to 360

// Advanced Settings
settings.defaultColorArray = [[0,0,0], [0,0,0], [0,0,0], [0,0,0]];
settings.webcamoptions     = {video:true, audio:false};
settings.tryAgainInterval  = 3000; // New attempt to connect every ... ms

settings.currentValues     = {};