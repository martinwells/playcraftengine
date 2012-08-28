pc.systems.Input = pc.systems.EntitySystem.extend('pc.systems.Input',
    {},
    {
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
                for (var i=0; i < input.states.length; i++)
                {
                    var keys = input.states[i][1];
                    for (var k = 0; k < keys.length; k++)
                        pc.device.input.bindState(entity, input.states[i][0], keys[k]);
                }
                input._bound = true;
            }
        },

        /**
         * override to capture actions
         * @param entity
         * @param action
         */
        onAction: function(entity, action)
        {
        },

        isInputState: function(entity, state)
        {
            if (entity.getComponent('input')._bound)
                return pc.device.input.isInputState(entity, state);
        }


    });
