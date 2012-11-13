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
