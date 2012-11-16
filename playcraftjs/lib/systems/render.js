/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Render
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Handles rendering of components: sprite, overlay, rect, text
 */
pc.systems.Render = pc.systems.EntitySystem.extend('pc.systems.Render',
    /** @lends pc.systems.Render */
    {},
    /** @lends pc.systems.Render.prototype */
    {
        /**
         * Constructs a new render system.
         */
        init: function()
        {
            this._super( [ 'sprite', 'overlay', 'rect', 'text', 'poly', 'circle' ] );
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
                    var clip = entity.getComponent('clip');

                    // accommodate scene viewport and layering offset positions
                    var drawX = entity.layer.screenX(spatial.pos.x);
                    var drawY = entity.layer.screenY(spatial.pos.y);
                    var unscaledPos = spatial.getUnscaledPos();

                    // is it onscreen?
                    if (entity.layer.scene.viewPort.overlaps(drawX, drawY, spatial.dim.x, spatial.dim.y,0, spatial.dir))
                    {
                        var ctx = pc.device.ctx;
                        ctx.save();

                        if (clip)
                        {
                            ctx.beginPath();
                            if (clip.clipEntity)
                            {
                                // entity plus clipping rectangle
                                var sp = clip.clipEntity.getComponent('spatial');
                                ctx.rect(
                                    entity.layer.screenX(sp.pos.x) + clip.x, entity.layer.screenY(sp.pos.y) + clip.y,
                                    sp.dim.x+clip.w, sp.dim.y+clip.h);
                            } else
                            {
                                // just plain rectangle clipping
                                ctx.rect(
                                    entity.layer.screenX(spatial.pos.x) + clip.x,
                                    entity.layer.screenY(spatial.pos.y) + clip.y, clip.w, clip.h);
                            }
                            ctx.closePath();
                            ctx.clip();
                        }

                        if (spatial.scaleX != 1 || spatial.scaleY != 1)
                        {
                            ctx.scale(spatial.scaleX, spatial.scaleY);
                            drawX = entity.layer.screenX(unscaledPos.x);
                            drawY = entity.layer.screenY(unscaledPos.y);
                        }

                        var shifter = entity.getComponent('originshifter');
                        if (shifter)
                        {
                            // if it has a shifter on it, adjust the position of the entity based on a ratio to
                            // the layer's origin

                            // reverse any changes we've made so far
                            var origX = spatial.pos.x - shifter._offsetX;
                            var origY = spatial.pos.y - shifter._offsetY;

                            shifter._offsetX = (this.layer.origin.x * shifter.ratio);
                            shifter._offsetY = (this.layer.origin.y * shifter.ratio);

                            spatial.pos.x = origX + shifter._offsetX;
                            spatial.pos.y = origY + shifter._offsetY;
                        }

                        var spriteComponent = entity.getComponent('sprite');
                        if (spriteComponent)
                        {
                            spriteComponent.sprite.update(pc.device.elapsed);
                            if (alpha && alpha.level != 1 && alpha.level != 0)
                                spriteComponent.sprite.alpha = alpha.level;
                            spriteComponent.sprite.draw(ctx, drawX+ spriteComponent.offset.x, drawY+ spriteComponent.offset.y, spatial.dir);
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
                            ctx.save();
                            if (alpha) ctx.globalAlpha = alpha.level;

                            ctx.translate((drawX+(spatial.dim.x/2)), (drawY+(spatial.dim.y/2)));
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

                                if (rect.color)
                                {
                                    ctx.fillStyle = rect.color.color;
                                    ctx.fill();
                                }
                                if (rect.lineColor && rect.lineWidth)
                                {
                                    ctx.lineWidth = rect.lineWidth;
                                    ctx.strokeStyle = rect.lineColor.color;
                                    ctx.stroke();
                                }
                            } else
                            {
                                if (rect.color)
                                {
                                    ctx.fillStyle = rect.color.color;
                                    ctx.fillRect(-spatial.dim.x/2, -spatial.dim.y/2, spatial.dim.x, spatial.dim.y);
                                }
                                if (rect.lineColor && rect.lineWidth)
                                {
                                    ctx.lineWidth = rect.lineWidth;
                                    ctx.strokeStyle = rect.lineColor.color;
                                    ctx.strokeRect(-spatial.dim.x/2, -spatial.dim.y/2, spatial.dim.x, spatial.dim.y);
                                }
                            }

                            if (alpha) ctx.globalAlpha = 1; // restore the alpha
                            ctx.restore();
                            pc.device.elementsDrawn++;
                        }


                        var circle = next.obj.getComponent('circle');
                        if (circle)
                        {
                            ctx.save();
                            ctx.lineWidth = circle.lineWidth;
                            if (alpha) ctx.globalAlpha = alpha.level;

                            ctx.translate((drawX + (spatial.dim.x / 2)), (drawY + (spatial.dim.y / 2)));
                            ctx.rotate(spatial.dir * (Math.PI / 180));

                            ctx.beginPath();
                            ctx.arc(0, 0, spatial.dim.x / 2, 0, pc.Math.PI * 2, true);
                            ctx.closePath();

                            if (circle.color)
                            {
                                ctx.fillStyle = circle.color.color;
                                ctx.fill();
                            }

                            if (circle.lineColor)
                            {
                                ctx.lineWidth = circle.lineWidth;
                                ctx.strokeStyle = circle.lineColor.color;
                                ctx.stroke();
                            }
                            if (alpha) ctx.globalAlpha = 1; // restore the alpha
                            ctx.restore();
                            pc.device.elementsDrawn++;
                        }

                        var poly = next.obj.getComponent('poly');
                        if (poly)
                        {
                            ctx.save();
                            if (alpha) ctx.globalAlpha = alpha.level;

                            var hw = spatial.dim.x/2;
                            var hh = spatial.dim.y/2;

                            // we center so rotation / dir works correctly
                            ctx.translate((drawX + hw), (drawY + hh));
                            ctx.rotate(spatial.dir * (Math.PI / 180));

                            ctx.beginPath();
                            ctx.moveTo(poly.points[0][0]-hw, poly.points[0][1]-hh);
                            for (var p=1; p < poly.points.length; p++)
                                ctx.lineTo(poly.points[p][0]-hw, poly.points[p][1]-hh);

                            ctx.closePath();
                            if (poly.color)
                            {
                                ctx.fillStyle = poly.color.color;
                                ctx.fill();
                            }

                            if (poly.lineColor)
                            {
                                ctx.lineWidth = poly.lineWidth;
                                ctx.strokeStyle = poly.lineColor.color;
                                ctx.stroke();
                            }

                            if (alpha) ctx.globalAlpha = 1; // restore the alpha
                            ctx.restore();
                            pc.device.elementsDrawn++;
                        }

                        var text = entity.getComponent('text');
                        if (text)
                        {
                            ctx.save();
                            var yAdd=0;
                            if (alpha) ctx.globalAlpha = alpha.level;
                            hw = spatial.dim.x / 2;
                            hh = spatial.dim.y / 2;
                            ctx.font = text._fontCache;
                            ctx.lineWidth = text.lineWidth;

                            ctx.translate((drawX + hw), (drawY + hh));
                            ctx.rotate(spatial.dir * (Math.PI / 180));

                            for (var i=0; i < text.text.length; i++)
                            {
                                // canvas text is drawn with an origin at the bottom left, so we draw at y+h, not y
                                if (text.color)
                                {
                                    ctx.fillStyle = text.color.color;
                                    ctx.fillText(text.text[i], text.offset.x-hw, yAdd + spatial.dim.y + text.offset.y-hh);
                                }
                                if (text.strokeColor && text.lineWidth)
                                {
                                    ctx.strokeStyle = text.strokeColor.color;
                                    ctx.strokeText(text.text[i], text.offset.x-hw, yAdd + spatial.dim.y + text.offset.y-hh);
                                }
                                yAdd += (text.fontHeight * 1.1);
                            }
                            if (alpha) ctx.globalAlpha = 1; // restore the alpha
                            pc.device.elementsDrawn++;
                            ctx.restore();
                        }

                        ctx.restore();
                    }
                }
                next = next.next();
            }

            pc.device.lastDrawMS += (Date.now() - startTime);
        }

    });
















