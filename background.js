var callback = function(details) {
	alert(details["url"]);
}

chrome.webRequest.onBeforeRequest.addListener(callback, {urls: ["*://goo.gl/*", "*://bitly.com/*", "*://bit.ly/*", "*://tinyurl.com/*"]}, ["blocking"]);