
// first playcraft script loaded -- used to init anything before the rest of the engine is loaded
pc.Hashtable = gamecore.Hashtable;
pc.Base = gamecore.Base('pc.Base', {}, {});
pc.Pool = gamecore.Pool.extend('pc.Pool', {}, {});
pc.Pooled = gamecore.Pooled.extend('pc.Pooled', {}, {});
pc.LinkedList = gamecore.LinkedList.extend('pc.LinkedList', {}, {});
pc.HashList = gamecore.HashList.extend('pc.HashList', {}, {});

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


