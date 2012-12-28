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
