/* Magic Mirror
 * Node Helper: Calendar
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var validUrl = require("valid-url");
var CalendarFetcher = require("./calendarfetcher.js");
var fs = require('fs')

module.exports = NodeHelper.create({
	// Override start method.
	start: function () {
		var events = [];

		this.fetchers = [];

		this.watchIdentified();

		console.log("Starting node helper for: " + this.name);

	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "ADD_CALENDAR") {
			console.log('ADD_CALENDAR: ');
			this.createFetcher(payload.url, payload.fetchInterval, payload.excludedEvents, payload.maximumEntries, payload.maximumNumberOfDays, payload.auth);
		}
	},

	/* createFetcher(url, reloadInterval)
	 * Creates a fetcher for a new url if it doesn't exist yet.
	 * Otherwise it reuses the existing one.
	 *
	 * attribute url string - URL of the news feed.
	 * attribute reloadInterval number - Reload interval in milliseconds.
	 */

	createFetcher: function (url, fetchInterval, excludedEvents, maximumEntries, maximumNumberOfDays, auth) {
		var self = this;

		if (!validUrl.isUri(url)) {
			self.sendSocketNotification("INCORRECT_URL", { url: url });
			return;
		}

		var fetcher;
		if (typeof self.fetchers[url] === "undefined") {
			console.log("Create new calendar fetcher for url: " + url + " - Interval: " + fetchInterval);
			fetcher = new CalendarFetcher(url, fetchInterval, excludedEvents, maximumEntries, maximumNumberOfDays, auth);

			fetcher.onReceive(function (fetcher) {
				//console.log('Broadcast events.');
				//console.log(fetcher.events());

				self.sendSocketNotification("CALENDAR_EVENTS", {
					url: fetcher.url(),
					events: fetcher.events()
				});
			});

			fetcher.onError(function (fetcher, error) {
				self.sendSocketNotification("FETCH_ERROR", {
					url: fetcher.url(),
					error: error
				});
			});

			self.fetchers[url] = fetcher;
		} else {
			console.log('Use existing news fetcher for url: ' + url);
			fetcher = self.fetchers[url];
			fetcher.broadcastEvents();
		}

		fetcher.startFetch();
	},
	watchIdentified: function () {
		var self = this;

		// fetch identified.txt
		try {

			var filepath = '/home/itto/work/ImageDetect2/identified.txt';
			fs.watch(filepath, function (event, filename) {
				if (event == 'change') {
					console.log(event + ' to ' + filepath);
					const userName = fs.readFileSync(filepath, { encoding: "utf-8" });
					self.sendSocketNotification("CHANGE_CALENDAR", { userName: userName });
				}
			});
		} catch (error) {
			console.error(error);
		}
	}
});
