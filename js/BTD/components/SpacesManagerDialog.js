BTD.components.SpacesManagerDialog = TD.components.BaseModal.extend(function(spaceId) {
    var columnList = _.map(TD.controller.columnManager.getAllOrdered(), function(column) {
		return { key: BTD.utils.generateColumnHash(column), title: column.model.getTitle() }
   	 	})
      , currentSpace = {}
    this.spaceId = spaceId
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
