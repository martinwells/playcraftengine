/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.DebugPanel
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * This class is used to create the real-time debugging panels. An instance of this class is automatically constructed
 * by the pc.device system. When onReady is triggered the panel will automatically attach to a canvas element with the
 * id 'debug'.
 * <p>
 * <pre><code>
 * &ltcanvas id="debug"&gt&lt/canvas&gt
 * </code></pre>
 * The debug panel will automatically size to the available space in the canvas element.
 * <p>
 * You can gain access to the debug panel through pc.device.debugPanel member.
 */

pc.DebugPanel = pc.Base('pc.DebugPanel',
    {},
    /** @lends pc.DebugPanel.prototype */
    {
        x:0,
        y:0,
        panelHeight:0,
        panelWidth:0,
        canvas:null,
        ctx:null,
        statusText:null,
        active:false,
        timeGraph:null,
        memGraph:null,
        entityGraph:null,
        poolGraph:null,
        currentMem:0,
        lastMem:0,

        init:function ()
        {
            this._super();
        },

        onReady:function ()
        {
            this.attach('pcDebug');
        },

        /**
         * Attach the debug panel to a canvas element with the supplied id
         * @param {String} canvasElement Id of a canvas element to attach to
         */
        attach:function (canvasElement)
        {
            this.canvas = document.getElementById(canvasElement);
            if (this.canvas == null)
            {
                this.warn('Showing debug requires a div with an id of "debug" to be added to your dom.');
                pc.device.showDebug = false;
                return;
            }

            // resize the canvas to be the size of it's parent (containing element)
            this.panelElement = this.canvas.parentNode;
            this.ctx = this.canvas.getContext('2d');
            this.onResize();

            var np = 4;
            // create the graphs
            this.timeGraph = new pc.CanvasLineGraph(this.ctx, 'Performance', '', 10,
                [
                    {name:'process (ms)', color:'#f55'},
                    { name:'render (ms)', color:'#5f5'}
                ], 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);

            if (typeof console.memory === 'undefined' || console.memory.totalJSHeapSize == 0)
            {
                this.memGraph = new pc.CanvasLineGraph(this.ctx, 'Memory', 'Memory profiling not available', 0,
                    [
                        {name:'mem used (mb)', color:'#55f'}
                    ], (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);
            } else
            {
                this.memGraph = new pc.CanvasLineGraph(this.ctx, 'Memory', '', ((console.memory.totalJSHeapSize / 1024 / 1024) * 1.2),
                    [
                        {name:'mem used (mb)', color:'#55f'}
                    ], (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);
            }

            this.poolGraph = new pc.CanvasLineGraph(this.ctx, 'Pool Size', '', 100,
                [
                    {name:'pooled', color:'#5b1654'}
                ], this.panelWidth - ((this.panelWidth / np) * 2) + 10, 10, (this.panelWidth / np) - 20, this.panelHeight - 20);

            this.entityGraph = new pc.CanvasLineGraph(this.ctx, 'Entities', '', 100,
                [
                    { name:'drawn (total)', color:'#f9f007'}
                ], this.panelWidth - (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 20, this.panelHeight - 20);

            this.active = true;
        },

        onResize:function ()
        {
            if (this.canvas == null) return;

            this.canvas.width = this.panelElement.offsetWidth;
            this.canvas.height = this.panelElement.offsetHeight;
            this.panelWidth = this.panelElement.offsetWidth;
            this.panelHeight = this.panelElement.offsetHeight;

            // clear the background
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.panelWidth, this.panelHeight);

            var np = 4;
            if (this.timeGraph != null)
                this.timeGraph.resize(10, 10, this.panelWidth / np - 10, this.panelHeight - 20);
            if (this.memGraph != null)
                this.memGraph.resize(this.panelWidth / np + 10, 10, this.panelWidth / np - 10, this.panelHeight - 20);
            if (this.poolGraph != null)
                this.poolGraph.resize(this.panelWidth - ((this.panelWidth / np) * 2) + 20, 10, this.panelWidth / np - 20, this.panelHeight - 20);
            if (this.entityGraph != null)
                this.entityGraph.resize(this.panelWidth - (this.panelWidth / np) + 10, 10, this.panelWidth / np - 20, this.panelHeight - 20);

        },

        _timeSince:0,

        update:function (delta)
        {
            if (!this.active) return;

            // update the averages
            this._timeSince += delta;
            if (this._timeSince > 30)
            {
                this._timeSince = 0;
                if (this.timeGraph != null)
                    this.timeGraph.addLine2(pc.device.lastProcessMS, pc.device.lastDrawMS);
                if (this.entityGraph != null)
                    this.entityGraph.addLine1(pc.device.elementsDrawn);
                if (this.memGraph != null)
                    if (typeof console.memory !== 'undefined')
                        if (console.memory.totalJSHeapSize != 0)
                            this.memGraph.addLine1((window.performance.memory.usedJSHeapSize / 1024 / 1024));
                if (this.poolGraph != null)
                    this.poolGraph.addLine1(gamecore.Pool.totalPooled);
            }
        },

        draw:function ()
        {
            if (!this.active) return;

            if (this.timeGraph != null)
                this.timeGraph.draw();
            if (this.entityGraph != null)
                this.entityGraph.draw();
            if (this.memGraph != null) this.memGraph.draw();
            if (this.poolGraph != null) this.poolGraph.draw();
        }

    });


/**
 * CanvasLineGraph -- a line bar graph designed to be update quickly (optimized drawing)
 * rendered onto a canvas. Used primarily by the debug panel to display pretty graphs
 * of performance, memory, entity and network graphs.
 */
pc.CanvasLineGraph = pc.Base.extend('pc.CanvasLineGraph', {

    height:0,
    width:0,
    ctx:null,
    data:null,
    maxY:0, // top most range value
    x:0,
    y:0,
    labels:null,
    graphName:null,
    bgCanvas:null, // off screen canvas for background (grid etc)
    graphCanvas:null, // off screen canvas for graph
    message:null,
    cursor:0, // position in the data array that is the head of the data

    init:function (ctx, graphName, message, maxY, labels, x, y, width, height)
    {
        this._super();

        this.ctx = ctx;
        this.message = message;
        this.graphName = graphName;
        this.maxY = maxY;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.labels = labels;
        this.graphX = this.x + this.graphLeftMargin;
        this.graphY = this.y + 20;
        this.cursor = 0;

        this.graphCanvas = document.createElement('canvas');
        this.bgCanvas = document.createElement('canvas');

        this.resize(x, y, width, height);
    },

    resize:function (x, y, width, height)
    {
        // if the current graph line data is too big we need to resize it down
        if (this.width > width)
            this.data = this.data.slice(this.width - width, width);

        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        // size the graph component
        this.graphHeight = this.height - 40;
        this.graphWidth = this.width - (this.graphLeftMargin + this.graphRightMargin);
        this.graphX = this.graphLeftMargin;
        this.graphY = 20;

        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this.graphCanvas.width = this.graphWidth;
        this.graphCanvas.height = this.graphHeight;

        // resize the data array?
        this.resizeDataArray(this.graphWidth, this.labels.length);
        this.renderBackground();
    },

    resizeDataArray:function (newSize, numDataPoints)
    {
        var start = 0;
        if (newSize <= 0) return;

        if (this.data == null)
            this.data = [];
        else
        {
            // resize the array
            if (newSize > this.data.length) // growing?
            {
                start = this.data.length - 1;
            }
            else
            {
                // shrinking -- we cut from the begining
                this.data.splice(0, newSize - this.data.length);
                if (this.cursor > this.data.length - 1)
                    this.cursor = this.data.length - 1;
                return; // job done, no new init needed (it's smaller)
            }
        }

        // add some new data -- the array is expanding
        for (var i = start; i < newSize; i++)
            this.data.push(new Array(numDataPoints));
    },

    _totalAdded:0,
    linesSinceLastPeak:0, // set a new peak every n lines
    lastPeak:0,
    _total:0,

    // we use this to add multiple data items -- saves using variable length arrays (which chew
    // memory, thus we only currently support graphs with up to two data elements to a line.
    // if you want more, add an addLine3 method
    addLine2:function (lineData1, lineData2)
    {
        if (!this.data) return;

        this._totalAdded++;
        this._total = lineData1 + lineData2;
        this.checkMaxRange(this._total);
        this.data[this.cursor][0] = lineData1;
        this.data[this.cursor][1] = lineData2;
        this._updateGraph(this._total);
    },

    addLine1:function (lineData1)
    {
        if (!this.data) return;

        this._totalAdded++;
        this._total = lineData1;
        this.checkMaxRange(this._total);
        this.data[this.cursor][0] = lineData1;
        this._updateGraph(lineData1);
    },

    checkMaxRange:function (max)
    {
        if (max > this.maxY)
        {
            this.maxY = max * 1.4;
            // make sure the absolute smallest number of axis is equal to the height of the graph
            if (this.maxY < this.height / this.gridLineInc)
                this.maxY = this.height / this.gridLineInc;
            this.renderBackground();
            this.renderGraph(true);
        }
    },

    _updateGraph:function (total)
    {
        this.linesSinceLastPeak++;
        if (this.linesSinceLastPeak > this.width * 1.5)
        {
            this.linesSinceLastPeak++;
            this.maxY = total * 1.4;
            // make sure the absolute smallest number of axis is equal to the height of the graph
            if (this.maxY < this.height / this.gridLineInc)
                this.maxY = this.height / this.gridLineInc;

            this.lastPeak = total * 1.4;
            this.renderBackground();
            this.linesSinceLastPeak = 0;
        }

        if (total > this.lastPeak)
            this.lastPeak = total * 1.4;

        this.cursor++;
        if (this.cursor > this.data.length - 1)
            this.cursor = 0;

    },

    margin:20,
    linePixelSize:0,
    yline:0,
    unit:0,
    gridY:0,
    i:0,
    n:0,
    graphLeftMargin:30,
    graphRightMargin:15,
    graphHeight:0,
    graphWidth:0,
    graphX:0,
    graphY:0,
    gridLineInc:15,

    /**
     * Renders to an offscreen background canvas, which is only drawn on or resize
     */
    renderBackground:function ()
    {
        var ctx = this.bgCanvas.getContext('2d');

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.width, this.height);

        // graph title
        ctx.fillStyle = '#aaa';
        ctx.font = '11px sans-serif';
        ctx.fillText(this.graphName, this.graphX, this.graphY - 6);

        // draw the surround rectangle
        ctx.strokeStyle = '#111';
        ctx.strokeRect(this.graphX + 0.5, this.graphY + 0.5, this.graphWidth, this.graphHeight);

        // DRAW GRID AND MARKERS (Y AXIS)
        this.unit = (this.graphHeight) / this.maxY; // figure out the y scale
        var graphLines = (this.graphHeight + this.gridLineInc) / this.gridLineInc;
        var axisInc = this.maxY / graphLines;
        var axisValue = 0;
        var lineCount = 0;

        for (this.gridY = this.graphHeight + this.graphY; this.gridY > this.graphY + 1; this.gridY -= this.gridLineInc)
        {
            lineCount++;
            ctx.textAlign = 'right';
            (lineCount % 2 == 0) ? ctx.fillStyle = '#111' : ctx.fillStyle = '#000';

            var lineHeight = this.gridLineInc;
            if (this.gridY - lineHeight < this.graphY)
            {
                lineHeight = (this.gridY - this.graphY);
                ctx.fillRect(this.graphX + 1, this.graphY + 1, this.graphWidth - 2, lineHeight - 1);
            } else
                ctx.fillRect(this.graphX + 1, this.gridY - lineHeight - 1, this.graphWidth - 2, lineHeight);

            axisValue = Math.round(axisInc * lineCount);
            ctx.fillStyle = '#777';
            ctx.fillText('' + axisValue, this.graphX - 5, this.gridY);
        }

        // DRAW LEGEND
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
        var legendY = this.height - 13;
        var textX = this.graphLeftMargin + 3;

        for (this.n = 0; this.n < this.labels.length; this.n++)
        {
            ctx.fillStyle = this.labels[this.n].color;
            ctx.fillRect(textX, legendY, 5, 5);
            ctx.fillStyle = '#888';
            ctx.fillText(this.labels[this.n].name, textX + 8, legendY + 6);
            textX += ctx.measureText(this.labels[this.n].name).width + 18;
        }

        this.renderGraph(true);
    },

    renderGraph:function (completeRedraw)
    {
        if (!this.data) return;

        var gtx = this.graphCanvas.getContext('2d');
        if (completeRedraw)
        {
            gtx.fillStyle = '#000';
            gtx.fillRect(0, 0, this.graphWidth, this.graphHeight);
        } else if (this._totalAdded > this.graphWidth) // we are appending a line
            gtx.drawImage(this.graphCanvas, -1, 0); // so draw the previous graph shift by one

        // now draw a new line on the far right side
        var len = 0;

        if (completeRedraw)
        {
            len = this.data.length - 1;
            this.dx = 1;

        } else
        {
            // draw the first set of lines across, prior to scrolling
            if (this._totalAdded < this.graphWidth)
                this.dx = this.cursor;
            else
                this.dx = this.graphWidth - 1;
            len = this.dx + 1;
        }

        if (len == 0) return;

        // dx is the count of pixels across the screen
        // dpos is the cursor being drawn pointing inside the array
        var dpos = this.cursor - 1;
        if (dpos < 0) dpos = this.data.length - 1;

        for (; this.dx < len; this.dx++)
        {
            if (dpos > this.data.length - 1) dpos = 0;

            gtx.fillStyle = '#000';
            gtx.fillRect(this.dx, 0, 1, this.graphHeight);

            this.yline = this.graphHeight; // start at the bottom of the graph

            for (this.i = 0; this.i < this.data[dpos].length; this.i++)
            {
                this.linePixelSize = (this.data[dpos][this.i] * this.unit);

                gtx.strokeStyle = this.labels[this.i].color;
                gtx.beginPath();
                gtx.moveTo(this.dx, this.yline);

                var lineY = this.yline - this.linePixelSize;
                if (lineY < 0)
                    lineY = 0;
                gtx.lineTo(this.dx, lineY);
                gtx.closePath();
                gtx.stroke();

                this.yline -= this.linePixelSize;
            }
            dpos++;
        }

    },

    draw:function ()
    {
        this.ctx.save();
        this.ctx.drawImage(this.bgCanvas, this.x, this.y);
        this.renderGraph(false);
        this.ctx.globalAlpha = 0.4;
        this.ctx.drawImage(this.graphCanvas, this.x + this.graphX, this.y + this.graphY);

        // draw the message over the top, if there is one
        if (this.message)
        {
            this.ctx.font = '13px sans-serif';
            this.ctx.fillStyle = '#333';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.message, this.x + this.width / 2, this.y + this.height / 2 - 9);
        }
        this.ctx.restore();
    }

});

