/*******************************************************************************************
 * Used to create entities and add to requested scene/layer
 * @package: com.i2tm.web.roidsonroids
 * @param {Scene} scene The scene to insert this entity into 
 * @param {Scene} layer The Layer to insert this entity into 
 * @param {String} type The type of entity to create 
 * @param {integer} x The X position to create the entity at 
 * @param {integer} y The Y position to create the entity at 
 * @param {integer} dir The Direction (0-359) to point the entity at 
 * @param {Entity} attachTo The entity to attach this entity to 
 *******************************************************************************************/
function createEntity(scene, layer, type, x, y, dir, attachTo)
{
	var e = pc.Entity.create(layer);
	//var bouncy = (1 + (scene.level/10));

	switch (type)
	{
        /*******************************************************************************************
		 * Create a small asteroid
		 *******************************************************************************************/
		case 'asteroid-small':
			e.addTag('ASTEROID-SMALL');
			e.points = 100;
			e.addComponent(pc.components.Sprite.create({currentFrame:pc.Math.rand(0, 10),animSpeedOffset:pc.Math.rand(500, 1000),spriteSheet:scene.smallAsteroidSheet, animationStart:'floating'}));
			e.addComponent(pc.components.Spatial.create({x:x, y:y,dir:pc.Math.rand(0, 359),	w:scene.smallAsteroidSheet.frameWidth,h:scene.smallAsteroidSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({force:20+scene.levelBounce,mass:1, bounce:scene.levelBounce, shapes:[{shape:pc.CollisionShape.CIRCLE}], collisionCategory:CollisionType.ENEMY, collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY}));
			return e;

        /*******************************************************************************************
		 * Create a medium asteroid
		 *******************************************************************************************/
		case 'asteroid-medium':
			e.addTag('ASTEROID-MEDIUM');
			e.points = 200;
			e.addComponent(pc.components.Sprite.create(	{currentFrame:pc.Math.rand(0, 10),animSpeedOffset:pc.Math.rand(500, 1000),spriteSheet:scene.mediumAsteroidSheet, animationStart:'floating'}));
			e.addComponent(pc.components.Spatial.create({x:x, y:y,dir:pc.Math.rand(0, 359),w:scene.mediumAsteroidSheet.frameWidth,h:scene.mediumAsteroidSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({force:40+scene.levelBounce,mass:2,bounce:scene.levelBounce,shapes:[{shape:pc.CollisionShape.CIRCLE}],collisionCategory:CollisionType.ENEMY,collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY}));
			return e;
			
        /*******************************************************************************************
		 * Create a large asteroid
		 *******************************************************************************************/
		case 'asteroid-large':
			e.addTag('ASTEROID-LARGE');
			e.points = 400;

			// pick a random spot for the asteroid, but make sure it's not near the center
			var x1 = 0;	var y1 = 0;
			do
			{
				x1 = pc.Math.rand(100, pc.device.canvasWidth - 100);
				y1 = pc.Math.rand(100, pc.device.canvasHeight - 100);

			} while (pc.Math.isPointInRect(x1, y1, (pc.device.canvasWidth / 2) - 100, (pc.device.canvasHeight / 2) - 100, 200, 200));

			e.addComponent(pc.components.Sprite.create({currentFrame:pc.Math.rand(0, 10),animSpeedOffset:pc.Math.rand(500, 1000),spriteSheet:scene.largeAsteroidSheet, animationStart:'floating'}));
			e.addComponent(pc.components.Spatial.create({x:x1, y:y1,dir:pc.Math.rand(0, 359),w:scene.largeAsteroidSheet.frameWidth,h:scene.largeAsteroidSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({impulse:10+scene.levelBounce,mass:3,bounce:scene.levelBounce,shapes:[ {shape:pc.CollisionShape.CIRCLE} ],collisionCategory:CollisionType.ENEMY,collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY}));

			return e;

        /*******************************************************************************************
		 * Create the players ship
		 *******************************************************************************************/
		case 'player':
			scene.Fighter.status = PlayerStatus.ALIVE;
			e.addTag('PLAYER');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.playerSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,w:scene.playerSheet.frameWidth, h:scene.playerSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({maxSpeed:{x:scene.Fighter.maxSpeed, y:scene.Fighter.maxSpeed},linearDamping:0.0,mass:scene.Fighter.mass,shapes:[{shape:pc.CollisionShape.CIRCLE}],collisionCategory:CollisionType.FRIENDLY,collisionMask:CollisionType.ENEMY}));
			return e;

        /*******************************************************************************************
		 * Create the players debris field when they die.
		 *******************************************************************************************/
		case 'debris':
			e.addTag('DEBRIS');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.playerDebris, animationStart:'floating' }));
			e.addComponent(pc.components.Spatial.create({x:(pc.device.canvasWidth / 2) - 300, y:(pc.device.canvasHeight / 2) - 300, dir:pc.Math.rand(0, 359),w:scene.playerDebris.frameWidth, h:scene.playerSheet.frameHeight}));
			return e;
			
        /*******************************************************************************************
		 * Create the engine thrust and attach to back of players ship
		 *******************************************************************************************/
		case 'engine':
			// attach the engine emitter (it's an entity so it can be attached to the back of the ship)
			e.addComponent(pc.components.Spatial.create({ dir:dir, w:24, h:24}));
			e.addComponent(pc.components.Physics.create({ shapes:[ { shape:pc.CollisionShape.CIRCLE } ] }));
			e.addComponent(pc.components.ParticleEmitter.create({spriteSheet:scene.exhaustSheet,burst:1,delay:10,thrustMin:2, thrustMax:4,thrustTime:250,lifeMin:400,fadeOutTime:800,spinMin:65,rotateSprite:true,emitting:true}));
			e.addComponent(pc.components.Joint.create({attachedTo:attachTo,type:pc.JointType.REVOLUTE,offset:{x:-40, y:0}}));                   
			return e;

        case 'leftTurret':
            // attach the engine emitter (it's an entity so it can be attached to the back of the ship)
            e.addComponent(pc.components.Spatial.create({ dir:dir, w:24, h:24}));
            e.addComponent(pc.components.Physics.create({ shapes:[
                { shape:pc.CollisionShape.CIRCLE }
            ] }));
            e.addComponent(pc.components.ParticleEmitter.create({spriteSheet:scene.exhaustSheet, burst:1, delay:10, thrustMin:2, thrustMax:4, thrustTime:250, lifeMin:400, fadeOutTime:800, spinMin:65, rotateSprite:true, emitting:true}));
            e.addComponent(pc.components.Joint.create({attachedTo:attachTo, type:pc.JointType.REVOLUTE, offset:{x:0, y:-10}}));
            return e;

        /*******************************************************************************************
		 * Create the players Nose Mass Driver when fired
		 *******************************************************************************************/
		case 'projector': //Nose Gun
			e.addTag('BULLET');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.weap1FireSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Expiry.create({ lifetime:3000 }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:scene.weap1FireSheet.frameWidth, h:scene.weap1FireSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({ force:40, shapes:[ { offset:{w:-25}, shape:pc.CollisionShape.CIRCLE } ],collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));

			return e;
					
        /*******************************************************************************************
		 * Create the players dual plama cannons when fired
		 *******************************************************************************************/
		case 'plasma':
			e.addTag('BULLET');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.weap2FireSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Expiry.create({ lifetime:300 }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:scene.weap2FireSheet.frameWidth, h:scene.weap2FireSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({ maxSpeed:{x:100, y:100}, force:150, shapes:[ { offset:{w:-2,h:-2}, shape:pc.CollisionShape.RECTANGLE } ],collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));00
			return e;

		/*******************************************************************************************
		 * Create the players dual lasers when fired
		 *******************************************************************************************/
		case 'laser':
			e.addTag('BULLET');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.weap3FireSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Expiry.create({ lifetime:6000 }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:scene.weap3FireSheet.frameWidth, h:scene.weap3FireSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({ maxSpeed:{x:200, y:200}, force:75, shapes:[ { offset:{w:0}, shape:pc.CollisionShape.RECTANGLE } ],collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));
			return e;

		/*******************************************************************************************
		 * Create the players dual lasers when fired
		 *******************************************************************************************/
		case 'gravitron':
			e.addTag('BULLET');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.weap4FireSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Expiry.create({ lifetime:10000 }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:scene.weap4FireSheet.frameWidth, h:scene.weap4FireSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({ maxSpeed:{x:20, y:20}, force:500, shapes:[ { offset:{w:-4}, shape:pc.CollisionShape.CIRCLE } ],collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));
			return e;
					
        /*******************************************************************************************
		 * Create the instructions that popup when the game starts for a few seconds
		 *******************************************************************************************/
		case 'instructions':
			e.addComponent(pc.components.Rect.create({ color:'#222222', lineColor:'#888888', lineWidth:3 }));
			e.addComponent(pc.components.Fade.create({ startDelay:1000, fadeInTime:3500, holdTime:3000, fadeOutTime:1500 }));
			e.addComponent(pc.components.Text.create({ text:['Arrow keys=move', 'Space=fire', '-- DEBUG --', 'F9=Toggle Debug', 'F10=Toggle Pool Dump','F11=Toggle Sound'], lineWidth:0, fontHeight:14, offset:{x:25, y:-65} }));
			e.addComponent(pc.components.Expiry.create({ lifetime:8000 }));
			e.addComponent(pc.components.Spatial.create({ dir:0, w :170, h:85 }));
			e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'middle', margin:{ right:80 } }));
			return e;
			
        /*******************************************************************************************
		 * Create the YOUR TOAST message fr use when player dies
		 *******************************************************************************************/
		case 'yourdead':
            e.addComponent(pc.components.Fade.create({ fadeInTime:1500, holdTime:3000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#2d2929', strokeColor:'#631212', text:['Your Toast!'], lineWidth:2,fontHeight:80 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:280, h:80 }));
            e.addComponent(pc.components.Layout.create({ vertical:'center', horizontal:'center' }));
            //e.addComponent(pc.components.Layout.create({ vertical:'center', horizontal:'center', margin:{ bottom:0, left:0 } }));
			return e;			
		
		return null;
	}
};

function createWeapon(scene, layer, type, tc, forewardoffset) 
{
	var half = (scene.weap4FireSheet.frameWidth / 2)
	tc.subtract(half, half);
	tc.moveInDir(scene.playerSpatial.dir, forewardoffset);
	createEntity(scene, layer, 'gravitron', tc.x, tc.y, this.playerSpatial.dir);
}