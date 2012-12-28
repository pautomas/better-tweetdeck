BTD.controller.columnManager = (function() {
	var currentColumnId = null

	return {
		  getIds: function() {
				var columnIds = [] 
				$(TD.controller.columnManager.getAllOrdered()).each(function() {
					columnIds.push(this.model.getKey())
				})
				return columnIds
		}
		, getAllByFeedKey : function() {
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
		, getCurrentColumnId : function() {
			return this.currentColumnId
		}
		, setCurrentColumnId : function(columnId) {
			TD.controller.columnManager.showColumn(columnId)

			if (this.currentColumnId) {
				this.getColumnElement(this.currentColumnId).removeClass('s-current')
			}
			this.currentColumnId = columnId
			this.getColumnElement(this.currentColumnId).addClass('s-current')
		}
		, getColumnElement : function(columnId) {
			return $(this.getColumnSelector(columnId))
		}
		, getColumnSelector : function(columnId) {
			return '.js-column[data-column="' + columnId + '"]'
		}
	}
})();
