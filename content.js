chrome.runtime.onConnect.addListener(function (port) {
	console.assert(port.name === "soundcloud-port");
	port.onMessage.addListener(function (msg) {
		switch (msg.action) {
			case "handshake":
				port.postMessage({ connected: true });
				break;
			case "get-settings":
				port.postMessage({
					settings: {
						
					},
					createBar: msg.createBar
				});
				break;
			default:
				throw new Error("Unrecognized action");
		}
	});
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.action) {
		case "apply-settings":
			break;
		case "report-error":
			break;
		default:
			throw new Error("Unrecognized action");
	}
});
