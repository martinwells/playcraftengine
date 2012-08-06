

/**
 * Renders all entities that have drawable components
 */
pc.systems.Render = pc.EntitySystem.extend('pc.systems.Render',
    {},
    {
        init: function()
        {
            this._super( [ 'sprite', 'overlay', 'rect', 'text' ] );
        },

        processAll: function()
        {
            var startTime = Date.now();

            var next = this.entities.first;
            while (next)
            {
                var entity = next.obj;
                if (entity.active)
                {
                    var spatial = entity.getComponent('spatial');
                    var alpha = entity.getComponent('alpha');

                    // accommodate scene viewport and layering offset positions
                    var drawX = spatial.pos.x - entity.layer.origin.x - entity.layer.scene.viewPort.x;
                    var drawY = spatial.pos.y - entity.layer.origin.y - entity.layer.scene.viewPort.y;

                    // is it onscreen?
                    if (entity.layer.scene.viewPort.overlaps(drawX, drawY, spatial.dim.x, spatial.dim.y,0, spatial.dir))
                    {
                        var ctx = pc.device.ctx;

                        var sprite = entity.getComponent('sprite');
                        if (sprite)
                        {
                            sprite.sprite.update(pc.device.elapsed);
                            if (alpha)
                                sprite.sprite.alpha = alpha.level;
                            sprite.sprite.draw(ctx, drawX, drawY, spatial.dir);
                        }

                        var overlay = entity.getComponent('overlay');
                        if (overlay)
                        {
                            // update and draw the overlay sprite
                            overlay.sprite.update(pc.device.elapsed);
                            if (alpha)
                                overlay.sprite.alpha = alpha.level;
                            overlay.sprite.draw(ctx, drawX, drawY, spatial.dir);

                            overlay.decrease(pc.device.elapsed);
                            if (overlay.hasExpired())
                                entity.removeComponent(overlay);
                        }

                        var rect = next.obj.getComponent('rect');
                        if (rect)
                        {
                            ctx.lineWidth = rect.lineWidth;
                            ctx.fillStyle = rect.color.color;
                            if (alpha) ctx.globalAlpha = alpha.level;
                            if (rect.strokeColor && rect.lineWidth) ctx.strokeStyle = rect.strokeColor.color;

                            ctx.save();
                            ctx.translate(drawX+(spatial.dim.x/2), drawY+(spatial.dim.y/2));
                            ctx.rotate( spatial.dir * (Math.PI/180));

                            // rounded rectangle
                            if (rect.cornerRadius > 0)
                            {
                                ctx.beginPath();
                                ctx.moveTo(drawX + spatial.radius, drawY);
                                ctx.lineTo(drawX + spatial.dim.x - spatial.radius, drawY);
                                ctx.quadraticCurveTo(drawX + spatial.dim.x, drawY, drawX + spatial.dim.x, drawY + spatial.radius);
                                ctx.lineTo(drawX + spatial.dim.x, drawY + spatial.dim.y - spatial.radius);
                                ctx.quadraticCurveTo(drawX + spatial.dim.x, drawY + spatial.dim.y,
                                    drawX + spatial.dim.x - spatial.radius, drawY + spatial.dim.y);
                                ctx.lineTo(drawX + spatial.radius, drawY + spatial.dim.y);
                                ctx.quadraticCurveTo(drawX, drawY + spatial.dim.y, drawX, drawY + spatial.dim.y - spatial.radius);
                                ctx.lineTo(drawX, drawY + spatial.radius);
                                ctx.quadraticCurveTo(drawX, drawY, drawX + spatial.radius, drawY);
                                ctx.closePath();
                                ctx.fill();
                            } else
                            {
                                ctx.fillRect(-spatial.dim.x/2, -spatial.dim.y/2, spatial.dim.x, spatial.dim.y);
                                if (rect.strokeColor)
                                    ctx.strokeRect(-spatial.dim.x/2, -spatial.dim.y/2, spatial.dim.x, spatial.dim.y);
                            }

                            ctx.restore();

                            if (alpha) ctx.globalAlpha = 1; // restore the alpha
                            pc.device.elementsDrawn++;
                        }

                        var text = entity.getComponent('text');
                        if (text)
                        {
                            var yAdd=0;
                            if (alpha) ctx.globalAlpha = alpha.level;
                            ctx.font = text._fontCache;
                            ctx.lineWidth = text.lineWidth;

                            for (var i=0; i < text.text.length; i++)
                            {
                                // canvas text is drawn with an origin at the bottom left, so we draw at y+h, not y
                                if (text.color)
                                {
                                    ctx.fillStyle = text.color.color;
                                    ctx.fillText(text.text[i], drawX + text.offset.x, drawY + yAdd + spatial.dim.y + text.offset.y);
                                }
                                if (text.strokeColor && text.lineWidth)
                                {
                                    ctx.strokeStyle = text.strokeColor.color;
                                    ctx.strokeText(text.text[i], drawX + text.offset.x, drawY + yAdd + spatial.dim.y + text.offset.y);
                                }
                                yAdd += (text.fontHeight * 1.1);
                            }
                            if (alpha) ctx.globalAlpha = 1; // restore the alpha
                            pc.device.elementsDrawn++;
                        }

                        // draw debug info if required
                        var debuginfo = next.obj.getComponent('debuginfo');
                        if (debuginfo)
                        {
                            pc.device.ctx.strokeStyle='#5f5';
                            pc.device.ctx.strokeRect(drawX, drawY, spatial.dim.x, spatial.dim.y);
                        }
                    }
                }
                next = next.nextLinked;
            }

            pc.device.lastDrawMS += (Date.now() - startTime);
        }

    });
















