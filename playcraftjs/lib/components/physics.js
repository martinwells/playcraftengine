pc.components.Physics = pc.components.Component.extend('pc.components.Physics',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        maxSpeed:null,
        bounce:0.5,
        faceVel:false,
        density:0,
        mass:-1,
        friction:0,
        linearDamping:0, // rate at which an object will slow down movement
        angularDamping:0, // rate at which ab object will slow down its rate of spin
        fixedRotation:false, // allow the object to rotate
        bullet:false, // tell the physics engine to expect this object to move fast (slows things down
        // so only enable if collisions are not being handled well (enables CCD between dynamic
        // entities)

        /**
         * A designated collision index, anything in the same index won't collide
         * a negative value will cause collisions with other objects, but not others of the same index
         * a positive number will cause collisions between objects of this group as well
         * @default 0
         */
        collisionGroup:0,

        /**
         * Advanced collisions using a bit mask. Use this to set bits on/off.
         * @default 0
         */
        collisionCategory:0,

        /**
         * Collision mask to apply to the entities
         * @default 0
         */
        collisionMask:0,

        /**
         * Whether the object can move in space (true gives it infinite mass)
         */
        immovable:false,

        centerOfMass:null,

        /**
         * Shapes - an array of shapes that make up this physics body
         *
         * Each shape defintion can contain:
         *
         * sensorOnly - {boolean} Collisions will be reported, but actual collision will occur in physics, i.e. a
         * poison cloud which damages the player, but they don't collide with it physically. Default fault
         * shape - {pc.CollisionShape} Shape of the collisions (rectangle, polygon or circle)
         * offset - x, y, w, h offset of this shape to the physics body's position and dimension
         */
        shapes:null,

        _body:null, // set by the physics system, if this is attached to a physics body
        _fixtures:null, // array of fixtures attached to the body
        force:0, // force to apply
        turn:0, // turn to apply (through angular velocity)
        torque:0, // torque to apply

        init:function (options)
        {
            this._super(this.Class.shortName);
            this.centerOfMass = pc.Point.create(0, 0);
            this.margin = { x:0, y:0 };
            if (pc.valid(options))
                this.config(options);
            this._velReturn = pc.Dim.create(0, 0);
        },

        config:function (options)
        {
            this._body = null;
            if (this._fixtures)
                this._fixtures.length = 0;
            else
                this._fixtures = [];

            // no shape supplied, create a default one
            if (!pc.valid(options.shapes) && !Array.isArray(options.shapes))
            {
                options.shapes = [{}];
                options.shapes[0].shape = pc.CollisionShape.RECT;
            }

            for (var i = 0; i < options.shapes.length; i++)
            {
                var shape = options.shapes[i];

                // take the spatial, then offset
                if (!shape.offset)
                    shape.offset = {};

                shape.offset.x = pc.checked(shape.offset.x, 0);
                shape.offset.y = pc.checked(shape.offset.y, 0);
                shape.offset.w = pc.checked(shape.offset.w, 0);
                shape.offset.h = pc.checked(shape.offset.h, 0);

                shape.type = pc.checked(shape.type, 0);
                shape.shape = pc.checked(shape.shape, pc.CollisionShape.RECT);
                shape.sensorOnly = pc.checked(shape.sensorOnly, false);
            }

            this.shapes = options.shapes;

            if (!this.maxSpeed) this.maxSpeed = {};
            if (options.maxSpeed)
            {
                this.maxSpeed.x = pc.checked(options.maxSpeed.x, 0);
                this.maxSpeed.y = pc.checked(options.maxSpeed.y, 0);
            } else
            {
                this.maxSpeed.x = 0;
                this.maxSpeed.y = 0;
            }

            this.mass = pc.checked(options.mass, -1);

            this.fixedRotation = pc.checked(options.fixedRotation, false);
            this.thrust = pc.checked(options.thrust, 0);
            this.bounce = pc.checked(options.bounce, 0.5);
            this.faceVel = pc.checked(options.faceVel, 0);
            this.shape = pc.checked(options.shape, pc.CollisionShape.RECT);

            this.collisionGroup = pc.checked(options.collisionGroup, 0);
            this.collisionCategory = pc.checked(options.collisionCategory, 0);
            this.collisionMask = pc.checked(options.collisionMask, 0);
            this.immovable = pc.checked(options.immovable, false);

            this.density = pc.checked(options.density, 1);
            this.friction = pc.checked(options.friction, 0.2);
            this.linearDamping = pc.checked(options.linearDamping, 0);
            this.angularDamping = pc.checked(options.angularDamping, 0);
            this.bullet = pc.checked(options.bullet, false);
            this.torque = pc.checked(options.torque, 0);
            this.impulse = pc.checked(options.impulse, 0);
            this.turn = pc.checked(options.turn, 0);
            this.force = pc.checked(options.force, 0);

            if (pc.valid(options.centerOfMass))
            {
                this.centerOfMass.x = pc.checked(options.centerOfMass.x);
                this.centerOfMass.y = pc.checked(options.centerOfMass.y);
            }
        },

        setPos:function (x, y)
        {
            if (this._body)
                this._body.SetPosition({x:pc.systems.Physics.toP(x), y:pc.systems.Physics.toP(y)});
        },

        applyTurn:function (d)
        {
            if (this._body)
            {
                this._body.SetAngularVelocity(pc.Math.degToRad(d));
                this._body.SetAwake(true);
            } else
                this._pendingDir = d;
        },

        setDir:function (d)
        {
            if (this._body)
            {
                this._body.SetAngle(pc.Math.degToRad(d));
                this._body.SetAwake(true);
            } else
                this.dir = d;
        },

        getDir:function ()
        {
            if (this._body)
            {
                return pc.Math.radToDeg(this._body.GetAngle());
            }
            return 0;
        },

        applyForce:function (f, a)
        {
            if (this._body)
            {
                var angle = this._body.GetAngle();
                if (pc.valid(a))
                    angle = pc.Math.degToRad(a);

                this._body.ApplyForce(
                    Box2D.Common.Math.b2Vec2.Get(Math.cos(angle) * f, Math.sin(angle) * f),
                    this._body.GetWorldCenter());

            } else
                this.force = f;
        },

        applyImpulse:function (f, a)
        {
            if (this._body)
            {
                var angle = this._body.GetAngle();
                if (pc.valid(a))
                    angle = pc.Math.degToRad(a);

                this._body.ApplyImpulse(
                    Box2D.Common.Math.b2Vec2.Get(Math.cos(angle) * f, Math.sin(angle) * f),
                    this._body.GetWorldCenter());
            } else
                this.impulse = f;
        },

        applyTorque:function (a)
        {
            if (this._body)
            {
                this._body.ApplyTorque(pc.Math.degToRad(a));
            } else
                this.torque = a;
        },

        setCenterOfMass:function (x, y)
        {
            if (this._body)
            {
                var md = new Box2D.Collision.Shapes.b2MassData();
                md.center = Box2D.Common.Math.b2Vec2.Get(pc.systems.Physics.toP(x), pc.systems.Physics.toP(y));
                this._body.SetMassData(md);
            } else
            {
                this.centerOfMass.x = x;
                this.centerOfMass.y = y;
            }
        },

        getSpeed:function ()
        {
            if (this._body)
                return this._body.GetLinearVelocity().Length() / pc.systems.Physics.SCALE;
            return 0;
        },

        setLinearVelocity:function (x, y)
        {
            if (this._body)
                this._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(x * pc.systems.Physics.SCALE, y * pc.systems.Physics.SCALE));
        },

        _velReturn: null,

        getLinearVelocity:function ()
        {
            if (this._body)
            {
                var v = this._body.GetLinearVelocity();
                return this._velReturn.setXY(pc.systems.Physics.fromP(v.x), pc.systems.Physics.fromP(v.y));
            }
            return pc.Dim.create(0, 0);
        },

        getVelocityAngle:function ()
        {
            return pc.Math.angleFromVector(this._body.GetLinearVelocity().x, this._body.GetLinearVelocity().y);
        },

        setAngularVelocity:function (a)
        {
            if (this._body)
                this._body.SetAngularVelocity(a);
        },

        setCollisionCategory:function (c)
        {
            if (!this._fixtures.length) return;

            this.collisionCategory = c;
            for (var i = 0; i < this._fixtures.length; i++)
            {
                var f = this._fixtures[i].GetFilterData();
                f.collisionCategory = c;
                this._fixtures[i].SetFilterData(f);

                this._fixtures[i].GetFilterData().categoryBits = c;
            }
        },

        setCollisionGroup:function (g)
        {
            if (!this._fixtures.length) return;

            this.collisionGroup = g;
            for (var i = 0; i < this._fixtures.length; i++)
            {
                var f = this._fixtures[i].GetFilterData();
                f.groupIndex = g;
                this._fixtures[i].SetFilterData(f);
            }
        },

        setCollisionMask:function (m)
        {
            if (!this._fixtures.length) return;

            this.collisionMask = m;
            for (var i = 0; i < this._fixtures.length; i++)
            {
                var f = this._fixtures[i].GetFilterData();
                f.maskBits = m;
                this._fixtures[i].SetFilterData(f);
            }
        },

        setIsSensor:function (s, shapeIndex)
        {
            if (!this._fixtures.length) return;
            this._fixtures[shapeIndex].isSensor = s;
        }

    });

