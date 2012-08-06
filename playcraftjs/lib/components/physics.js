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
        maxSpeed:0,
        bounce:0.5,
        faceVel:false,
        density:0,
        mass: -1,
        friction:0,
        linearDamping: 0,   // rate at which an object will slow down movement
        angularDamping: 0,  // rate at which ab object will slow down its rate of spin
        allowRotate: false, // whether when colliding, the object can react by rotating
        bullet: false,      // tell the physics engine to expect this object to move fast (slows things down
                            // so only enable if collisions are not being handled well (enables CCD between dynamic
                            // entities)

        /**
         * Shape of the collision (either RECT, CIRCLE or POLY). Rect and Circle use the dimensions
         * of the associated spatial object. Poly uses an array of points.
         */
        shape: 0,

        /**
         * The collision margin to use (collisions are smaller on all sides by this amount)
         */
        margin:0,

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
        immovable: false,

        /**
         * Collisions will be reported, but actual collision will occur in physics, i.e. a poison cloud
         * which damages the player, but they don't collide with it physically
         * @default false
         */
        sensorOnly: false,

        centerOfMass: null,

        _body:null,             // set by the physics system, if this is attached to a physics body
        force: 0,               // force to apply
        turn: 0,                // turn to apply (through angular velocity)
        torque:0,               // torque to apply

        init:function (options)
        {
            this._super(this.Class.shortName);
            this.centerOfMass = pc.Point.create(0, 0);
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            this._body = null;
            this._fixture = null;

            this.velX = 0;
            this.velY = 0;
            this.maxVelX = 5;
            this.maxVelY = 5;

            if (options.velocity)
            {
                this.velX = pc.checked(options.velocity.x, 0);
                this.velY = pc.checked(options.velocity.y, 0);
            }

            this.maxSpeed = pc.checked(options.maxSpeed, 0);
            this.mass = pc.checked(options.mass, -1);

            this.allowRotate = pc.checked(options.allowRotate, false);
            this.thrust = pc.checked(options.thrust, 0);
            this.bounce = pc.checked(options.bounce, 0.5);
            this.faceVel = pc.checked(options.faceVel, 0);
            this.shape = pc.checked(options.shape, pc.CollisionShape.RECT);

            this.margin = pc.checked(options.margin, 0);
            this.collisionGroup = pc.checked(options.collisionGroup, 0);
            this.collisionCategory = pc.checked(options.collisionCategory, 0);
            this.collisionMask = pc.checked(options.collisionMask, 0);
            this.sensorOnly = pc.checked(options.sensorOnly, false);
            this.immovable = pc.checked(options.immovable, false);

            this.density = pc.checked(options.density, 1.0);
            this.friction = pc.checked(options.friction, 0.5);
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

        setPos: function(x, y)
        {
            if (this._body)
                this._body.SetPosition({x:x * pc.systems.Physics.SCALE, y:y * pc.systems.Physics.SCALE});
        },

        applyTurn: function(d)
        {
            if (this._body)
            {
                this._body.SetAngularVelocity(pc.Math.degToRad(d));
                this._body.SetAwake(true);
            } else
                this._pendingDir = d;

        },

        setDir: function(d)
        {
            if (this._body)
            {
                this._body.SetAngle(pc.Math.degToRad(d));
                this._body.SetAwake(true);
            } else
                this.dir = d;
        },

        applyForce: function(f)
        {
            if (this._body)
            {
                if (this.getSpeed() > this.maxSpeed) return;

                this._body.ApplyForce(
                    new Box2D.Common.Math.b2Vec2(
                        Math.cos(this._body.GetAngle()) * f,
                        Math.sin(this._body.GetAngle()) * f),
                    this._body.GetWorldCenter());
            } else
                this.force = f;
        },

        applyImpulse: function(f)
        {
            if (this._body)
            {
                if (this.getSpeed() > this.maxSpeed) return;

                this._body.ApplyImpulse(
                    new Box2D.Common.Math.b2Vec2(
                        Math.cos(this._body.GetAngle()) * f,
                        Math.sin(this._body.GetAngle()) * f),
                    this._body.GetWorldCenter());
            } else
                this.impulse = f;
        },

        applyTorque: function(a)
        {
            if (this._body)
            {
                this._body.ApplyTorque(pc.Math.degToRad(a));
            } else
                this.torque = a;
        },

        setCenterOfMass: function(x, y)
        {
            if (this._body)
            {
                var md = new Box2D.Collision.Shapes.b2MassData();
                md.center = new Box2D.Common.Math.b2Vec2(x * pc.systems.Physics.SCALE, y * pc.systems.Physics.SCALE);
                this._body.SetMassData(md);
            } else
            {
                this.centerOfMass.x = x;
                this.centerOfMass.y = y;
            }
        },

        getSpeed: function()
        {
            if (this._body)
                return this._body.GetLinearVelocity().Length() / pc.systems.Physics.SCALE;
        },

        setLinearVelocity: function(x, y)
        {
            this._body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(x * pc.systems.Physics.SCALE, y * pc.systems.Physics.SCALE));
        },

        setAngularVelocity:function (a)
        {
            this._body.SetAngularVelocity(a);
        },

        setCollisionCategory: function(c)
        {
            this.collisionCategory = c;
            this._fixture.GetFilterData().categoryBits = c;
        },

        setCollisionGroup: function(g)
        {
            this.collisionGroup = g;
            this._fixture.GetFilterData().groupIndex = g;
        },

        setCollisionMask: function(m)
        {
            this.collisionMask = m;
            this._fixture.GetFilterData().maskBits = m;
        },

        setIsSensor: function(s)
        {
            this.sensorOnly = s;
            this._fixture.isSensor = s;

        }

    });

