BTD = {};
BTD = { components : {}, utils : {}, settings : {}, controller : {} };
BTD.mustaches = BTD_mustaches

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

BTD.storage = {
	get : function(key) {
	  	return JSON.parse(localStorage.getItem('BTD_' + key))
	}
	, set : function set(key, value) {
		localStorage.setItem('BTD_' + key, JSON.stringify(value))
	}
}


BTD.controller.columnManager = {
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

BTD.components.ExtendSettingsForm = {
	init : function() {

		/*
		* Extend settings component
		*/
		BTD.components.ExtendSettings = TD.components.Base.extend(function() {
			var content = '<fieldset id="global_filter_settings"><legend class="frm-legend">Extend TweetDeck Settings</legend>'
						+ '<div class="control-group"><label for="enable-spaces" class="checkbox">Enable spaces (needs refresh browser)<input type="checkbox" name="enable-spaces" id="enable-spaces" checked="checked"> </label></div>' 
						+ '</fieldset>'
						+ '<div class="mdl-version-number">Provided by the Extend TweetDeck extension</div>'
			this.$node = $(content);
			$("#global-settings").append(this.$node)

		    this.$enableSpaces = $('#enable-spaces')
			this.$enableSpaces.change(_.bind(this.handleEnableSpacesChange, this))
			this.setEnableSpaces()
		}).methods({
		    destroy: function(a) {
		        this.$node.remove()
	    	},handleEnableSpacesChange: function(e) {
				var enableSpaces = Boolean(this.$enableSpaces.attr("checked"))
				BTD.settings.setEnableSpaces(enableSpaces)
			},setEnableSpaces: function() {
				this.$enableSpaces.attr("checked", BTD.settings.getEnableSpaces())
			}})

		/*
		* Override global settings TD component to also include the Design settings
		* one
		*/
		var _GlobalSettings = TD.components.GlobalSettings
		TD.components.GlobalSettings = function() { 
			var extendDialog = new _GlobalSettings
			  , menuNode = extendDialog.$optionList
			  , extendNode = $('<li><a href="#" class="list-link" data-action="extend"><strong>Extend TweetDeck</strong><i class="chev-right"></i></a></li>')

			$(menuNode.parent()).append(extendNode)
			extendNode.on('click', function() {
		        extendDialog.$optionList.removeClass("selected"), extendDialog.currentTab.destroy();
				extendDialog.currentTab = new BTD.components.ExtendSettings
		        extendDialog.currentTabName = "extend", $(this).addClass("selected")
			})
			extendDialog.$optionList.push(extendNode[0])

			return extendDialog;
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
						var detailHeader = $('#' + that.currentColumnId + ' .js-column-back')
						if ($('#' + that.currentColumnId).hasClass('is-shifted-1')) {
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
							var columnDetail = TD.controller.columnManager.getAll()[that.currentColumnId].detailViewComponent
							if (columnDetail && columnDetail.chirp.messages) {
								$('#' + that.currentColumnId + ' .js-reply-tweetbox').focus()
							} else {
								$('#' + that.currentColumnId).find("[data-key='" + that.currentChirpId + "']").find(('[rel="reply"]')).click()
							}
							return false
						}
						break
					case 84: // T - Retweet
						$('#' + that.currentColumnId).find("[data-key='" + that.currentChirpId + "']").find('[rel="retweet"]').click()
						break
					case 70: // F - Favorite
						$('#' + that.currentColumnId).find("[data-key='" + that.currentChirpId + "']").find('[rel="favorite"]').click()
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
				selector = '#' + columnId + ' .column-holder'
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

BTD.components.SpacesSideBar = TD.components.Base.extend(function() {
	this.$node = $(Hogan.compile(BTD.mustaches.space_container)
			.render({spaces:BTD.controller.spaceManager.getAllOrdered()}))
	, this._render()
	, this._handleShowAll()
	, this._registerEvents()
}).methods({
	  _refresh : function() {
		this.$node = $(Hogan.compile(BTD.mustaches.space_container)
				.render({spaces:BTD.controller.spaceManager.getAllOrdered()}))
		$('.spaces-container').html(this.$node.html())
	}
	, _render : function() {		
		$('#container')
			.css('padding-left', '45px')
			.after(this.$node)		
	}
	, _registerEvents : function() {
		var spaces = BTD.controller.spaceManager.getAll()
		$('.spaces-container').on('click', (function(event) {
			var element = $(event.target).closest('.js-spaces-action')
			$('#container').hide()
			switch (element.data('action')) {
				case 'show-all': 
					this._handleShowAll()
					break
				case 'show-space':
					var spaceId = element.attr('data-space')
					$('.space-item.s-current').removeClass('s-current')
					element.closest('.space-item').addClass('s-current')
					BTD.controller.spaceManager.showSpace(spaceId)
					break
				case 'add-space':
					var spacesManagerDialog = new BTD.components.SpacesManagerDialog(null)
					$(spacesManagerDialog).on('save-successful', (function() {
						this._refresh()
					}).bind(this))
					$("#open-modal").append(spacesManagerDialog.$node).show()
					break
				case 'edit-space':
					var spaceId = element.attr('data-space')
					  , spacesManagerDialog = new BTD.components.SpacesManagerDialog(spaceId)
					$(spacesManagerDialog)
						.on('save-successful', (function() {
							this._refresh()
						}).bind(this))
						.on('remove-successful', (function() {
							this._refresh()
						}).bind(this))
					$("#open-modal").append(spacesManagerDialog.$node).show()
					break					
			}
			$('#container').show()
		}).bind(this))
	},
	_handleShowAll : function() {
		$('.space-item.s-current').removeClass('s-current')
		$('.btn-show-all').closest('.space-item').addClass('s-current')
		BTD.controller.spaceManager.showAll()
	}
})

BTD.components.SpacesManagerDialog = TD.components.BaseModal.extend(function(spaceId) {
      this.columns = TD.controller.columnManager.getAllOrdered()
      this.spaceId = spaceId
    var columnList = _.map(this.columns, function(column) {
		return { key: BTD.utils.generateColumnHash(column), title: column.model.getTitle() }
   	 	})
      , currentSpace = {}
	this.$menuContainer.html($(Hogan.compile(BTD.mustaches.spaces_dialog)
		.render({columns:columnList})))
	this.$spaceName = this.$menuContainer.find('#space-name')
	this.$checkboxes = this.$menuContainer.find('input[type=checkbox]')
	this.$footer.append($(Hogan.compile(BTD.mustaches.spaces_dialog_footer).render()))
	this.$addSpaceButton = this.$footer.find('.js-add-space')
	this.$removeSpaceButton = this.$footer.find('.js-remove-space')
	if (this.spaceId) {
		currentSpace = BTD.controller.spaceManager.get(this.spaceId)
	    this.$title.html('Edit space')
		this.$addSpaceButton.html('Save space')
		this.$spaceName.val(currentSpace.name)
		$.each(currentSpace.columns, (function(key, value) {
			this.$checkboxes.filter('[value="' + value + '"]').attr('checked', 'checked')
		}).bind(this))
	} else {
	    this.$title.html('Add new space')
		this.$removeSpaceButton.remove()	
	}
	this._registerEvents()
}).methods({
	  _registerEvents : function() {
	  	this.$menuContainer.find('form').on('submit', function() { return false });
		this.$addSpaceButton.on('click', this._handleSaveSpace.bind(this))
		this.$removeSpaceButton.on('click', this._handleRemoveSpace.bind(this))
	}
	, _handleSaveSpace : function() {
		var spaceName = this.$spaceName.val()
		  , checkedColumns = []
		if (!this.$menuContainer.find('form')[0].checkValidity()) {
			this._handleSaveFailure()
		} else {
			$(this.$checkboxes.filter(':checked')).each(function() {
				checkedColumns.push($(this).val())
			})
			if (this.spaceId) {
				BTD.controller.spaceManager.edit(this.spaceId, {name: spaceName, columns: checkedColumns})				
			} else {
				BTD.controller.spaceManager.add({name: spaceName, columns: checkedColumns})
			}
			this._handleSaveSuccess()
		}
	}
	, _handleSaveSuccess : function() {
        this.destroy()
        $(this).trigger('save-successful')
	}
	, _handleSaveFailure : function() {
	    TD.controller.progressIndicator.addMessage("Problem saving space. Please check the details and try again")		
	}
	, _handleRemoveSpace : function() {
		BTD.controller.spaceManager.remove(this.spaceId)
		this._handleRemoveSuccess()	
	}
	, _handleRemoveSuccess : function() {
        this.destroy()
        $(this).trigger('remove-successful')
	}
	, _handleRemoveFailure : function() {
	    TD.controller.progressIndicator.addMessage("Problem saving space. Please check the details and try again")		
	}
	, destroy : function() {
	    this.supr(), $("#open-modal").hide()
	}
})

;(BetterTweetdeck = {
	init : function() {
		BTD.settings.init()
		BTD.components.ExtendSettingsForm.init();
		BTD.components.KeyboardShortcuts.init()
		
		if (BTD.settings.getEnableSpaces()) {
			new BTD.components.SpacesSideBar
		}
	}
}).init()
