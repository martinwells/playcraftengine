SceneID =
{
    PUBLISHER:0x0000,
    TITLE:0x0001,
    CREDITS:0x0002
};

SplashScene = pc.Scene.extend('splashScene',
{ },
{
	publisherLayer:null,
	titleLayer:null,
	currentScene:SceneID.TITLE,
	btnLaunch:null,
	btnHelp:null,
	btnFeedback:null,
	btnExit:null,

	init:function ()
	{
		this._super();
		this.btnLaunch = pc.Rect.create(700,464,1320,540);
		this.btnHelp = pc.Rect.create(700,580,910,660);
		this.btnFeedback = pc.Rect.create(700,688,1210,748);
		this.btnExit = pc.Rect.create(700,792,900,856);

		//this.publisherLayer = this.addLayer(new PublisherLayer('publisherLayer', 1));
		this.titleLayer = this.addLayer(new TitleLayer('titleLayer', 1));
		
		//pc.device.input.bindState(this, 'select', 'MOUSE_LEFT_CLICK');
		pc.device.input.bindState(this, 'select', 'SPACE');
	},
	onReady:function()
	{
	},
	
    onAction:function (actionName, event, pos) 
	{
	},
		
    process:function () {
	//setLayerInactive:function (layer)
	//setLayerActive:function (layer)

		if (pc.device.input.isInputState(this, 'select'))
		{
			pc.device.game.deactivateScene(this);
			//TheGame.activateScene(TheGame.gameScene);
		
			//var mouse = pc.device.input.mousePos;
			//	if (isPointInRect(mouse.x, mouse.y, this.btnLaunch)) {
			//		this.setLayerInactive(splashScene);
			//		this.setLayerActive(gameScene);
			//	} else if (isPointInRect(mouse.x, mouse.y, this.btnHelp)) {
			//	} else if (isPointInRect(mouse.x, mouse.y, this.btnFeedback)) {
			//	} else if (isPointInRect(mouse.x, mouse.y, this.btnExit)) {
			//		this.setLayerInactive(splashScene);
			//		this.setLayerInactive(gameScene);
			//		window.back();
			//	}
		}
		
		this._super();   //CALL LAST
	}
});

PublisherLayer = pc.Layer.extend('publisherLayer',
{},
{
	background:null,				//The image being drawn
	
	init:function() 
	{
		this._super('splashLayer',1);
		this.background = pc.device.loader.get('publisher').resource;
	},
		
   // override draw to do custom layer drawing
   draw:function()
   {
      // draw a background
      this.background.draw(pc.device.ctx, 0, 0);
   },

   // override process to update or change things
   process:function()
   { }

});

TitleLayer = pc.Layer.extend('titleLayer',
{},
{
	background:null,				//The image being drawn
	
	init:function() 
	{
		this._super('titleLayer',1);
		this.background = pc.device.loader.get('titlescreen').resource;
	},
		
   // override draw to do custom layer drawing
   draw:function()
   {
      // draw a background
      this.background.draw(pc.device.ctx, 0, 0);
   },

   // override process to update or change things
   process:function()
   {
   }
});
