(betterTweetdeck = {
	  currentColumnIndex : null
	, currentChirpIndex : null
	, currentColumnId : null
	, currentChirpId : null

	, init : function() {
		var that = this

		/*
		* Close modal overlays when clicking outside just like in twitter.com
		*/
		$('.ovl').bind('click', function(e) {
			if ($(e.target).hasClass('l-cell')) {
				$('.close').click()			
			}
		})

		/*
		$('#compose-modal .js-compose-input').live('focus', function(e) {
			if (document.activeElement == document.body && $('#compose-modal .js-compose-input').is(':visible')) {
				return false
			}
		})
		*/

		$(window).bind('keydown', function(e) { 
				if (e.target.tagName != 'BODY'/* || that.getContext() != 'window'*/) {
					console.log(e.target.tagName)
					return 
				}
				switch (e.which) {
					case 13: // Enter - Open tweet detail
						var detailHeader = $('#' + that.currentColumnId + ' header.detail')
						if (detailHeader.length > 0) {
							detailHeader.click()
						} else {
							$('#' + that.currentColumnId).find("[data-key='" + that.currentChirpId + "']").children('div').click()
						}
						break
					case 27: // ESC - Close dialog
						//$('.ovl').css('display', 'none')
						$('.close').click()
						break
					case 73: // I - Move column left
						TD.controller.columnManager.move(that.currentColumnId, "left")
						break
					case 79: // O - Move column right
						TD.controller.columnManager.move(that.currentColumnId, "right")
						break
					case 68: // D - Delete column
						TD.controller.columnManager.deleteColumn(that.currentColumnId)
						break
					case 48: // 0 - Go to last column
						var columns = that.getColumnsIds()
						that.currentColumnIndex = columns.length - 1
						that.setCurrentColumn(columns[that.currentColumnIndex])
						that.setCurrentChirp(that.currentColumnId)
						break;
					case 49: // 1...9 - Move to column
					case 50:
					case 51:
					case 52:
					case 53:
					case 54:
					case 55:
					case 56:
					case 57:
						that.currentColumnIndex = e.keyCode - 49
						that.setCurrentColumn(that.getColumnsIds()[that.currentColumnIndex])
						that.setCurrentChirp(that.currentColumnId)
						break
					case 40: // down - Next Tweet
					case 74: // J - Next Tweet
						if (that.currentColumnId) {
							var chirps = that.getChirpsByColumnId(that.currentColumnId)
							if (that.currentChirpIndex != null) {
								that.currentChirpIndex = (that.currentChirpIndex + 1 >= chirps.length) ? chirps.length - 1 : that.currentChirpIndex + 1
								//that.currentChirpIndex = (that.currentChirpIndex + 1) % chirps.length
							} else {
								that.currentChirpIndex = 0
							}
							that.setCurrentChirp(that.currentColumnId, chirps[that.currentChirpIndex])
						}
						break
					case 38: // up - Previous Tweet
					case 75: // K - Previous Tweet
						if (that.currentColumnId) { 
							var chirps = that.getChirpsByColumnId(that.currentColumnId)
							if (that.currentChirpIndex != null) {
								that.currentChirpIndex = (that.currentChirpIndex - 1 < 0) ? 0 : that.currentChirpIndex - 1
								//that.currentChirpIndex = (chirps.length + that.currentChirpIndex - 1) % chirps.length
							} else {
								that.currentChirpIndex = chirps.length - 1
							}
							that.setCurrentChirp(that.currentColumnId, chirps[that.currentChirpIndex])
						}
						break
					case 37: // left - Previous column
					case 72: // H - Previous column
						var columns = that.getColumnsIds()
						  , position = $('#' + that.currentColumnId).find('article[data-key="' + that.currentChirpId + '"]').position()

						if (position != null) {
							position.top = position.top + $('#' + that.currentColumnId).find('article[data-key="' + that.currentChirpId + '"]').height() / 2
						}

						if (that.currentColumnIndex != null) { 
							that.currentColumnIndex = (columns.length + that.currentColumnIndex - 1) % columns.length
						} else {
							that.currentColumnIndex = columns.length - 1
						}
						that.setCurrentColumn(columns[that.currentColumnIndex])
						
						// Reset current chirp
						if (position != null) {
							that.setCurrentChirpByPosition(that.currentColumnId, position)
						}
						break
					case 39: // right - Next column
					case 76: // L - Next column
						var columns = that.getColumnsIds()
						  , position = $('#' + that.currentColumnId).find('article[data-key="' + that.currentChirpId + '"]').position()

						if (position != null) {
							position.top = position.top + $('#' + that.currentColumnId).find('article[data-key="' + that.currentChirpId + '"]').height() / 2
						}
		
						if (that.currentColumnIndex != null) { 
							that.currentColumnIndex = (that.currentColumnIndex + 1) % columns.length
						} else {
							that.currentColumnIndex = 0
						}
						that.setCurrentColumn(columns[that.currentColumnIndex])
						
						// Reset current chirp
						if (position != null) {
							that.setCurrentChirpByPosition(that.currentColumnId, position)
						}
						break
					case 78: // N - New tweet 
						$('.btn-tweet').click()
						return false
						break
					case 77: // M - Direct message
						$('.btn-tweet').click()
						$('.cp-message').click()
						return false
						break
					case 82: // R - Reply tweet / DM
						if (!e.shiftKey && !e.metaKey && !e.altKey) {
							var columnDetail = TD.controller.columnManager.getAll()[that.currentColumnId].detailViewComponent
							if (columnDetail && columnDetail.chirp.messages) {
								$('#' + that.currentColumnId + ' .js-reply-tweetbox').focus()
							} else {
								$('#' + that.currentColumnId).find("[data-key='" + that.currentChirpId + "']").find('.action-reply').click()
							}
							return false
						}
						break
					case 84: // T - Retweet
						$('#' + that.currentColumnId).find("[data-key='" + that.currentChirpId + "']").find('.action-rt').click()
						break
					case 70: // F - Favorite
						$('#' + that.currentColumnId).find("[data-key='" + that.currentChirpId + "']").find('.action-fav').click()
						break
					case 191: 
						if (e.shiftKey) { // ? - Show help dialog
							var modalContent = $('#help-modal-content').html()
							that.openCustomModal('Keyboard Shortcuts', modalContent) 
						} else if (!e.shiftKey) { // / - Search
							$('.js-search-input').focus()
						}
						break
				}
			})
	}
	,  getContext: function() {
		if ($('.ovl').is(':visible')) {
			return 'overlay'
		} else {
			return 'window'
		} 	
	}
	,  getColumnsIds: function() {
			var columns = [] 
			$(TD.controller.columnManager.getAllOrdered()).each(function() {
				columns.push(this.model.getKey())
			})
			return columns
	}
	,  getChirpsByColumnId: function(columnId) {
			if ($('#' + columnId + ' header.detail').length > 0) {
				return this.getChirpsFromDetailView(columnId)
			} else {
				return this.getChirpsFromUpdatesView(columnId)
			}
	}
	,  getChirpsFromUpdatesView: function(columnId) {
			var chirps = [] 
			$(TD.controller.columnManager.getAll()[columnId].updateArray).each(function() {
				chirps.push(this.id)
			})
			return chirps	
	}
	,  getChirpsFromDetailView: function(columnId) {
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
	,  setCurrentColumn : function(columnId) {
		TD.controller.columnManager.showColumn(columnId)

		if (this.currentColumnId) {
			$('#' + this.currentColumnId).removeClass('s-current')
		}
		this.currentColumnId = columnId
		$('#' + this.currentColumnId).addClass('s-current')
	}
	, setCurrentChirp : function(columnId, chirpId) {
		$("[data-key='" + this.currentChirpId +"']").removeClass('s-current')

		var isDetail = ($('#' + columnId + ' header.detail').length > 0)
		  , chirp = null
		  , selector = null

		this.currentChirpId = chirpId
		if (this.currentChirpId) {
			if (!isDetail) {
				selector = '#' + columnId + ' .column-updates'
			} else {
				selector = '#' + columnId + ' .column-detail'
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
		  , selector = TD.controller.columnManager.get(columnId).containerUpdatesSelector
		$(selector).find('article').each(function() {
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
	,  getChirpsInViewPort : function(columnId) {
		var columnTop = $('#' + columnId + ' .column-updates').scrollTop()
		  , columnHeight = $('#' + columnId + ' .column-updates').height()
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
	,  openCustomModal : function(title, content) {
		var modal = new TD.components.OpenColumn
		  , that = this
		  , html = ''

		modal.$title.html(title)
		modal.$menuContainer.html(content)
		$("#open-modal").append(modal.$node).show()

	}
}).init()