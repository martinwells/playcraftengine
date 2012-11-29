/**
 * A system that is passed any entity with the MouseHover component attached (in this case a component of type
 * 'input'. When hovering over the entity, we just move it to the right by 5 pixels.
 */
MouseHoverSystem = pc.systems.Input.extend('MouseHoverSystem',
    {
    },
    {
        process:function (entity)
        {
            this._super(entity);

            if (this.isInputState(entity, 'hover'))
                entity.getComponent("spatial").pos.x += 5;
        }

    });
