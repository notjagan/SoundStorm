var visible = {};
var port;

chrome.commands.onCommand.addListener(function (command) {
	if (command === "toggle-play-control") {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			if (tabs.length > 0) {
				var activeId = tabs[0].id;
				visible[activeId] = !visible[activeId];
				if (visible[activeId]) {
					if (typeof port === "undefined") {
						chrome.tabs.query({ url: "*://soundcloud.com/*" }, function (tabs) {
							if (tabs.length > 0) {
								var soundcloudId = tabs[0].id;
								port = chrome.tabs.connect(soundcloudId, { name: "soundcloud-port" });
								port.onMessage.addListener(function (msg) {
									if (msg.connected) {
										port.postMessage({
											action: "get-settings",
											createBar: true
										});
									}
									else {
										chrome.tabs.sendMessage(activeId, {
											action: "apply-settings",
											settings: msg.settings,
											createBar: msg.createBar
										});
									}
								});
								port.postMessage({ action: "handshake" });
								chrome.tabs.onRemoved.addListener(function (soundcloudId) {
									port = undefined;
								});
							}
							else {
								chrome.tabs.sendMessage(activeId, {
									action: "report-error",
									error: "soundcloud-closed",
									createBar: true
								});
								return;
							}
						});
					}
					else {
						port.postMessage({
							action: "get-settings",
							createBar: true
						});
					}
				}
			}
		});
	}
});
