/**
 * GUNSTAR -- game.js
 * (C) 2012 Playcraft Labs, Inc.
 */

Wormhole = pc.Entity.extend('Wormhole',
    {
        ///
        /// STATICS
        ///
        create:function (layer, x, y)
        {
            var n = this._super(layer, x, y, 0, 64, 64, true);
            n.sprite.setAnimation('spinning', 0);
            return n;
        }
    },
    {
        ///
        /// INSTANCE
        ///
        init:function ()
        {
            this._super();
            var img = pc.system.loader.get('wormhole').resource;
            var s = new pc.SpriteSheet(img, 64, 64);
            s.addAnimation('spinning', 0, 0, null, 1000, 0);
            this.setSprite(s);
        }
    });

PlasmaWeave = pc.Entity.extend('PlasmaWeave',
    {
        ///
        /// STATICS
        ///
        create:function (layer, x, y)
        {
            var n = this._super(layer, x, y, 0, 80, 80, true);
            n.sprite.setAnimation('spinning', 0);
            n.drawOffsetX = 7;
            n.drawOffsetY = 7;
            //            n.setVel(0.1, 0.1);
            return n;
        }
    },
    {
        ///
        /// INSTANCE
        ///
        init:function ()
        {
            this._super();
            var img = pc.system.loader.get('plasma-weave').resource;
            var s = new pc.SpriteSheet(img, 80, 80);
            s.addAnimation('spinning', 0, 0, null, 500, 0);
            this.setSprite(s);
        }
    });


BulletEntity = pc.Entity.extend('BulletEntity',
    {
        ///
        /// STATICS
        ///
        create:function (layer, enemy, owner, x, y, dir, velX, velY)
        {
            var newBullet = this._super(layer, x, y, dir, 12, 12, true);
            newBullet.velX = velX;
            newBullet.velY = velY;
            newBullet.incVel(8);
            newBullet.setLifetime(3000);
            newBullet.enemy = enemy;
            newBullet.owner = owner;

            if (enemy)
                newBullet.sprite.setAnimation('red', 0);
            else
                newBullet.sprite.setAnimation('blue', 0);

            return newBullet;
        }
    },
    {
        ///
        /// INSTANCE
        ///

        enemy:false,
        owner:null,

        init:function ()
        {
            this._super();
            var bulletImage = pc.system.loader.get('bullet').resource;
            var bulletSpriteSheet = new pc.SpriteSheet(bulletImage, 12, 12);
            bulletSpriteSheet.addAnimation('blue', 0, 0, [0, 1, 2], 500, 0);
            bulletSpriteSheet.addAnimation('red', 0, 1, [0, 1, 2], 500, 0);
            this.setSprite(bulletSpriteSheet);
        }

    });

PulseBall = pc.Entity.extend('PulseBall',
    {
        ///
        /// STATICS
        ///
        create:function (layer, enemy, owner, x, y, dir, velX, velY)
        {
            var newBullet = this._super(layer, x, y, dir, 6, 6, true);
            newBullet.velX = velX;
            newBullet.velY = velY;
            newBullet.faceVel = true;
            newBullet.incVel(8);
            newBullet.setLifetime(3000);
            newBullet.enemy = enemy;
            newBullet.owner = owner;
            return newBullet;
        }
    },
    {
        ///
        /// INSTANCE
        ///
        enemy:false,
        owner:null,

        init:function ()
        {
            this._super();
            var img = pc.system.loader.get('pulseball').resource;
            var s = new pc.SpriteSheet(img, 6, 6);
            //            s.addAnimationWithDirections('floating', 0, 0, [0], 16, 0, 0, true);
            s.addAnimationWithDirections('floating', 0, 0, [0], 1, 0, 0, true);
            this.setSprite(s);
        }

    });


Torpedo = pc.Entity.extend('Torpedo',
    {
        ///
        /// STATICS
        ///
        create:function (layer, enemy, owner, x, y, dir, velX, velY)
        {
            var newBullet = this._super(layer, x, y, dir, 5, 5, true);
            newBullet.velX = velX;
            newBullet.velY = velY;
            newBullet.faceVel = true;
            newBullet.incVel(8);
            newBullet.setLifetime(3000);
            newBullet.enemy = enemy;
            newBullet.owner = owner;
            newBullet.drawOffsetX = 13;
            newBullet.drawOffsetY = 13;
            return newBullet;
        }
    },
    {
        ///
        /// INSTANCE
        ///
        enemy:false,
        owner:null,

        init:function ()
        {
            this._super();
            var img = pc.system.loader.get('big-bomb').resource;
            var s = new pc.SpriteSheet(img, 30, 30);
            //            s.addAnimationWithDirections('floating', 0, 0, [0], 16, 0, 0, true);
            s.addAnimationWithDirections('floating', 0, 0, null, 1, 400, 0, true);
            this.setSprite(s);
        }

    });

PowerupEntity = pc.Entity.extend('PowerupEntity',
    {
        ///
        /// STATICS
        ///

        total:0,

        createRandom:function (layer)
        {
            var px = pc.Math.rand(0, SpaceGame.WORLD_WIDTH);
            var py = pc.Math.rand(0, SpaceGame.WORLD_HEIGHT);

            this.create(layer, px, py, pc.Math.rand(0, 359));
        },

        create:function (layer, x, y, dir)
        {
            var n = this._super(layer, x, y, dir, 12, 12, true);
            n.setVel(0.5);
            n.setLifetime(6 * 1000);
            this.total++;
            return n;
        }
    },
    {
        ///
        /// INSTANCE
        ///
        enemy:false,

        init:function ()
        {
            this._super();
            var img = pc.system.loader.get('powerup').resource;
            var sheet = new pc.SpriteSheet(img, 12, 12);
            sheet.addAnimation('red', 0, 2, null, 900, 0);
            this.setSprite(sheet);
        },

        onRelease:function ()
        {
            this._super();
            this.Class.total--;
        }

    });


// todo: merge this and the player ship together (base class)

