BTD.storage = {
	get : function(key) {
	  	return JSON.parse(localStorage.getItem('BTD_' + key))
	}
	, set : function set(key, value) {
		localStorage.setItem('BTD_' + key, JSON.stringify(value))
	}
}
