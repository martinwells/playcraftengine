
pc.AttachmentType = {

    WELD: 0,
    REVOLUTE: 1,
    DISTANCE: 2
};

pc.components.Attachment = pc.components.Component.extend('pc.components.Attachment',
    {
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        attachTo: null,
        offset: null,
        distance: 0,
        type: 0,

        _joint: null,

        init: function(options)
        {
            this._super(this.Class.shortName);
            this.offset = pc.Point.create(0,0);
            if (pc.valid(options))
                this.config(options);
        },

        config: function(options)
        {
            this.attachTo = pc.checked(options.attachedTo, null);
            if (options.offset)
                this.offset.setXY(pc.checked(options.offset.x, 0), pc.checked(options.offset.y, 0));

            this.distance = pc.checked(options.distance, 1);
            this.type = pc.checked(options.type, pc.AttachmentType.WELD);
            this._joint = null;
        }


    });