EnemyBase = pc.Entity.extend('EnemyBase',
    ///
    /// STATICS
    ///
    {
        FIRE_RATE:1000,
        STATE_LURKING:0,
        STATE_ACTIVE:1,
        STATE_EXPLODING:2,

        create:function (layer, x, y)
        {
            var n = this._super(layer, x, y, 0, 48, 48, true);
            n.wreckageEmitter = pc.Emitter.create(layer, n.pos.x, n.pos.y, n.dir, 1, 1, 3000, 15, WreckageParticle);
            n.hp = 100;
            n.shield = ShieldEffect48.create(layer);
            n.shield.visible = false;
            n.state = this.STATE_LURKING;
            n.shieldStartTime = 0;
            return n;
        }
    },
    ///
    /// INSTANCE
    ///
    {
        lastFire:0,
        lastDirChange:0,
        state:0,
        enemy:true,
        wreckageEmitter:null,
        hp:0,
        explosionSound:null,
        shield:null,
        shieldHitSound:null,
        shieldStartTime:0,
        shieldTime:200,
        fireSound:null,

        init:function ()
        {
            this._super();

            if (pc.system.soundEnabled)
            {
                this.explosionSound = pc.system.loader.get('explosion').resource;
                this.explosionSound.setVolume(0.8);

                this.shieldHitSound = pc.system.loader.get('shield-hit2').resource;
                this.shieldHitSound.setVolume(0.3);

                this.fireSound = pc.system.loader.get('fire2').resource;
                this.fireSound.setVolume(0.05);
            }
        },

        release:function ()
        {
            this._super();
            this.wreckageEmitter.release();
        },

        update:function (delta)
        {
            this._super(delta);

            var distanceToPlayer = theGame.gameScene.playerShip.pos.distance(this.pos);
            if (this.state == EnemyBase.STATE_LURKING)
            {
                if (distanceToPlayer < 600)
                    this.state = EnemyBase.STATE_ACTIVE;
            }

            if (this.shieldStartTime > 0)
            {
                var since = Date.now() - this.shieldStartTime;
                if (since > this.shieldTime)
                {
                    this.shield.visible = false;
                    this.shieldStartTime = 0;
                }
            }

            if (this.shield.visible)
                this.shield.setPos(this.pos.x, this.pos.y);

            if (this.state == EnemyBase.STATE_ACTIVE)
            {
                var sinceLastDirChange = Date.now() - this.lastDirChange;
                if (sinceLastDirChange > 50)
                {
                    var targetDir = this.pos.dirTo(theGame.gameScene.playerShip.pos);
                    var turnInc = 10;

                    // are we turning left (ccw) or right (cw)?
                    if (pc.Math.isClockwise(targetDir, this.dir))
                    {
                        // find out if turning helps us
                        var d1 = pc.Math.angleDiff(targetDir, this.dir, false);
                        var cd1 = pc.Math.angleDiff(targetDir, this.dir + turnInc, false);

                        if (cd1 < d1)
                        {
                            this.dir = pc.Math.rotate(this.dir, turnInc);
                            if (this.sprite.spriteSheet.hasAnimation('turning_right'))
                            {
                                if (cd1 > 1)
                                    this.sprite.setAnimation('turning_right');
                                else
                                    this.sprite.setAnimation('floating');
                            }
                        }
                    }
                    else
                    {
                        var d2 = pc.Math.angleDiff(targetDir, this.dir, true);
                        var cd2 = pc.Math.angleDiff(targetDir, this.dir - turnInc, true);

                        if (cd2 < d2)
                        {
                            this.dir = pc.Math.rotate(this.dir, -turnInc);
                            if (this.sprite.spriteSheet.hasAnimation('turning_left'))
                            {
                                if (cd2 > 1)
                                    this.sprite.setAnimation('turning_left');
                                else
                                    this.sprite.setAnimation('floating');
                            }
                        }
                    }
                    this.lastDirChange = Date.now();
                }

                if (this.Class.FIRE_RATE > 0)
                {
                    // if the player is close, and the angle is right, then fire!
                    if (distanceToPlayer < this.layer.scene.viewPortWidth && Math.abs(this.dir - targetDir) < 20)
                    {
                        if (Date.now() - this.lastFire > this.Class.FIRE_RATE)
                        {
                            var bulletStartPos = pc.Point.create(this.pos.x + (this.dim.x / 2), this.pos.y + (this.dim.y / 2));
                            bulletStartPos.moveInDir(this.dir, this.dim.x / 2);
                            BulletEntity.create(this.layer, true, this, bulletStartPos.x, bulletStartPos.y, this.dir, this.velX, this.velY);
                            this.lastFire = Date.now();
                            bulletStartPos.release();
                            if (pc.system.soundEnabled)
                                this.fireSound.play();
                        }
                    }
                }

            } else
            {
                // EXPLODING!
                if (this.wreckageEmitter.emissions == 1)
                    this.suicide();
            }
        },

        onCollisionStart:function (collision)
        {
            this._super(collision);

            if (collision.type == pc.Collision.ENTITY_TYPE && !collision.entity.enemy)
            {
                // explode
                if (collision.entity.Class.fullName != 'PowerupEntity')
                {
                    if (collision.entity.Class.fullName == 'PulseBall' || collision.entity.Class.fullName == 'Torpedo')
                    {
                        this.hp -= 25;
                        this.shieldStartTime = Date.now();
                        this.shield.visible = true;
                        if (pc.system.soundEnabled)
                            this.shieldHitSound.play();
                        collision.entity.suicide(); // destroy the pulse ball
                    }

                    if (this.hp < 0)
                    {
                        this.state = EnemyBase.STATE_EXPLODING;
                        if (pc.system.soundEnabled)
                            this.explosionSound.play();
                        this.thrust = 0;
                        this.setCollidable(false);
                        this.wreckageEmitter.pos.x = this.pos.x;
                        this.wreckageEmitter.pos.y = this.pos.y;
                        this.wreckageEmitter.dir = this.dir;
                        this.wreckageEmitter.setEmitting(true);
                        this.shield.visible = false;
                        this.shieldStartTime = 0;

                        if (collision.entity.Class.fullName != 'Gunstar')
                        {
                            // drop a powerup, but only if we didn't hit the player
                            PowerupEntity.create(this.layer, this.pos.x + 12, this.pos.y + 12, this.dir);
                        }

                    }
                }

            }
        }


    });


EnemyTurret = EnemyBase.extend('EnemyTurret',
    ///
    /// STATICS
    ///
    {
        FIRE_RATE:500,

        create:function (layer, x, y)
        {
            var n = this._super(layer, x, y);
            n.shield = ShieldEffect32.create(layer);
            n.shield.visible = false;
            n.dim.x = 32;
            n.dim.y = 32;
            n.hp = 100;
            return n;
        }
    },
    ///
    /// INSTANCE
    ///
    {
        init:function ()
        {
            this._super();
            // todo: no need to have an animSheet for every instance -- move to static
            var shipImage = pc.system.loader.get('enemy-turret').resource;
            var sheet = new pc.SpriteSheet(shipImage, 32, 32);
            sheet.addAnimationWithDirections('floating', 0, 0, [0], 16, 500, 0);
            this.setSprite(sheet);
            this.sprite.setAnimation('floating');
        }
    });


EnemyShip = EnemyBase.extend('EnemyShip',
    ///
    /// STATICS
    ///
    {
        FIRE_RATE:0,

        create:function (layer, x, y)
        {
            var n = this._super(layer, x, y, 0, 48, 48, true);
            n.setMaxVel(2, 2);
            return n;
        }
    },
    ///
    /// INSTANCE
    ///
    {
        init:function ()
        {
            this._super();
            // todo: no need to have an animSheet for every instance -- move to static
            var shipImage = pc.system.loader.get('enemy-ship').resource;
            var sheet = new pc.SpriteSheet(shipImage, 48, 48);
            sheet.addAnimationWithDirections('floating', 0, 3, [0], 16, 500, 0);
            sheet.addAnimationWithDirections('turning_left', 0, 4, [0], 16, 500, 0);
            sheet.addAnimationWithDirections('turning_right', 0, 5, [0], 16, 500, 0);
            this.setSprite(sheet);
            this.sprite.setAnimation('floating');
        },

        update:function (delta)
        {
            this._super(delta);

            if (this.state == this.Class.STATE_ACTIVE)
                this.thrust = pc.Math.rand(2, 6);
        }

    });


/**
 * The turret that sits on top of the gunstar
 */
GunTurret = pc.Entity('GunTurret',
    {
        create:function (gunstar)
        {
            var n = this._super(gunstar.layer, 0, 0, 0, 20, 20, false);
            n.gunstar = gunstar;
            return n;
        }
    },
    {
        gunstar:null, // the gunstar I'm sitting on top of
        fireSound:null,

        init:function ()
        {
            this._super();
            var sheet = new pc.SpriteSheet(pc.system.loader.get('turret-small').resource, 20, 20);
            sheet.addAnimationWithDirections('floating', 0, 0, [0], 16, 0, 0);
            this.setSprite(sheet);
            this.mousePos = pc.Point.create(0, 0);
            if (pc.system.soundEnabled)
            {
                this.fireSound = pc.system.loader.get('fire').resource;
                this.fireSound.setVolume(0.2);
            }
        },

        mousePos:null,

        update:function (delta)
        {
            this._super(delta);
            this.setPos(this.gunstar.centerPos.x - 10, this.gunstar.centerPos.y - 10);

            if (!pc.system.isTouch && this.isInputState('firing'))
                this.fire();
            if (!pc.system.isTouch && this.isInputState('firing2'))
                this.fire2();
        },

        lastFireTime:0,
        fireDelay:100,

        fire:function ()
        {
            var sinceLastFire = Date.now() - this.lastFireTime;
            if (sinceLastFire > this.fireDelay)
            {
                if (pc.system.soundEnabled)
                    this.fireSound.play();
                // create a bullet entity
                var bulletStartPos = pc.Point.create(this.pos.x + 6, this.pos.y + 6);
                bulletStartPos.moveInDir(this.dir, 5);
                PulseBall.create(this.layer, false, this, bulletStartPos.x, bulletStartPos.y, this.dir, this.velX, this.velY);
                bulletStartPos.release();
                this.lastFireTime = Date.now();
            }
        },

        lastFire2Time:0,
        fire2Delay:100,

        fire2:function ()
        {
            var sinceLastFire = Date.now() - this.lastFire2Time;
            if (sinceLastFire > this.fire2Delay)
            {
                if (pc.system.soundEnabled)
                    this.fireSound.play();
                // create a bullet entity
                var bulletStartPos = pc.Point.create(this.pos.x + 12, this.pos.y + 12);
                //                bulletStartPos.moveInDir(this.dir, 5);
                Torpedo.create(this.layer, false, this, bulletStartPos.x, bulletStartPos.y, this.dir, this.velX, this.velY);
                bulletStartPos.release();
                this.lastFire2Time = Date.now();
            }
        },

        /**
         * Called when an action event occurs.
         * @param actionName
         */
        onAction:function (actionName, event, pos)
        {
            if (actionName === 'aiming')
            {
                // get the mouse pos on the screen
                var screenCenterPos = this.getScreenCenterPos();
                if (screenCenterPos != null)
                {
                    this.dir = screenCenterPos.dirTo(pos);
                    screenCenterPos.release();
                }
            }
        }



    });


