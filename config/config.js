/* Magic Mirror Config Sample
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information how you can configurate this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
	address: "localhost", // Address to listen on, can be:
	// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
	// - another specific IPv4/6 to listen on a specific interface
	// - "", "0.0.0.0", "::" to listen on any interface
	// Default, when address config is left out, is "localhost"
	port: 8080,
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"], // Set [] to allow all IP addresses
	// or add a specific IPv4 of 192.168.1.5 :
	// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
	// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
	// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	language: "ja",
	timeFormat: 24,
	units: "metric",

	modules: [
		{
			module: 'voicecontrol',
			position: 'bottom_left',
			config: {
				models: [
					{
						keyword: "showMirror",   // keyword 
						description: "「鏡を表示して」と言うと、情報が消えます",
						file: "snowboy/showMirror.pmdl", // trained model file name
						message: "SHOW_MIRROR"   // notification message that's broadcast in the MagicMirror app
					},
					{
						keyword: "smartMirror",
						description: "「スマートミラー」と言うと、情報が表示されます",
						file: "snowboy/smartMirror.pmdl",
						message: "SMART_MIRROR"
					},
					{
						keyword: "vitalCheck",
						description: "「バイタルチェックして」と言うと、脈拍が表示されます",
						file: "snowboy/vitalCheck.pmdl",
						message: "VITAL_CHECK"
					},
					{
						keyword: "vitalCheckEnd",
						description: "「バイタルチェック終了」と言うと、カメラが消えます",
						file: "snowboy/vitalCheckEnd.pmdl",
						message: "VITAL_CHECK_END"
					}
				]
			}
		},
		{
			module: 'mm-hide-all',
			position: 'bottom_right'
		},
		{
			module: 'MMM-PulseCamera',
			position: 'lower_third'
		},
		{
			module: "alert",
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "calendar",
			header: "JP Holidays",
			position: "top_left",
			config: {
				calendars: [
					{
						symbol: "calendar-check-o ",
						url: "https://www.google.com/calendar/ical/ja.japanese%23holiday%40group.v.calendar.google.com/public/basic.ics"
					}
				]
			}
		},
		{
			module: "currentweather",
			position: "top_right",
			config: {
				location: "Tokyo",
				locationID: "1850147",  //ID from http://www.openweathermap.org/help/city_list.txt
				appid: "bf87f956430538598511f41dee733089"
			}
		},
		{
			module: "weatherforecast",
			position: "top_right",
			header: "Weather Forecast",
			config: {
				location: "Tokyo",
				locationID: "1850147",  //ID from http://www.openweathermap.org/help/city_list.txt
				appid: "bf87f956430538598511f41dee733089"
			}
		},
		{
			module: "newsfeed",
			position: "bottom_bar",
			config: {
				feeds: [
					{
						title: "Japan",
						url: "http://www3.nhk.or.jp/rss/news/cat0.xml"
					}
				],
				showSourceTitle: true,
				showPublishDate: true
			}
		},
	]

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }