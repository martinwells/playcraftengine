HudLayer = pc.EntityLayer.extend('hudLayer',
{},
{
	sheetEnergy:null,					
	sheetEnergyBars:null,				
	sheetArmor:null,					
	sheetArmorBars:null,				

	hudEnergy:null,					
	hudEnergyBars:null,				
	hudArmor:null,					
	hudArmorBars:null,				
	
	selected:0,						//The current backdrop in use [1-7]
	saved:0,						//Saved Selected index
	
	//pc.device.game.gameScene
	init:function() 
	{
		this._super('hudLayer',pc.device.canvasWidth, pc.device.canvasHeight);
		this.createHudEnergy();
		//this.createHudArmor();
		this.addSystem(new pc.systems.Render());
	},
		
	createHudEnergy:function ()
	{
        this.sheetEnergy = new pc.SpriteSheet({ image:pc.device.loader.get('hudenergybase').resource});
		this.hudEnergy = pc.Entity.create(this);
		this.hudEnergy.addComponent(pc.components.Sprite.create({ spriteSheet:this.sheetEnergy}));
		this.hudEnergy.addComponent(pc.components.Spatial.create({x:16, y:pc.device.canvasHeight-this.sheetEnergy.frameHeight-16, dir:0,	w:this.sheetEnergy.frameWidth, h:this.sheetEnergy.frameHeight}));
		//this.hudEnergy.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'left', margin:{ bottom:30, left:30 } }));
		
        this.sheetEnergyBars = new pc.SpriteSheet({ image:pc.device.loader.get('hudenergybars').resource});
		this.hudEnergyBars = pc.Entity.create(this);
		this.hudEnergyBars.addComponent(pc.components.Sprite.create({ spriteSheet:this.sheetEnergyBars}));
		this.hudEnergyBars.addComponent(pc.components.Spatial.create({x:16, y:pc.device.canvasHeight-this.sheetEnergyBars.frameHeight-16, dir:0, w:this.sheetEnergyBars.frameWidth, h:this.sheetEnergyBars.frameHeight}));
		//this.hudEnergyBars.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'left', margin:{ bottom:60, left:30 } }));
	},

	createHudArmor:function ()
	{
        this.sheetArmor = new pc.SpriteSheet({ image:pc.device.loader.get('hudarmorbase').resource});
		this.hudArmor = pc.Entity.create(this);
		this.hudArmor.addComponent(pc.components.Sprite.create({ spriteSheet:this.sheetArmor}));
		this.hudArmor.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:this.sheetArmor.frameWidth, h:this.sheetArmor.frameHeight}));
		this.hudArmor.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'right', margin:{ bottom:30, right:30 } }));

        this.sheetArmorBars = new pc.SpriteSheet({ image:pc.device.loader.get('hudarmorbars').resource});
		this.hudArmorBars = pc.Entity.create(this);
		this.hudArmorBars.addComponent(pc.components.Sprite.create({ spriteSheet:this.sheetArmorBars}));
		this.hudArmorBars.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:this.sheetArmorBars.frameWidth, h:this.sheetArmorBars.frameHeight}));
		this.hudArmorBars.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'right', margin:{ bottom:60, right:30 } }));
	},
		
   // override draw to do custom layer drawing
   draw:function()
   {
      // draw a background
      //this.hudEnergy.draw(pc.device.ctx, 0, pc.device.pc.device.canvasHeight-120);
      //this.hudArmor.draw(pc.device.ctx, pc.device.canvasWidth-350, pc.device.canvasHeight-120);
   },

   // override process to update or change things
   process:function()
   { }

});
