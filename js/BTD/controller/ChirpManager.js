BTD.controller.chirpManager = (function() {
	var currentChirpId = null
		, getFromUpdatesView = function(columnId) {
			var chirps = [] 
			$(TD.controller.columnManager.getAll()[columnId].updateArray).each(function() {
				chirps.push(this.id)
			})
			return chirps	
		}
		, getFromDetailView = function(columnId) {
			var columnDetail = TD.controller.columnManager.getAll()[columnId].detailViewComponent
			  , conversation = []
			  , chirps = []
			// Is a message thread
			if (columnDetail.chirp.messages) {
				conversation = columnDetail.chirp.messages
			} else {
				var mainChirp = TD.controller.columnManager.getAll()[columnId].detailViewComponent.chirp || []
				  , repliesTo = TD.controller.columnManager.getAll()[columnId].detailViewComponent.repliesTo.repliesTo || []
				  , replies = TD.controller.columnManager.getAll()[columnId].detailViewComponent.replies.replies || []

				conversation = replies.concat([mainChirp], repliesTo)
			}

			$(conversation).each(function() {
				if (chirps.indexOf(this.id) == -1) {
					chirps.push(this.id)
				}
			})
			return chirps	
		}

	return {
		  getCurrentChirpId : function() {
		  	return this.currentChirpId
		  }
		, getByColumnId: function(columnId) {
				if ($('[data-column="' + columnId + '"] header.detail').length > 0) {
					return getFromDetailView(columnId)
				} else {
					return getFromUpdatesView(columnId)
				}
		}
		, setCurrentChirp : function(columnId, chirpId) {
			$("[data-key='" + this.currentChirpId +"']").removeClass('s-current')

			var isDetail = ($('[data-column="' + columnId + '"] header.detail').length > 0)
			  , chirp = null
			  , selector = BTD.controller.columnManager.getColumnSelector(columnId)

			this.currentChirpId = chirpId
			if (this.currentChirpId) {
				if (!isDetail) {
					selector += ' .column-holder'
				} else {
					selector = ' .column-detail'
				}
				chirp = $(selector).find("article[data-key='" + this.currentChirpId + "']")
				this.currentChirpIndex = $(selector).find('article').index(chirp)
				chirp.addClass('s-current').get(0).scrollIntoView(false)
			} else {
				this.currentChirpIndex = -1
			}
		}
		, setCurrentChirpByPosition : function(columnId, position) {
			var chirpId = null
			  , chirpContainer = TD.controller.columnManager.get(columnId).getChirpContainer()
			chirpContainer.find('article').each(function() {
				var chirp = $(this)
				if (chirp.position().top <= position.top &&
						position.top < chirp.position().top + chirp.height()
					) {
					chirpId = $(this).attr('data-key')
					return false
				}
			})
			this.setCurrentChirp(columnId, chirpId)
		}
		/*
		, getChirpsInViewPort : function(columnId) {
			var columnTop = $('[data-column="' + columnId + '"] .column-updates').scrollTop()
			  , columnHeight = $('[data-column="' + columnId + '"] .column-updates').height()
			  , visibleChirps = []

			$('#' + columnId + ' article').each(function() {
				var chirpPos = $(this).position().top
				  , isVisible = false
				if (chirpPos >= 0 && chirpPos < columnHeight) {
					visibleChirps.push($(this).attr('data-key'))
				}
			})
			return visibleChirps
		}
		*/
	}
})();
