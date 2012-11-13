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
