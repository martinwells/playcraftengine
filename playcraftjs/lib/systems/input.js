/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Input
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Input system. See the <a href='pc.components.Input'>input component</a> for more information.
 */
pc.systems.Input = pc.systems.EntitySystem.extend('pc.systems.Input',
    /** @lends pc.systems.Input */
    {},
    /** @lends pc.systems.Input.prototype */
    {
        /**
         * Constructs a new input system.
         */
        init:function ()
        {
            this._super(['input']);
        },

        process:function (entity)
        {
            var input = entity.getComponent('input');
            if (!input.active) return;

            if (!input._bound)
            {
                var uiSpatial = entity.getComponent('spatial');
                var eventTarget = entity;

                // if there is a target specified for the events, then we flip things around a little
                // we bind the input to the entity target, and make this entity (the one with the entity component
                // on it the uiTarget (bounding rectangle)
                if (input.target)
                    eventTarget = input.target;

                // bind all the inputs we want
                if (input.states)
                {
                    for (var i=0; i < input.states.length; i++)
                    {
                        var keys = input.states[i][1];
                        for (var k = 0; k < keys.length; k++)
                        {
                            var ts = uiSpatial;
                            if (pc.valid(input.states[i][2]) && input.states[i][2] == false)
                                ts = null;
                            pc.device.input.bindState(eventTarget, input.states[i][0], keys[k], ts);
                        }
                    }
                }

                if (input.actions)
                {
                    eventTarget = this;
                    for (i = 0; i < input.actions.length; i++)
                    {
                        keys = input.actions[i][1];
                        for (k = 0; k < keys.length; k++)
                        {
                            ts = uiSpatial;
                            if (pc.valid(input.actions[i][2]) && input.actions[i][2] == false)
                                ts = null;
                            pc.device.input.bindAction(eventTarget, input.actions[i][0], keys[k], ts);
                        }
                    }
                }

                input._bound = true;
            }
        },

        /**
         * Override to react to the actions
         * @param {String} actionName Name of the action
         * @param {Event} event Event object that caused the input
         * @param {pc.Point} pos Position the input occurred
         * @param {Object} uiTarget The target that received the input (spatial of an entity if bound)
         */
        onAction:function(actionName, event, pos, uiTarget)
        {
        },

        /**
         * Gets whether an input state is active
         * @param {pc.Entity} entity Entity testing the active state for
         * @param {String} state The state to test
         * @return {Boolean} true if the state is presently on
         */
        isInputState: function(entity, state)
        {
            if (entity.getComponent('input')._bound)
                return pc.device.input.isInputState(entity, state);
            return false;
        }


    });
