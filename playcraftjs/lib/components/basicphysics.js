

pc.components.BasicPhysics = pc.components.Component.extend('pc.components.BasicPhysics',
    {
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        velX: 0,
        velY: 0,
        thrust: 0,
        maxVelX: 0,
        maxVelY: 0,
        bounce: 0.5,
        faceVel: false,
        speed: 0,

        _currentSpeed: 0, // used to determine if we need to adjust speed

        /**
         * Acceleration is read-only -- it's set based on thrust and direction
         */
        accelX: 0,
        accelY: 0,

        init: function(options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config: function(options)
        {
            this.velX = 0;
            this.velY = 0;
            this.maxVelX = 5;
            this.maxVelY = 5;
            this._currentSpeed = 0;

            if (options.velocity)
            {
                this.velX = pc.checked(options.velocity.x, 0);
                this.velY = pc.checked(options.velocity.y, 0);
            }

            this.speed = pc.checked(options.speed, 0);
            if (options.maxVelocity)
            {
                this.maxVelX = pc.checked(options.maxVelocity.x, 5);
                this.maxVelY = pc.checked(options.maxVelocity.y, 5);
            }
            this.thrust = pc.checked(options.thrust, 0);
            this.bounce = pc.checked(options.bounce, 0);
            this.faceVel = pc.checked(options.faceVel, 0);
        },

        /**
         * Increases velocity as a factor of current speed
         * @example incVel(2) doubles current speed
         * @param speed
         */
        incVel: function (speed, dir)
        {
            // todo: replace with lookup tables
            this.velX += speed * Math.cos( pc.Math.degToRad(dir));
            this.velY += speed * Math.sin( pc.Math.degToRad(dir));
        },

        /**
         * Reduces the velocity as a factor of current speed
         * @example decVel(2) cuts speed in half
         * @param speed
         */
        decVel: function (speed, dir)
        {
            this.velX -= speed * Math.cos(pc.Math.degToRad(dir));
            this.velY -= speed * Math.sin(pc.Math.degToRad(dir));
        },

        /**
         * Sets the velocity of the entity (based on the current direction)
         * @param speed
         */
        setVel: function (speed, dir)
        {
            this.velX = speed * Math.cos(pc.Math.degToRad(dir));
            this.velY = speed * Math.sin(pc.Math.degToRad(dir));
        },

        /**
         * Sets the maximum velocity for this entity
         * @param x
         * @param y
         */
        setMaxVel: function(x, y)
        {
            this.maxVelX = x;
            this.maxVelY = y;
        },

        /**
         * @return Angle of the velocity.
         */
        angleOfVel: function()
        {
            return pc.Math.angleFromVector(this.velX, this.velY);
        }


    });

