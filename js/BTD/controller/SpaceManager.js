
BTD.controller.spaceManager = (function() {
	var STORAGE_KEY = 'spaces'
	  , spaces = BTD.storage.get(STORAGE_KEY)||{}

	return {
		get : function(spaceId) {
			return spaces[spaceId]
		} 

		, getAll : function() {
			return spaces
		}

		, getAllOrdered : function() {
			var orderedSpaces = []
			
			$.each(spaces, function(spaceId, space) {
				space.id = spaceId
				orderedSpaces.push(space)
			})
			return orderedSpaces
		}

		, add : function(space) {
			space.id = this.getAllOrdered().length + 1
			spaces[space.id] = space
			BTD.storage.set(STORAGE_KEY, spaces)
		}

		, edit : function(spaceId, space) {
			space.id = spaceId
			spaces[space.id] = space
			BTD.storage.set(STORAGE_KEY, spaces)
		}

		, remove : function(spaceId) {
			delete spaces[spaceId]
			BTD.storage.set(STORAGE_KEY, spaces)
		}

		, showSpace : function(spaceId) {
			var space = this.get(spaceId)
			$('.column').hide()
			$(space.columns).each(function() {
				var column = BTD.controller.columnManager.getByFeedKey(this) 
					|| BTD.controller.columnManager.getByFeedKeyHash(this)
				 ,  columnId = null
				if (column !== undefined) {
					columnId = column.model.getKey()
					$('#' + columnId).show()
				}
			})
			$('#column-navigator .menu-button').text(space.name)
		}

		, showAll : function() {
			$('.column').show()
			$('#column-navigator .menu-button').text('Columns')
		}
	}
})();
