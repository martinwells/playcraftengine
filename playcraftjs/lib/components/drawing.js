

pc.components.Rect = pc.components.Component.extend('pc.components.Rect',
    {
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        color: null,
        strokeColor: null,
        lineWidth: 0,

        cornerRadius: 0,

        init: function(options)
        {
            this._super(this.Class.shortName);
            this.color = pc.Color.create('#ffffff');
            this.strokeColor = pc.Color.create('#888888');
            if (pc.valid(options))
                this.config(options);
        },

        config: function(options)
        {
            if (!options.color)
                this.color.set('#ffffff');
            else
                this.color.set(pc.checked(options.color, '#ffffff'));

            if (!options.strokeColor)
                this.strokeColor.set('#ffffff');
            else
                this.strokeColor.set(pc.checked(options.strokeColor, '#888888'));

            this.lineWidth = pc.checked(options.lineWidth, 0);
            this.cornerRadius = pc.checked(options.cornerRadius, 0);
        },

        release: function()
        {
            this._super();
            this.color.release();
            if (this.strokeColor)
                this.strokeColor.release();
        }

    });

pc.components.Text = pc.components.Component.extend('pc.components.Text',
    {
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        color: null,
        strokeColor: null,
        font: null,
        fontHeight: 0,
        text: null,
        lineWidth: 0,
        offset: null,
        _fontCache: null,

        init: function(options)
        {
            this._super(this.Class.shortName);
            this.color = pc.Color.create('#ffffff');
            this.strokeColor = pc.Color.create('#888888');
            this.text = [];
            this.font = 'Calibri';
            this.fontHeight = 20;
            this.offset = pc.Dim.create(0,0);
            this._fontCache = '';
            if (pc.valid(options))
                this.config(options);
        },

        config: function(options)
        {
            this.color.set(pc.checked(options.color, '#ffffff'));
            this.strokeColor.set(pc.checked(options.strokeColor, '#888888'));
            this.lineWidth = pc.checked(options.lineWidth, 0);
            this.text = pc.checked(options.text, ['']);
            this.font = pc.checked(options.font, 'Arial');
            this.fontHeight = pc.checked(options.fontHeight, 20);
            if (pc.valid(options.offset))
            {
                this.offset.x = pc.checked(options.offset.x);
                this.offset.y = pc.checked(options.offset.y);
            }
            this._updateFont();
        },

        setHeight: function(height)
        {
            this.fontHeight = height;
            this._updateFont();
        },

        setFont: function(font)
        {
            this.font = font;
            this._updateFont();
        },

        _updateFont: function()
        {
            this._fontCache = '' + this.fontHeight + 'px ' + this.font;
        }


    });


