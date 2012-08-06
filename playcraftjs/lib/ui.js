/**
 * Playcraft UI -- tools to help you manage UI elements in a scene
 *
 */

pc.graphics =
{
};

pc.LayoutManager = pc.Base('pc.LayoutManager',
    {},
    {}
);


pc.ui.BaseElement = pc.Element('pc.ui.BaseElement',
    {
        create: function (layer, strokeColor, fillColor, x, y, w, h)
        {
            // todo: add support for strings pass in # and rgba (strip them out)
            var n = this._super(layer, x, y, 0, w, h);
            n.strokeColor = strokeColor;
            n.fillColor = fillColor;
            // fix the alpha, since they are optional
            if (n.fillColor != null && n.fillColor.length == 3) n.fillColor[3] = 0;
            if (n.strokeColor != null && n.strokeColor.length == 3) n.strokeColor[3] = 0;
            n._updateColorCache();
            return n;
        }
    },
    {
        strokeColor: null,
        fillColor: null,
        alpha: 0, // alpha override of all alpha channels as an offset value (includes stroke and fill)

        // cache the color rgba strings so we don't have to create it every draw
        strokeColorCache: null,
        fillColorCache: null,

        draw: function (ctx, screenOffsetX, screenOffsetY)
        {
            this._super(ctx, screenOffsetX, screenOffsetY);
            if (this.strokeColor != null)
                ctx.strokeStyle = this.strokeColorCache;
            if (this.fillColor != null)
                ctx.fillStyle = this.fillColorCache;
        },

        setAlpha: function(a)
        {
            this.alpha = a;
            if (this.strokeColor != null)
                this.strokeColor[3] = a;
            if (this.fillColor != null)
                this.fillColor[3] = a;
            this._updateColorCache();
        },

        addAlpha: function(a)
        {
            this.alpha += a;
            if (this.strokeColor != null)
                this.strokeColor[3] += a;
            if (this.fillColor != null)
                this.fillColor[3] += a;
            this._updateColorCache();
        },

        getAlpha: function()
        {
            return this.alpha;
        },

        setFillColor: function(c)
        {
            this.fillColor = c;
            this._updateColorCache();
        },

        setStrokeColor: function(c)
        {
            this.strokeColor = c;
            this._updateColorCache();
        },

        //
        // INTERNALS
        //
        _updateColorCache: function()
        {
            // todo: this is constructing a string on every adjustment: can we save on that?
            if (this.strokeColor != null)
                this.strokeColorCache = 'rgba(' + this.strokeColor[0] + ',' + this.strokeColor[1] + ','
                    + this.strokeColor[2] + ',' + this.strokeColor[3] + ')';
            if (this.fillColor != null)
                this.fillColorCache = 'rgba(' + this.fillColor[0] + ',' + this.fillColor[1] + ','
                    + this.fillColor[2] + ',' + this.fillColor[3] + ')';
        }



    });

pc.ui.Text = pc.ui.BaseElement('pc.ui.Text',
    {
        create: function (layer, label, strokeColor, fillColor, font, x, y, w, h)
        {
            // todo: add support for strings pass in # and rgba (strip them out)
            var n = this._super(layer, strokeColor, fillColor, x, y, w, h);
            n.label = label;
            n.font =  font;
            return n;
        }
    },
    {
        label: null,
        font: null,

        // cache the color rgba strings so we don't have to create it every draw
        strokeColorCache: null,
        fillColorCache: null,

        draw: function (ctx, screenOffsetX, screenOffsetY)
        {
            ctx.save();
            this._super(ctx, screenOffsetX, screenOffsetY);
            ctx.font = this.font;
            ctx.lineWidth = 1;
            // canvas text is drawn with an origin at the bottom left, so we draw at y+h, not y
            if (this.fillColor != null)
                ctx.fillText(this.label, this.pos.x + screenOffsetX, this.pos.y + this.dim.y + screenOffsetY);
            if (this.strokeColor != null)
            ctx.strokeText(this.label, this.pos.x + screenOffsetX, this.pos.y + this.dim.y + screenOffsetY);
            ctx.restore();
        }
    });



