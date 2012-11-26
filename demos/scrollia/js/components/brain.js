/**
 * The base brain code for player/monsters. Basically a container for state and decisions to control the movement
 * of any complex creature in the game
 */
Brain = pc.components.Component('Brain',
    {
        State:{
            NONE:0,
            STANDING:1,
            WALKING:2,
            ATTACKING:4,
            DYING:5,
            RECOILING:6,
            JUMPING:7,
            BLOCKING:8,
            CLIMBING:9
        },

        create:function ()
        {
            var n = this._super();
            n.config();
            return n;
        },

        getStateName:function (state)
        {
            switch (state)
            {
                case this.State.NONE:
                    return 'none';
                case this.State.WALKING:
                    return 'walking';
                case this.State.STANDING:
                    return 'standing';
                case this.State.ATTACKING:
                    return 'attacking';
                case this.State.RECOILING:
                    return 'recoiling';
                case this.State.DYING:
                    return 'dying';
                case this.State.JUMPING:
                    return 'jumping';
                case this.State.BLOCKING:
                    return 'blocking';
                case this.State.CLIMBING:
                    return 'climbing';
            }
            throw "It's life jim, but not as we know it";
        }

    },
    {
        stateChangeDelay:0,
        stateStartTime:0,
        facingRight:false,
        tookHit:0, // took damage in the last cycle: value = level of damage, 0 = didn't take damage
        collidedWith:null,
        startingJump:false,
        wantsToWalk:false,
        state:0,
        onGround:0, // 0 = not on the ground, otherwise the number of contacts with the foot sensor
        attacked:false, // whether we've attacked this attacking cycle yet
        blocking:false,
        wantsToClimbUp:false,
        wantsToClimbDown:false,
        lastCastTime:0,

        init:function ()
        {
            this._super(this.Class.shortName);
            this.config();
        },

        config:function ()
        {
            this.stateChangeDelay = pc.Math.rand(5000, 8000);
            this.facingRight = pc.Math.rand(0, 1) ? true : false;
            this.state = this.Class.State.WALKING;
            this.collidedWith = null;
            this.tookHit = 0;
            this.onGround = 0;
            this.startingJump = false;
            this.wantsToWalk = false;
            this.attacked = false;
            this.blocking = false;
            this.lastCastTime = 0;
        },

        /**
         * Changes state from one to another
         * @param sprite Associated sprite (so the corresponding animation can be set)
         * @param newState The new state to switch to
         * @param force Force the state change (usually to reset an animation)
         * @return {Boolean} False if the state did not change (already in that state), otherwise true
         */
        changeState:function (sprite, newState, force)
        {
            if (this.state == newState && !force) return false;

            if (this.state == Brain.State.DYING)
                throw 'oops, no changing states after dying';

            // debugging states
            //console.log('state: ' + this.Class.getStateName(this.state) +  ' -> ' + this.Class.getStateName(newState));

            this.state = newState;
            if (this.state != Brain.State.NONE)
            {
                if (this.state == Brain.State.CLIMBING)
                {
                    // climbing has no left/right to it
                    sprite.sprite.setAnimation(Brain.getStateName(this.state), 0, false);
                }
                else
                {
                    sprite.sprite.setAnimation(Brain.getStateName(this.state) + ' ' +
                        (this.facingRight ? 'right' : 'left'), 0, false);
                }
            }

            return true;
        }

    });

