/* global Module */

/* Magic Mirror
 * Module: MMM-PulseCamera
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-PulseCamera", {

	getScripts: function () {
		return [
			"webcamera.js",
			"numeric-1.2.6.js",
			"clmtrackr.js",
			"model_pca_20_svm.js"
		];
	},
	getDom: function () {

		var wrapper = document.createElement("div");
		var video = document.createElement("video");
		video.id = "videoMain";
		video.style.display = "none";
		video.autoplay = true;
		var canvas = document.createElement("canvas");
		canvas.id = "canvasMain";
		wrapper.appendChild(video);
		wrapper.appendChild(canvas);

		HeartRateCam.attach(wrapper);

		return wrapper;
	},
	getTemplateData: function () {
		return this.config
	},
	start: function () {
		Log.info("Starting module: " + this.name);

	},
	notificationReceived: function (notification, payload, sender) {
		if (notification === "VITAL_CHECK") {
			this.show();
		}

		if (notification === "VITAL_CHECK_END") {
			this.hide();
		}
	}
});
