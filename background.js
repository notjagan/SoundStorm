var active = false;

chrome.commands.onCommand.addListener(function(command) {
	if (command === "toggle-play-control") {
		active = !active;
		if (active) {
			chrome.tabs.query({url: "*://soundcloud.com/*"}, function (tabs) {
				var tab = tabs[0];
				console.log(tab.url);
;			});
		}
	}
});
