/**
 * MouseHover component
 * Extends the standard system component, and automatically binds a 'hover' state to mouse movement
 */
MouseHover = pc.components.Input.extend('MouseHover',
    {
        create:function ()
        {
            return this._super({
                states:[
                    [ 'hover', ['MOUSE_MOVE'] ]
                ]});
        }
    },
    {
    });