ShieldEffect = pc.Element('ShieldEffect',
    {
        create:function (layer, width, height)
        {
            return this._super(layer, 0, 0, 0, width, height);
        },

        generate:function (width, height, r, g, b)
        {
            var shieldCanvas = document.createElement('canvas');
            shieldCanvas.width = width;
            shieldCanvas.height = height;
            var ctx = shieldCanvas.getContext('2d');
            var rgr = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, width / 2, width / 2);
            rgr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.5)');
            rgr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0.0)');
            ctx.fillStyle = rgr;
            ctx.fillRect(0, 0, width, height);
            return new pc.SpriteSheet(new pc.CanvasImage(shieldCanvas));
        }
    },
    {
        init:function ()
        {
            this._super();
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            this._super(ctx, screenOffsetX, screenOffsetY);
        }


    });


ShieldEffect80 = ShieldEffect.extend('ShieldEffect80',
    {
        create:function (parent)
        {
            return this._super(parent, 80, 80);

        }
    },
    {
        init:function ()
        {
            this._super();
            var sheet = new pc.SpriteSheet(pc.system.loader.get('plasma-shield').resource, 80, 80);
            sheet.addAnimationWithDirections('floating', 0, 0, null, 1, 500, 0);
            this.setSprite(sheet);
        }
    });

ShieldEffect48 = ShieldEffect.extend('ShieldEffect48',
    {
        create:function (parent)
        {
            return this._super(parent, 48, 48);
        }
    },
    {
        init:function ()
        {
            this._super();
            this.setSprite(ShieldEffect.generate(48, 48, 251, 58, 58));
        }
    });

ShieldEffect32 = ShieldEffect.extend('ShieldEffect32',
    {
        create:function (parent)
        {
            return this._super(parent, 32, 32);
        }
    },
    {
        init:function ()
        {
            this._super();
            this.setSprite(ShieldEffect.generate(32, 32, 251, 58, 58));
        }
    });


/**
 * The gunstar
 */
Gunstar = pc.Entity('Gunstar',
    ///
    /// STATICS
    ///
    {
        STATE_FLYING:0,
        STATE_EXPLODING:1,

        STARTING_X:5 * 64,
        STARTING_Y:5 * 64,

        create:function (layer)
        {
            var s = this._super(layer, this.STARTING_X, this.STARTING_Y, 0, 64, 64, true);
            s.leftExhaust = pc.Emitter.create(layer, s.pos.x, s.pos.y, 180, 1, 1, 20, 1, ExhaustParticle);
            s.rightExhaust = pc.Emitter.create(layer, s.pos.x, s.pos.y, 0, 1, 1, 20, 1, ExhaustParticle);
            s.topExhaust = pc.Emitter.create(layer, s.pos.x, s.pos.y, 270, 1, 1, 20, 1, ExhaustParticle);
            s.bottomExhaust = pc.Emitter.create(layer, s.pos.x, s.pos.y, 90, 1, 1, 20, 1, ExhaustParticle);
            s.energy = 1000;
            s.maxVelX = 2;
            s.maxVelY = 2;

            // the gun turret on top
            s.turret = GunTurret.create(s);

            s.shield = ShieldEffect80.create(layer);
            s.shield.visible = false;

            return s;
        }
    },
    ///
    /// INSTANCE
    ///
    {
        leftExhaust:null,
        rightExhaust:null,
        topExhaust:null,
        bottomExhaust:null,
        explodingSpriteSheet:null,
        shipSpriteSheet:null,
        enemy:false,
        maxEnergy:1000,
        energy:1000,
        state:0,
        turret:null,
        shield:null,
        shieldHitSound:null,

        init:function ()
        {
            this._super();

            // the gunstar
            var shipImage = pc.system.loader.get('gunstar').resource;
            this.shipSpriteSheet = new pc.SpriteSheet(shipImage, 64, 64);
            this.shipSpriteSheet.addAnimationWithDirections('floating', 0, 0, [0], 1, 250, 0);
            this.setSprite(this.shipSpriteSheet);

            if (pc.system.soundEnabled)
            {
                this.shieldHitSound = pc.system.loader.get('shield-hit').resource;
                this.shieldHitSound.setVolume(0.3);
            }

            // explosions for when I die
            var explosionImage = pc.system.loader.get('big-explosions').resource;
            this.explodingSpriteSheet = new pc.SpriteSheet(explosionImage, 64, 64);
            this.explodingSpriteSheet.addAnimation('exploding', 0, 7, null, 2500, 1);
        },

        shieldStartTime:0,
        shieldTime:500,
        shakeStartTime:0,
        shakeTime:500,

        update:function (delta)
        {
            this._super(delta);

            switch (this.state)
            {
                case Gunstar.STATE_FLYING:

                    // update energy levels
                    this.energy += delta / 100;
                    if (this.energy > this.maxEnergy)
                        this.energy = this.maxEnergy;
                    if (this.energy < 0)
                        this.energy = 0;

                    // position the shield if it's visible
                    if (this.shield.visible)
                        this.shield.setPos(this.centerPos.x - (this.shield.dim.x / 2), this.centerPos.y - (this.shield.dim.y / 2));

                    // update the exhaust emitter with the correct direction and x,y
                    var o = 20;
                    this.leftExhaust.setPos(this.centerPos.x - 12 - o, this.centerPos.y - 12);
                    this.leftExhaust.setEmitting(false);
                    this.rightExhaust.setPos(this.centerPos.x - 12 + o, this.centerPos.y - 12);
                    this.rightExhaust.setEmitting(false);
                    this.topExhaust.setPos(this.centerPos.x - 12, this.centerPos.y - 12 - o);
                    this.topExhaust.setEmitting(false);
                    this.bottomExhaust.setPos(this.centerPos.x - 12, this.centerPos.y - 12 + o);
                    this.bottomExhaust.setEmitting(false);

                    // turn on the right emitters based on input controls
                    if (!pc.system.isTouch)
                    {
                        this.thrust = 0;

                        // update the thrust based on key states
                        if (this.isInputState('moving_left'))
                        {
                            this.thrust = 2;
                            this.dir = 180;
                            this.rightExhaust.setEmitting(true);

                            if (this.isInputState('moving_up')) this.dir = 225;
                            if (this.isInputState('moving_down')) this.dir = 135;
                        } else if (this.isInputState('moving_right'))
                        {
                            this.thrust = 2;
                            this.dir = 0;
                            this.leftExhaust.setEmitting(true);
                            if (this.isInputState('moving_up')) this.dir = 315;
                            if (this.isInputState('moving_down')) this.dir = 45;
                        } else
                        {
                            if (this.isInputState('moving_up'))
                            {
                                this.dir = 270;
                                this.thrust = 2;
                            }
                            if (this.isInputState('moving_down'))
                            {
                                this.dir = 90;
                                this.thrust = 2;
                            }
                        }

                        if (this.isInputState('moving_up'))
                            this.bottomExhaust.setEmitting(true);
                        if (this.isInputState('moving_down'))
                            this.topExhaust.setEmitting(true);
                    }
                    else if (this.thrust > 0) // handle the touch inputs
                    {
                        // fire the emitters based on direction moving
                        if (this.dir >= 100 && this.dir <= 260)
                            this.rightExhaust.setEmitting(true);
                        if (this.dir >= 10 && this.dir <= 170)
                            this.topExhaust.setEmitting(true);
                        if (this.dir >= 280 || this.dir <= 80)
                            this.leftExhaust.setEmitting(true);
                        if (this.dir >= 190 && this.dir <= 350)
                            this.bottomExhaust.setEmitting(true);
                    }


                    break;

                case Gunstar.STATE_EXPLODING:
                    if (this.sprite.loopCount == 1)
                    {
                        // reset
                        this.state = Gunstar.STATE_FLYING;
                        this.setSprite(this.shipSpriteSheet);
                        this.setPos(Gunstar.STARTING_X, Gunstar.STARTING_Y);
                        this.thrust = 0;
                        this.velX = 0;
                        this.velY = 0;
                        this.energy = 100;
                        this.setCollidable(true);
                        this.turret.setActive(true);
                    }
                    break;
            }

            if (this.shieldStartTime > 0)
            {
                var since = Date.now() - this.shieldStartTime;
                if (since > this.shieldTime)
                {
                    this.shield.visible = false;
                    this.shieldStartTime = 0;
                }
            }

            // camera shake
            if (this.shakeStartTime > 0)
            {
                var timeSince = Date.now() - this.shakeStartTime;
                if (timeSince > this.shakeTime)
                {
                    // end the shaking
                    theGame.gameScene.gameLayer.scene.offsetX = 0;
                    theGame.gameScene.gameLayer.scene.offsetY = 0;
                    this.shakeStartTime = 0;

                } else
                {
                    var f = (this.shakeTime - timeSince) / this.shakeTime;
                    theGame.gameScene.gameLayer.scene.offsetX = pc.Math.rand(-8 * f, 8 * f);
                    theGame.gameScene.gameLayer.scene.offsetY = pc.Math.rand(-8 * f, 8 * f);
                }
            }
        },

        onAddedToLayer: function(layer)
        {
            layer.addElement(this.turret);
            layer.addElement(this.shield);
            layer.addElement(this.leftExhaust);
            layer.addElement(this.rightExhaust);
            layer.addElement(this.topExhaust);
            layer.addElement(this.bottomExhaust);

        },

        onCollisionEnd:function (collision)
        {
            this._super(collision);
        },

        onCollisionStart:function (collision)
        {
            this._super(collision);

            if (this.state != Gunstar.STATE_FLYING) return;

            // take some damage
            if (collision.type = pc.Collision.ENTITY_TYPE && collision.entity != null && collision.entity.enemy)
            {
                if (collision.entity.Class.fullName == 'EnemyShip' || collision.entity.Class.fullName == 'BulletEntity')
                {
                    this.energy -= 20;
                    this.shieldStartTime = Date.now();
                    this.shield.visible = true;
                    if (pc.system.soundEnabled)
                        this.shieldHitSound.play();

                    // shake camera
                    this.shakeStartTime = Date.now();
                    collision.entity.suicide(); // make the bullet go away
                } else
                {
                    if (collision.entity.Class.fullName == 'PowerupEntity')
                    {
                        this.energy = 100;
                        collision.entity.suicide(); // make the powerup go away
                    }
                }
            }

            if (this.energy < 0)
            {
                // DEAD!
                this.shieldStartTime = 0;
                this.shield.visible = false;

                this.state = Gunstar.STATE_EXPLODING;
                this.setCollidable(false);
                this.thrust = 0;
                this.energy = this.maxEnergy;
                this.velX = 0;
                this.velY = 0;
                this.accelX = 0;
                this.accelY = 0;
                this.topExhaust.setEmitting(false);
                this.leftExhaust.setEmitting(false);
                this.rightExhaust.setEmitting(false);
                this.bottomExhaust.setEmitting(false);
                this.turret.setActive(false);

                this.setSprite(this.explodingSpriteSheet);
            }
        }


    });

