

pc.Collision = pc.Pooled('pc.Collision',
    {
        TILE_TYPE: 0,
        ENTITY_TYPE: 1,

        create: function(xMove, yMove)
        {
            var n = this._super();
            n.xMove = xMove;
            n.yMove = yMove;
            n.current = true;
            n.type = -1;
            return n;
        }
    },
    {
        xMove: 0,
        yMove: 0,
        type: -1,

        // marking a collision as current is done by the collisions sweeper (the layer.update). Collisions not marked
        // as current on each update are how onCollisionEnd events are detected -- it was colliding, but after a sweep
        // it's no longer current so the collision is now over
        current: true,

        init: function()
        {
            this._super();
        },

        toString: function()
        {
            return ' xMove: ' + this.xMove + ' yMove: ' + this.yMove + ' current:' + this.current;
        }

    });


pc.EntityCollision = pc.Collision('pc.EntityCollision',
    {
        create: function(entity, xMove, yMove)
        {
            var n = this._super(xMove, yMove);
            n.entity = entity;
            n.type = pc.Collision.ENTITY_TYPE;
            return n;
        }
    },
    {
        entity: null,

        toString: function()
        {
            return this._super() + ' With: ' + this.entity.uniqueId;
        }

    });

/**
 * Represents a collision with a single tile
 * @type {pc.TileCollision}
 */
pc.TileCollision = pc.Collision('pc.TileCollision',
    {
        create: function(tileX, tileY, xAxis, yAxis, xMove, yMove)
        {
            var n = this._super();
            n.tileX = tileX;
            n.tileY = tileY;
            n.xAxis = xAxis;
            n.yAxis = yAxis;
            n.xMove = xMove;
            n.yMove = yMove;
            n.type = pc.Collision.TILE_TYPE;
            return n;
        }
    },
    {
        xAxis: false,
        yAxis: false,
        xMove: 0,
        yMove: 0,
        tileX: 0,
        tileY: 0,

        toString: function()
        {
            return this._super() + ' xAxis: ' + this.xAxis + ' yAxis: ' + this.yAxis +
                   ' xMove: ' + this.xMove + ' yMove: ' + this.yMove + ' tileX: ' + this.tileX + ' tileY: ' + this.tileY;
        }

    });