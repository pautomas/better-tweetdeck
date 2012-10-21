var templates = document.createElement('script');
templates.src = chrome.extension.getURL('templates/mustaches.js');
(document.head||document.documentElement).appendChild(templates);


var s = document.createElement('script');
s.src = chrome.extension.getURL('better-tweetdeck.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};

var p = document.createElement('link');
p.rel = 'stylesheet';
p.href = chrome.extension.getURL('custom.css');
(document.head||document.documentElement).appendChild(p);

var l = document.createElement('link');
l.rel = 'stylesheet';
l.href = chrome.extension.getURL('themes/light/light.css');
(document.head||document.documentElement).appendChild(l);
//p.onload = function() {
//   p.parentNode.removeChild(p);
//};

$.get(chrome.extension.getURL('help.html'), function(data) {
	var d = document.createElement('div');
	d.id = 'help-modal-content';
	d.setAttribute('style', 'display:none');
	d.innerHTML = data;
	document.body.appendChild(d)
});
