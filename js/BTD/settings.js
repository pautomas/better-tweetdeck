
BTD.settings = {
	STORAGE_KEY : 'settings'
	, _ : {
		enable_spaces : 'true'
	}
	, storedSettings : {}
	, init : function() {
		this.storedSettings = BTD.storage.get(this.STORAGE_KEY)
		if (this.storedSettings == undefined) {
			this.storeSettings()
		} else {
			$.each(this.storedSettings, (function(key, value) {
				if (this.storedSettings[key] != undefined) {
					this._[key] = value
				}
			}).bind(this))
			this.storeSettings()
		}
	}
	, storeSettings : function() {
		BTD.storage.set(this.STORAGE_KEY, this._)
	}
	, getStoredSettings : function(key) {
		var storedSettings = BTD.storage.get(this.STORAGE_KEY)
		return storedSettings[key]
	}
	, setEnableSpaces : function(enableSpaces) {
		this._.enable_spaces = String(enableSpaces)
		this.storeSettings()
	}
	, getEnableSpaces : function() {
		return Boolean(this.getStoredSettings('enable_spaces') === 'true')
	}
}
