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

            if (!input._bound)
            {
                // bind all the inputs we want
                if (input.states)
                {
                    var spatial = entity.getComponent('spatial');
                    for (var i=0; i < input.states.length; i++)
                    {
                        var keys = input.states[i][1];
                        for (var k = 0; k < keys.length; k++)
                            pc.device.input.bindState(entity, input.states[i][0], keys[k], input.states[i][2] ? spatial : null);
                    }
                }

                if (input.actions)
                {
                    spatial = entity.getComponent('spatial');
                    for (i = 0; i < input.actions.length; i++)
                    {
                        keys = input.actions[i][1];
                        for (k = 0; k < keys.length; k++)
                            pc.device.input.bindAction(entity, input.actions[i][0], keys[k], input.actions[i][2] ? spatial:null);
                    }
                }

                input._bound = true;
            }
        },

        /**
         * Override to react to the actions
         * @param {pc.Entity} entity Entity that had the action occur on it
         * @param {String} action Name of the action
         */
        onAction: function(entity, action)
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