DamageParticle = pc.Entity('DamageParticle',
    {
        ///
        /// STATICS
        ///
        create:function (layer, x, y, dir, velX, velY)
        {
            var d = pc.Math.rotate(dir, pc.Math.rand(-120, 120));
            var p = this._super(layer, x, y, d, 24, 24, false);

            p.incVel(pc.Math.rand(2, 4));
            p.setLifetime(3000);
            p.getSprite().reset();
            p.setCollidable(false);
            return p;
        }
    },
    {
        init:function ()
        {
            this._super();

            var explosionImage = pc.system.loader.get('small-explosions').resource;
            var explosionSpriteSheet = new pc.SpriteSheet(explosionImage, 24, 24);
            explosionSpriteSheet.addAnimationWithDirections('explode3', 0, 4, null, 1, 2000, 1);
            this.setSprite(explosionSpriteSheet);
        }

    });

WreckageParticle = pc.Entity('WreckageParticle',
    {
        ///
        /// STATICS
        ///
        create:function (layer, x, y, dir, velX, velY)
        {
            var d = pc.Math.rotate(dir, pc.Math.rand(-120, 120));
            var p = this._super(layer, x, y, d, 24, 24, false);

            p.incVel(pc.Math.rand(1, 2));
            p.setLifetime(5000);
            p.getSprite().reset();
            p.setCollidable(false);
            return p;
        }
    },
    {
        init:function ()
        {
            this._super();

            var explosionImage = pc.system.loader.get('small-explosions').resource;
            var explosionSpriteSheet = new pc.SpriteSheet(explosionImage, 24, 24);
            explosionSpriteSheet.addAnimationWithDirections('explode3', 0, 3, null, 1, 2000, 1);
            this.setSprite(explosionSpriteSheet);
        }

    });


ExhaustParticle = pc.Entity('ExhaustParticle',
    {
        ///
        /// STATICS
        ///
        create:function (layer, x, y, dir)
        {
            var p = this._super(layer, x, y, dir, 24, 24, false);
            p.incVel(1.5);
            p.setLifetime(200);
            p.setCollidable(false);
            return p;
        }
    },
    {
        init:function ()
        {
            this._super();
            var explosionImage = pc.system.loader.get('small-explosions').resource;
            var explosionSpriteSheet = new pc.SpriteSheet(explosionImage, 24, 24);
            explosionSpriteSheet.addAnimationWithDirections('explode3', 0, 3, null, 1, 100, 1);
            this.setSprite(explosionSpriteSheet);
        }

    });


