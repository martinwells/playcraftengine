

pc.Color = pc.Pooled.extend('pc.Color',
    {
        /**
         * Constructs a color object using the passed in color
         * @param color Can either be a string in the form of #RRGGBB or an array of
         * 3 numbers representing red, green, blue levels, i.e. full red is
         * [255, 0, 0]
         */
        create: function(color)
        {
            var n = this._super();
            n.config(color);
            return n;
        }
    },
    {
        rgb: [],
        color: null,    // color as an rgb string (updates automatically when you change the color)

        init: function(color)
        {
            if (color != undefined)
                this.config(color);
        },

        config: function(color)
        {
            if (Array.isArray(color))
                this.rgb = color;
            else
            {
                if (color.charAt(0) === '#')
                {
                    this.rgb[0] = parseInt(color.substring(1,3), 16);
                    this.rgb[1] = parseInt(color.substring(3,5), 16);
                    this.rgb[2] = parseInt(color.substring(5,7), 16);
                } else
                    throw "Invalid color: use either array [r,g,b] or '#RRGGBB'";
            }
            this._updateColorCache();
        },

        set: function(c)        { this.config(c); },

        setRed: function(r)     { this.rgb[0] = pc.Math.limit(r, 0, 255); this._updateColorCache(); },
        addRed: function(r)     { this.rgb[0] = pc.Math.limitAdd(this.rgb[0], r, 0, 255); this._updateColorCache(); },
        subRed: function(r)     { this.rgb[0] = pc.Math.limitAdd(this.rgb[0], -r, 0, 255); this._updateColorCache(); },
        setGreen: function(g)   { this.rgb[1] = pc.Math.limit(g, 0, 255); this._updateColorCache(); },
        addGreen: function(g)   { this.rgb[1] = pc.Math.limitAdd(this.rgb[0], g, 0, 255); this._updateColorCache(); },
        subGreen: function(g)   { this.rgb[1] = pc.Math.limitAdd(this.rgb[0], -g, 0, 255); this._updateColorCache(); },
        setBlue: function(b)    { this.rgb[2] = pc.Math.limit(b, 0, 255); this._updateColorCache(); },
        addBlue: function(b)    { this.rgb[2] = pc.Math.limitAdd(this.rgb[0], b, 0, 255); this._updateColorCache(); },
        subBlue: function(b)    { this.rgb[2] = pc.Math.limitAdd(this.rgb[0], -b, 0, 255); this._updateColorCache(); },

        darken:function (amt)
        {
            this.subRed(amt);
            this.subGreen(amt);
            this.subBlue(amt);
        },

        lighten: function(amt)
        {
            this.addRed(amt);
            this.addGreen(amt);
            this.addBlue(amt);
        },

        _updateColorCache: function()
        {
            // todo: this is constructing a string on every adjustment: can we save on that?
            this.color = 'rgb(' + this.rgb[0] + ',' + this.rgb[1] + ',' + this.rgb[2] + ')';
        }


    });