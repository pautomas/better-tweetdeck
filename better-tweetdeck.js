BTD = {};
BTD = { components : {}, utils : {}, settings : {} };

BTD.utils = {
	openCustomModal : function(title, content) {
		var modal = new TD.components.OpenColumn
		  , html = ''

		modal.$title.html(title)
		modal.$menuContainer.html(content)
		$("#open-modal").append(modal.$node).show()

	}
}
BTD.settings = {
	setUseLightTheme : function(useLightTheme) {
		if (useLightTheme) {
			$('body').addClass('light')
		} else {
			$('body').removeClass('light')
		}
		localStorage.setItem('use_light_theme', String(useLightTheme))
	}
	, getUseLightTheme : function(useLightTheme) {
		return Boolean(localStorage.getItem('use_light_theme') === 'true')
	}
}

BTD.components.DesignSettingsForm = {
	init : function() {

		if (BTD.settings.getUseLightTheme()) {
			$('body').addClass('light')
		} else {
			$('body').removeClass('light')
		}

		/*
		* Design settings component
		*/
		BTD.components.DesignSettings = TD.components.Base.extend(function() {
			var content = '<fieldset id="global_filter_settings"><legend class="frm-legend">Global Filter Settings</legend>'
						+ '<div class="control-group"><label for="use-light-theme" class="checkbox">Light theme<input type="checkbox" name="use-light-theme" id="use-light-theme" checked="checked"> </label></div>' 
						+ '</fieldset>'
						+ '<div class="mdl-version-number">Provided by the Extend TweetDeck extension</div>'
			this.$node = $(content);
			$("#global-settings").append(this.$node)

		    this.$useLightTheme = $('#use-light-theme')
			this.$useLightTheme.change(_.bind(this.handleLightThemeChange, this))
			this.setLightTheme()
		}).methods({
		    destroy: function(a) {
		        this.$node.remove()
	    	},handleLightThemeChange: function(e) {
				var useLightTheme = Boolean(this.$useLightTheme.attr("checked"))
				BTD.settings.setUseLightTheme(useLightTheme)
			},setLightTheme: function() {
				this.$useLightTheme.attr("checked", BTD.settings.getUseLightTheme())
			}})

		/*
		* Override global settings TD component to also include the Design settings
		* one
		*/
		var _GlobalSettings = TD.components.GlobalSettings
		TD.components.GlobalSettings = function() { 
			var settingsDialog = new _GlobalSettings
			  , menuNode = settingsDialog.$optionList
			  , designNode = $('<li><a href="#" class="list-link" data-action="design"><strong>Design</strong><i class="chev-right"></i></a></li>')

			$(menuNode.parent()).append(designNode)
			designNode.on('click', function() {
		        settingsDialog.$optionList.removeClass("selected"), settingsDialog.currentTab.destroy();
				settingsDialog.currentTab = new BTD.components.DesignSettings
		        settingsDialog.currentTabName = "design", $(this).addClass("selected")
			})
			settingsDialog.$optionList.push(designNode[0])

			return settingsDialog;
		}
	}
};

BTD.components.KeyboardShortcuts = {
	  currentColumnIndex : null
	, currentChirpIndex : null
	, currentColumnId : null
	, currentChirpId : null

	, init : function() {
		var that = this
		/*
		* Init keyboard shortcuts
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
							BTD.utils.openCustomModal('Keyboard Shortcuts', modalContent) 
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
};

(BetterTweetdeck = {
	init : function() {
		BTD.components.DesignSettingsForm.init();
		BTD.components.KeyboardShortcuts.init();
	}
}).init()