// Create the game
SpaceGame = pc.Game('SpaceGame',
    {
        LOADING:0,
        MENU: 1,
        PLAYING:2
    },
    {
        menuScene:null,
        gameScene:null,
        starFieldLayer1: null, // used by both gamescene and menuscene
        starFieldLayer2: null, // used by both gamescene and menuscene
        starFieldLayer3: null, // used by both gamescene and menuscene
        menuMusic: null,
        gameMusic: null,

        init:function (canvasId, fps)
        {
            this._super(canvasId, fps);
            //            pc.system.isTouch = true; // testing
        },

        /**
         * onReady is called when the system is up and running
         */
        onReady:function ()
        {
            this._super();

            this.state = this.Class.LOADING;

            // start the resource loading
            if (pc.system.isAppMobi)
                pc.system.loader.setBaseUrl('demos/starfrontier/');
            else
                pc.system.loader.setBaseUrl('/demos/starfrontier/');

            pc.system.loader.setDisableCache();

            pc.system.loader.add(new pc.Image('player-ship', 'images/ship1.png'));
            pc.system.loader.add(new pc.Image('enemy-ship', 'images/enemy1.png'));
            pc.system.loader.add(new pc.Image('powerup', 'images/powerup.png'));
            pc.system.loader.add(new pc.Image('station', 'images/station32.png'));
            pc.system.loader.add(new pc.Image('bullet', 'images/bomb.png'));
            pc.system.loader.add(new pc.Image('pulseball', 'images/pulseballsimple.png'));
            pc.system.loader.add(new pc.Image('stars', 'images/stars.png'));
            pc.system.loader.add(new pc.Image('planet1', 'images/planet_01.png'));
            pc.system.loader.add(new pc.Image('planet2', 'images/planet_02.png'));
            pc.system.loader.add(new pc.Image('stars-dim', 'images/stars-dim.png'));
            pc.system.loader.add(new pc.Image('nebula-blobs', 'images/nebula-blobs.png'));
            pc.system.loader.add(new pc.Image('small-explosions', 'images/smallexplosions.png'));
            pc.system.loader.add(new pc.Image('big-explosions', 'images/explosions.png'));
            pc.system.loader.add(new pc.Image('gunstar', 'images/gunstar-small.png'));
            pc.system.loader.add(new pc.Image('turret-small', 'images/turret-small.png'));
            pc.system.loader.add(new pc.Image('enemy-turret', 'images/turret1.png'));
            pc.system.loader.add(new pc.Image('plasma-shield', 'images/plasmaballfront80.png'));
            pc.system.loader.add(new pc.Image('big-bomb', 'images/flareblue16.png'));
            pc.system.loader.add(new pc.Image('plasma-weave', 'images/plasmaweave16-dark.png'));
            pc.system.loader.add(new pc.Image('logo', 'images/logo.png'));
            pc.system.loader.add(new pc.Image('poweredby', 'images/poweredbyplaycraft.png'));

            // sounds
            if (pc.system.soundEnabled)
            {
                pc.system.loader.add(new pc.Sound('fire', 'sounds/lowfire', ['ogg', 'mp3'], 10));
                pc.system.loader.add(new pc.Sound('fire2', 'sounds/shoot', ['ogg', 'mp3'], 10));
                pc.system.loader.add(new pc.Sound('explosion', 'sounds/explosion', ['ogg', 'mp3'], 3));
                pc.system.loader.add(new pc.Sound('athmo1', 'sounds/athmo1', ['ogg', 'mp3'], 1));
                pc.system.loader.add(new pc.Sound('music3', 'sounds/music3', ['ogg', 'mp3'], 1));
                pc.system.loader.add(new pc.Sound('shield-hit', 'sounds/shieldimpact', ['ogg', 'mp3'], 5));
                pc.system.loader.add(new pc.Sound('shield-hit2', 'sounds/shieldimpact2', ['ogg', 'mp3'], 5));
            }

            // levels
            pc.system.loader.add(new pc.DataResource('level1', 'data/level1.tmx'));

            // tell the resource loader to get going
            pc.system.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));

        },

        onLoading:function (percentageComplete)
        {
            // draw title screen -- with loading bar

        },

        onLoaded:function (loaded, errored)
        {
            this.starFieldLayer1 = new StarFieldLayer(0, 32 * 1000, 32 * 1000);
            this.starFieldLayer2 = new StarFieldLayer(1, 32 * 1000, 32 * 1000);
            this.starFieldLayer3 = new StarFieldLayer(2, 32 * 1000, 32 * 1000);

            this.state = this.Class.PLAYING;

            if (pc.system.soundEnabled)
            {
                this.menuMusic = pc.system.loader.get('music3').resource;
                this.menuMusic.setVolume(0.7);
                this.gameMusic = pc.system.loader.get('athmo1').resource;
                this.gameMusic.setVolume(0.7);
            }

            this.startMenu();
        },

        startMenu: function()
        {
            if (this.gameScene)
                this.deactivateScene(this.gameScene);

            if (this.menuScene == null)
            {
                this.menuScene = new MenuScene();
                this.addScene(this.menuScene);
            } else
                this.activateScene(this.menuScene);

            if (pc.system.soundEnabled)
            {
                this.gameMusic.stop();
                this.menuMusic.play(true);
            }

        },

        startGame:function ()
        {
            // turn off the music
            if (pc.system.soundEnabled)
            {
                this.menuMusic.stop();
                this.gameMusic.play(true);
            }

            // turn off the menu
            this.deactivateScene(this.menuScene);

            // already setup the gamescene?
            if (this.gameScene)
                this.activateScene(this.gameScene);
            else
            {
                this.gameScene = new GameScene();
                this.addScene(this.gameScene);
            }

        }



    });


// You need to have a canvas element somewhere in your web page with its ID set
// to 'gameCanvas'
var theGame = new SpaceGame('gameCanvas', 30);
/**
 * PlaycraftJS (C)2010-2012 Playcraft Labs, Inc.
 */

ControlsLayer = pc.ElementLayer('ControlsLayer',
    {},
    {
        bcs: 60, // base control size
        CONTROL_STYLE: 'rgba(200, 200, 200, 0.1)',

        init:function ()
        {
            this._super('ui', false);

        },

        onAddedToScene:function()
        {
            this._super();

            this.bcs *= pc.system.pixelRatio;

            // add all the ui elements
            EnergyBar.create(this, 10*pc.system.pixelRatio, 10, 0, (this.scene.viewPortWidth / 6) + 6, 19);

            if (pc.system.isTouch)
            {
//                TurnLeftArrow.create(this, 10, this.scene.viewPortHeight - (this.bcs * 2), this.bcs, this.bcs);
//                TurnRightArrow.create(this, 10 + this.bcs * 2, this.scene.viewPortHeight - (this.bcs * 2), this.bcs, this.bcs);
//                ForwardArrow.create(this, 10 + this.bcs, this.scene.viewPortHeight - (this.bcs * 3), this.bcs, this.bcs);
//                ReverseArrow.create(this, 10 + this.bcs, this.scene.viewPortHeight - this.bcs, this.bcs, this.bcs);
                DirControlButton.create(this, 10, this.scene.viewPortHeight - (this.bcs*2) - 10, 0, this.bcs*2, this.bcs*2);
                FireControlButton.create(this, this.scene.viewPortWidth - (this.bcs*2) - 10,
                                    this.scene.viewPortHeight - (this.bcs*2) - 10, 0, this.bcs*2, this.bcs*2);

//                FireButton.create(this, this.scene.viewPortWidth - (this.bcs*2) - 10,
//                    this.scene.viewPortHeight - (this.bcs*2) - 10, this.bcs*2, this.bcs*2);
            }
        },

        onResize: function(width, height)
        {
        },

        draw: function (ctx, screenOffsetX, screenOffsetY)
        {
//            if (pc.system.isTouch)
//            {
//                draw a circle around
//                ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
//
//                ctx.beginPath();
//                ctx.arc(screenOffsetX + 10 + (this.bcs*1.5), screenOffsetX + this.scene.viewPortHeight - (this.bcs*1.5),
//                    this.bcs*1.5, 0, pc.Math.PI * 2, true);
//                ctx.closePath();
//                ctx.fill();
//            }
            this._super(ctx, screenOffsetX, screenOffsetY);
        }

    });

PosControlButton = pc.UIElement('PosControlButton',
    { },
    {
        clickPos: null,

        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(this, 'pressed', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(this, 'pressed', 'TOUCH', this);
            this.clickPos = pc.Point.create(0, 0);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;

            ctx.fillStyle = this.layer.CONTROL_STYLE;

            ctx.beginPath();
            ctx.arc(x+(width/2), y+(width/2), width/2, 0, pc.Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x+(width/2), y+(width/2), width/3, 0, pc.Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            // debug
//            if (this.clickPos != null)
//            {
//                ctx.fillStyle = '#ff4444';
//                ctx.fillRect(this.clickPos.x, this.clickPos.y, 10, 10);
//            }

        },

        update: function(delta)
        {
            this._super(delta);
//            return;
            var state = this.getInputState('pressed');
            if (state.on)
            {
                // get the event so we can read the position
                pc.Input.getEventPosition(state.event, this.clickPos);
            }

            // pass it through to the subclasses
            this.handleState(state.on, this.clickPos);
        },

        handleState: function(on, pos) {}

    });

DirControlButton = PosControlButton.extend('DirControlButton',
    { },
    {
        handleState: function(on, pos)
        {
            if (on)
            {
                theGame.gameScene.playerShip.dir = this.centerPos.dirTo(pos);
                theGame.gameScene.playerShip.thrust = 2;


            } else
            {
                theGame.gameScene.playerShip.thrust = 0;
            }
        }
    });

FireControlButton = PosControlButton.extend('FireControlButton',
    { },
    {
        handleState: function(on, pos)
        {
            if (on)
            {
                alert('firing');
                theGame.gameScene.playerShip.turret.dir = this.centerPos.dirTo(pos);
                theGame.gameScene.playerShip.turret.fire();
            }
        }
    });



EnergyBar = pc.UIElement('EnergyBar',
    {},
    {
        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            this._super(ctx, screenOffsetX, screenOffsetY);

            // draw the energy bar
            ctx.save();
            var color = '#44bb44';
            if (theGame.gameScene.playerShip.energy < 25)
                color = '#dd4444';

            var darkColor = '#333333';
            var barSize = this.dim.x;
            // figure out the % of the bar relative to the ship's energy

            // todo: energybar should be linked to a playership, not reference a global like this
            var perc = theGame.gameScene.playerShip.energy / theGame.gameScene.playerShip.maxEnergy;
            var pixels = barSize * perc;

            // draw the base bar
            ctx.fillStyle = darkColor;
            ctx.fillRect(this.pos.x + 5 - screenOffsetX, this.pos.y + 5 - screenOffsetY, barSize + 6, this.dim.y);
            // draw the energy left
            ctx.fillStyle = color;
            ctx.fillRect(this.pos.x + 5 + 3 - screenOffsetX, this.pos.y + 3 + 5 - screenOffsetY, pixels, this.dim.y - 6);

            ctx.restore();
        }
    });



