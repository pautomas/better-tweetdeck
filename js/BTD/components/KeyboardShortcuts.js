BTD.components.KeyboardShortcuts = {
	  currentColumnIndex : null
	, currentChirpIndex : null

	, init : function() {
		/*
		* Init keyboard shortcuts
		*/
		$(window).bind('keydown', (function(e) { 
				if (e.target.tagName != 'BODY'/* || this.getContext() != 'window'*/) {
					console.log(e.target.tagName)
					return 
				}
				var column = TD.controller.columnManager.get(BTD.controller.columnManager.getCurrentColumnId())
					, $currentColumn = $()
				if (column) {
					$currentColumn = TD.controller.columnManager.get(BTD.controller.columnManager.getCurrentColumnId()).getChirpContainer()
				}
				switch (e.which) {
					case 13: // Enter - Open tweet detail
						var detailHeader = $currentColumn.find('.js-column-back')
						if ($currentColumn.hasClass('is-shifted-1')) {
							detailHeader.click()
						} else {
							$currentColumn.find("[data-key='" + BTD.controller.chirpManager.getCurrentChirpId() + "']").children('div').click()
						}
						break
					case 27: // ESC - Close dialog
						//$('.ovl').css('display', 'none')
						$('.close').click()
						break
					case 73: // I - Move column left
						TD.controller.columnManager.move(BTD.controller.columnManager.getCurrentColumnId(), "left")
						break
					case 79: // O - Move column right
						TD.controller.columnManager.move(BTD.controller.columnManager.getCurrentColumnId(), "right")
						break
					case 68: // D - Delete column
						TD.controller.columnManager.deleteColumn(BTD.controller.columnManager.getCurrentColumnId())
						break
					case 48: // 0 - Go to last column
						var columns = BTD.controller.columnManager.getIds()
						this.currentColumnIndex = columns.length - 1
						BTD.controller.columnManager.setCurrentColumnId(columns[this.currentColumnIndex])
						BTD.controller.chirpManager.setCurrentChirp(BTD.controller.columnManager.getCurrentColumnId())
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
						this.currentColumnIndex = e.keyCode - 49
						BTD.controller.columnManager.setCurrentColumnId(BTD.controller.columnManager.getIds()[this.currentColumnIndex])
						BTD.controller.chirpManager.setCurrentChirp(BTD.controller.columnManager.getCurrentColumnId())
						break
					case 40: // down - Next Tweet
					case 74: // J - Next Tweet
						if (BTD.controller.columnManager.getCurrentColumnId()) {
							var chirps = BTD.controller.chirpManager.getByColumnId(BTD.controller.columnManager.getCurrentColumnId())
							if (this.currentChirpIndex != null) {
								this.currentChirpIndex = (this.currentChirpIndex + 1 >= chirps.length) ? chirps.length - 1 : this.currentChirpIndex + 1
								//this.currentChirpIndex = (this.currentChirpIndex + 1) % chirps.length
							} else {
								this.currentChirpIndex = 0
							}
							BTD.controller.chirpManager.setCurrentChirp(BTD.controller.columnManager.getCurrentColumnId(), chirps[this.currentChirpIndex])
						}
						break
					case 38: // up - Previous Tweet
					case 75: // K - Previous Tweet
						if (BTD.controller.columnManager.getCurrentColumnId()) { 
							var chirps = BTD.controller.chirpManager.getByColumnId(BTD.controller.columnManager.getCurrentColumnId())
							if (this.currentChirpIndex != null) {
								this.currentChirpIndex = (this.currentChirpIndex - 1 < 0) ? 0 : this.currentChirpIndex - 1
								//this.currentChirpIndex = (chirps.length + this.currentChirpIndex - 1) % chirps.length
							} else {
								this.currentChirpIndex = chirps.length - 1
							}
							BTD.controller.chirpManager.setCurrentChirp(BTD.controller.columnManager.getCurrentColumnId(), chirps[this.currentChirpIndex])
						}
						break
					case 37: // left - Previous column
					case 72: // H - Previous column
						var columns = BTD.controller.columnManager.getIds()
						  , position = $currentColumn.find('article[data-key="' + BTD.controller.chirpManager.getCurrentChirpId() + '"]').position()

						if (position != null) {
							position.top = position.top + $currentColumn.find('article[data-key="' + BTD.controller.chirpManager.getCurrentChirpId() + '"]').height() / 2
						}

						if (this.currentColumnIndex != null) { 
							this.currentColumnIndex = (columns.length + this.currentColumnIndex - 1) % columns.length
						} else {
							this.currentColumnIndex = columns.length - 1
						}
						BTD.controller.columnManager.setCurrentColumnId(columns[this.currentColumnIndex])
						
						// Reset current chirp
						if (position != null) {
							BTD.controller.chirpManager.setCurrentChirpByPosition(BTD.controller.columnManager.getCurrentColumnId(), position)
						}
						break
					case 39: // right - Next column
					case 76: // L - Next column
						var columns = BTD.controller.columnManager.getIds()
						  , position = $currentColumn.find('article[data-key="' + BTD.controller.chirpManager.getCurrentChirpId() + '"]').position()

						if (position != null) {
							position.top = position.top + $currentColumn.find('article[data-key="' + BTD.controller.chirpManager.getCurrentChirpId() + '"]').height() / 2
						}
		
						if (this.currentColumnIndex != null) { 
							this.currentColumnIndex = (this.currentColumnIndex + 1) % columns.length
						} else {
							this.currentColumnIndex = 0
						}
						BTD.controller.columnManager.setCurrentColumnId(columns[this.currentColumnIndex])
						
						// Reset current chirp
						if (position != null) {
							BTD.controller.chirpManager.setCurrentChirpByPosition(BTD.controller.columnManager.getCurrentColumnId(), position)
						}
						break
					case 78: // N - New tweet 
						TD.ui.compose.showComposeWindow()
						return false
						break
					case 77: // M - Direct message
						TD.ui.compose.showComposeWindow();
						$('[rel="message"]').click()
						return false
						break
					case 82: // R - Reply tweet / DM
						if (!e.shiftKey && !e.metaKey && !e.altKey) {
							var columnDetail = TD.controller.columnManager.getAll()[BTD.controller.columnManager.getCurrentColumnId()].detailViewComponent
							if (columnDetail && columnDetail.chirp.messages) {
								$currentColumn.find('.js-reply-tweetbox').focus()
							} else {
								$currentColumn.find("[data-key='" + BTD.controller.chirpManager.getCurrentChirpId() + "']").find(('[rel="reply"]')).click()
							}
							return false
						}
						break
					case 84: // T - Retweet
						$currentColumn.find("[data-key='" + BTD.controller.chirpManager.getCurrentChirpId() + "']").find('[rel="retweet"]').click()
						break
					case 70: // F - Favorite
						$currentColumn.find("[data-key='" + BTD.controller.chirpManager.getCurrentChirpId() + "']").find('[rel="favorite"]').click()
						break
					case 191: 
						if (e.shiftKey) { // ? - Show help dialog
							var modalContent = $('#help-modal-content').html()
							BTD.utils.openCustomModal('Keyboard Shortcuts', modalContent) 
						} else if (!e.shiftKey) { // / - Search
							$('.js-search-input').focus()
						}
						break
				}
			}).bind(this))
	}
	, getContext: function() {
		if ($('.ovl').is(':visible')) {
			return 'overlay'
		} else {
			return 'window'
		} 	
	}
};
