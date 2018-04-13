/* global Module */

/* Magic Mirror
 * Module: MM Hide All
 *
 * By EoF https://forum.magicmirror.builders/user/eof
 * MIT Licensed.
 */

Module.register("mm-hide-all", {

	getScripts: function () {
		return ["modules/mm-hide-all/js/jquery.js"];
	},

	getStyles: function () {
		return ["mm-hide-all-style.css"];
	},
	// magicmirror show/hide
	showHideMirror: function (isShow) {
		if (isShow) {
			$(this.overlay).fadeIn(1000);
			$(this.button).fadeTo(1000, 0.3);
			$(this.text).html('Show');
		} else {
			$(this.overlay).fadeOut(1000);
			$(this.button).fadeTo(1000, 1);
			$(this.text).html('Hide');
		}
		this.updateDom();
	},
	getDom: function () {

		this.wrapper = document.createElement("div");
		this.button = document.createElement("div");
		this.text = document.createElement("span");
		this.overlay = document.createElement("div");
		this.hidden = true;

		this.overlay.className = "paint-it-black";

		this.button.className = "hide-toggle";
		this.button.appendChild(this.text);
		this.text.innerHTML = "Hide";

		this.wrapper.appendChild(this.button);
		this.wrapper.appendChild(this.overlay);

		$(this.button).on("click", function () {
			if (this.hidden) {
				$(this.overlay).fadeIn(1000);
				$(this.button).fadeTo(1000, 0.3);
				$(this.text).html('Show');
				this.hidden = false;
			} else {
				$(this.overlay).fadeOut(1000);
				$(this.button).fadeTo(1000, 1);
				$(this.text).html('Hide');
				this.hidden = true;
			}
		});

		return this.wrapper;
	},
	notificationReceived: function (notification, payload, sender) {
		if (notification === "SHOW_MIRROR") {
			this.showHideMirror(ture);
		}

		if (notification === "SMART_MIRROR") {
			this.showHideMirror(false);
		}
	},
});
