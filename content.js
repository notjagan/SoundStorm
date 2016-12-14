var active = false;
var playControl;

chrome.runtime.onConnect.addListener(function (port) {
	if (port.name === "soundcloud-port") {
		port.postMessage({ connected: true });
		port.onMessage.addListener(function (msg) {
			if (msg.action === "get-html") {
				console.log("Capturing html");
				if (!active) {
					playControl = $("div.playControls")[0];
					active = true;
				}
				var html = playControl.outerHTML;
				port.postMessage({ html: html });
			}
		});
	} else {
		port.onMessage.addListener(function (msg) {
			switch (msg.action) {
				case "apply-html":
					if (!active) {
						$.get(chrome.extension.getURL("/playControl.html"), function (data) {
							playControl = $(data);
							playControl.append($(msg.html));
							playControl.appendTo("body");
						})
						active = true;
					} else {
						$("div.playControls")[0].outerHTML = msg.html;
					}
					break;
				case "remove-bar":
					playControl.remove();
					active = false;
					break;
				case "report-error":
					console.log(msg.error);
					break;
			}
		});
	}
});
