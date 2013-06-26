/**
 * PlaycraftJS Engine. (C)2010-2012 Playcraft Labs, Inc.
 */


PlanetLayer = pc.Layer.extend('PlanetLayer', {},
    {
        planetImage:null,

        init:function (scene)
        {
            this._super('planets');
            this.planetImage = pc.device.loader.get('planet1').resource;
            this.planetImage2 = pc.device.loader.get('planet2').resource;
        },

        process:function()
        {
            this._super();
            this.planetImage.draw(pc.device.ctx, this.screenX(100), this.screenY(100));
            this.planetImage2.draw(pc.device.ctx, this.screenX(500), this.screenY(500));
        }

    });


StarFieldLayer = pc.TileLayer('StarFieldLayer', {},
    {
        starFieldCanvas:null,

        init:function (type, width, height)
        {
            // generate a starfield
            var tileSize = 256;   // big fat space tile width
            var spaceTiles = this.generateStarFieldTiles(type, tileSize, tileSize, 4, 1);
            var spaceSpriteSheet = new pc.SpriteSheet({image:spaceTiles, frameWidth:tileSize, frameHeight:tileSize,
                framesWide:4, framesHigh:1});

            var tileSet = new pc.TileSet(spaceSpriteSheet);
            // we need enough tiles to cover the entire map (plus some edges)
            var tilesWide = Math.ceil(width / tileSize)+4;
            var tilesHigh = Math.ceil(height / tileSize)+4;

            var tileMap = new pc.TileMap([tileSet], tilesWide, tilesHigh, tileSize, tileSize);
            tileMap.generate(-1);

            for (var ty = 0; ty < tilesHigh; ty++)
                for (var tx = 0; tx < tilesWide; tx++)
                    tileMap.setTile(tx, ty, pc.Math.rand(0, 3));

            this._super('starfield', false, tileMap, tileSet);
        },

        generateStarFieldTiles:function (type, tileWidth, tileHeight, tilesWide, tilesHigh)
        {
            var starsImage = pc.device.loader.get('stars').resource;
            var dimStarsImage = pc.device.loader.get('stars-dim').resource;
            var nebulaImage = pc.device.loader.get('nebula-blobs').resource;

            var starSpriteSheet = new pc.SpriteSheet({image:starsImage, frameWidth: 20, frameHeight:20, framesWide:4, framesHigh:3});
            var dimStarSpriteSheet = new pc.SpriteSheet({image:dimStarsImage, frameWidth:20, frameHeight:20, framesWide:4, framesHigh:3 });
            var nebulaSpriteSheet = new pc.SpriteSheet({image:nebulaImage, frameWidth:64, frameHeight:64, framesWide:4, framesHigh:1 });

            this.starFieldCanvas = document.createElement('canvas');
            this.starFieldCanvas.width = tileWidth * tilesWide;
            this.starFieldCanvas.height = tileHeight * tilesHigh;

            var ctx = this.starFieldCanvas.getContext('2d');
            if (type == 0)
            {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, this.starFieldCanvas.width, this.starFieldCanvas.height);
            }

            for (var ty = 0; ty < tilesHigh; ty++)
            {
                for (var tx = 0; tx < tilesWide; tx++)
                {
                    var originX = tx * tileWidth;
                    var originY = ty * tileHeight;

                    // create a first layer of dense but distant (smaller and faded) stars
                    switch (type)
                    {
                        case 0:
                            this.generateImageField(ctx, originX, originY, tileWidth, tileHeight,
                                dimStarSpriteSheet, 30, 0.8, 1, 0);
                            break;

                        case 1:
                            this.generateImageField(ctx, originX, originY, tileWidth, tileHeight,
                                starSpriteSheet, 80, 0.8, 1, 0);
                            break;
                        case 2:
                            this.generateImageField(ctx, originX, originY, tileWidth, tileHeight,
                                nebulaSpriteSheet, 100, 0.2, 0.3, 100);
                            break;
                    }
                }
            }

            return new pc.CanvasImage(this.starFieldCanvas);
        },

        generateImageField:function (ctx, originX, originY, width, height, spriteSheet, spread, alphaLow, alphaHigh, leapDistance)
        {
            var nextIncX = 1;
            var nextIncY = 1;

            for (var y = originY; y < originY + height; y += nextIncY)
            {
                for (var x = originX; x < originX + width; x += nextIncX)
                {
                    ctx.globalAlpha = pc.Math.randFloat(alphaLow, alphaHigh);

                    var px = x + pc.Math.rand(0, spread);
                    var py = y + pc.Math.rand(0, spread);
                    var fx = pc.Math.rand(0, spriteSheet.framesWide - 1);
                    var fy = pc.Math.rand(0, spriteSheet.framesHigh - 1);

                    // make sure we don't draw something over the edge of the canvas (it'll get cutoff
                    // when tiled and look choppy, not nice and seamless and beautiful, like my girlfriend)
                    if (pc.Math.isRectInRect(px, py, spriteSheet.frameWidth, spriteSheet.frameHeight,
                        originX, originY, width, height))
                        spriteSheet.drawFrame(ctx, fx, fy, px, py);

                    nextIncX = pc.Math.rand(spread - (spread / 2), spread + (spread / 2));
                    if (pc.Math.rand(leapDistance / 2, leapDistance) < leapDistance / 4)
                        nextIncX += leapDistance;
                }
                nextIncY = pc.Math.rand(spread - (spread / 2), spread + (spread / 2));
                if (pc.Math.rand(0, leapDistance) < leapDistance / 2)
                    nextIncY += leapDistance;
            }
        }
    });
