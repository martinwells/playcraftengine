StarsLayer = pc.Layer.extend('starsLayer',
{},
{
	background:null,				//The image being drawn
	selected:0,						//The current backdrop in use [1-7]
	saved:0,						//Saved Selected index
	
	init:function() 
	{
		this._super('starsLayer',1);
		this.setBackdrop(1);
	},
	
	setBackdrop:function(stage) {
		if (this.selected != stage) {
			if (stage < 1) { stage = 1; } 
			if (stage > 7) { stage = 7; } 		
			this.selected = stage;
			var bkName = 'backdrop'+this.selected;
			//TODO: Out of memory. Must load each backdrop as needed and release other
			this.background = pc.device.loader.get(bkName).resource;
			//this.background = pc.device.loader.get('backdrop1').resource;
		}
	},
	
   // override draw to do custom layer drawing
   draw:function()
   {
      this.background.draw(pc.device.ctx, 0, 0);
   },

   // override process to update or change things
   process:function()
   { }

});