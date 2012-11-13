BTD.controller.columnManager = (function() {
	return {
		getAllByFeedKey : function() {
			var columns = new Object()
			$(TD.controller.columnManager.getAllOrdered()).each(function() {
				var column = this
				$(this.model.getFeedKeys()).each(function() {
					columns[this] = column
				})
			})
			return columns
		}
		, getByFeedKey : function(key) {
			return BTD.controller.columnManager.getAllByFeedKey()[key]
		}
		, getByFeedKeyHash : function(feedKeyHash) {
			var column = {}
			$(TD.controller.columnManager.getAllOrdered()).each(function() {
				var columnFeedKeysHash = BTD.utils.generateColumnHash(this)
			  	if (columnFeedKeysHash == feedKeyHash) {
					column = this
			  	}
			})
			return column
		}
	}
})();
