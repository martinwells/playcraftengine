/**
 * PlayerControlSystem
 * Handle input for the player
 */

PlayerControlSystem = pc.systems.Input.extend('PlayerControlSystem',
    { },
    {

        init:function ()
        {
            this._super([ 'input' ], 60);
        },

        onAction:function (actionName, event, pos, uiTarget)
        {
            if (actionName === 'crate pressed')
            {
                var entity = uiTarget.getEntity();

                if (entity.hasComponentOfType('spin'))
                    entity.removeComponentByType('spin');
                else
                {
                    entity.addComponent(pc.components.Spin.create({rate:10}));
                }
            }
        },

        process:function (entity)
        {
            this._super(entity);

            if (entity.hasTag('player'))
            {
                var brain = entity.getComponent('brain');

                if (brain.state == Brain.State.DYING)
                    return; // no input if you're dead -- todo: add a way to disable input - set input component to inactive?

                if (this.isInputState(entity, 'casting'))
                {
                    if (pc.device.now - brain.lastCastTime > 300)
                    {
                        pc.device.game.soundManager.play('fireball-cast');

                        var sp = entity.getComponent('spatial');
                        var fb = entity.layer.scene.entityFactory.createEntity(entity.layer, 'fireball',
                            sp.getCenterPos().x + (brain.facingRight ? 0 : -50),
                            sp.getCenterPos().y - 40,
                            brain.facingRight ? 340 : 200);
                        brain.lastCastTime = pc.device.now;
                    }

                }

                brain.wantsToWalk = false;
                brain.wantsToClimbUp = false;
                brain.wantsToClimbDown = false;

                if (brain.state != Brain.State.CLIMBING)
                {
                    if (this.isInputState(entity, 'attacking'))
                    {
                        var sprite = entity.getComponent('sprite');
                        brain.changeState(sprite, Brain.State.ATTACKING);
                    }
                }

                if (this.isInputState(entity, 'moving left') && brain.state != Brain.State.BLOCKING)
                {
                    sprite = entity.getComponent('sprite');

                    var faceChange = false;
                    if (brain.facingRight)
                    {
                        brain.facingRight = false;
                        faceChange = true;
                    }
                    if (brain.state != Brain.State.JUMPING && brain.state != Brain.State.ATTACKING &&
                        brain.state != Brain.State.CLIMBING)
                        brain.changeState(sprite, Brain.State.WALKING, faceChange);

                    if (!brain.wantsToWalk)// && brain.state != Brain.State.JUMPING)
                        brain.wantsToWalk = true;
                }

                if (this.isInputState(entity, 'moving right') && brain.state != Brain.State.BLOCKING)
                {
                    sprite = entity.getComponent('sprite');

                    faceChange = false;
                    if (!brain.facingRight)
                    {
                        brain.facingRight = true;
                        faceChange = true;
                    }
                    if (brain.state != Brain.State.JUMPING && brain.state != Brain.State.ATTACKING &&
                        brain.state != Brain.State.CLIMBING)
                        brain.changeState(sprite, Brain.State.WALKING, faceChange);

                    if (!brain.wantsToWalk)// && brain.state != Brain.State.JUMPING)
                        brain.wantsToWalk = true;
                }

                if (this.isInputState(entity, 'jumping'))
                {
                    // are we in a climbable area?
                    // get the tile from the background layer
                    if (this.onClimbableTile(entity))
                    {
                        var physics = entity.getComponent('physics');

                        // climb!
                        if (brain.state != Brain.State.CLIMBING)
                        {
                            brain.changeState(entity.getComponent('sprite'), Brain.State.CLIMBING);
                            physics.setGravity(0, 0);
                            physics.setLinearVelocity(0, 0);
                            physics.maxSpeed.y = 18;
                        }

                        // check to see if the tile above is not a ladder, if so, restrict them by not allowing
                        // the movement
                        var spatial = entity.getComponent('spatial');
                        var tw = entity.layer.scene.overlayLayer.tileMap.tileWidth;
                        var th = entity.layer.scene.overlayLayer.tileMap.tileHeight;
                        var tileX = Math.floor(spatial.getCenterPos().x / tw);
                        var tileY = Math.floor(((spatial.getCenterPos().y - 3) / th)); // one tile up
                        if (entity.layer.scene.backgroundOverlayLayer.tileMap.tileHasProperty(tileX, tileY, 'climbable'))
                        {
                            physics.applyImpulse(2, 270);
                            brain.wantsToClimbUp = true;
                        }

                    } else
                    {
                        brain = entity.getComponent('brain');
                        if (brain.state != Brain.State.JUMPING && brain.onGround && !brain.startingJump)
                            brain.startingJump = true;
                    }
                }

                if (this.isInputState(entity, 'blocking'))
                {
                    if (this.onClimbableTile(entity))
                    {
                        physics = entity.getComponent('physics');

                        // climb!
                        if (brain.state != Brain.State.CLIMBING)
                        {
                            brain.changeState(entity.getComponent('sprite'), Brain.State.CLIMBING);
                            physics.setGravity(0, 0);
                            physics.setLinearVelocity(0, 0);
                        }
                        brain.wantsToClimbDown = true;
                        physics.maxSpeed.y = 18;
                        physics.applyImpulse(2, 90);

                    } else
                        brain.blocking = true;
                    brain.wantsToWalk = false;

                } else if (brain.blocking)
                {
                    brain.blocking = false;
                    brain.changeState(entity.getComponent('sprite'), Brain.State.STANDING);
                }

                // Climbing - if we are climbing, check that we are still on a climbable tile, if not, then
                // drop back to walking
                if (brain.state == Brain.State.CLIMBING)
                {
                    if (!this.onClimbableTile(entity))
                    {
                        physics = entity.getComponent('physics');
                        physics.clearGravity();
                        brain.changeState(entity.getComponent('sprite'), Brain.State.STANDING);
                        physics.maxSpeed.y = 150;
                    } else
                    {
                        if (!brain.wantsToClimbUp && !brain.wantsToClimbDown && !brain.wantsToWalk)
                            entity.getComponent('physics').setLinearVelocity(0, 0);
                    }
                }
            }
        },

        onClimbableTile:function (entity)
        {
            var spatial = entity.getComponent('spatial');
            var tileX = Math.floor(spatial.getCenterPos().x / entity.layer.scene.overlayLayer.tileMap.tileWidth);
            var tileY = Math.floor(spatial.getCenterPos().y / entity.layer.scene.overlayLayer.tileMap.tileHeight);
            return (entity.layer.scene.backgroundOverlayLayer.tileMap.tileHasProperty(tileX, tileY, 'climbable'));
        }
    });
