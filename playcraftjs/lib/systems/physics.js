pc.CollisionShape = {
    RECT:0, // rectangular collision area
    CIRCLE:1, // circular
    POLY:2     // a polygon
};


pc.systems.Physics = pc.EntitySystem.extend('pc.systems.Physics',
    {
        SCALE:0.1
    },
    {
        world:null,
        gravity:null,

        init:function (options)
        {
            this._super([ 'physics' ]);

            if (options.gravity)
                this.gravity = pc.Point.create(pc.checked(options.gravity.x, 0), pc.checked(options.gravity.y, 0));
            else
                this.gravity = pc.Point.create(0, 0);

            var gravity = new Box2D.Common.Math.b2Vec2(this.gravity.x * this.Class.SCALE, this.gravity.y * this.Class.SCALE);
            this.world = new Box2D.Dynamics.b2World(gravity, true);

            // todo: create physics from tilemap for collisions
            // based on config options containing tilemaps (like BasicPhysics does)

            if (options.debug == true)
            {
                // enable debug drawing
                var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
                var debugDraw = new b2DebugDraw();
                debugDraw.SetSprite(pc.device.ctx);
                debugDraw.SetDrawScale(this.Class.SCALE * 100);
                debugDraw.SetFillAlpha(0.3);
                debugDraw.SetLineThickness(1.0);
                debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
                this.world.SetDebugDraw(debugDraw);
            }

            // setup the contact listeners
            var listener = new Box2D.Dynamics.b2ContactListener;
            listener.BeginContact = this._beginContactListener.bind(this);
            listener.EndContact = this._endContactListener.bind(this);
            listener.PostSolve = this._postSolveListener.bind(this);
            this.world.SetContactListener(listener);
        },

        _beginContactListener:function (contact)
        {
            this.onEntityCollisionStart(contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData());
        },

        _endContactListener:function (contact)
        {
            this.onEntityCollisionEnd(contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData());
        },

        _postSolveListener:function (contact, impulse)
        {
            var i = impulse.normalImpulses[0];
            this.onEntityCollision(contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData(), i);
        },

        process:function (entity)
        {
            var sp = entity.getComponent('spatial');
            var ph = entity.getComponent('physics');
            var at = entity.getComponent('attachment');

            if (!ph._body)
            {
                var collisionWidth = (sp.dim.x - ph.margin) * this.Class.SCALE;
                if (collisionWidth < 0) collisionWidth = 0;
                var collisionHeight = (sp.dim.y - ph.margin) * this.Class.SCALE;
                if (collisionHeight < 0) collisionHeight = 0;

                var hw = collisionWidth / 2;
                var hh = collisionHeight / 2;
                pc.assert(hw > 0 && hh > 0, "Physics requires a spatial size minimum of 1 (including the margin reduction)");

                // setup physics body
                var fixDef = new Box2D.Dynamics.b2FixtureDef();
                fixDef.density = ph.density;
                fixDef.friction = ph.friction;
                fixDef.restitution = ph.bounce;

                var bodyDef = new Box2D.Dynamics.b2BodyDef();
                if (ph.immovable)
                    bodyDef.type = Box2D.Dynamics.b2BodyDef.b2_staticBody;
                else
                    bodyDef.type = Box2D.Dynamics.b2BodyDef.b2_dynamicBody;

                switch (ph.shape)
                {
                    case pc.CollisionShape.CIRCLE:
                        fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(hw);
                        break;

                    case pc.CollisionShape.POLY:
                        throw "Polygon shapes not supported yet";
                        //fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
                        // array of vertices
                        break;

                    default: // pc.CollisionShape.RECT:
                        fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;

                        // need to set based on polygon rectangle --
                        var points = [];

                        points.push(new Box2D.Common.Math.b2Vec2(-hw, -hh));   // top left
                        points.push(new Box2D.Common.Math.b2Vec2(hw, -hh));    // top right
                        points.push(new Box2D.Common.Math.b2Vec2(hw, hh));    // bottom right
                        points.push(new Box2D.Common.Math.b2Vec2(-hw, hh));   // bottom left

                        fixDef.shape.SetAsArray(points, points.length);
                        break;
                }

                // set the collision filters
                fixDef.filter.groupIndex = ph.collisionGroup;
                fixDef.filter.categoryBits = ph.collisionCategory;
                fixDef.filter.maskBits = ph.collisionMask;
                fixDef.isSensor = ph.sensorOnly;

                bodyDef.position.x = (sp.pos.x * this.Class.SCALE) + hw;
                bodyDef.position.y = (sp.pos.y * this.Class.SCALE) + hh;
                bodyDef.angle = pc.Math.degToRad(sp.dir);
                bodyDef.linearDamping = ph.linearDamping;
                bodyDef.angularDamping = ph.angularDamping;
                bodyDef.isBullet = ph.bullet;
                bodyDef.fixedRotation = ph.allowRotate;

                ph._body = this.world.CreateBody(bodyDef);
                ph._fixture = ph._body.CreateFixture(fixDef);
                ph._body.SetUserData(entity);

                if (ph.centerOfMass.x != 0 || ph.centerOfMass.y != 0 || ph.mass != -1)
                {
                    var md = new Box2D.Collision.Shapes.b2MassData();
                    md.center = new Box2D.Common.Math.b2Vec2(ph.centerOfMass.x * pc.systems.Physics.SCALE, ph.centerOfMass.y * pc.systems.Physics.SCALE);
                    if (ph.mass != -1) md.mass = ph.mass;
                    ph._body.SetMassData(md);
                } else
                {
                    md = new Box2D.Collision.Shapes.b2MassData();
                    md.mass = 1;
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
                            case pc.AttachmentType.WELD:
                                jointDef = new Box2D.Dynamics.Joints.b2WeldJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.collideConnected = false;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);
                                // todo: attachedTo anchor offsets (not just attached)

                                // set this bodies position to the right place
                                var atPos = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos.x + (at.offset.x * this.Class.SCALE),
                                        y:atPos.y + (at.offset.y * this.Class.SCALE)
                                    });
                                break;

                            case pc.AttachmentType.DISTANCE:
                                jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.collideConnected = false;
                                jointDef.length = at.distance;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);
                                // todo: attachedTo anchor offsets (not just attached)

                                // set this bodies position to the right place
                                atPos = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos.x + (at.offset.x * this.Class.SCALE),
                                        y:atPos.y + (at.offset.y * this.Class.SCALE)
                                    });
                                break;

                            case pc.AttachmentType.REVOLUTE:
                                jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.collideConnected = false;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);

                                // set this bodies position to the right place
                                var atPos2 = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos2.x + (at.offset.x * this.Class.SCALE),
                                        y:atPos2.y + (at.offset.y * this.Class.SCALE)
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
            sp.pos.x = (p.x / this.Class.SCALE) - (sp.dim.x / 2);
            sp.pos.y = (p.y / this.Class.SCALE) - (sp.dim.y / 2);
            sp.dir = pc.Math.radToDeg(ph._body.GetAngle());

            // if there is a max velocity set enforce it
            if (ph.maxSpeed > 0)
            {
                var currentSpeed = ph._body.GetLinearVelocity().Length() / pc.systems.Physics.SCALE;
                if (currentSpeed > ph.maxSpeed / this.Class.SCALE)
                {
                    // slow it down
                    var s = ph._body.GetLinearVelocity();
                    s.Multiply(0.8);
                    ph._body.SetLinearVelocity(s);
                }
            }

        },


        processAll:function ()
        {
            this.world.Step(pc.device.elapsed / 200, 7, 7);
            this.world.DrawDebugData();
            this.world.ClearForces();

            this._super();
        },

        onAddedToLayer: function(layer)
        {
            var worldBoundingBox = new Box2D.Collision.b2AABB();
            worldBoundingBox.lowerBound.Set(0, 0);
            worldBoundingBox.upperBound.Set(layer.worldSize.x * this.Class.SCALE, layer.worldSize.y * this.Class.SCALE);

        },

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


        onEntityCollisionStart:function (entityA, entityB)
        {
        },
        onEntityCollision:function (entityA, entityB, force)
        {
        },
        onEntityCollisionEnd:function (entityA, entityB)
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
        },

        onComponentAdded:function (entity, component)
        {
        },
        onComponentRemoved:function (entity, component)
        {
        }

    });


