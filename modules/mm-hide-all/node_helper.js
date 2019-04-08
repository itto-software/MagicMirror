'use strict';

/* Magic Mirror
 * Module: voicecontrol
 *
 * By Alex Yaknin 
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const spawn = require('child_process').spawn;

module.exports = NodeHelper.create({
    start: function () {
        this.started = false;

    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "ALEXA-CONNECT") {
            this.startRecognition(payload);
            return;
        }
    },

    startRecognition: function (config) {

        var models = config.models;

        var kwsSensitivity = 0.5;
        this.started = true;
        var self = this;
        // Initilize the keyword spotter
        var params = ['./modules/mm-hide-all/AlexaClientSDKConfig.json']; //, modelFile1, modelFile2];

        //var kwsProcess = spawn('python', ['./speech-osx/kws-multiple.py', modelFile1, modelFile2], { detached: false });
        var kwsProcess = spawn('./modules/mm-hide-all/SampleApp', params, { detached: false });
        // Handel messages from python script
        kwsProcess.stderr.on('data', function (data) {
            var message = data.toString();
            console.log(message);
            var target_on = new RegExp(/mirror_on/);
            var target_off = new RegExp(/mirror_off/);
            var on = target_on.test(message);
            var off = target_off.test(message);
            if (on) {
                self.sendSocketNotification("SHOW_MIRROR", model);
            }
            if (off) {
                self.sendSocketNotification("SMART_MIRROR", model);
            }

        })
        kwsProcess.stdout.on('data', function (data) {
            console.log(data.toString());
        })
    }

});