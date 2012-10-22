/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Effects
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * A effects system that drives effects like fade.
 */
pc.systems.Effects = pc.systems.EntitySystem.extend('pc.systems.Effects',
    /** @lends pc.systems.Effects */
    {
        FadeState:
        {
            NOT_STARTED: 0,
            DELAYING:1,
            FADING_IN:2,
            HOLDING:3,
            FADING_OUT:4,
            DONE: 5
        }
    },
    /** @lends pc.systems.Effects.prototype */
    {
        /**
         * Constructs a new systems with options.
         */
        init: function()
        {
            this._super( [ 'fade' ] );
        },

        /**
         * Processes all the entities with effect components
         */
        processAll: function()
        {
            var next = this.entities.first;
            while (next)
            {
                var entity = next.obj;
                if (entity.active)
                {
                    var fade = entity.getComponent('fade');
                    if (fade)
                    {
                        var alpha = entity.getComponent('alpha');
                        if (!alpha)
                            alpha = entity.addComponent(pc.components.Alpha.create({}));

                        if (fade.state != this.Class.FadeState.DONE)
                        {
                            if (!this._fade(alpha, fade))
                                entity.removeComponent(fade);
                        }
                    }
                }

//                var floatAway = entity.getComponent('float');
//                if (float)
//                {
//                      this component could just modify physics over time?
//                }

                next = next.next();
            }
        },

        _fade: function(alpha, fader)
        {
            var timeSinceStart = pc.device.now - fader.startTime;

            // do something about the current state, and change states if it's time.
            switch (fader.state)
            {
                case this.Class.FadeState.NOT_STARTED:
                    fader.startTime = pc.device.now;

                    if (fader.startDelay > 0)
                    {
                        fader.state = this.Class.FadeState.DELAYING;
                        fader.timeLimit = fader.startDelay;
                        alpha.setAlpha(0);

                    } else if (fader.fadeInTime > 0)
                    {
                        fader.state = this.Class.FadeState.FADING_IN;
                        fader.timeLimit = fader.fadeInTime;
                        // if we have a fade in element, then start alpha at 0
                        alpha.setAlpha(0);
                    }
                    else if (fader.holdTime > 0)
                    {
                        fader.state = this.Class.FadeState.HOLDING;
                        fader.timeLimit = fader.holdTime;
                    }
                    else if (fader.fadeOutTime > 0)
                    {
                        fader.state = this.Class.FadeState.FADING_OUT;
                        fader.timeLimit = fader.fadeOutTime;
                    }
                    break;

                case this.Class.FadeState.DELAYING:
                    // do nothing whilst holding
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.fadeInTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.FADING_IN;
                    }
                    break;
                case this.Class.FadeState.FADING_IN:
                    alpha.addAlpha((pc.device.elapsed * (100 / fader.timeLimit)) / 100);
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.holdTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.HOLDING;
                    }
                    break;
                case this.Class.FadeState.HOLDING:
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.fadeOutTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.FADING_OUT;
                    }
                    // do nothing whilst holding
                    break;
                case this.Class.FadeState.FADING_OUT:
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.loopsSoFar++;

                        if (fader.loops > 1 || fader.loops == 0) // restart?
                        {
                            fader.startTime = pc.device.now;
                            fader.timeLimit = fader.fadeInTime;
                            fader.state = this.Class.FadeState.FADING_IN;
                            if (fader.timeLimit > 0) alpha.setAlpha(0);
                        }

                        if (fader.loopsSoFar >= fader.loops)
                        {
                           // all done, kill thyself
                           fader.state = this.Class.FadeState.DONE;
                           if (fader.timeLimit > 0) alpha.setAlpha(0);
                           return false;
                        }
                    } else
                    {
                        alpha.subAlpha((pc.device.elapsed * (100 / fader.timeLimit)) / 100);
                    }

                    break;
            }
            return true;
        }


    });
















