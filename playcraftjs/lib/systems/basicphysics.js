

pc.systems.BasicPhysics = pc.EntitySystem.extend('pc.systems.BasicPhysics',
    {},
    {
        /**
         * Very simple gravity system, just adds to velocity x or y (gravity: {y:1}} makes things fall
         */
        gravity: null,

        /**
         * List of collidable entities
         * @readonly
         */
        collidables: null, // this system keeps it's own list of collidable entities for speed

        /**
         * Array of maps to be used for optional collisions (usually cross-layer collisions like tile maps)
         */
        collisionMaps: null,

        init: function(options)
        {
            this._super( [ 'basicphysics', 'collidable' ] );
            this.collidables = new pc.LinkedList();

            this.collisionMaps = [];
            if (options.collisionMap)
                this.collisionMaps.push(options.collisionMap);
            if (options.gravity)
                this.gravity = pc.Point.create(pc.checked(options.gravity.x, 0), pc.checked(options.gravity.y, 0));
        },

        addCollisionMap: function(map)
        {
            this.collisionMaps.push(map);
        },

        removeCollisionMap: function(map)
        {
            this.collisionMaps.remove(map);
        },

        process: function(entity)
        {
            var sp = entity.getComponent('spatial');
            var ph = entity.getComponent('basicphysics');
            var collidable = entity.getComponent('collidable');

            // speed adjusters: detect if things have changed and adjust the speed. This is so you can
            // just do a phsyicsComponent.speed = 5; to instantly accelerate... kinda like a prius
            if (ph._currentSpeed != ph.speed)
            {
                ph.setVel(ph.speed, sp.dir);
                ph._currentSpeed = ph.speed;
            }

            if (ph.thrust != 0 || this.gravity.x || this.gravity.y)
            {
                // calc acceleration
                ph.accelX = ph.thrust * Math.cos( pc.Math.degToRad(sp.dir) );
                ph.accelY = ph.thrust * Math.sin( pc.Math.degToRad(sp.dir) );

                // add the acceleration to velocity
                ph.velX += (ph.accelX * (pc.device.elapsed/1000)) + this.gravity.x;
                ph.velY += (ph.accelY * (pc.device.elapsed/1000)) + this.gravity.y;

                // cap velocity
                ph.velX = pc.Math.limit(ph.velX, -ph.maxVelX, ph.maxVelX);
                ph.velY = pc.Math.limit(ph.velY, -ph.maxVelY, ph.maxVelY);

                // make direction match the velocity path
                if (ph.faceVel)
                {
                    var vel = pc.Point.create(this.velX, this.velY);
                    var zero = pc.Point.create(0, 0);
                    ph.dir = zero.dirTo(vel);
                    vel.release();
                    zero.release();
                }
            }

            //
            // check for collisions
            //

            if (ph.velX != 0 || ph.velY != 0) // todo: or positional change (check lastMove.x/y?)
            {
                if (collidable)
                {
                    // sweep the current collisions with this object as stale
                    // we then detect collisions in this frame and update the flag, after we're
                    // done, any that are not updated will be detected as ended (and we can then
                    // do something about it)
                    for (var c in collidable.entityCollisions.items)
                        collidable.entityCollisions.items[c].current = false;

//                    if an entity is removed, all collisions should be removed in cleanup

                    // collision testing
                    // get all the other collidable objects that are within range
                    // spatial sorting not deployed yet, so we get all the other entities (slow)
                    var next = this.collidables.first;
                    while (next)
                    {
                        var collided = false;

                        var otherEntity = next.obj;
                        if (otherEntity != entity) // don't collide with yourself
                        {
                            var otherSP = otherEntity.getComponent('spatial');
                            var otherCollidable = otherEntity.getComponent('collidable');

                            if (collidable.restrict) // restrict movement into the collision
                            {
                                var xAxis = false;
                                var yAxis = false;

                                // todo: this could be replaced with a single collision test, and once
                                // a collision is detected, figure out the axis of the collision
                                // x-axis movement
                                if (pc.Math.isRectColliding(sp.pos.x + ph.velX + collidable.margin, sp.pos.y + collidable.margin,
                                    sp.dim.x - collidable.margin, sp.dim.y-collidable.margin,
                                    otherSP.pos.x+ otherCollidable.margin, otherSP.pos.y+otherCollidable.margin,
                                    otherSP.dim.x- otherCollidable.margin, otherSP.dim.y-otherCollidable.margin))
                                {
                                    xAxis = true;
                                    collided = true;
                                    if (collidable.restrict)
                                    {
                                        if (ph.bounce)
                                            ph.velX *= -ph.bounce;
                                        else
                                            ph.velX = 0;
                                    }
                                }

                                // y-axis movement
                                if (pc.Math.isRectColliding(sp.pos.x + ph.velX + collidable.margin, sp.pos.y + collidable.margin + ph.velY,
                                    sp.dim.x - collidable.margin, sp.dim.y-collidable.margin,
                                    otherSP.pos.x+ otherCollidable.margin, otherSP.pos.y+otherCollidable.margin,
                                    otherSP.dim.x- otherCollidable.margin, otherSP.dim.y-otherCollidable.margin))
                                {
                                    yAxis = true;
                                    collided = true;
                                    if (collidable.restrict)
                                    {
                                        if (ph.bounce)
                                            ph.velY *= -ph.bounce;
                                        else
                                            ph.velY = 0;
                                    }
                                }

                            } else
                            {
                                if (pc.Math.isRectColliding(sp.pos.x + ph.velX + collidable.margin, sp.pos.y + ph.velY,
                                    sp.dim.x- + collidable.margin, sp.dim.y-collidable.margin,
                                    otherSP.pos.x+ otherCollidable.margin, otherSP.pos.y-otherCollidable.margin,
                                    otherSP.dim.x- otherCollidable.margin, otherSP.dim.y-otherCollidable.margin))
                                {
                                    collided = true;
                                }
                            }

                            if (collided)
                            {
                                var collision = collidable.getEntityCollision(otherEntity);
                                if (collision != null)
                                    collision.current = true;

                                if (collidable.isCollidingWithEntity(otherEntity))
                                    this.onCollision(collision);
                                else
                                {
                                    this.onCollisionStart(collidable.addEntityCollision(entity, otherEntity));
                                }
                            }
                        }

                        next = next.next();

                    } // while next collidable (other entities loop)

                    //
                    // ENTITY COLLISION CLEANUP
                    //
                    // ending collisions test -- check if any of the current collisions are no longer current
                    // i.e. they didn't get current set to true on this collision pass
                    //

                    for (var k in collidable.entityCollisions.items)
                    {
                        var c = collidable.entityCollisions.items[k];
                        if (!c.current)
                        {
                            this.onCollisionEnd(c);
                            collidable.removeEntityCollision(c);
                        }

                    }

                    //
                    // TILE COLLISIONS
                    //
                    // If this physics system is associated with a collision map, then test entities against
                    // that map to see if we hit anything.
                    //

                    // mark all current tile collisions as non-current
                    var tcNext = collidable.tileCollisions.first;
                    while (tcNext)
                    {
                        tcNext.obj.current = false;
                        tcNext = tcNext.next();
                    }

                    for (var i=0; i < this.collisionMaps.length; i++)
                    {
                        var tileCollision = this.collisionMaps[i].checkCollision(entity, sp, collidable, ph.velX, ph.velY);
                        if (tileCollision)
                        {
                            if (collidable.restrict)
                            {
                                if (tileCollision.yAxis)
                                {
                                    if (ph.bounce)
                                        ph.velY *= -ph.bounce;
                                    else
                                        ph.velY = 0;
                                }

                                if (tileCollision.xAxis)
                                {
                                    if (ph.bounce)
                                        ph.velX *= -ph.bounce;
                                    else
                                        ph.velX = 0;
                                }
                            }

                            // check if this collision is already in the collision list then it's current
                            // todo: this check is also done in the TileLayer.collisionCheck -- merge somehow?
                            // return that is was a new collision
                            if (!collidable.getTileCollision(tileCollision.tileMap, tileCollision.tileX, tileCollision.tileY))
                            {
                                collidable.addTileCollision(tileCollision);
                                this.onCollisionStart(tileCollision);
                            }
                            else
                                this.onCollision(tileCollision);
                        }
                    }

                    // remove any collisions not marked as current
                    tcNext = collidable.tileCollisions.first;
                    while (tcNext)
                    {
                        if (!tcNext.obj.current)
                        {
                            this.onCollisionEnd(tcNext.obj);
                            collidable.removeTileCollision(tcNext.obj);
                        }
                        tcNext = tcNext.next();
                    }


                } // if collidable

                sp.pos.x = sp.pos.x + ph.velX;
                sp.pos.y = sp.pos.y + ph.velY;
                sp.lastMove.x = ph.velX;
                sp.lastMove.y = ph.velY;
            }
        },

        onCollisionStart: function(collision) { },
        onCollision: function(collision) { },
        onCollisionEnd: function(collision) { },

        onEntityAdded: function(entity)
        {
            if (entity.getComponent('collidable'))
                this.collidables.add(entity);
        },

        onEntityRemoved: function(entity)
        {
            var collidable = entity.getComponent('collidable');
            if (collidable)
            {
                for (var k in collidable.entityCollisions.items)
                {
                    var c = collidable.entityCollisions.items[k];
                    this.onCollisionEnd(c);
                    collidable.removeEntityCollision(c);
                }

                // remove it from the local cache
                this.collidables.remove(entity);
            }
        },

        onComponentAdded: function(entity, component)
        {
            if (component.getType() == 'collidable')
                this.collidables.add(entity);
        },

        onComponentRemoved: function(entity, component)
        {
            if (component.getType() == 'collidable')
                this.collidables.remove(entity);
        }




    });