FireButton = pc.UIElement('FireButton',
    { },
    {
        init:function ()
        {
            this._super();
            // todo: remove global, pass in a ship reference
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'firing', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'firing', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;

            ctx.fillStyle = this.layer.CONTROL_STYLE;

            ctx.beginPath();
            ctx.arc(x+(width/2), y+(width/2), width/2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x+(width/2), y+(width/2), width/3, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    });


TurnLeftArrow = pc.UIElement('TurnLeftArrow',
    { },
    {
        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'turning_left', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'turning_left', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;
            var height = this.dim.y;

            ctx.fillStyle = this.layer.CONTROL_STYLE;

            // left arrow
            ctx.beginPath();
            ctx.moveTo(x, y + (height / 2));
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x, y + (height / 2));
            ctx.fill();
            ctx.closePath();
        }
    });

TurnRightArrow = pc.UIElement('TurnRightArrow',
    {
    },
    {
        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'turning_right', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'turning_right', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;
            var height = this.dim.y;

            // right arrow
            ctx.fillStyle = this.layer.CONTROL_STYLE;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y + (height / 2));
            ctx.lineTo(x, y + height);
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.closePath();
        }
    });


ForwardArrow = pc.UIElement('ForwardArrow',
    {
    },
    {
        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'forward_thrusting', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'forward_thrusting', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;
            var height = this.dim.y;

            // right arrow
            ctx.fillStyle = this.layer.CONTROL_STYLE;
            ctx.beginPath();
            ctx.moveTo(x + (width / 2), y);
            ctx.lineTo(x + (width), y + height);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + (width / 2), y);
            ctx.fill();
            ctx.closePath();
        }
    });

ReverseArrow = pc.UIElement('ReverseArrow',
    {
    },
    {
        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'backward_thrusting', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'backward_thrusting', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;
            var height = this.dim.y;

            // right arrow
            ctx.fillStyle = this.layer.CONTROL_STYLE;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (width), y);
            ctx.lineTo(x + (width / 2), y + height);
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.closePath();
        }
    });

MenuScene = pc.Scene('MenuScene',
    {

    },
    {
        starFieldLayer:null, // note: this layer is also referenced by the game scene
        menuLayer:null,

        init:function ()
        {
            this._super('menu');

            // create the background layer
            this.starFieldLayer1 = theGame.starFieldLayer1;
            this.addLayer(this.starFieldLayer1);
            this.starFieldLayer2 = theGame.starFieldLayer2;
            this.addLayer(this.starFieldLayer2);
            this.starFieldLayer3 = theGame.starFieldLayer3;
            this.addLayer(this.starFieldLayer3);
            this.menuLayer = new MenuLayer();
            this.addLayer(this.menuLayer);
        },

        update:function (elapsed)
        {
            this._super(elapsed);

            // todo: move the starfield
            this.starFieldLayer1.origin.x += 0.25;
            this.starFieldLayer1.origin.y += 0.25;
            this.starFieldLayer2.origin.x += 0.5;
            this.starFieldLayer2.origin.y += 0.5;
            this.starFieldLayer3.origin.x += 1;
            this.starFieldLayer3.origin.y += 1;
        }

    });

MenuLayer = pc.ElementLayer('MenuLayer',
    {
    },
    {
        showingTitle:true,
        menuOptions:['Continue', 'New Game', 'Leaders', 'Options'],
        menuElements:[],
        faders:[],
        MENU_CONTINUE:0,
        MENU_NEW_GAME:1,
        MENU_LEADERS:2,
        MENU_OPTIONS:3,
        current:0,
        menuY: 0,
        menuX: 0,
        fader: null,

        init:function ()
        {
            this._super('menu');
        },

        // a layout manager basically handles positioning and onresize events
        // it's something that you can add to a layer

        onAddedToScene:function ()
        {
            this.menuY = 220 + (this.scene.viewPortHeight / 8);

            var logo = pc.Element.create(this, this.scene.viewPortWidth / 15 - 10, this.menuY-180, 0, 388, 100);
            logo.setSprite(new pc.SpriteSheet(pc.system.loader.get('logo').resource, 388, 100));

            var poweredBy = pc.Element.create(this, this.scene.viewPortWidth - 410, this.scene.viewPortHeight-109, 0, 350, 79);
            poweredBy.setSprite(new pc.SpriteSheet(pc.system.loader.get('poweredby').resource, 350, 79));

            pc.TextElement.create(this, 'Version 1.03', [70, 70, 70, 1], [70, 70, 70, 1], '13pt Calibri',
                this.scene.viewPortWidth / 15, this.scene.viewPortHeight-80, 200, 20);
            pc.TextElement.create(this, 'Copyright 2012 Playcraft Labs, Inc.', [70, 70, 70, 1], [70, 70, 70, 1], '13pt Calibri',
                this.scene.viewPortWidth / 15, this.scene.viewPortHeight-60, 200, 20);
            pc.TextElement.create(this, 'All rights reserved.', [70, 70, 70, 1], [70, 70, 70, 1], '13pt Calibri',
                this.scene.viewPortWidth / 15, this.scene.viewPortHeight-40, 200, 20);
            pc.TextElement.create(this, 'Code: Martin Wells   Art: Colin Pyle   Level Design: Blake Wells', [70, 70, 70, 1], [70, 70, 70, 1], '13pt Calibri',
                this.scene.viewPortWidth / 15, this.scene.viewPortHeight-20, 200, 20);

            // create the text elements
            for (var i = 0; i < this.menuOptions.length; i++)
            {
                var menuElement = pc.TextElement.create(this, this.menuOptions[i], [100, 100, 100, 1],
                    [100, 100, 100, 1], '35pt Calibri',
                    this.scene.viewPortWidth / 10, this.menuY + (i * 50), 200, 50);
                this.menuElements.push(menuElement);

                // setup the mouse/touch interaction
                // todo: its firing the textelement event... add bindAction option to have the event routed to menuLayer
                pc.system.input.bindAction(menuElement, 'execute-' + this.menuOptions[i], 'MOUSE_LEFT_BUTTON');
                pc.system.input.bindAction(menuElement, 'execute-' + this.menuOptions[i], 'TOUCH');

                var fader = pc.FadeEffect.create(500, 100, 500, 999);
                fader.active = false;
                menuElement.add(fader);
                this.faders.push(fader);
            }



            this.current = 1;
            this.menuElements[this.current].setFillColor([255,255,255,1]);
            this.faders[this.current].reset();
            this.faders[this.current].active = true;

            // setup input
            if (!pc.system.isTouch)
            {
                pc.system.input.bindAction(this, 'up', 'UP');
                pc.system.input.bindAction(this, 'down', 'DOWN');
                pc.system.input.bindAction(this, 'execute', 'ENTER');
                pc.system.input.bindAction(this, 'execute', 'SPACE');
            }


        },

        onAction:function (actionName, event, pos)
        {

            if (actionName == 'execute')
            {
                switch (this.current)
                {
                    case this.MENU_CONTINUE:
                        break;

                    case this.MENU_NEW_GAME:
                        theGame.startGame();
                        break;

                    case this.MENU_LEADERS:
                        break;

                    case this.MENU_OPTIONS:
                        break;
                }
            }

            if (actionName == 'down' || actionName == 'up')
            {
                // remove the fader off the current item
                this.faders[this.current].active = false;
                this.faders[this.current].element.setAlpha(1);
                this.menuElements[this.current].setFillColor([150,150,150,1]);

                if (actionName == 'down')
                    this.current++;
                if (actionName == 'up')
                    this.current--;

                if (this.current > this.menuOptions.length - 1)
                    this.current = 0;
                if (this.current < 0) this.current = this.menuOptions.length - 1;

                // add an effect to show the selected item
                this.menuElements[this.current].setFillColor([255,255,255,1]);
                this.faders[this.current].reset();
                this.faders[this.current].active = true;
            }

        }


    });

/**
 * PlaycraftJS Engine. (C)2010-2012 Playcraft Labs, Inc.
 */


