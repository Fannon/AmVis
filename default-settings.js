/* global amvis */

/**
 * This are the default Settings the Client starts with and the Controller resets to by choosing "Default"
 */

amvis.settings = {};

// Main Settings
amvis.settings.set               = true;
amvis.settings.serverUrl         = '/'; // Default: '/' (Own Server)  Use absolute URL for Remote Server Control

// Visual Settings
amvis.settings.interval          = 250;  // in ms
amvis.settings.analogAngle       = 20;    // Rotation Degree for calculating analog palette
amvis.settings.maxBrightness     = 100;   // 0 to 255
amvis.settings.minBrightness     = 20;    // 0 to 255
amvis.settings.minColorfulness   = 100;   // 0 to ~300
amvis.settings.saturation        = 0;     // -1 to 1
amvis.settings.shiftHue          = 0;    // 0 to 360

// Advanced Settings
amvis.settings.defaultColorArray = [[0,0,0], [0,0,0], [0,0,0], [0,0,0]];
amvis.settings.webcamoptions     = {video:true, audio:false};
amvis.settings.tryAgainInterval  = 3000; // New attempt to connect every ... ms

amvis.settings.currentValues     = {};
