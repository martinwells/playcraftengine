/**
 * Takes care of updating the health bar component on the UI for the player
 */
HealthBarSystem = pc.systems.EntitySystem.extend('HealthBarSystem',
    {},
    {
        healthBar:null, // health bar that appears on the UI

        init:function ()
        {
            this._super([ 'healthbar' ]);
        },

        process:function (entity)
        {
            // we only expect one entity to be processed (the on-screen health bar)
            var healthBar = entity.getComponent('healthbar');
            var health = healthBar.healthEntity.getComponent('health');
            var spatial = entity.getComponent('spatial');
            var alpha = entity.getComponent('alpha');

            var perc = health.hp / health.maxHP;
            var percWidth = Math.max(healthBar.width * perc, 0);

            // custom render the health bar
            var ctx = pc.device.ctx;
            ctx.globalAlpha = 0.5;
            if (alpha && alpha.level != 1)
                ctx.globalAlpha = alpha.level;
            if (ctx.globalAlpha > 0.5)
                ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#115511';
            ctx.fillRect(healthBar.offsetX + entity.layer.screenX(spatial.pos.x),
                healthBar.offsetY + entity.layer.screenY(spatial.pos.y),
                healthBar.width, healthBar.height);
            if (percWidth)
            {
                ctx.fillStyle = '#44ff44';
                ctx.fillRect(healthBar.offsetX + entity.layer.screenX(spatial.pos.x),
                    healthBar.offsetY + entity.layer.screenY(spatial.pos.y), percWidth, healthBar.height);
            }
            ctx.globalAlpha = 1;
        }

    });