RadarLayer = pc.Layer('RadarLayer',
    {},
    {
        mapCanvas:null,
        tileLayer:null,
        entityLayer:null,
        mapSize:null,

        init:function (tileLayer, entityLayer)
        {
            this._super('radar');
            this.tileLayer = tileLayer;
            this.entityLayer = entityLayer;

            if (pc.valid(tileLayer) && pc.valid(entityLayer))
                this.setLayers(tileLayer, entityLayer);
        },

        setLayers: function(tileLayer, entityLayer)
        {
            this.tileLayer = tileLayer;
            this.entityLayer = entityLayer;

            // the map size is 20% of the viewport width, square
            this.mapSize = pc.Dim.create(0,0);
            var mapWidth = Math.floor(pc.system.screen.x / 8);
            var mapHeight = Math.floor(pc.system.screen.y / 8);
            if (mapWidth > this.tileLayer.tilesWide)
                mapWidth = this.tileLayer.tilesWide;
            if (mapHeight > this.tileLayer.tilesHigh)
                mapHeight = this.tileLayer.tilesHigh;
            this.mapSize.x = mapWidth;
            this.mapSize.y = mapHeight;

            // now draw pixel where all
            this.mapCanvas = document.createElement('canvas');
            this.mapCanvas.width = tileLayer.tilesWide;
            this.mapCanvas.height = tileLayer.tilesHigh;

            var ctx = this.mapCanvas.getContext('2d');

            // background
            ctx.fillStyle = 'rgb(0,0,0)';
            ctx.fillRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);

            // the minimap tiles
            ctx.fillStyle = '#777777';
            for (var ty = 0; ty < tileLayer.tilesHigh; ty++)
            {
                for (var tx = 0; tx < tileLayer.tilesWide; tx++)
                {
                    if (tileLayer.tileMap[ty][tx] >= 0)
                        ctx.fillRect(tx, ty, 1, 1);
                }
            }
        },

        lastBlinkTime:0,
        blinkDelay:300,
        blinkOn:true,

        update:function (delta)
        {
            var sinceLastBlink = Date.now() - this.lastBlinkTime;
            if (sinceLastBlink > this.blinkDelay)
            {
                this.blinkOn = !this.blinkOn;
                this.lastBlinkTime = Date.now();
            }
        },

        draw:function (ctx, vx, vy, vw, vh)
        {
        	if (this.tileLayer == null || this.entityLayer == null) return;
        	
            // draw the area relative to the player's ship position
            var topLeftX = vw - this.mapSize.x - 16;
            var topLeftY = 10;

            var playerTilePosX = Math.floor(theGame.gameScene.playerShip.pos.x / this.tileLayer.tileWidth);
            var playerTilePosY = Math.floor(theGame.gameScene.playerShip.pos.y / this.tileLayer.tileHeight);

            // make the player blip the center by shifting up half the radar size
            var px = Math.floor(playerTilePosX - (this.mapSize.x / 2));
            var py = Math.floor(playerTilePosY - (this.mapSize.y / 2));

            // normalize
            if (px < 0) px = 0;
            if (py < 0) py = 0;
            if (px + this.size > this.tileLayer.tilesWide)
                px = this.tileLayer.tilesWide - this.mapSize.x;
            if (py + this.size > this.tileLayer.tilesHigh)
                py = this.tileLayer.tilesHigh - this.mapSize.y;

            // draw the background
            ctx.strokeStyle = 'rgb(80,80,80)';
            ctx.strokeRect(topLeftX, topLeftY, this.mapSize.x + 4, this.mapSize.y + 4);

            // draw the tile map (precached image)
            ctx.drawImage(this.mapCanvas, px, py, this.mapSize.x, this.mapSize.y,
                topLeftX + 2, topLeftY + 2, this.mapSize.x, this.mapSize.y);

            // draw player
            if (this.blinkOn)
            {
                ctx.fillStyle = '#ffdb14';
                ctx.fillRect(topLeftX + playerTilePosX - px - 0.1, topLeftY + playerTilePosY - py - 0.1, 3, 3);
            }

            // draw all the entities that are close by
            var next = this.entityLayer.collidableEntities.first;
            while (next)
            {
                if (next.obj.Class.fullName == 'EnemyShip' || next.obj.Class.fullName == 'PowerupEntity')
                {
                    var pix = 2;
                    if (next.obj.Class.fullName == 'EnemyShip')
                    {
                        ctx.fillStyle = '#ff3838';
                        pix = 3;
                    }
                    else
                    {
                        if (this.blinkOn)
                            ctx.fillStyle = '#63c003';
                        else
                            ctx.fillStyle = '#3f7c01';
                    }

                    var etx = Math.floor(next.obj.pos.x / this.tileLayer.tileWidth);
                    var ety = Math.floor(next.obj.pos.y / this.tileLayer.tileHeight);

                    if (etx >= px && ety >= py && etx < px + this.mapSize.x && ety < py + this.mapSize.y)
                        ctx.fillRect(topLeftX + etx - px - 0.1, topLeftY + ety - py - 0.1, pix, pix);
                }
                next = next.nextLinked;
            }

        }

    });



GameScene = pc.Scene('GameScene',
    {},
    {
        gameLayer:null,
        playerShip:null,
        energyBarLayer:null,
        spaceStationLayer:null,
        radarLayer: null,
        state:0,
        originTarget:null,
        starFieldLayer1: null,
        starFieldLayer2: null,
        starFieldLayer3: null,
        uiLayer:null,
        level: 1,

        init: function()
        {
            this._super('game');
        },

        onReady: function()
        {
            // create the background layer
            this.starFieldLayer1 = theGame.starFieldLayer1;
            this.starFieldLayer2 = theGame.starFieldLayer2;
            this.starFieldLayer3 = theGame.starFieldLayer3;
            this.addLayer(this.starFieldLayer1);
            this.addLayer(this.starFieldLayer2);
            this.addLayer(this.starFieldLayer3);
            this.planetLayer = new PlanetLayer();
            this.addLayer(this.planetLayer);

            // create the player ship -- not in a layer/level till startLevel is called
            this.playerShip = Gunstar.create();

            // sets up input states and binds them to the player entity
            // you can have multiple inputs result in a different state
            if (!pc.system.isTouch)
            {
                pc.system.input.bindState(this.playerShip, 'moving_right', 'RIGHT');
                pc.system.input.bindState(this.playerShip, 'moving_right', 'D');
                pc.system.input.bindState(this.playerShip, 'moving_left', 'LEFT');
                pc.system.input.bindState(this.playerShip, 'moving_left', 'A');
                pc.system.input.bindState(this.playerShip, 'moving_up', 'UP');
                pc.system.input.bindState(this.playerShip, 'moving_up', 'W');
                pc.system.input.bindState(this.playerShip, 'moving_down', 'DOWN');
                pc.system.input.bindState(this.playerShip, 'moving_down', 'S');
                //            pc.system.input.bindState(this.playerShip, 'firing', 'SPACE');
                pc.system.input.bindState(this.playerShip.turret, 'firing2', 'MOUSE_LEFT_BUTTON');
                //                    pc.system.input.bindState(this.playerShip.turret, 'firing', 'SPACE');
                pc.system.input.bindAction(this, 'aiming', 'MOUSE_MOVE');

                pc.system.input.bindState(this.playerShip.turret, 'firing', 'SPACE');

                pc.system.input.bindAction(this, 'escape', 'ESC');
                pc.system.input.bindAction(this, 'toggleCollisions', 'T');
                pc.system.input.bindAction(this, 'toggleDebugGrid', 'G');
                pc.system.input.bindAction(this, 'toggleSound', 'M');
                pc.system.input.bindAction(this, 'togglePause', 'P');
            } else
            {
                // UI controls layer will setup the input for touch input
            }

            this.uiLayer = new ControlsLayer();
            this.addLayer(this.uiLayer);

            this.radarLayer = new RadarLayer();
            this.addLayer(this.radarLayer);

            this.startLevel(1);
        },

        startLevel: function(level)
        {
            this.level = level;

            // load up the map
            this.loadFromTMX(pc.system.loader.get('level'+this.level).resource);
            this.spaceStationLayer = this.get('station');
            this.gameLayer = this.get('Object Layer 1');
            this.spaceStationLayer.origin = this.gameLayer.origin;

            // add the player ship into the new game level
            this.gameLayer.addElement(this.playerShip);
            // todo: get the player ship start object, and move the ship to the same spot
            // then reset the ships shields etc

            // tell the radar about the new level
            this.radarLayer.setLayers(this.spaceStationLayer, this.gameLayer);

            var levelAlert = pc.TextElement.create(this.uiLayer, 'Level '+ this.level, [0,0,0], [200,200,200], '30pt Calibri',
                (this.viewPortWidth/20), this.viewPortHeight / 2);

            levelAlert.add(pc.FadeEffect.create(4000, 1000, 4000));
            levelAlert.setLifetime(10000);

            var levelTitle = pc.TextElement.create(this.uiLayer, 'Discovery', [0,0,0], [120,120,120], '30pt Calibri',
                (this.viewPortWidth/20), (this.viewPortHeight / 2) +30);
            levelTitle.add(pc.FadeEffect.create(4000, 1000, 4000));
            levelTitle.setLifetime(10000);
        },

        onAction:function (actionName, event, pos)
        {
            if (actionName === 'aiming')
                this.playerShip.turret.onAction('aiming', event, pos);

            if (actionName === 'toggleCollisions')
                pc.system.setDebugCollisions(!pc.system.debugCollisions);

            // todo: go through and pause all sounds - this just disables playing of new sounds
            if (actionName === 'toggleSound')
                pc.system.soundEnabled = (!pc.system.soundEnabled);

            if (actionName === 'toggleDebugGrid')
            {
                this.spaceStationLayer.debugShowGrid = (!this.spaceStationLayer.debugShowGrid);
                this.planetLayer.debugShowGrid = (!this.planetLayer.debugShowGrid);
                this.starFieldLayer.debugShowGrid = (!this.starFieldLayer.debugShowGrid);
            }

            if (actionName === 'escape')
                theGame.startMenu();

            if (actionName === 'dumpPool')
            {
                console.log(pc.Pool.getStats());
            }

            if (actionName === 'togglePause')
                this.togglePauseResume();
        },

        update:function (elapsed)
        {
            this._super(elapsed);

            this.gameLayer.origin.x = this.playerShip.centerPos.x - (this.viewPortWidth / 2);
            this.gameLayer.origin.y = this.playerShip.centerPos.y - (this.viewPortHeight / 2);
            this.spaceStationLayer.origin.match(this.gameLayer.origin);

            this.starFieldLayer1.origin.x = (this.playerShip.pos.x - (this.viewPortWidth / 6)) / 7;
            this.starFieldLayer1.origin.y = (this.playerShip.pos.y - (this.viewPortHeight / 2)) / 7;
            this.starFieldLayer2.origin.x = (this.playerShip.pos.x - (this.viewPortWidth / 6)) / 5;
            this.starFieldLayer2.origin.y = (this.playerShip.pos.y - (this.viewPortHeight / 2)) / 5;
            this.starFieldLayer3.origin.x = (this.playerShip.pos.x - (this.viewPortWidth / 6)) / 3;
            this.starFieldLayer3.origin.y = (this.playerShip.pos.y - (this.viewPortHeight / 2)) / 3;

            this.planetLayer.origin.x = (this.playerShip.pos.x - (this.viewPortWidth / 6)) / 20;
            this.planetLayer.origin.y = (this.playerShip.pos.y - (this.viewPortHeight / 2)) / 20;

            return true; // return false to quit
        }



    });


