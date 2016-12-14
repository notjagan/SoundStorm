var activePorts = {};
var soundcloudPort;
var activeId;
var interval;

function initiateConnection() {
	soundcloudPort.postMessage({ action: "get-html" });
	interval = setInterval(function () {
		soundcloudPort.postMessage({ action: "get-html" });
	}, 100);
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
	if (activePorts[activeId]) {
		clearInterval(interval);
	}
	activeId = activeInfo.tabId;
	if (activePorts[activeId]) {
		initiateConnection();
	}
});

chrome.commands.onCommand.addListener(function (command) {
	if (command === "toggle-play-control") {
		chrome.tabs.get(activeId, function (tab) {
			if (!tab.url.match(/https?:\/\/(www\.)?soundcloud\.[a-z]+\b.*/)) {
				if (!activePorts[activeId]) {
					activePorts[activeId] = chrome.tabs.connect(activeId, { name: String(activeId) });
					activePorts[activeId].onDisconnect.addListener(function (port) {
						console.log(port.name);
						if (port.name === String(activeId)) {
							clearInterval(interval);
							delete activePorts[activeId];
						}
						delete port;
					});
					if (typeof soundcloudPort === "undefined") {
						chrome.tabs.query({
							url: "*://soundcloud.com/*",
							audible: true
						}, function (tabs) {
							if (tabs.length > 0) {
								var soundcloudId = tabs[0].id;
								soundcloudPort = chrome.tabs.connect(soundcloudId, { name: "soundcloud-port" });					
								soundcloudPort.onMessage.addListener(function (msg) {
									if (msg.connected) {
										initiateConnection();
									} else if (msg.html) {
										activePorts[activeId].postMessage({
											action: "apply-html",
											html: msg.html
										});
									}
								});
								chrome.tabs.onRemoved.addListener(function (tabId) {
									if (tabId === soundcloudId) {
										soundcloudPort = undefined;
										clearInterval(interval);
									} else if (activePorts[tabId]) {
										activePorts[tabId].disconnect();
										if (tabId === activeId) {
											clearInterval(interval);
										}
										delete activePorts[tabId];
									}
								});
							} else {
								activePorts[activeId].postMessage({
									action: "report-error",
									error: "soundcloud-closed"
								});
								return;
							}
						});
					} else {
						initiateConnection();
					}
				} else {
					activePorts[activeId].postMessage({ action: "remove-bar" });
					activePorts[activeId].disconnect();
					clearInterval(interval);
					delete activePorts[activeId];
				}
			}
		});
	}
});
