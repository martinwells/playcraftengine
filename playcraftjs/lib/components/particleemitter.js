/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.ParticleEmitter
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Particles'>pc.systems.Particles</a>]
 * <p>
 * A particle generator.
 */
pc.components.ParticleEmitter = pc.components.Component.extend('pc.components.ParticleEmitter',
    /** @lends pc.components.ParticleEmitter */
    {
        /**
         * Constructs (or acquires from the pool) a particle emitter component
         * @param {Object} options See member list for available options
         * @return {pc.components.ParticleEmitter} A newly configured emitter component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.ParticleEmitter.prototype */
    {
        /** set to false to pause the emitter (and all emissions) */
        active: true,
        /** set to false to stop new emissions, but still update existing ones */
        emitting: true,
        /** minimum amount to grow particles at (negative values shrink) x-axis */
        growXMin:0,
        /** maximum amount to grow particles at x-axis (defaults to growXMin) */
        growXMax:0,
        /** minimum amount to grow particles at (negative values shrink) y-axis */
        growYMin:0,
        /** maximum amount to grow particles at y-axis (defaults to growYMin) */
        growYMax:0,
        /** scaling of the image on x-axis (minimum) */
        scaleXMin: 0,
        /** scaling maximum. if different to min a random scale is chosen */
        scaleXMax: 0,
        /** scaling of the image on y-axis (minimum) */
        scaleYMin: 0,
        /** scaling maximum. if different to min a random scale is chosen */
        scaleYMax: 0,
        /** time to spend fading in the particle */
        fadeInTime: 0,
        /** time spent fading out the particle */
        fadeOutTime: 0,
        /** minimum angle (direction) to fire a particle in */
        angleMin: 0,
        /** maximum angle (direction) to fire a particle in */
        angleMax: 0,
        /** minimum speed */
        thrustMin: 0,
        /** (optional) maximum speed (default is speed minimum */
        thrustMax: 0,
        /** how long to thrust for */
        thrustTime: 0,
        /** min amount of spin on the particle (in degrees per second) */
        spinMin: 0,
        /** max spin (random spin chosen between min and max) */
        spinMax: 0,
        /** distribution of particles over x range */
        rangeX: 1,
        /** distribution of particles over y */
        rangeY: 1,
        /** number to fire out on each emission */
        burst: 1,
        /** delay time between emissions in ms */
        delay: 25,
        /** spritesheet to use (a particle = a frame) */
        spriteSheet: null,
        /** minimum life span of particles */
        lifeMin: 0,
        /** max life span (random life span = max-min) */
        lifeMax: 0,
        /** whether sprite should rotate with angle changes */
        rotateSprite: false,
        /** x position offset (from the position of the entity) */
        offsetX: null,
        /** y position offset (from the position of the entity) */
        offsetY: null,
        /** composite operation on the image */
        compositeOperation: null,
        /** whether particle angles should be relative to the entity I'm attached to */
        relativeAngle: true,
        /** number of shots the emitter shold fire (self destructs after this). 0=repeat continuously */
        shots: 0,
        /** minimum range of alpha to randomly change opacity/alpha */
        alphaMin: 1,
        /** minimum range of alpha to randomly change opacity/alpha */
        alphaMax: 1,
        /** delay before changing alpha */
        alphaDelay: 0,

        _particles: null,
        _lastEmitTime: 0,
        _shotCount: 0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super('emitter');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Reset the emitter to start again
         */
        reset: function()
        {
            this._shotCount = 0;
            this._lastEmitTime = 0;
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this._lastEmitTime = 0;
            this._shotCount = 0;

            this.active = pc.checked(options.active, true);
            this.emitting = pc.checked(options.emitting, true);
            this.growXMin = pc.checked(options.growXMin, 0);
            this.growXMax = pc.checked(options.growXMax, this.growXMin);
            this.growYMin = pc.checked(options.growYMin, 0);
            this.growYMax = pc.checked(options.growYMax, this.growYMin);
            this.scaleXMin = pc.checked(options.scaleXMin, 1);
            this.scaleYMin = pc.checked(options.scaleYMin, 1);
            this.scaleXMax = pc.checked(options.scaleXMax, 1);
            this.scaleYMax = pc.checked(options.scaleYMax, 1);
            this.compositeOperation = pc.checked(options.compositeOperation, null);
            this.alphaMin = pc.checked(options.alphaMin, 1);
            this.alphaMax = pc.checked(options.alphaMax, this.alphaMin);
            this.alphaDelay = pc.checked(options.alphaDelay, 50);
            this.shots = pc.checked(options.shots, 0);
            this.relativeAngle = pc.checked(options.relativeAngle, true);

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