/**
 * PlaycraftJS Engine. (C)2010-2012 Playcraft Labs, Inc.
 */


PlanetLayer = pc.Layer.extend('PlanetLayer', {},
    {
        planetImage:null,

        init:function (scene)
        {
            this._super('planets', false);
            this.planetImage = pc.system.loader.get('planet1').resource;
            this.planetImage2 = pc.system.loader.get('planet2').resource;
        },

        // this layer's offset will be changed based on the ship's movement
        // switch to tile-based?
        draw:function (ctx, vx, vy, vw, vh)
        {
            this.planetImage.draw(ctx, vx - this.origin.x + 350, vy - this.origin.y + 200);
            this.planetImage2.draw(ctx, vx - this.origin.x + 1050, vy - this.origin.y + 700);
        }

    });


StarFieldLayer = pc.TiledLayer('StarFieldLayer', {},
    {
        starFieldCanvas:null,

        init:function (type, width, height)
        {
            // generate a starfield
            var tileSize = 256;   // big fat space tile width
            var spaceTiles = this.generateStarFieldTiles(type, tileSize, tileSize, 4, 1);
            var spaceSpriteSheet = new pc.SpriteSheet(spaceTiles, tileSize, tileSize, 4, 1);

            // we need enough tiles to cover the entire map (plus some edges)
            var tilesWide = Math.ceil(width / tileSize)+4;
            var tilesHigh = Math.ceil(height / tileSize)+4;
            this._super('starfield', false, spaceSpriteSheet, tilesWide, tilesHigh, tileSize, tileSize);

            this.generate(tilesWide, tilesHigh, -1);

            for (var ty = 0; ty < tilesHigh; ty++)
                for (var tx = 0; tx < tilesWide; tx++)
                    this.setTile(tx, ty, pc.Math.rand(0, 3));

        },

        generateStarFieldTiles:function (type, tileWidth, tileHeight, tilesWide, tilesHigh)
        {
            var starsImage = pc.system.loader.get('stars').resource;
            var dimStarsImage = pc.system.loader.get('stars-dim').resource;
            var nebulaImage = pc.system.loader.get('nebula-blobs').resource;

            var starSpriteSheet = new pc.SpriteSheet(starsImage, 20, 20, 4, 3);
            var dimStarSpriteSheet = new pc.SpriteSheet(dimStarsImage, 20, 20, 4, 3);
            var nebulaSpriteSheet = new pc.SpriteSheet(nebulaImage, 64, 64, 4, 1);

            this.starFieldCanvas = document.createElement('canvas');
            this.starFieldCanvas.width = tileWidth * tilesWide;
            this.starFieldCanvas.height = tileHeight * tilesHigh;

            var ctx = this.starFieldCanvas.getContext('2d');
            if (type == 0)
            {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, this.starFieldCanvas.width, this.starFieldCanvas.height);
            }

            for (var ty = 0; ty < tilesHigh; ty++)
            {
                for (var tx = 0; tx < tilesWide; tx++)
                {
                    var originX = tx * tileWidth;
                    var originY = ty * tileHeight;

                    // create a first layer of dense but distant (smaller and faded) stars
                    switch (type)
                    {
                        case 0:
                            this.generateImageField(ctx, originX, originY, tileWidth, tileHeight,
                                dimStarSpriteSheet, 30, 0.8, 1, 0);
                            break;

                        case 1:
                            this.generateImageField(ctx, originX, originY, tileWidth, tileHeight,
                                starSpriteSheet, 80, 0.8, 1, 0);
                            break;
                        case 2:
                            this.generateImageField(ctx, originX, originY, tileWidth, tileHeight,
                                nebulaSpriteSheet, 100, 0.2, 0.3, 100);
                            break;
                    }
                }
            }

            return new pc.CanvasImage(this.starFieldCanvas);
        },

        generateImageField:function (ctx, originX, originY, width, height, spriteSheet, spread, alphaLow, alphaHigh, leapDistance)
        {
            var nextIncX = 1;
            var nextIncY = 1;

            for (var y = originY; y < originY + height; y += nextIncY)
            {
                for (var x = originX; x < originX + width; x += nextIncX)
                {
                    ctx.globalAlpha = pc.Math.randFloat(alphaLow, alphaHigh);

                    var px = x + pc.Math.rand(0, spread);
                    var py = y + pc.Math.rand(0, spread);
                    var fx = pc.Math.rand(0, spriteSheet.framesWide - 1);
                    var fy = pc.Math.rand(0, spriteSheet.framesHigh - 1);

                    // make sure we don't draw something over the edge of the canvas (it'll get cutoff
                    // when tiled and look choppy, not nice and seamless and beautiful, like my girlfriend)
                    if (pc.Math.isRectInRect(px, py, spriteSheet.frameWidth, spriteSheet.frameHeight,
                        originX, originY, width, height))
                        spriteSheet.drawFrame(ctx, fx, fy, px, py);

                    nextIncX = pc.Math.rand(spread - (spread / 2), spread + (spread / 2));
                    if (pc.Math.rand(leapDistance / 2, leapDistance) < leapDistance / 4)
                        nextIncX += leapDistance;
                }
                nextIncY = pc.Math.rand(spread - (spread / 2), spread + (spread / 2));
                if (pc.Math.rand(0, leapDistance) < leapDistance / 2)
                    nextIncY += leapDistance;
            }
        }
    });
