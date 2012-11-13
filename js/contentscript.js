var templates = document.createElement('script');
templates.src = chrome.extension.getURL('templates/mustaches.js');
(document.head||document.documentElement).appendChild(templates);

var s = document.createElement('script');
s.src = chrome.extension.getURL('js/better-tweetdeck.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};

var p = document.createElement('link');
p.rel = 'stylesheet';
p.href = chrome.extension.getURL('css/custom.css');
(document.head||document.documentElement).appendChild(p);

$.get(chrome.extension.getURL('templates/help.html'), function(data) {
	var d = document.createElement('div');
	d.id = 'help-modal-content';
	d.setAttribute('style', 'display:none');
	d.innerHTML = data;
	document.body.appendChild(d)
});
