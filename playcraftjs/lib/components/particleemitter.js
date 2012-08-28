/**
 * A particle emitter component
 */

pc.components.ParticleEmitter = pc.components.Component.extend('pc.components.ParticleEmitter',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        active: true,
        emitting: true,         // true if the emitter should be creating new emissions
        scaleXMin: 0,           // minimum amount to grow particles at (negative values shrink) x-axis
        scaleXMax: 0,           // maximum amount to grow particles at (negative values shrink) x-axis
        scaleYMin: 0,           // minimum amount to grow particles at (negative values shrink) y-axis
        scaleYMax: 0,           // maximum amount to grow particles at (negative values shrink) y-axis
        fadeInTime: 0,          // time to spend fading in the particle
        fadeOutTime: 0,         // time spent fading out the particle
        angleMin: 0,            // minimum angle (direction) to fire a particle in
        angleMax: 0,            // maximum angle (direction) to fire a particle in
        thrustMin: 0,           // minimum speed
        thrustMax: 0,           // (optional) maximum speed (default is speed minimum
        thrustTime: 0,          // how long to thrust for
        spinMin: 0,
        spinMax: 0,
        rangeX: 1,              // distribution of particles over x
        rangeY: 1,              // distribution of particles over y
        burst: 1,               // number to fire out on each emission
        delay: 25,              // delay time between emissions in ms
        spriteSheet: null,      // spritesheet to use
        lifeMin: 0,
        lifeMax: 0,             // (optional) default is life minimum
        rotateSprite: false,    // whether sprite should rotate with angle changes
        offsetX: null,           // x and y position offset (from the position of the entity)
        offsetY: null,
        compositeOperation: null,
        shots: 0,               // number of shots fired by the emitter (self destructs after this). 0=repeat continuously
        alphaMin: 1,            // minimum range of alpha to randomly change opacity/alpha
        alphaMax: 1,
        alphaDelay: 0,

        _particles: null,
        _lastEmitTime: 0,
        _shotCount: 0,

        init:function (options)
        {
            this._super('emitter');
            if (pc.valid(options))
                this.config(options);
        },

        reset: function()
        {
            this._shotCount = 0;
            this._lastEmitTime = 0;
        },

        config:function (options)
        {
            this._lastEmitTime = 0;
            this._shotCount = 0;

            this.active = pc.checked(options.active, true);
            this.emitting = pc.checked(options.emitting, true);
            this.scaleXMin = pc.checked(options.scaleXMin, 0);
            this.scaleXMax = pc.checked(options.scaleXMax, this.scaleXMin);
            this.scaleYMin = pc.checked(options.scaleYMin, 0);
            this.scaleYMax = pc.checked(options.scaleYMax, this.scaleYMin);
            this.compositeOperation = pc.checked(options.compositeOperation, null);
            this.alphaMin = pc.checked(options.alphaMin, 1);
            this.alphaMax = pc.checked(options.alphaMax, this.alphaMin);
            this.alphaDelay = pc.checked(options.alphaDelay, 50);
            this.shots = pc.checked(options.shots, 0);

            this.rangeX = pc.checked(options.rangeX, 1);
            this.rangeY = pc.checked(options.rangeY, 1);
            this.fadeInTime = pc.checked(options.fadeInTime, 0);
            this.fadeOutTime = pc.checked(options.fadeOutTime, 0);
            this.angleMin = pc.checked(options.angleMin, 0);
            this.angleMax = pc.checked(options.angleMax, 359);
            this.thrustMin = pc.checked(options.thrustMin, 1);
            this.thrustMax = pc.checked(options.thrustMax, this.thrustMin);
            this.thrustTime = pc.checked(options.thrustTime, 100);
            this.burst = pc.checked(options.burst, 1);
            this.delay = pc.checked(options.delay, 25);
            this.lifeMin = pc.checked(options.lifeMin, 100);
            this.lifeMax = pc.checked(options.lifeMin, this.lifeMin);
            this.rotateSprite = pc.checked(options.rotateSprite, false);
            this.spinMin = pc.checked(options.spinMin, 0);
            this.spinMax = pc.checked(options.spinMax, this.spinMin);
            this.offsetX = pc.checked(options.offsetX, 0);
            this.offsetY = pc.checked(options.offsetY, 0);
            this.gravityX = pc.checked(options.gravityX, 0);
            this.gravityY = pc.checked(options.gravityY, 0);
            this.maxVelX = pc.checked(options.maxVelX, 50);
            this.maxVelY = pc.checked(options.maxVelY, 50);

            if (!pc.valid(options.spriteSheet))
                throw "A spritesheet is required for the emitter";
            else
                this.spriteSheet = options.spriteSheet;

            if (!Array.isArray(this._particles))
                this._particles = new pc.LinkedList();
            else
                this._particles.clear();
        },

        onBeforeRemoved: function()
        {
            // being removed from entity, so need to release any particles that
            // are left back into the pool
            var p = this._particles.first;
            while (p)
            {
                p.obj.release();
                p = p.next();
            }
        }

    });