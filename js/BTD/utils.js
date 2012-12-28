BTD.utils = {
	openCustomModal : function(title, content) {
		var modal = new TD.components.BaseModal
		  , html = ''

		modal.$title.html(title)
		modal.$menuContainer.html(content)
		$("#open-modal").append(modal.$node).show()
	}
	/**
	 * Fake-hash: only joining available strings to generate a key that's 
	 * hopefully both unique and persistent
	 */ 
	, generateColumnHash : function(column) {
		return (column.model.getFeedKeys().join() + column.model.getTitle()).replace(/,\s/g, '')
	}
}
