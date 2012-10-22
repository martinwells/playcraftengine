/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.CollisionShape = {
    RECT:0, // rectangular collision area
    CIRCLE:1, // circular
    POLY:2     // a polygon
};

pc.BodyType = {
    ENTITY:0,
    TILE:1
};

/**
 * @class pc.systems.Physics
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * A 2D physics system for entities. See the <a href='pc.components.Physics'>physics component</a> and
 * <a href='/develop/guide/physics'>physics guide</a>.
 */
pc.systems.Physics = pc.systems.EntitySystem.extend('pc.systems.Physics',
    /** @lends pc.systems.Physics */
    {
        /** scale of the physics systems relative to 1 pixel */
        SCALE:0.1,

        /** static function to convert from a screen coordinate to physics space */
        toP:function (a)
        {
            return a * this.SCALE;
        },

        /** static function to convert from a physics coordinate to a screen space */
        fromP:function (a)
        {
            return a / this.SCALE;
        }
    },
    /** @lends pc.systems.Physics.prototype */
    {
        /** the physics world */
        world:null,
        /** current gravity (pc.Dim) */
        gravity:null,
        /** whether debugging is enabled */
        debug:false,

        debugDraw:null,

        /**
         * Constructs a new physics systems with options.
         * @param {pc.Dim} options.gravity Level of gravity as a 2D vector (gravity.x, gravity.y)
         * @param {pc.TileMap} options.tileCollisionMap.tileMap A tile map which will be used to construct tile collisions
         * @param {Number} options.tileCollisionMap.collisionCategory Collision category for the tile map
         * @param {Number} options.tileCollisionMap.collisionMask Collision mask for the tile map
         * @param {Number} options.tileCollisionMap.collisionGroup Collision group for the tile map
         * @param {Boolean} options.debug Whether debugging is enabled
         */
        init:function (options)
        {
            this._super([ 'physics' ]);

            if (options && options.gravity)
                this.gravity = pc.Point.create(pc.checked(options.gravity.x, 0), pc.checked(options.gravity.y, 0));
            else
                this.gravity = pc.Point.create(0, 0);

            var gravity = new Box2D.Common.Math.b2Vec2(this.gravity.x * this.Class.SCALE, this.gravity.y * this.Class.SCALE);
            this.world = new Box2D.Dynamics.b2World(gravity, true);

            if (options && pc.valid(options.tileCollisionMap))
            {
                pc.assert(pc.valid(options.tileCollisionMap.tileMap), 'A tileMap is required for a tileCollisionMap');
                this.addTileCollisionMap(
                    options.tileCollisionMap.tileMap,
                    pc.checked(options.tileCollisionMap.collisionGroup, 0),
                    pc.checked(options.tileCollisionMap.collisionCategory, 0),
                    pc.checked(options.tileCollisionMap.collisionMask, 0));
            }

            // setup the contact listeners
            var listener = new Box2D.Dynamics.b2ContactListener;
            listener.BeginContact = this._beginContactListener.bind(this);
            listener.EndContact = this._endContactListener.bind(this);
            listener.PostSolve = this._postSolveListener.bind(this);
            this.world.SetContactListener(listener);

            // setup debug drawing
            var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
            this.debugDraw = new b2DebugDraw();
            this.debugDraw.SetSprite(pc.device.ctx);
            this.debugDraw.SetDrawScale(this.Class.SCALE * 100);
            this.debugDraw.SetFillAlpha(0.3);
            this.debugDraw.SetLineThickness(1.0);
            this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);

            if (options && options.debug == true)
            {
                this.debug = options.debug;
                this.setDebug(options.debug);
            }
        },

        _beginContactListener:function (contact)
        {
            this.onCollisionStart(
                contact.GetFixtureA().GetBody()._pc_bodyType,
                contact.GetFixtureB().GetBody()._pc_bodyType,
                contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData(),
                contact.GetFixtureA()._pc_type,
                contact.GetFixtureB()._pc_type,
                contact);
        },

        _endContactListener:function (contact)
        {
            this.onCollisionEnd(
                contact.GetFixtureA().GetBody()._pc_bodyType,
                contact.GetFixtureB().GetBody()._pc_bodyType,
                contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData(),
                contact.GetFixtureA()._pc_type,
                contact.GetFixtureB()._pc_type,
                contact);
        },

        _postSolveListener:function (contact, impulse)
        {
            var i = impulse.normalImpulses[0];
            this.onCollision(
                contact.GetFixtureA().GetBody()._pc_bodyType,
                contact.GetFixtureB().GetBody()._pc_bodyType,
                contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData(),
                i,
                contact.GetFixtureA()._pc_type,
                contact.GetFixtureB()._pc_type,
                contact);
        },

        /**
         * Process an entity's physics. Called automatically by the entity system.
         * @param {pc.Entity} entity Entity being processed
         */
        process:function (entity)
        {
            if (!entity.active) return;

            var sp = entity.getComponent('spatial');
            var ph = entity.getComponent('physics');
            var at = entity.getComponent('joint');

            if (!ph._body)
            {
                // setup physics body
                var bodyDef = new Box2D.Dynamics.b2BodyDef();
                bodyDef.type = ph.immovable ? Box2D.Dynamics.b2BodyDef.b2_staticBody :
                    bodyDef.type = Box2D.Dynamics.b2BodyDef.b2_dynamicBody;

                bodyDef.position.x = this.Class.toP(sp.pos.x + (sp.dim.x / 2));
                bodyDef.position.y = this.Class.toP(sp.pos.y + (sp.dim.y / 2));
                bodyDef.linearDamping = ph.linearDamping;
                bodyDef.angularDamping = ph.angularDamping;
                bodyDef.isBullet = ph.bullet;
                bodyDef.fixedRotation = ph.fixedRotation;

                ph._body = this.world.CreateBody(bodyDef);
                ph._body.SetAngle(pc.Math.degToRad(sp.dir));
                ph._body.SetUserData(entity);
                ph._body._pc_bodyType = pc.BodyType.ENTITY;

                // custom gravity for the body (optional)
                if (ph.gravity)
                    ph.setGravity(ph.gravity.x, ph.gravity.y);

                //
                // Fixtures
                //
                pc.assert(ph.shapes.length, "You must specify at least one shapes for a physics entity");

                // configure the shapes as fixtures
                for (var i = 0; i < ph.shapes.length; i++)
                {
                    var shape = ph.shapes[i];

                    // take the spatial, then offset
                    var w = (sp.dim.x + shape.offset.w) * this.Class.SCALE;
                    var h = (sp.dim.y + shape.offset.h) * this.Class.SCALE;
                    var hw = w / 2;
                    var hh = h / 2;
                    var hx = (shape.offset.x * this.Class.SCALE) / 2;
                    var hy = (shape.offset.y * this.Class.SCALE) / 2;

                    pc.assert(hw > 0 && hh > 0, "Physics requires a spatial size minimum of 1");

                    var fixDef = new Box2D.Dynamics.b2FixtureDef();
                    fixDef.density = ph.density;
                    fixDef.friction = ph.friction;
                    fixDef.restitution = ph.bounce;

                    switch (shape.shape)
                    {
                        case pc.CollisionShape.CIRCLE:
                            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(w / 2);
                            fixDef.shape.SetLocalPosition(
                                Box2D.Common.Math.b2Vec2.Get(shape.offset.x * this.Class.SCALE,
                                    shape.offset.y * this.Class.SCALE));
                            break;

                        case pc.CollisionShape.POLY:
                            var points = [];
                            for (var q = 0; q < shape.points.length; q++)
                                points.push(new Box2D.Common.Math.b2Vec2(
                                    (shape.offset.x + shape.points[q][0]) * this.Class.SCALE,
                                    (shape.offset.y + shape.points[q][1]) * this.Class.SCALE));
                            fixDef.shape.SetAsArray(points, points.length);
                            break;

                        default: // pc.CollisionShape.RECT:
                            fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;

                            // need to set based on polygon rectangle --
                            points = [];

                            // the body is positioned relative to the center in physics,
                            // so we have to figure out the correct position of the center
                            points.push(Box2D.Common.Math.b2Vec2.Get(-(hw) + hx, -(hh) + hy));   // top left
                            points.push(Box2D.Common.Math.b2Vec2.Get(hw, -(hh) + hy));    // top right
                            points.push(Box2D.Common.Math.b2Vec2.Get(hw, hh));    // bottom right
                            points.push(Box2D.Common.Math.b2Vec2.Get(-(hw) + hx, hh));   // bottom left

                            fixDef.shape.SetAsArray(points, points.length);
                            break;
                    }

                    // set the collision filters
                    fixDef.filter.groupIndex = shape.collisionGroup;
                    fixDef.filter.categoryBits = shape.collisionCategory;
                    fixDef.filter.maskBits = shape.collisionMask;
                    fixDef.isSensor = shape.sensorOnly;

                    var f = ph._body.CreateFixture(fixDef);
                    f._pc_type = shape.type;
                    ph._fixtures.push(f);
                }


                if (ph.centerOfMass.x != 0 || ph.centerOfMass.y != 0 || ph.mass != -1)
                {
                    var md = new Box2D.Collision.Shapes.b2MassData();
                    md.center = Box2D.Common.Math.b2Vec2.Get(ph.centerOfMass.x * pc.systems.Physics.SCALE, ph.centerOfMass.y * pc.systems.Physics.SCALE);
                    if (ph.mass != -1) md.mass = ph.mass;
                    md.I = 1;
                    ph._body.SetMassData(md);
                } else
                {
                    md = new Box2D.Collision.Shapes.b2MassData();
                    md.mass = 1;
                    md.I = 1;

                    ph._body.SetMassData(md);
                }

                if (ph.force) ph.applyForce(ph.force);
                if (ph.impulse) ph.applyImpulse(ph.impulse);
                if (ph.torque) ph.applyTorque(ph.torque);
                if (ph.turn) ph.applyTurn(ph.turn);
            }

            // handle attachments/joints
            if (at)
            {
                if (!at._joint) // still not hooked up
                {
                    // test if we're ready to create a join (is other entity bound to physics and
                    // therefore has a body already)
                    var connectToPhysics = at.attachTo.getComponent('physics');
                    if (connectToPhysics._body)
                    {
                        var jointDef = null;

                        switch (at.type)
                        {
                            case pc.JointType.WELD:
                                jointDef = new Box2D.Dynamics.Joints.b2WeldJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.collideConnected = false;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                jointDef.localAnchorB.Set(at.attachmentOffset.x * this.Class.SCALE, at.attachmentOffset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);

                                // set this bodies position to the right place
                                var atPos = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos.x + (at.offset.x * this.Class.SCALE),
                                        y:atPos.y + (at.offset.y * this.Class.SCALE)
                                    });
                                break;

                            case pc.JointType.DISTANCE:
                                jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.frequency = at.frequency;
                                jointDef.dampingRatio = at.dampingRatio;
                                jointDef.collideConnected = false;
                                jointDef.length = at.distance;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                jointDef.localAnchorB.Set(at.attachmentOffset.x * this.Class.SCALE, at.attachmentOffset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);

                                // set this bodies position to the right place
                                atPos = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos.x + (at.offset.x * this.Class.SCALE),
                                        y:atPos.y + (at.offset.y * this.Class.SCALE)
                                    });
                                break;

                            case pc.JointType.REVOLUTE:
                                jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.collideConnected = false;
                                jointDef.referenceAngle = at.angle;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                jointDef.localAnchorB.Set(at.attachmentOffset.x * this.Class.SCALE, at.attachmentOffset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);

                                if (at.enableLimit)
                                {
                                    jointDef.enableLimit = at.enableLimit;
                                    jointDef.lowerAngle = pc.Math.degToRad(at.lowerAngleLimit);
                                    jointDef.upperAngle = pc.Math.degToRad(at.upperAngleLimit);
                                }

                                if (at.enableMotor)
                                {
                                    jointDef.enableMotor = at.enableMotor;
                                    jointDef.motorSpeed = pc.Math.degToRad(at.motorSpeed);
                                    jointDef.maxMotorTorque = at.maxMotorTorque;
                                }

                                // set this bodies position to the right place
                                var atPos2 = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos2.x + this.Class.toP(at.offset.x),
                                        y:atPos2.y + this.Class.toP(at.offset.y)
                                    });
                                break;
                        }

                        if (!jointDef)
                            throw "Invalid attachment config";
                        at._joint = this.world.CreateJoint(jointDef);
                    }
                }
            }

            var p = ph._body.GetPosition();

            sp.pos.x = this.Class.fromP(p.x) - (sp.dim.x / 2);
            sp.pos.y = this.Class.fromP(p.y) - (sp.dim.y / 2);
            sp.dir = pc.Math.radToDeg(ph._body.GetAngle());

            // if there is a max velocity set enforce it
            if (ph.maxSpeed.x > 0 || ph.maxSpeed.y > 0)
            {
                var velocity = ph._body.GetLinearVelocity();
                if (velocity.x != 0 || velocity.y != 0)
                {
                    var maxX = this.Class.toP(ph.maxSpeed.x);
                    if (velocity.x > 0 && velocity.x > maxX)
                        ph._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(maxX, velocity.y));
                    if (velocity.x < 0 && velocity.x < -maxX)
                        ph._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(-maxX, velocity.y));

                    var maxY = this.Class.toP(ph.maxSpeed.y);
                    if (velocity.y > 0 && velocity.y > maxY)
                        ph._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(velocity.x, maxY));
                    if (velocity.y < 0 && velocity.y < -maxY)
                        ph._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(velocity.x, -maxY));
                }
            }
        },

        /**
         * Called when the origin of the layer changes
         * @param {Number} x x-position of the origin
         * @param {Number} y y-position of the origin
         */
        onOriginChange:function (x, y)
        {
            // update the debug draw origin so it keeps up with us
            this.debugDraw.SetOrigin(x, y);
        },

        /**
         * Process the system
         */
        processAll:function ()
        {
            // this.world.Step(pc.device.elapsed / 200, 20, 20);
            this.world.Step(0.08, 10, 10); // fixed step to avoid frame rate physics issues when encountering lag
            this.world.DrawDebugData();
            this.world.ClearForces();

            this._super();
        },

        onAddedToLayer:function (layer)
        {
            var worldBoundingBox = new Box2D.Collision.b2AABB();
            worldBoundingBox.lowerBound.Set(0, 0);
            worldBoundingBox.upperBound.Set(this.Class.toP(layer.worldSize.x), this.Class.toP(layer.worldSize.y));
        },

        /**
         * Sets debugging
         * @param {Boolean} on True to enable debugging
         */
        setDebug:function (on)
        {
            if (on)
            {
                this.world.SetDebugDraw(this.debugDraw);
            } else
                this.world.SetDebugDraw(null);

            this.debug = on;
        },

        /**
         * Get all the entities in a given area
         * @param {pc.Rect} rect Area to query
         * @return {Array} Array of entities in the area
         */
        getEntitiesInArea:function (rect)
        {
            var aabb = new Box2D.Collision.b2AABB(), entities = [];
            aabb.lowerBound.Set(rect.x, rect.y);
            aabb.upperBound.Set(rect.w, rect.h);

            // Query the world
            this.world.QueryAABB(function (fixture)
            {
                //if (fixture.GetBody().GetType() != Box2D.Dynamics.b2Body.b2_staticBody)
                entities.push(fixture.GetBody().GetUserData());
                return true;
            }, aabb);

            return entities;
        },

        /**
         * Quick way to create a static shape and add it directly to the physics world (without requiring an entity).
         * Great for collision shapes like world boundaries
         * @param {Number} x x-position of the collidable shape
         * @param {Number} y y-position of the collidable shape
         * @param {Number} w width of the collidable shape
         * @param {Number} h height of the collidable
         * @param {Number} collisionGroup Collision group index
         * @param {Number} collisionCategory Collision category
         * @param {Number} collisionMask Collision mask
         */
        createStaticBody:function (x, y, w, h, collisionGroup, collisionCategory, collisionMask)
        {
            var hw = this.Class.toP(w / 2);
            var hh = this.Class.toP(h / 2);

            // setup physics body
            var fixDef = new Box2D.Dynamics.b2FixtureDef();
            var bodyDef = new Box2D.Dynamics.b2BodyDef();

            bodyDef.type = Box2D.Dynamics.b2BodyDef.b2_staticBody;
            fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;

            var points = [];
            points.push(Box2D.Common.Math.b2Vec2.Get(-hw, -hh));   // top left
            points.push(Box2D.Common.Math.b2Vec2.Get(hw, -hh));    // top right
            points.push(Box2D.Common.Math.b2Vec2.Get(hw, hh));    // bottom right
            points.push(Box2D.Common.Math.b2Vec2.Get(-hw, hh));   // bottom left
            fixDef.shape.SetAsArray(points, points.length);

            // set the collision filters
            fixDef.filter.groupIndex = collisionGroup;
            fixDef.filter.categoryBits = collisionCategory;
            fixDef.filter.maskBits = collisionMask;

            bodyDef.position.x = this.Class.toP(x) + hw;
            bodyDef.position.y = this.Class.toP(y) + hh;

            var body = this.world.CreateBody(bodyDef);
            body._pc_bodyType = pc.BodyType.TILE;
            body.CreateFixture(fixDef);
        },

        /**
         * Add a collision tile map (by creating collidable shapes in the physics world matching the tile map)
         * @param {pc.TileMap} tileMap Tile map for all the tiles
         * @param {Number} collisionGroup Collision group index
         * @param {Number} collisionCategory Collision category
         * @param {Number} collisionMask Collision mask
         */
        addTileCollisionMap:function (tileMap, collisionGroup, collisionCategory, collisionMask)
        {
            // Generate a set of rectangles (polys) for the tiles. To make things more efficient
            // we pack tiles horizontally across to reduce the total number of physics fixtures being
            // added.

            for (var ty = 0; ty < tileMap.tilesHigh; ty++)
            {
                // new row, start again
                var x = 0;
                var w = 0;

                for (var tx = 0; tx < tileMap.tilesWide; tx++)
                {
                    if (tileMap.tiles[ty][tx] >= 0)
                    {
                        w += tileMap.tileWidth;

                    } else
                    {
                        // we found a gap, so create the physics body for his horizontal tile set
                        if (w > 0)
                        {
                            this.createStaticBody(x, ty * tileMap.tileHeight, w,
                                tileMap.tileHeight, collisionGroup, collisionCategory, collisionMask);
                            w = 0;
                        }

                        // set the starting x position for the next rectangle
                        x = ((tx + 1) * tileMap.tileWidth);
                    }
                }
            }
        },

        /** Not implemented fully yet
         getEntityAtPoint:function (p)
         {
         var aabb = new Box2D.Collision.b2AABB();
         var entity = null;

         var wx = p.x / this.Class.SCALE;
         var wy = p.y / this.Class.SCALE;

         aabb.lowerBound.Set(wx, wy);
         aabb.upperBound.Set(wx, wy);

         // Query the world
         this.world.QueryAABB(
         function (fixture)
         {
         if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), b2P))
         {
         body = fixture.GetBody();
         return false;
         }
         return true;
         }, aabb);

         return body;
         },
         */


        /**
         * Called when an entity first collides with a tile or another entity. Use the fixture types to differentiate
         * collisions with different fixtures.
         * @param {pc.BodyType} aType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.BodyType} bType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.Entity} entityA If an entity, a reference to the entity that was the first part of the collision
         * @param {pc.Entity} entityB If an entity, a reference to the entity that was the second part of the collision
         * @param {Number} fixtureAType User type provided when fixture was created of the first fixture
         * @param {Number} fixtureBType User type provided when fixture was created of the second fixture
         * @param {b2Contact} contact Additional contact information
         */
        onCollisionStart:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
        },

        /**
         * Continuously called when in a collision state -- note that sensors will not be reported as constantly
         * colliding, they will only be reported as collision start and end events.
         * @param {pc.BodyType} aType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.BodyType} bType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.Entity} entityA If an entity, a reference to the entity that was the first part of the collision
         * @param {pc.Entity} entityB If an entity, a reference to the entity that was the second part of the collision
         * @param {Number} force The impact force of the collision
         * @param {Number} fixtureAType User type provided when fixture was created of the first fixture
         * @param {Number} fixtureBType User type provided when fixture was created of the second fixture
         * @param {b2Contact} contact Additional contact information
         */
        onCollision:function (aType, bType, entityA, entityB, force, fixtureAType, fixtureBType, contact)
        {
        },

        /**
         * Called when an entity has finished colliding with a tile or another entity
         * @param {pc.BodyType} aType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.BodyType} bType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.Entity} entityA If an entity, a reference to the entity that was the first part of the collision
         * @param {pc.Entity} entityB If an entity, a reference to the entity that was the second part of the collision
         * @param {Number} fixtureAType User type provided when fixture was created of the first fixture
         * @param {Number} fixtureBType User type provided when fixture was created of the second fixture
         * @param {b2Contact} contact Additional contact information
         */
        onCollisionEnd:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
        },

        onEntityAdded:function (entity)
        {
        },

        onEntityRemoved:function (entity)
        {
            var ph = entity.getComponent('physics');
            if (ph._body)
            {
                this.world.DestroyBody(ph._body);
                var at = entity.getComponent('attachment');
                if (at)
                {
                    this.world.DestroyJoint(at._joint);
                }
            }
        }

    });


