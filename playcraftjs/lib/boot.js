
// first playcraft script loaded -- used to init anything before the rest of the engine is loaded
pc.Hashtable = gamecore.Hashtable;

/**
 * @class pc.Base
 * @augments gamecore.Base
 */
pc.Base = gamecore.Base('pc.Base',
    /** @lends gamecore.Base */
    {},
    /** @lends gamecore.Base.prototype */
    {});

/**
 * @class pc.Pool
 * @augments gamecore.Pool
 */
pc.Pool = gamecore.Pool.extend('pc.Pool',
    /** @lends gamecore.Pool */
    {},
    /** @lends gamecore.Pool.prototype */
    {});

/**
 * @class pc.Pooled
 * @augments gamecore.Pooled
 */
pc.Pooled = gamecore.Pooled.extend('pc.Pooled',
    /** @lends gamecore.Pooled */
    {},
    /** @lends gamecore.Pooled.prototype */
    {});

/**
 * @class pc.LinkedList
 * @augments gamecore.LinkedList
 */
pc.LinkedList = gamecore.LinkedList.extend('pc.LinkedList',
    /** @lends gamecore.LinkedList */
    {},
    /** @lends gamecore.LinkedList.prototype */
    {});

/**
 * @class pc.LinkedListNode
 * @augments gamecore.LinkedListNode
 */
pc.LinkedListNode = gamecore.LinkedListNode.extend('pc.LinkedListNode',
    /** @lends gamecore.LinkedListNode */
    {},
    /** @lends gamecore.LinkedListNode.prototype */
    {});

/**
 * @class pc.HashList
 * @augments gamecore.HashList
 */
pc.HashList = gamecore.HashList.extend('pc.HashList',
    /** @lends gamecore.HashList */
    {},
    /** @lends gamecore.HashList.prototype */
    {});

if (!Function.prototype.bind)
{
    Function.prototype.bind = function (oThis)
    {
        if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function ()
            {
            },
            fBound = function ()
            {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function (searchElement /*, fromIndex */)
    {
        "use strict";
        if (this == null)
        {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0)
        {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0)
        {
            n = Number(arguments[1]);
            if (n != n)
            { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity)
            {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len)
        {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++)
        {
            if (k in t && t[k] === searchElement)
            {
                return k;
            }
        }
        return -1;
    }
}


