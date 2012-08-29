/*
 * Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */
/*
 * Original Box2D created by Erin Catto
 * http://www.gphysics.com
 * http://box2d.org/
 *
 * Box2D was converted to Flash by Boris the Brave, Matt Bush, and John Nesky as Box2DFlash
 * http://www.box2dflash.org/
 *
 * Box2DFlash was converted from Flash to Javascript by Uli Hecht as box2Dweb
 * http://code.google.com/p/box2dweb/
 *
 * box2Dweb was modified to utilize Google Closure, as well as other bug fixes, optimizations, and tweaks by Illandril
 * https://github.com/illandril/box2dweb-closure
 *
 * Playcraft additions:
 * - various bug fixes
 * - debug positioning supports the notion of an origin
 *
 */

goog = {inherits:function (a, b)
{
    function c()
    {
    }

    c.prototype = b.prototype;
    a.superClass_ = b.prototype;
    a.prototype = new c;
    a.prototype.constructor = a
}};
goog.debug = {};
goog.debug.Error = function (a)
{
    this.stack = Error().stack || "";
    a && (this.message = "" + a)
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.string = {};
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function (a, b)
{
    return 0 == a.lastIndexOf(b, 0)
};
goog.string.endsWith = function (a, b)
{
    var c = a.length - b.length;
    return 0 <= c && a.indexOf(b, c) == c
};
goog.string.caseInsensitiveStartsWith = function (a, b)
{
    return 0 == goog.string.caseInsensitiveCompare(b, a.substr(0, b.length))
};
goog.string.caseInsensitiveEndsWith = function (a, b)
{
    return 0 == goog.string.caseInsensitiveCompare(b, a.substr(a.length - b.length, b.length))
};
goog.string.subs = function (a, b)
{
    for (var c = 1; c < arguments.length; c++)
    {
        var d = ("" + arguments[c]).replace(/\$/g, "$$$$"), a = a.replace(/\%s/, d)
    }
    return a
};
goog.string.collapseWhitespace = function (a)
{
    return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function (a)
{
    return/^[\s\xa0]*$/.test(a)
};
goog.string.isEmptySafe = function (a)
{
    return goog.string.isEmpty(goog.string.makeSafe(a))
};
goog.string.isBreakingWhitespace = function (a)
{
    return!/[^\t\n\r ]/.test(a)
};
goog.string.isAlpha = function (a)
{
    return!/[^a-zA-Z]/.test(a)
};
goog.string.isNumeric = function (a)
{
    return!/[^0-9]/.test(a)
};
goog.string.isAlphaNumeric = function (a)
{
    return!/[^a-zA-Z0-9]/.test(a)
};
goog.string.isSpace = function (a)
{
    return" " == a
};
goog.string.isUnicodeChar = function (a)
{
    return 1 == a.length && " " <= a && "~" >= a || "\u0080" <= a && "\ufffd" >= a
};
goog.string.stripNewlines = function (a)
{
    return a.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function (a)
{
    return a.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function (a)
{
    return a.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function (a)
{
    return a.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function (a)
{
    return a.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function (a)
{
    return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function (a)
{
    return a.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function (a)
{
    return a.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function (a, b)
{
    var c = ("" + a).toLowerCase(), d = ("" + b).toLowerCase();
    return c < d ? -1 : c == d ? 0 : 1
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function (a, b)
{
    if (a == b)
    {
        return 0
    }
    if (!a)
    {
        return-1
    }
    if (!b)
    {
        return 1
    }
    for (var c = a.toLowerCase().match(goog.string.numerateCompareRegExp_), d = b.toLowerCase().match(goog.string.numerateCompareRegExp_), e = Math.min(c.length, d.length), f = 0; f < e; f++)
    {
        var g = c[f], h = d[f];
        if (g != h)
        {
            return c = parseInt(g, 10), !isNaN(c) && (d = parseInt(h, 10), !isNaN(d) && c - d) ? c - d : g < h ? -1 : 1
        }
    }
    return c.length != d.length ? c.length - d.length : a < b ? -1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function (a)
{
    a = "" + a;
    return!goog.string.encodeUriRegExp_.test(a) ? encodeURIComponent(a) : a
};
goog.string.urlDecode = function (a)
{
    return decodeURIComponent(a.replace(/\+/g, " "))
};
goog.string.newLineToBr = function (a, b)
{
    return a.replace(/(\r\n|\r|\n)/g, b ? "<br />" : "<br>")
};
goog.string.htmlEscape = function (a, b)
{
    if (b)
    {
        return a.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
    }
    if (!goog.string.allRe_.test(a))
    {
        return a
    }
    -1 != a.indexOf("&") && (a = a.replace(goog.string.amperRe_, "&amp;"));
    -1 != a.indexOf("<") && (a = a.replace(goog.string.ltRe_, "&lt;"));
    -1 != a.indexOf(">") && (a = a.replace(goog.string.gtRe_, "&gt;"));
    -1 != a.indexOf('"') && (a = a.replace(goog.string.quotRe_, "&quot;"));
    return a
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function (a)
{
    return goog.string.contains(a, "&") ? "document" in goog.global ? goog.string.unescapeEntitiesUsingDom_(a) : goog.string.unescapePureXmlEntities_(a) : a
};
goog.string.unescapeEntitiesUsingDom_ = function (a)
{
    var b = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'}, c = document.createElement("div");
    return a.replace(goog.string.HTML_ENTITY_PATTERN_, function (a, e)
    {
        var f = b[a];
        if (f)
        {
            return f
        }
        if ("#" == e.charAt(0))
        {
            var g = Number("0" + e.substr(1));
            isNaN(g) || (f = String.fromCharCode(g))
        }
        f || (c.innerHTML = a + " ", f = c.firstChild.nodeValue.slice(0, -1));
        return b[a] = f
    })
};
goog.string.unescapePureXmlEntities_ = function (a)
{
    return a.replace(/&([^;]+);/g, function (a, c)
    {
        switch (c)
        {
            case "amp":
                return"&";
            case "lt":
                return"<";
            case "gt":
                return">";
            case "quot":
                return'"';
            default:
                if ("#" == c.charAt(0))
                {
                    var d = Number("0" + c.substr(1));
                    if (!isNaN(d))
                    {
                        return String.fromCharCode(d)
                    }
                }
                return a
        }
    })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function (a, b)
{
    return goog.string.newLineToBr(a.replace(/  /g, " &#160;"), b)
};
goog.string.stripQuotes = function (a, b)
{
    for (var c = b.length, d = 0; d < c; d++)
    {
        var e = 1 == c ? b : b.charAt(d);
        if (a.charAt(0) == e && a.charAt(a.length - 1) == e)
        {
            return a.substring(1, a.length - 1)
        }
    }
    return a
};
goog.string.truncate = function (a, b, c)
{
    c && (a = goog.string.unescapeEntities(a));
    a.length > b && (a = a.substring(0, b - 3) + "...");
    c && (a = goog.string.htmlEscape(a));
    return a
};
goog.string.truncateMiddle = function (a, b, c, d)
{
    c && (a = goog.string.unescapeEntities(a));
    if (d && a.length > b)
    {
        d > b && (d = b);
        var e = a.length - d, a = a.substring(0, b - d) + "..." + a.substring(e)
    } else
    {
        a.length > b && (d = Math.floor(b / 2), e = a.length - d, a = a.substring(0, d + b % 2) + "..." + a.substring(e))
    }
    c && (a = goog.string.htmlEscape(a));
    return a
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function (a)
{
    a = "" + a;
    if (a.quote)
    {
        return a.quote()
    }
    for (var b = ['"'], c = 0; c < a.length; c++)
    {
        var d = a.charAt(c), e = d.charCodeAt(0);
        b[c + 1] = goog.string.specialEscapeChars_[d] || (31 < e && 127 > e ? d : goog.string.escapeChar(d))
    }
    b.push('"');
    return b.join("")
};
goog.string.escapeString = function (a)
{
    for (var b = [], c = 0; c < a.length; c++)
    {
        b[c] = goog.string.escapeChar(a.charAt(c))
    }
    return b.join("")
};
goog.string.escapeChar = function (a)
{
    if (a in goog.string.jsEscapeCache_)
    {
        return goog.string.jsEscapeCache_[a]
    }
    if (a in goog.string.specialEscapeChars_)
    {
        return goog.string.jsEscapeCache_[a] = goog.string.specialEscapeChars_[a]
    }
    var b = a, c = a.charCodeAt(0);
    if (31 < c && 127 > c)
    {
        b = a
    } else
    {
        if (256 > c)
        {
            if (b = "\\x", 16 > c || 256 < c)
            {
                b += "0"
            }
        } else
        {
            b = "\\u", 4096 > c && (b += "0")
        }
        b += c.toString(16).toUpperCase()
    }
    return goog.string.jsEscapeCache_[a] = b
};
goog.string.toMap = function (a)
{
    for (var b = {}, c = 0; c < a.length; c++)
    {
        b[a.charAt(c)] = !0
    }
    return b
};
goog.string.contains = function (a, b)
{
    return-1 != a.indexOf(b)
};
goog.string.removeAt = function (a, b, c)
{
    var d = a;
    0 <= b && (b < a.length && 0 < c) && (d = a.substr(0, b) + a.substr(b + c, a.length - b - c));
    return d
};
goog.string.remove = function (a, b)
{
    var c = RegExp(goog.string.regExpEscape(b), "");
    return a.replace(c, "")
};
goog.string.removeAll = function (a, b)
{
    var c = RegExp(goog.string.regExpEscape(b), "g");
    return a.replace(c, "")
};
goog.string.regExpEscape = function (a)
{
    return("" + a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function (a, b)
{
    return Array(b + 1).join(a)
};
goog.string.padNumber = function (a, b, c)
{
    a = goog.isDef(c) ? a.toFixed(c) : "" + a;
    c = a.indexOf(".");
    -1 == c && (c = a.length);
    return goog.string.repeat("0", Math.max(0, b - c)) + a
};
goog.string.makeSafe = function (a)
{
    return null == a ? "" : "" + a
};
goog.string.buildString = function (a)
{
    return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function ()
{
    return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function (a, b)
{
    for (var c = 0, d = goog.string.trim("" + a).split("."), e = goog.string.trim("" + b).split("."), f = Math.max(d.length, e.length), g = 0; 0 == c && g < f; g++)
    {
        var h = d[g] || "", i = e[g] || "", j = RegExp("(\\d*)(\\D*)", "g"), k = RegExp("(\\d*)(\\D*)", "g");
        do {
            var l = j.exec(h) || ["", "", ""], n = k.exec(i) || ["", "", ""];
            if (0 == l[0].length && 0 == n[0].length)
            {
                break
            }
            var c = 0 == l[1].length ? 0 : parseInt(l[1], 10), m = 0 == n[1].length ? 0 : parseInt(n[1], 10), c = goog.string.compareElements_(c, m) || goog.string.compareElements_(0 == l[2].length, 0 == n[2].length) || goog.string.compareElements_(l[2], n[2])
        } while (0 == c)
    }
    return c
};
goog.string.compareElements_ = function (a, b)
{
    return a < b ? -1 : a > b ? 1 : 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function (a)
{
    for (var b = 0, c = 0; c < a.length; ++c)
    {
        b = 31 * b + a.charCodeAt(c), b %= goog.string.HASHCODE_MAX_
    }
    return b
};
goog.string.uniqueStringCounter_ = 2147483648 * Math.random() | 0;
goog.string.createUniqueString = function ()
{
    return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function (a)
{
    var b = Number(a);
    return 0 == b && goog.string.isEmpty(a) ? NaN : b
};
goog.string.toCamelCaseCache_ = {};
goog.string.toCamelCase = function (a)
{
    return goog.string.toCamelCaseCache_[a] || (goog.string.toCamelCaseCache_[a] = ("" + a).replace(/\-([a-z])/g, function (a, c)
    {
        return c.toUpperCase()
    }))
};
goog.string.toSelectorCaseCache_ = {};
goog.string.toSelectorCase = function (a)
{
    return goog.string.toSelectorCaseCache_[a] || (goog.string.toSelectorCaseCache_[a] = ("" + a).replace(/([A-Z])/g, "-$1").toLowerCase())
};
goog.array = {};
goog.NATIVE_ARRAY_PROTOTYPES = !0;
goog.array.peek = function (a)
{
    return a[a.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.indexOf.call(a, b, c)
} : function (a, b, c)
{
    c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
    if (goog.isString(a))
    {
        return!goog.isString(b) || 1 != b.length ? -1 : a.indexOf(b, c)
    }
    for (; c < a.length; c++)
    {
        if (c in a && a[c] === b)
        {
            return c
        }
    }
    return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(a, b, null == c ? a.length - 1 : c)
} : function (a, b, c)
{
    c = null == c ? a.length - 1 : c;
    0 > c && (c = Math.max(0, a.length + c));
    if (goog.isString(a))
    {
        return!goog.isString(b) || 1 != b.length ? -1 : a.lastIndexOf(b, c)
    }
    for (; 0 <= c; c--)
    {
        if (c in a && a[c] === b)
        {
            return c
        }
    }
    return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function (a, b, c)
{

    goog.array.ARRAY_PROTOTYPE_.forEach.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
    {
        f in e && b.call(c, e[f], f, a)
    }
};
goog.array.forEachRight = function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; --d)
    {
        d in e && b.call(c, e[d], d, a)
    }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.filter.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = [], f = 0, g = goog.isString(a) ? a.split("") : a, h = 0; h < d; h++)
    {
        if (h in g)
        {
            var i = g[h];
            b.call(c, i, h, a) && (e[f++] = i)
        }
    }
    return e
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.map.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = Array(d), f = goog.isString(a) ? a.split("") : a, g = 0; g < d; g++)
    {
        g in f && (e[g] = b.call(c, f[g], g, a))
    }
    return e
};
goog.array.reduce = function (a, b, c, d)
{
    if (a.reduce)
    {
        return d ? a.reduce(goog.bind(b, d), c) : a.reduce(b, c)
    }
    var e = c;
    goog.array.forEach(a, function (c, g)
    {
        e = b.call(d, e, c, g, a)
    });
    return e
};
goog.array.reduceRight = function (a, b, c, d)
{
    if (a.reduceRight)
    {
        return d ? a.reduceRight(goog.bind(b, d), c) : a.reduceRight(b, c)
    }
    var e = c;
    goog.array.forEachRight(a, function (c, g)
    {
        e = b.call(d, e, c, g, a)
    });
    return e
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.some.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
    {
        if (f in e && b.call(c, e[f], f, a))
        {
            return!0
        }
    }
    return!1
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.every.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
    {
        if (f in e && !b.call(c, e[f], f, a))
        {
            return!1
        }
    }
    return!0
};
goog.array.find = function (a, b, c)
{
    b = goog.array.findIndex(a, b, c);
    return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndex = function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
    {
        if (f in e && b.call(c, e[f], f, a))
        {
            return f
        }
    }
    return-1
};
goog.array.findRight = function (a, b, c)
{
    b = goog.array.findIndexRight(a, b, c);
    return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndexRight = function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; d--)
    {
        if (d in e && b.call(c, e[d], d, a))
        {
            return d
        }
    }
    return-1
};
goog.array.contains = function (a, b)
{
    return 0 <= goog.array.indexOf(a, b)
};
goog.array.isEmpty = function (a)
{
    return 0 == a.length
};
goog.array.clear = function (a)
{
    if (!goog.isArray(a))
    {
        for (var b = a.length - 1; 0 <= b; b--)
        {
            delete a[b]
        }
    }
    a.length = 0
};
goog.array.insert = function (a, b)
{
    goog.array.contains(a, b) || a.push(b)
};
goog.array.insertAt = function (a, b, c)
{
    goog.array.splice(a, c, 0, b)
};
goog.array.insertArrayAt = function (a, b, c)
{
    goog.partial(goog.array.splice, a, c, 0).apply(null, b)
};
goog.array.insertBefore = function (a, b, c)
{
    var d;
    2 == arguments.length || 0 > (d = goog.array.indexOf(a, c)) ? a.push(b) : goog.array.insertAt(a, b, d)
};
goog.array.remove = function (a, b)
{
    var c = goog.array.indexOf(a, b), d;
    (d = 0 <= c) && goog.array.removeAt(a, c);
    return d
};
goog.array.removeAt = function (a, b)
{

    return 1 == goog.array.ARRAY_PROTOTYPE_.splice.call(a, b, 1).length
};
goog.array.removeIf = function (a, b, c)
{
    b = goog.array.findIndex(a, b, c);
    return 0 <= b ? (goog.array.removeAt(a, b), !0) : !1
};
goog.array.concat = function (a)
{
    return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function (a)
{
    if (goog.isArray(a))
    {
        return goog.array.concat(a)
    }
    for (var b = [], c = 0, d = a.length; c < d; c++)
    {
        b[c] = a[c]
    }
    return b
};
goog.array.toArray = function (a)
{
    return goog.isArray(a) ? goog.array.concat(a) : goog.array.clone(a)
};
goog.array.extend = function (a, b)
{
    for (var c = 1; c < arguments.length; c++)
    {
        var d = arguments[c], e;
        if (goog.isArray(d) || (e = goog.isArrayLike(d)) && d.hasOwnProperty("callee"))
        {
            a.push.apply(a, d)
        } else
        {
            if (e)
            {
                for (var f = a.length, g = d.length, h = 0; h < g; h++)
                {
                    a[f + h] = d[h]
                }
            } else
            {
                a.push(d)
            }
        }
    }
};
goog.array.splice = function (a, b, c, d)
{

    return goog.array.ARRAY_PROTOTYPE_.splice.apply(a, goog.array.slice(arguments, 1))
};
goog.array.slice = function (a, b, c)
{

    return 2 >= arguments.length ? goog.array.ARRAY_PROTOTYPE_.slice.call(a, b) : goog.array.ARRAY_PROTOTYPE_.slice.call(a, b, c)
};
goog.array.removeDuplicates = function (a, b)
{
    for (var c = b || a, d = {}, e = 0, f = 0; f < a.length;)
    {
        var g = a[f++], h = goog.isObject(g) ? "o" + goog.getUid(g) : (typeof g).charAt(0) + g;
        Object.prototype.hasOwnProperty.call(d, h) || (d[h] = !0, c[e++] = g)
    }
    c.length = e
};
goog.array.binarySearch = function (a, b, c)
{
    return goog.array.binarySearch_(a, c || goog.array.defaultCompare, !1, b)
};
goog.array.binarySelect = function (a, b, c)
{
    return goog.array.binarySearch_(a, b, !0, void 0, c)
};
goog.array.binarySearch_ = function (a, b, c, d, e)
{
    for (var f = 0, g = a.length, h; f < g;)
    {
        var i = f + g >> 1, j;
        j = c ? b.call(e, a[i], i, a) : b(d, a[i]);
        0 < j ? f = i + 1 : (g = i, h = !j)
    }
    return h ? f : ~f
};
goog.array.sort = function (a, b)
{

    goog.array.ARRAY_PROTOTYPE_.sort.call(a, b || goog.array.defaultCompare)
};
goog.array.stableSort = function (a, b)
{
    for (var c = 0; c < a.length; c++)
    {
        a[c] = {index:c, value:a[c]}
    }
    var d = b || goog.array.defaultCompare;
    goog.array.sort(a, function (a, b)
    {
        return d(a.value, b.value) || a.index - b.index
    });
    for (c = 0; c < a.length; c++)
    {
        a[c] = a[c].value
    }
};
goog.array.sortObjectsByKey = function (a, b, c)
{
    var d = c || goog.array.defaultCompare;
    goog.array.sort(a, function (a, c)
    {
        return d(a[b], c[b])
    })
};
goog.array.isSorted = function (a, b, c)
{
    for (var b = b || goog.array.defaultCompare, d = 1; d < a.length; d++)
    {
        var e = b(a[d - 1], a[d]);
        if (0 < e || 0 == e && c)
        {
            return!1
        }
    }
    return!0
};
goog.array.equals = function (a, b, c)
{
    if (!goog.isArrayLike(a) || !goog.isArrayLike(b) || a.length != b.length)
    {
        return!1
    }
    for (var d = a.length, c = c || goog.array.defaultCompareEquality, e = 0; e < d; e++)
    {
        if (!c(a[e], b[e]))
        {
            return!1
        }
    }
    return!0
};
goog.array.compare = function (a, b, c)
{
    return goog.array.equals(a, b, c)
};
goog.array.compare3 = function (a, b, c)
{
    for (var c = c || goog.array.defaultCompare, d = Math.min(a.length, b.length), e = 0; e < d; e++)
    {
        var f = c(a[e], b[e]);
        if (0 != f)
        {
            return f
        }
    }
    return goog.array.defaultCompare(a.length, b.length)
};
goog.array.defaultCompare = function (a, b)
{
    return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function (a, b)
{
    return a === b
};
goog.array.binaryInsert = function (a, b, c)
{
    c = goog.array.binarySearch(a, b, c);
    return 0 > c ? (goog.array.insertAt(a, b, -(c + 1)), !0) : !1
};
goog.array.binaryRemove = function (a, b, c)
{
    b = goog.array.binarySearch(a, b, c);
    return 0 <= b ? goog.array.removeAt(a, b) : !1
};
goog.array.bucket = function (a, b)
{
    for (var c = {}, d = 0; d < a.length; d++)
    {
        var e = a[d], f = b(e, d, a);
        goog.isDef(f) && (c[f] || (c[f] = [])).push(e)
    }
    return c
};
goog.array.repeat = function (a, b)
{
    for (var c = [], d = 0; d < b; d++)
    {
        c[d] = a
    }
    return c
};
goog.array.flatten = function (a)
{
    for (var b = [], c = 0; c < arguments.length; c++)
    {
        var d = arguments[c];
        goog.isArray(d) ? b.push.apply(b, goog.array.flatten.apply(null, d)) : b.push(d)
    }
    return b
};
goog.array.rotate = function (a, b)
{

    a.length && (b %= a.length, 0 < b ? goog.array.ARRAY_PROTOTYPE_.unshift.apply(a, a.splice(-b, b)) : 0 > b && goog.array.ARRAY_PROTOTYPE_.push.apply(a, a.splice(0, -b)));
    return a
};
goog.array.zip = function (a)
{
    if (!arguments.length)
    {
        return[]
    }
    for (var b = [], c = 0; ; c++)
    {
        for (var d = [], e = 0; e < arguments.length; e++)
        {
            var f = arguments[e];
            if (c >= f.length)
            {
                return b
            }
            d.push(f[c])
        }
        b.push(d)
    }
};
goog.array.shuffle = function (a, b)
{
    for (var c = b || Math.random, d = a.length - 1; 0 < d; d--)
    {
        var e = Math.floor(c() * (d + 1)), f = a[d];
        a[d] = a[e];
        a[e] = f
    }
};
goog.structs = {};
goog.structs.Queue = function ()
{
    this.elements_ = []
};
goog.structs.Queue.prototype.head_ = 0;
goog.structs.Queue.prototype.tail_ = 0;
goog.structs.Queue.prototype.enqueue = function (a)
{
    this.elements_[this.tail_++] = a
};
goog.structs.Queue.prototype.dequeue = function ()
{
    if (this.head_ != this.tail_)
    {
        var a = this.elements_[this.head_];
        delete this.elements_[this.head_];
        this.head_++;
        return a
    }
};
goog.structs.Queue.prototype.peek = function ()
{
    return this.head_ == this.tail_ ? void 0 : this.elements_[this.head_]
};
goog.structs.Queue.prototype.getCount = function ()
{
    return this.tail_ - this.head_
};
goog.structs.Queue.prototype.isEmpty = function ()
{
    return 0 == this.tail_ - this.head_
};
goog.structs.Queue.prototype.clear = function ()
{
    this.tail_ = this.head_ = this.elements_.length = 0
};
goog.structs.Queue.prototype.contains = function (a)
{
    return goog.array.contains(this.elements_, a)
};
goog.structs.Queue.prototype.remove = function (a)
{
    a = goog.array.indexOf(this.elements_, a);
    if (0 > a)
    {
        return!1
    }
    a == this.head_ ? this.dequeue() : (goog.array.removeAt(this.elements_, a), this.tail_--);
    return!0
};
goog.structs.Queue.prototype.getValues = function ()
{
    return this.elements_.slice(this.head_, this.tail_)
};
var Box2D = {Common:{}};

Box2D.Common.Math = {};
Box2D.Common.Math.b2Vec2 = function (a, b)
{

    this.x = a;
    this.y = b
};
Box2D.Common.Math.b2Vec2._freeCache = [];
Box2D.Common.Math.b2Vec2.Get = function (a, b)
{

    if (0 < Box2D.Common.Math.b2Vec2._freeCache.length)
    {
        var c = Box2D.Common.Math.b2Vec2._freeCache.pop();
        c.Set(a, b);
        return c
    }
    return new Box2D.Common.Math.b2Vec2(a, b)
};
Box2D.Common.Math.b2Vec2.Free = function (a)
{
    null != a && ( Box2D.Common.Math.b2Vec2._freeCache.push(a))
};
Box2D.Common.Math.b2Vec2.prototype.SetZero = function ()
{
    this.y = this.x = 0
};
Box2D.Common.Math.b2Vec2.prototype.Set = function (a, b)
{
    this.x = a;
    this.y = b
};
Box2D.Common.Math.b2Vec2.prototype.SetV = function (a)
{
    this.x = a.x;
    this.y = a.y
};
Box2D.Common.Math.b2Vec2.prototype.GetNegative = function ()
{
    return Box2D.Common.Math.b2Vec2.Get(-this.x, -this.y)
};
Box2D.Common.Math.b2Vec2.prototype.NegativeSelf = function ()
{
    this.x = -this.x;
    this.y = -this.y
};
Box2D.Common.Math.b2Vec2.prototype.Copy = function ()
{
    return Box2D.Common.Math.b2Vec2.Get(this.x, this.y)
};
Box2D.Common.Math.b2Vec2.prototype.Add = function (a)
{
    this.x += a.x;
    this.y += a.y
};
Box2D.Common.Math.b2Vec2.prototype.Subtract = function (a)
{
    this.x -= a.x;
    this.y -= a.y
};
Box2D.Common.Math.b2Vec2.prototype.Multiply = function (a)
{
    this.x *= a;
    this.y *= a
};
Box2D.Common.Math.b2Vec2.prototype.MulM = function (a)
{
    var b = this.x;
    this.x = a.col1.x * b + a.col2.x * this.y;
    this.y = a.col1.y * b + a.col2.y * this.y
};
Box2D.Common.Math.b2Vec2.prototype.MulTM = function (a)
{
    var b = this.x * a.col1.x + this.y * a.col1.y;
    this.y = this.x * a.col2.x + this.y * a.col2.y;
    this.x = b
};
Box2D.Common.Math.b2Vec2.prototype.CrossVF = function (a)
{
    var b = this.x;
    this.x = a * this.y;
    this.y = -a * b
};
Box2D.Common.Math.b2Vec2.prototype.CrossFV = function (a)
{
    var b = this.x;
    this.x = -a * this.y;
    this.y = a * b
};
Box2D.Common.Math.b2Vec2.prototype.MinV = function (a)
{
    this.x = Math.min(this.x, a.x);
    this.y = Math.min(this.y, a.y)
};
Box2D.Common.Math.b2Vec2.prototype.MaxV = function (a)
{
    this.x = Math.max(this.x, a.x);
    this.y = Math.max(this.y, a.y)
};
Box2D.Common.Math.b2Vec2.prototype.Abs = function ()
{
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y)
};
Box2D.Common.Math.b2Vec2.prototype.Length = function ()
{
    return Math.sqrt(this.LengthSquared())
};
Box2D.Common.Math.b2Vec2.prototype.LengthSquared = function ()
{
    return this.x * this.x + this.y * this.y
};
Box2D.Common.Math.b2Vec2.prototype.Normalize = function ()
{
    var a = this.Length();
    if (a < Number.MIN_VALUE)
    {
        return 0
    }
    var b = 1 / a;
    this.x *= b;
    this.y *= b;
    return a
};
Box2D.Common.Math.b2Vec2.prototype.IsValid = function ()
{
    return isFinite(this.x) && isFinite(this.y)
};
Box2D.Common.b2Settings = {};
Box2D.Common.b2Settings.b2MixFriction = function (a, b)
{
    return Math.sqrt(a * b)
};
Box2D.Common.b2Settings.b2MixRestitution = function (a, b)
{
    return a > b ? a : b
};
Box2D.Common.b2Settings.b2Assert = function (a)
{
    if (!a)
    {
        throw"Assertion Failed";
    }
};
Box2D.Common.b2Settings.VERSION = "2.1a-playcraft";
Box2D.Common.b2Settings.USHRT_MAX = 65535;
Box2D.Common.b2Settings.b2_maxManifoldPoints = 2;
Box2D.Common.b2Settings.b2_aabbExtension = 0.1;
Box2D.Common.b2Settings.b2_aabbMultiplier = 2;
Box2D.Common.b2Settings.b2_polygonRadius = 2 * Box2D.Common.b2Settings.b2_linearSlop;
Box2D.Common.b2Settings.b2_linearSlop = 0.0050;
Box2D.Common.b2Settings.b2_angularSlop = 2 / 180 * Math.PI;
Box2D.Common.b2Settings.b2_toiSlop = 8 * Box2D.Common.b2Settings.b2_linearSlop;
Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland = 32;
Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland = 32;
Box2D.Common.b2Settings.b2_velocityThreshold = 1;
Box2D.Common.b2Settings.b2_maxLinearCorrection = 0.2;
Box2D.Common.b2Settings.b2_maxAngularCorrection = 8 / 180 * Math.PI;
Box2D.Common.b2Settings.b2_maxTranslation = 2;
Box2D.Common.b2Settings.b2_maxTranslationSquared = Box2D.Common.b2Settings.b2_maxTranslation * Box2D.Common.b2Settings.b2_maxTranslation;
Box2D.Common.b2Settings.b2_maxRotation = 0.5 * Math.PI;
Box2D.Common.b2Settings.b2_maxRotationSquared = Box2D.Common.b2Settings.b2_maxRotation * Box2D.Common.b2Settings.b2_maxRotation;
Box2D.Common.b2Settings.b2_contactBaumgarte = 0.2;
Box2D.Common.b2Settings.b2_timeToSleep = 0.5;
Box2D.Common.b2Settings.b2_linearSleepTolerance = 0.01;
Box2D.Common.b2Settings.b2_linearSleepToleranceSquared = Box2D.Common.b2Settings.b2_linearSleepTolerance * Box2D.Common.b2Settings.b2_linearSleepTolerance;
Box2D.Common.b2Settings.b2_angularSleepTolerance = 2 / 180 * Math.PI;
Box2D.Common.b2Settings.b2_angularSleepToleranceSquared = Box2D.Common.b2Settings.b2_angularSleepTolerance * Box2D.Common.b2Settings.b2_angularSleepTolerance;
Box2D.Common.b2Settings.MIN_VALUE_SQUARED = Number.MIN_VALUE * Number.MIN_VALUE;
Box2D.Common.Math.b2Mat22 = function ()
{

    this.col1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.col2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.SetIdentity()
};
Box2D.Common.Math.b2Mat22._freeCache = [];
Box2D.Common.Math.b2Mat22.Get = function ()
{

    if (0 < Box2D.Common.Math.b2Mat22._freeCache.length)
    {
        var a = Box2D.Common.Math.b2Mat22._freeCache.pop();
        a.SetZero();
        return a
    }
    return new Box2D.Common.Math.b2Mat22
};
Box2D.Common.Math.b2Mat22.Free = function (a)
{
    null != a && ( Box2D.Common.Math.b2Mat22._freeCache.push(a))
};
Box2D.Common.Math.b2Mat22.FromAngle = function (a)
{
    var b = Box2D.Common.Math.b2Mat22.Get();
    b.Set(a);
    return b
};
Box2D.Common.Math.b2Mat22.FromVV = function (a, b)
{
    var c = Box2D.Common.Math.b2Mat22.Get();
    c.SetVV(a, b);
    return c
};
Box2D.Common.Math.b2Mat22.prototype.Set = function (a)
{
    var b = Math.cos(a), a = Math.sin(a);
    this.col1.Set(b, a);
    this.col2.Set(-a, b)
};
Box2D.Common.Math.b2Mat22.prototype.SetVV = function (a, b)
{
    this.col1.SetV(a);
    this.col2.SetV(b)
};
Box2D.Common.Math.b2Mat22.prototype.Copy = function ()
{
    var a = Box2D.Common.Math.b2Mat22.Get();
    a.SetM(this);
    return a
};
Box2D.Common.Math.b2Mat22.prototype.SetM = function (a)
{
    this.col1.SetV(a.col1);
    this.col2.SetV(a.col2)
};
Box2D.Common.Math.b2Mat22.prototype.AddM = function (a)
{
    this.col1.Add(a.col1);
    this.col2.Add(a.col2)
};
Box2D.Common.Math.b2Mat22.prototype.SetIdentity = function ()
{
    this.col1.Set(1, 0);
    this.col2.Set(0, 1)
};
Box2D.Common.Math.b2Mat22.prototype.SetZero = function ()
{
    this.col1.Set(0, 0);
    this.col2.Set(0, 0)
};
Box2D.Common.Math.b2Mat22.prototype.GetAngle = function ()
{
    return Math.atan2(this.col1.y, this.col1.x)
};
Box2D.Common.Math.b2Mat22.prototype.GetInverse = function (a)
{
    var b = this.col1.x * this.col2.y - this.col2.x * this.col1.y;
    0 !== b && (b = 1 / b);
    a.col1.x = b * this.col2.y;
    a.col2.x = -b * this.col2.x;
    a.col1.y = -b * this.col1.y;
    a.col2.y = b * this.col1.x;
    return a
};
Box2D.Common.Math.b2Mat22.prototype.Solve = function (a, b, c)
{
    var d = this.col1.x * this.col2.y - this.col2.x * this.col1.y;
    0 !== d && (d = 1 / d);
    a.x = d * (this.col2.y * b - this.col2.x * c);
    a.y = d * (this.col1.x * c - this.col1.y * b);
    return a
};
Box2D.Common.Math.b2Mat22.prototype.Abs = function ()
{
    this.col1.Abs();
    this.col2.Abs()
};
Box2D.Common.Math.b2Math = {};
Box2D.Common.Math.b2Math.Dot = function (a, b)
{
    return a.x * b.x + a.y * b.y
};
Box2D.Common.Math.b2Math.CrossVV = function (a, b)
{
    return a.x * b.y - a.y * b.x
};
Box2D.Common.Math.b2Math.CrossVF = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(b * a.y, -b * a.x)
};
Box2D.Common.Math.b2Math.CrossFV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(-a * b.y, a * b.x)
};
Box2D.Common.Math.b2Math.MulMV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(a.col1.x * b.x + a.col2.x * b.y, a.col1.y * b.x + a.col2.y * b.y)
};
Box2D.Common.Math.b2Math.MulTMV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(b, a.col1), Box2D.Common.Math.b2Math.Dot(b, a.col2))
};
Box2D.Common.Math.b2Math.MulX = function (a, b)
{
    var c = Box2D.Common.Math.b2Math.MulMV(a.R, b);
    c.x += a.position.x;
    c.y += a.position.y;
    return c
};
Box2D.Common.Math.b2Math.MulXT = function (a, b)
{
    var c = Box2D.Common.Math.b2Math.SubtractVV(b, a.position), d = c.x * a.R.col1.x + c.y * a.R.col1.y;
    c.y = c.x * a.R.col2.x + c.y * a.R.col2.y;
    c.x = d;
    return c
};
Box2D.Common.Math.b2Math.AddVV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(a.x + b.x, a.y + b.y)
};
Box2D.Common.Math.b2Math.SubtractVV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(a.x - b.x, a.y - b.y)
};
Box2D.Common.Math.b2Math.Distance = function (a, b)
{
    return Math.sqrt(Box2D.Common.Math.b2Math.DistanceSquared(a, b))
};
Box2D.Common.Math.b2Math.DistanceSquared = function (a, b)
{
    var c = a.x - b.x, d = a.y - b.y;
    return c * c + d * d
};
Box2D.Common.Math.b2Math.MulFV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(a * b.x, a * b.y)
};
Box2D.Common.Math.b2Math.AddMM = function (a, b)
{
    var c = Box2D.Common.Math.b2Math.AddVV(a.col1, b.col1), d = Box2D.Common.Math.b2Math.AddVV(a.col2, b.col2), e = Box2D.Common.Math.b2Mat22.FromVV(c, d);
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(d);
    return e
};
Box2D.Common.Math.b2Math.MulMM = function (a, b)
{
    var c = Box2D.Common.Math.b2Math.MulMV(a, b.col1), d = Box2D.Common.Math.b2Math.MulMV(a, b.col2), e = Box2D.Common.Math.b2Mat22.FromVV(c, d);
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(d);
    return e
};
Box2D.Common.Math.b2Math.MulTMM = function (a, b)
{
    var c = Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(a.col1, b.col1), Box2D.Common.Math.b2Math.Dot(a.col2, b.col1)), d = Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(a.col1, b.col2), Box2D.Common.Math.b2Math.Dot(a.col2, b.col2)), e = Box2D.Common.Math.b2Mat22.FromVV(c, d);
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(d);
    return e
};
Box2D.Common.Math.b2Math.AbsV = function (a)
{
    return Box2D.Common.Math.b2Vec2.Get(Math.abs(a.x), Math.abs(a.y))
};
Box2D.Common.Math.b2Math.AbsM = function (a)
{
    var b = Box2D.Common.Math.b2Math.AbsV(a.col1), a = Box2D.Common.Math.b2Math.AbsV(a.col2), c = Box2D.Common.Math.b2Mat22.FromVV(b, a);
    Box2D.Common.Math.b2Vec2.Free(b);
    Box2D.Common.Math.b2Vec2.Free(a);
    return c
};
Box2D.Common.Math.b2Math.Clamp = function (a, b, c)
{
    return a < b ? b : a > c ? c : a
};
Box2D.Common.Math.b2Math.ClampV = function (a, b, c)
{
    var d = Box2D.Common.Math.b2Math.Clamp(a.x, b.x, c.x), a = Box2D.Common.Math.b2Math.Clamp(a.y, b.y, c.y);
    return Box2D.Common.Math.b2Vec2.Get(d, a)
};
Box2D.Dynamics = {};
Box2D.Dynamics.Joints = {};
Box2D.Dynamics.Joints.b2JointEdge = function ()
{
};
Box2D.Dynamics.Joints.b2Joint = function (a)
{
    this.m_edgeA = new Box2D.Dynamics.Joints.b2JointEdge;
    this.m_edgeB = new Box2D.Dynamics.Joints.b2JointEdge;
    this.m_localCenterA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localCenterB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    Box2D.Common.b2Settings.b2Assert(a.bodyA != a.bodyB);
    this.m_type = a.type;
    this.m_next = this.m_prev = null;
    this.m_bodyA = a.bodyA;
    this.m_bodyB = a.bodyB;
    this.m_collideConnected = a.collideConnected
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetType = function ()
{
    return this.m_type
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetAnchorA = function ()
{
    return null
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetAnchorB = function ()
{
    return null
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetReactionForce = function ()
{
    return null
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetReactionTorque = function ()
{
    return 0
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetBodyA = function ()
{
    return this.m_bodyA
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetBodyB = function ()
{
    return this.m_bodyB
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetNext = function ()
{
    return this.m_next
};
Box2D.Dynamics.Joints.b2Joint.prototype.IsActive = function ()
{
    return this.m_bodyA.IsActive() && this.m_bodyB.IsActive()
};
Box2D.Dynamics.Joints.b2Joint.Create = function (a)
{
    return a.Create()
};
Box2D.Dynamics.Joints.b2Joint.prototype.InitVelocityConstraints = function ()
{
};
Box2D.Dynamics.Joints.b2Joint.prototype.SolveVelocityConstraints = function ()
{
};
Box2D.Dynamics.Joints.b2Joint.prototype.FinalizeVelocityConstraints = function ()
{
};
Box2D.Dynamics.Joints.b2Joint.prototype.SolvePositionConstraints = function ()
{
    return!1
};
Box2D.Dynamics.Joints.b2Joint.e_unknownJoint = 0;
Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint = 1;
Box2D.Dynamics.Joints.b2Joint.e_prismaticJoint = 2;
Box2D.Dynamics.Joints.b2Joint.e_distanceJoint = 3;
Box2D.Dynamics.Joints.b2Joint.e_pulleyJoint = 4;
Box2D.Dynamics.Joints.b2Joint.e_mouseJoint = 5;
Box2D.Dynamics.Joints.b2Joint.e_gearJoint = 6;
Box2D.Dynamics.Joints.b2Joint.e_lineJoint = 7;
Box2D.Dynamics.Joints.b2Joint.e_weldJoint = 8;
Box2D.Dynamics.Joints.b2Joint.e_frictionJoint = 9;
Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit = 0;
Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit = 1;
Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit = 2;
Box2D.Dynamics.Joints.b2Joint.e_equalLimits = 3;
Box2D.Dynamics.Joints.b2LineJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localXAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localYAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_perp = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_K = new Box2D.Common.Math.b2Mat22;
    this.m_impulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_localXAxis1.SetV(a.localAxisA);
    this.m_localYAxis1.x = -this.m_localXAxis1.y;
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_impulse.SetZero();
    this.m_motorImpulse = this.m_motorMass = 0;
    this.m_lowerTranslation = a.lowerTranslation;
    this.m_upperTranslation = a.upperTranslation;
    this.m_maxMotorForce = a.maxMotorForce;
    this.m_motorSpeed = a.motorSpeed;
    this.m_enableLimit = a.enableLimit;
    this.m_enableMotor = a.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero()
};
goog.inherits(Box2D.Dynamics.Joints.b2LineJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), a * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y))
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    return a * this.m_impulse.y
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetJointTranslation = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = a.GetWorldPoint(this.m_localAnchor1), d = b.GetWorldPoint(this.m_localAnchor2), b = d.x - c.x, c = d.y - c.y, a = a.GetWorldVector(this.m_localXAxis1);
    return a.x * b + a.y * c
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetJointSpeed = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c;
    c = a.m_xf.R;
    var d = this.m_localAnchor1.x - a.m_sweep.localCenter.x, e = this.m_localAnchor1.y - a.m_sweep.localCenter.y, f = c.col1.x * d + c.col2.x * e, e = c.col1.y * d + c.col2.y * e, d = f;
    c = b.m_xf.R;
    var g = this.m_localAnchor2.x - b.m_sweep.localCenter.x, h = this.m_localAnchor2.y - b.m_sweep.localCenter.y, f = c.col1.x * g + c.col2.x * h, h = c.col1.y * g + c.col2.y * h, g = f;
    c = b.m_sweep.c.x + g - (a.m_sweep.c.x + d);
    var f = b.m_sweep.c.y + h - (a.m_sweep.c.y + e), i = a.GetWorldVector(this.m_localXAxis1), j = a.m_linearVelocity, k = b.m_linearVelocity, a = a.m_angularVelocity, b = b.m_angularVelocity;
    return c * -a * i.y + f * a * i.x + (i.x * (k.x + -b * h - j.x - -a * e) + i.y * (k.y + b * g - j.y - a * d))
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.IsLimitEnabled = function ()
{
    return this.m_enableLimit
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.EnableLimit = function (a)
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_enableLimit = a
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetLowerLimit = function ()
{
    return this.m_lowerTranslation
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetUpperLimit = function ()
{
    return this.m_upperTranslation
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetLimits = function (a, b)
{
    void 0 === a && (a = 0);
    void 0 === b && (b = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_lowerTranslation = a;
    this.m_upperTranslation = b
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.IsMotorEnabled = function ()
{
    return this.m_enableMotor
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.EnableMotor = function (a)
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_enableMotor = a
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetMotorSpeed = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_motorSpeed = a
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMotorSpeed = function ()
{
    return this.m_motorSpeed
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetMaxMotorForce = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_maxMotorForce = a
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMaxMotorForce = function ()
{
    return this.m_maxMotorForce
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMotorForce = function ()
{
    return this.m_motorImpulse
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d, e = 0;
    this.m_localCenterA.SetV(b.GetLocalCenter());
    this.m_localCenterB.SetV(c.GetLocalCenter());
    var f = b.GetTransform();
    c.GetTransform();
    d = b.m_xf.R;
    var g = this.m_localAnchor1.x - this.m_localCenterA.x, h = this.m_localAnchor1.y - this.m_localCenterA.y, e = d.col1.x * g + d.col2.x * h, h = d.col1.y * g + d.col2.y * h, g = e;
    d = c.m_xf.R;
    var i = this.m_localAnchor2.x - this.m_localCenterB.x, j = this.m_localAnchor2.y - this.m_localCenterB.y, e = d.col1.x * i + d.col2.x * j, j = d.col1.y * i + d.col2.y * j, i = e;
    d = c.m_sweep.c.x + i - b.m_sweep.c.x - g;
    e = c.m_sweep.c.y + j - b.m_sweep.c.y - h;
    this.m_invMassA = b.m_invMass;
    this.m_invMassB = c.m_invMass;
    this.m_invIA = b.m_invI;
    this.m_invIB = c.m_invI;
    this.m_axis.SetV(Box2D.Common.Math.b2Math.MulMV(f.R, this.m_localXAxis1));
    this.m_a1 = (d + g) * this.m_axis.y - (e + h) * this.m_axis.x;
    this.m_a2 = i * this.m_axis.y - j * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0;
    this.m_perp.SetV(Box2D.Common.Math.b2Math.MulMV(f.R, this.m_localYAxis1));
    this.m_s1 = (d + g) * this.m_perp.y - (e + h) * this.m_perp.x;
    this.m_s2 = i * this.m_perp.y - j * this.m_perp.x;
    f = this.m_invMassA;
    g = this.m_invMassB;
    h = this.m_invIA;
    i = this.m_invIB;
    this.m_K.col1.x = f + g + h * this.m_s1 * this.m_s1 + i * this.m_s2 * this.m_s2;
    this.m_K.col1.y = h * this.m_s1 * this.m_a1 + i * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = f + g + h * this.m_a1 * this.m_a1 + i * this.m_a2 * this.m_a2;
    this.m_enableLimit ? (d = this.m_axis.x * d + this.m_axis.y * e, Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Common.b2Settings.b2_linearSlop ? this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits : d <= this.m_lowerTranslation ? this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit && (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit, this.m_impulse.y = 0) : d >= this.m_upperTranslation ? this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
        (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit, this.m_impulse.y = 0) : (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_impulse.y = 0)) : this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    !1 == this.m_enableMotor && (this.m_motorImpulse = 0);
    a.warmStarting ? (this.m_impulse.x *= a.dtRatio, this.m_impulse.y *= a.dtRatio, this.m_motorImpulse *= a.dtRatio, a = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x, d = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y, e = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1, f = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2, b.m_linearVelocity.x -=
        this.m_invMassA * a, b.m_linearVelocity.y -= this.m_invMassA * d, b.m_angularVelocity -= this.m_invIA * e, c.m_linearVelocity.x += this.m_invMassB * a, c.m_linearVelocity.y += this.m_invMassB * d, c.m_angularVelocity += this.m_invIB * f) : (this.m_impulse.SetZero(), this.m_motorImpulse = 0)
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d = b.m_linearVelocity, e = b.m_angularVelocity, f = c.m_linearVelocity, g = c.m_angularVelocity, h = 0, i = 0, j = 0, k = 0;
    this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits && (k = this.m_motorMass * (this.m_motorSpeed - (this.m_axis.x * (f.x - d.x) + this.m_axis.y * (f.y - d.y) + this.m_a2 * g - this.m_a1 * e)), h = this.m_motorImpulse, a = a.dt * this.m_maxMotorForce, this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + k, -a, a), k = this.m_motorImpulse - h, h = k * this.m_axis.x, i = k * this.m_axis.y, j = k * this.m_a1, k *= this.m_a2, d.x -= this.m_invMassA *
        h, d.y -= this.m_invMassA * i, e -= this.m_invIA * j, f.x += this.m_invMassB * h, f.y += this.m_invMassB * i, g += this.m_invIB * k);
    i = this.m_perp.x * (f.x - d.x) + this.m_perp.y * (f.y - d.y) + this.m_s2 * g - this.m_s1 * e;
    this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit ? (a = this.m_axis.x * (f.x - d.x) + this.m_axis.y * (f.y - d.y) + this.m_a2 * g - this.m_a1 * e, h = this.m_impulse.Copy(), j = Box2D.Common.Math.b2Vec2.Get(0, 0), a = this.m_K.Solve(j, -i, -a), Box2D.Common.Math.b2Vec2.Free(j), this.m_impulse.Add(a), this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit ? this.m_impulse.y = Math.max(this.m_impulse.y, 0) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
        (this.m_impulse.y = Math.min(this.m_impulse.y, 0)), i = -i - (this.m_impulse.y - h.y) * this.m_K.col2.x, j = 0, j = 0 != this.m_K.col1.x ? i / this.m_K.col1.x + h.x : h.x, this.m_impulse.x = j, a.x = this.m_impulse.x - h.x, a.y = this.m_impulse.y - h.y, Box2D.Common.Math.b2Vec2.Free(h), h = a.x * this.m_perp.x + a.y * this.m_axis.x, i = a.x * this.m_perp.y + a.y * this.m_axis.y, j = a.x * this.m_s1 + a.y * this.m_a1, k = a.x * this.m_s2 + a.y * this.m_a2) : (a = 0, a = 0 != this.m_K.col1.x ? -i /
        this.m_K.col1.x : 0, this.m_impulse.x += a, h = a * this.m_perp.x, i = a * this.m_perp.y, j = a * this.m_s1, k = a * this.m_s2);
    d.x -= this.m_invMassA * h;
    d.y -= this.m_invMassA * i;
    e -= this.m_invIA * j;
    f.x += this.m_invMassB * h;
    f.y += this.m_invMassB * i;
    g += this.m_invIB * k;
    b.m_linearVelocity.SetV(d);
    b.m_angularVelocity = e;
    c.m_linearVelocity.SetV(f);
    c.m_angularVelocity = g
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SolvePositionConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = a.m_sweep.c, d = a.m_sweep.a, e = b.m_sweep.c, f = b.m_sweep.a, g, h = 0, i = 0, j = 0, k = 0, l = g = 0, n = 0, i = !1, m = 0, o = Box2D.Common.Math.b2Mat22.FromAngle(d), j = Box2D.Common.Math.b2Mat22.FromAngle(f);
    g = o;
    var n = this.m_localAnchor1.x - this.m_localCenterA.x, p = this.m_localAnchor1.y - this.m_localCenterA.y, h = g.col1.x * n + g.col2.x * p, p = g.col1.y * n + g.col2.y * p, n = h;
    g = j;
    j = this.m_localAnchor2.x - this.m_localCenterB.x;
    k = this.m_localAnchor2.y - this.m_localCenterB.y;
    h = g.col1.x * j + g.col2.x * k;
    k = g.col1.y * j + g.col2.y * k;
    j = h;
    g = e.x + j - c.x - n;
    h = e.y + k - c.y - p;
    if (this.m_enableLimit)
    {
        this.m_axis = Box2D.Common.Math.b2Math.MulMV(o, this.m_localXAxis1);
        this.m_a1 = (g + n) * this.m_axis.y - (h + p) * this.m_axis.x;
        this.m_a2 = j * this.m_axis.y - k * this.m_axis.x;
        var q = this.m_axis.x * g + this.m_axis.y * h;
        Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Common.b2Settings.b2_linearSlop ? (m = Box2D.Common.Math.b2Math.Clamp(q, -Box2D.Common.b2Settings.b2_maxLinearCorrection, Box2D.Common.b2Settings.b2_maxLinearCorrection), l = Math.abs(q), i = !0) : q <= this.m_lowerTranslation ? (m = Box2D.Common.Math.b2Math.Clamp(q - this.m_lowerTranslation + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), l = this.m_lowerTranslation - q, i = !0) :
            q >= this.m_upperTranslation && (m = Box2D.Common.Math.b2Math.Clamp(q - this.m_upperTranslation + Box2D.Common.b2Settings.b2_linearSlop, 0, Box2D.Common.b2Settings.b2_maxLinearCorrection), l = q - this.m_upperTranslation, i = !0)
    }
    this.m_perp = Box2D.Common.Math.b2Math.MulMV(o, this.m_localYAxis1);
    this.m_s1 = (g + n) * this.m_perp.y - (h + p) * this.m_perp.x;
    this.m_s2 = j * this.m_perp.y - k * this.m_perp.x;
    o = Box2D.Common.Math.b2Vec2.Get(0, 0);
    p = this.m_perp.x * g + this.m_perp.y * h;
    l = Math.max(l, Math.abs(p));
    n = 0;
    i ? (i = this.m_invMassA, j = this.m_invMassB, k = this.m_invIA, g = this.m_invIB, this.m_K.col1.x = i + j + k * this.m_s1 * this.m_s1 + g * this.m_s2 * this.m_s2, this.m_K.col1.y = k * this.m_s1 * this.m_a1 + g * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = i + j + k * this.m_a1 * this.m_a1 + g * this.m_a2 * this.m_a2, this.m_K.Solve(o, -p, -m)) : (i = this.m_invMassA, j = this.m_invMassB, k = this.m_invIA, g = this.m_invIB, m = i + j + k * this.m_s1 * this.m_s1 +
        g * this.m_s2 * this.m_s2, o.x = 0 != m ? -p / m : 0, o.y = 0);
    m = o.x * this.m_perp.x + o.y * this.m_axis.x;
    i = o.x * this.m_perp.y + o.y * this.m_axis.y;
    p = o.x * this.m_s1 + o.y * this.m_a1;
    o = o.x * this.m_s2 + o.y * this.m_a2;
    c.x -= this.m_invMassA * m;
    c.y -= this.m_invMassA * i;
    d -= this.m_invIA * p;
    e.x += this.m_invMassB * m;
    e.y += this.m_invMassB * i;
    f += this.m_invIB * o;
    a.m_sweep.a = d;
    b.m_sweep.a = f;
    a.SynchronizeTransform();
    b.SynchronizeTransform();
    return l <= Box2D.Common.b2Settings.b2_linearSlop && n <= Box2D.Common.b2Settings.b2_angularSlop
};
Box2D.Dynamics.Joints.b2JointDef = function ()
{
    this.type = Box2D.Dynamics.Joints.b2Joint.e_unknownJoint;
    this.bodyB = this.bodyA = null;
    this.collideConnected = !1
};
Box2D.Dynamics.Joints.b2LineJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAxisA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_lineJoint;
    this.localAxisA.Set(1, 0);
    this.enableLimit = !1;
    this.upperTranslation = this.lowerTranslation = 0;
    this.enableMotor = !1;
    this.motorSpeed = this.maxMotorForce = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2LineJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2LineJointDef.prototype.Initialize = function (a, b, c, d)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA = this.bodyA.GetLocalPoint(c);
    this.localAnchorB = this.bodyB.GetLocalPoint(c);
    this.localAxisA = this.bodyA.GetLocalVector(d)
};
Box2D.Dynamics.Joints.b2LineJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2LineJoint(this)
};
Box2D.Collision = {};
Box2D.Collision.b2DistanceProxy = function ()
{

    this.m_radius = this.m_count = 0;
    this.m_vertices = []
};
Box2D.Collision.b2DistanceProxy.prototype.SetValues = function (a, b, c)
{
    this.m_count = a;
    this.m_radius = b;
    this.m_vertices = c
};
Box2D.Collision.b2DistanceProxy.prototype.Set = function (a)
{
    a.SetDistanceProxy(this)
};
Box2D.Collision.b2DistanceProxy.prototype.GetSupport = function (a)
{
    for (var b = 0, c = this.m_vertices[0].x * a.x + this.m_vertices[0].y * a.y, d = 1; d < this.m_count; d++)
    {
        var e = this.m_vertices[d].x * a.x + this.m_vertices[d].y * a.y;
        e > c && (b = d, c = e)
    }
    return b
};
Box2D.Collision.b2DistanceProxy.prototype.GetSupportVertex = function (a)
{
    return this.m_vertices[this.GetSupport(a)]
};
Box2D.Collision.b2DistanceProxy.prototype.GetVertexCount = function ()
{
    return this.m_count
};
Box2D.Collision.b2DistanceProxy.prototype.GetVertex = function (a)
{
    void 0 === a && (a = 0);
    Box2D.Common.b2Settings.b2Assert(0 <= a && a < this.m_count);
    return this.m_vertices[a]
};
Box2D.Common.Math.b2Sweep = function ()
{

    this.localCenter = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.c0 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.c = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.t0 = this.a = this.a0 = null
};
Box2D.Common.Math.b2Sweep.prototype.Set = function (a)
{
    this.localCenter.SetV(a.localCenter);
    this.c0.SetV(a.c0);
    this.c.SetV(a.c);
    this.a0 = a.a0;
    this.a = a.a;
    this.t0 = a.t0
};
Box2D.Common.Math.b2Sweep.prototype.Copy = function ()
{
    var a = new Box2D.Common.Math.b2Sweep;
    a.localCenter.SetV(this.localCenter);
    a.c0.SetV(this.c0);
    a.c.SetV(this.c);
    a.a0 = this.a0;
    a.a = this.a;
    a.t0 = this.t0;
    return a
};
Box2D.Common.Math.b2Sweep.prototype.GetTransform = function (a, b)
{
    void 0 === b && (b = 0);
    a.position.x = (1 - b) * this.c0.x + b * this.c.x;
    a.position.y = (1 - b) * this.c0.y + b * this.c.y;
    a.R.Set((1 - b) * this.a0 + b * this.a);
    var c = a.R;
    a.position.x -= c.col1.x * this.localCenter.x + c.col2.x * this.localCenter.y;
    a.position.y -= c.col1.y * this.localCenter.x + c.col2.y * this.localCenter.y
};
Box2D.Common.Math.b2Sweep.prototype.Advance = function (a)
{
    void 0 === a && (a = 0);
    if (this.t0 < a && 1 - this.t0 > Number.MIN_VALUE)
    {
        var b = (a - this.t0) / (1 - this.t0);
        this.c0.x = (1 - b) * this.c0.x + b * this.c.x;
        this.c0.y = (1 - b) * this.c0.y + b * this.c.y;
        this.a0 = (1 - b) * this.a0 + b * this.a;
        this.t0 = a
    }
};
Box2D.Collision.b2TOIInput = function ()
{

    this.proxyA = new Box2D.Collision.b2DistanceProxy;
    this.proxyB = new Box2D.Collision.b2DistanceProxy;
    this.sweepA = new Box2D.Common.Math.b2Sweep;
    this.sweepB = new Box2D.Common.Math.b2Sweep
};
Box2D.Common.Math.b2Vec3 = function (a, b, c)
{

    this.x = a;
    this.y = b;
    this.z = c
};
Box2D.Common.Math.b2Vec3._freeCache = [];
Box2D.Common.Math.b2Vec3.Get = function (a, b, c)
{

    if (0 < Box2D.Common.Math.b2Vec3._freeCache.length)
    {
        var d = Box2D.Common.Math.b2Vec3._freeCache.pop();
        d.Set(a, b, c);
        return d
    }
    return new Box2D.Common.Math.b2Vec3(a, b, c)
};
Box2D.Common.Math.b2Vec3.Free = function (a)
{
    null != a && ( Box2D.Common.Math.b2Vec3._freeCache.push(a))
};
Box2D.Common.Math.b2Vec3.prototype.SetZero = function ()
{
    this.z = this.y = this.x = 0
};
Box2D.Common.Math.b2Vec3.prototype.Set = function (a, b, c)
{
    this.x = a;
    this.y = b;
    this.z = c
};
Box2D.Common.Math.b2Vec3.prototype.SetV = function (a)
{
    this.x = a.x;
    this.y = a.y;
    this.z = a.z
};
Box2D.Common.Math.b2Vec3.prototype.GetNegative = function ()
{
    return Box2D.Common.Math.b2Vec3.Get(-this.x, -this.y, -this.z)
};
Box2D.Common.Math.b2Vec3.prototype.NegativeSelf = function ()
{
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z
};
Box2D.Common.Math.b2Vec3.prototype.Copy = function ()
{
    return Box2D.Common.Math.b2Vec3.Get(this.x, this.y, this.z)
};
Box2D.Common.Math.b2Vec3.prototype.Add = function (a)
{
    this.x += a.x;
    this.y += a.y;
    this.z += a.z
};
Box2D.Common.Math.b2Vec3.prototype.Subtract = function (a)
{
    this.x -= a.x;
    this.y -= a.y;
    this.z -= a.z
};
Box2D.Common.Math.b2Vec3.prototype.Multiply = function (a)
{
    this.x *= a;
    this.y *= a;
    this.z *= a
};
Box2D.Common.Math.b2Mat33 = function (a, b, c)
{

    this.col1 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.col2 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.col3 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    a && this.col1.SetV(a);
    b && this.col2.SetV(b);
    c && this.col3.SetV(c)
};
Box2D.Common.Math.b2Mat33.prototype.SetVVV = function (a, b, c)
{
    this.col1.SetV(a);
    this.col2.SetV(b);
    this.col3.SetV(c)
};
Box2D.Common.Math.b2Mat33.prototype.Copy = function ()
{
    return new Box2D.Common.Math.b2Mat33(this.col1, this.col2, this.col3)
};
Box2D.Common.Math.b2Mat33.prototype.SetM = function (a)
{
    this.col1.SetV(a.col1);
    this.col2.SetV(a.col2);
    this.col3.SetV(a.col3)
};
Box2D.Common.Math.b2Mat33.prototype.AddM = function (a)
{
    this.col1.x += a.col1.x;
    this.col1.y += a.col1.y;
    this.col1.z += a.col1.z;
    this.col2.x += a.col2.x;
    this.col2.y += a.col2.y;
    this.col2.z += a.col2.z;
    this.col3.x += a.col3.x;
    this.col3.y += a.col3.y;
    this.col3.z += a.col3.z
};
Box2D.Common.Math.b2Mat33.prototype.SetIdentity = function ()
{
    this.col1.Set(1, 0, 0);
    this.col2.Set(0, 1, 0);
    this.col3.Set(0, 0, 1)
};
Box2D.Common.Math.b2Mat33.prototype.SetZero = function ()
{
    this.col1.Set(0, 0, 0);
    this.col2.Set(0, 0, 0);
    this.col3.Set(0, 0, 0)
};
Box2D.Common.Math.b2Mat33.prototype.Solve22 = function (a, b, c)
{
    var d = this.col1.x, e = this.col2.x, f = this.col1.y, g = this.col2.y, h = d * g - e * f;
    0 != h && (h = 1 / h);
    a.x = h * (g * b - e * c);
    a.y = h * (d * c - f * b);
    return a
};
Box2D.Common.Math.b2Mat33.prototype.Solve33 = function (a, b, c, d)
{
    var e = this.col1.x, f = this.col1.y, g = this.col1.z, h = this.col2.x, i = this.col2.y, j = this.col2.z, k = this.col3.x, l = this.col3.y, n = this.col3.z, m = e * (i * n - j * l) + f * (j * k - h * n) + g * (h * l - i * k);
    0 != m && (m = 1 / m);
    a.x = m * (b * (i * n - j * l) + c * (j * k - h * n) + d * (h * l - i * k));
    a.y = m * (e * (c * n - d * l) + f * (d * k - b * n) + g * (b * l - c * k));
    a.z = m * (e * (i * d - j * c) + f * (j * b - h * d) + g * (h * c - i * b));
    return a
};
Box2D.Dynamics.Joints.b2PrismaticJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localXAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localYAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_perp = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_K = new Box2D.Common.Math.b2Mat33;
    this.m_impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_localXAxis1.SetV(a.localAxisA);
    this.m_localYAxis1.x = -this.m_localXAxis1.y;
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_refAngle = a.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorImpulse = this.m_motorMass = 0;
    this.m_lowerTranslation = a.lowerTranslation;
    this.m_upperTranslation = a.upperTranslation;
    this.m_maxMotorForce = a.maxMotorForce;
    this.m_motorSpeed = a.motorSpeed;
    this.m_enableLimit = a.enableLimit;
    this.m_enableMotor = a.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero()
};
goog.inherits(Box2D.Dynamics.Joints.b2PrismaticJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), a * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y))
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    return a * this.m_impulse.y
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetJointTranslation = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = a.GetWorldPoint(this.m_localAnchor1), d = b.GetWorldPoint(this.m_localAnchor2), b = d.x - c.x, e = d.y - c.y;
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(d);
    a = a.GetWorldVector(this.m_localXAxis1);
    c = a.x * b + a.y * e;
    Box2D.Common.Math.b2Vec2.Free(a);
    return c
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetJointSpeed = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c;
    c = a.m_xf.R;
    var d = this.m_localAnchor1.x - a.m_sweep.localCenter.x, e = this.m_localAnchor1.y - a.m_sweep.localCenter.y, f = c.col1.x * d + c.col2.x * e, e = c.col1.y * d + c.col2.y * e, d = f;
    c = b.m_xf.R;
    var g = this.m_localAnchor2.x - b.m_sweep.localCenter.x, h = this.m_localAnchor2.y - b.m_sweep.localCenter.y, f = c.col1.x * g + c.col2.x * h, h = c.col1.y * g + c.col2.y * h, g = f, f = b.m_sweep.c.x + g - (a.m_sweep.c.x + d), i = b.m_sweep.c.y + h - (a.m_sweep.c.y + e);
    c = a.GetWorldVector(this.m_localXAxis1);
    var j = a.m_linearVelocity, k = b.m_linearVelocity, a = a.m_angularVelocity, b = b.m_angularVelocity, d = f * -a * c.y + i * a * c.x + (c.x * (k.x + -b * h - j.x - -a * e) + c.y * (k.y + b * g - j.y - a * d));
    Box2D.Common.Math.b2Vec2.Free(c);
    return d
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.IsLimitEnabled = function ()
{
    return this.m_enableLimit
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.EnableLimit = function (a)
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_enableLimit = a
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetLowerLimit = function ()
{
    return this.m_lowerTranslation
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetUpperLimit = function ()
{
    return this.m_upperTranslation
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetLimits = function (a, b)
{
    void 0 === a && (a = 0);
    void 0 === b && (b = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_lowerTranslation = a;
    this.m_upperTranslation = b
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.IsMotorEnabled = function ()
{
    return this.m_enableMotor
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.EnableMotor = function (a)
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_enableMotor = a
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetMotorSpeed = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_motorSpeed = a
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetMotorSpeed = function ()
{
    return this.m_motorSpeed
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetMaxMotorForce = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_maxMotorForce = a
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetMotorForce = function ()
{
    return this.m_motorImpulse
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d, e = 0;
    this.m_localCenterA.SetV(b.GetLocalCenter());
    this.m_localCenterB.SetV(c.GetLocalCenter());
    var f = b.GetTransform();
    d = b.m_xf.R;
    var g = this.m_localAnchor1.x - this.m_localCenterA.x, h = this.m_localAnchor1.y - this.m_localCenterA.y, e = d.col1.x * g + d.col2.x * h, h = d.col1.y * g + d.col2.y * h, g = e;
    d = c.m_xf.R;
    var i = this.m_localAnchor2.x - this.m_localCenterB.x, j = this.m_localAnchor2.y - this.m_localCenterB.y, e = d.col1.x * i + d.col2.x * j, j = d.col1.y * i + d.col2.y * j, i = e;
    d = c.m_sweep.c.x + i - b.m_sweep.c.x - g;
    e = c.m_sweep.c.y + j - b.m_sweep.c.y - h;
    this.m_invMassA = b.m_invMass;
    this.m_invMassB = c.m_invMass;
    this.m_invIA = b.m_invI;
    this.m_invIB = c.m_invI;
    var k = Box2D.Common.Math.b2Math.MulMV(f.R, this.m_localXAxis1);
    this.m_axis.SetV(k);
    Box2D.Common.Math.b2Vec2.Free(k);
    this.m_a1 = (d + g) * this.m_axis.y - (e + h) * this.m_axis.x;
    this.m_a2 = i * this.m_axis.y - j * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    this.m_motorMass > Number.MIN_VALUE && (this.m_motorMass = 1 / this.m_motorMass);
    f = Box2D.Common.Math.b2Math.MulMV(f.R, this.m_localYAxis1);
    this.m_perp.SetV(f);
    Box2D.Common.Math.b2Vec2.Free(f);
    this.m_s1 = (d + g) * this.m_perp.y - (e + h) * this.m_perp.x;
    this.m_s2 = i * this.m_perp.y - j * this.m_perp.x;
    g = this.m_invMassA;
    h = this.m_invMassB;
    i = this.m_invIA;
    j = this.m_invIB;
    this.m_K.col1.x = g + h + i * this.m_s1 * this.m_s1 + j * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i * this.m_s1 + j * this.m_s2;
    this.m_K.col1.z = i * this.m_s1 * this.m_a1 + j * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i + j;
    this.m_K.col2.z = i * this.m_a1 + j * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = g + h + i * this.m_a1 * this.m_a1 + j * this.m_a2 * this.m_a2;
    this.m_enableLimit ? (d = this.m_axis.x * d + this.m_axis.y * e, Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Common.b2Settings.b2_linearSlop ? this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits : d <= this.m_lowerTranslation ? this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit && (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit, this.m_impulse.z = 0) : d >= this.m_upperTranslation ? this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
        (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit, this.m_impulse.z = 0) : (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_impulse.z = 0)) : this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    !1 == this.m_enableMotor && (this.m_motorImpulse = 0);
    a.warmStarting ? (this.m_impulse.x *= a.dtRatio, this.m_impulse.y *= a.dtRatio, this.m_motorImpulse *= a.dtRatio, a = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x, d = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y, e = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1, g = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) *
        this.m_a2, b.m_linearVelocity.x -= this.m_invMassA * a, b.m_linearVelocity.y -= this.m_invMassA * d, b.m_angularVelocity -= this.m_invIA * e, c.m_linearVelocity.x += this.m_invMassB * a, c.m_linearVelocity.y += this.m_invMassB * d, c.m_angularVelocity += this.m_invIB * g) : (this.m_impulse.SetZero(), this.m_motorImpulse = 0)
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d = b.m_linearVelocity, e = b.m_angularVelocity, f = c.m_linearVelocity, g = c.m_angularVelocity, h = 0, i = 0, j = 0, k = 0;
    this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits && (k = this.m_motorMass * (this.m_motorSpeed - (this.m_axis.x * (f.x - d.x) + this.m_axis.y * (f.y - d.y) + this.m_a2 * g - this.m_a1 * e)), h = this.m_motorImpulse, a = a.dt * this.m_maxMotorForce, this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + k, -a, a), k = this.m_motorImpulse - h, h = k * this.m_axis.x, i = k * this.m_axis.y, j = k * this.m_a1, k *= this.m_a2, d.x -= this.m_invMassA *
        h, d.y -= this.m_invMassA * i, e -= this.m_invIA * j, f.x += this.m_invMassB * h, f.y += this.m_invMassB * i, g += this.m_invIB * k);
    j = this.m_perp.x * (f.x - d.x) + this.m_perp.y * (f.y - d.y) + this.m_s2 * g - this.m_s1 * e;
    i = g - e;
    this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit ? (k = this.m_axis.x * (f.x - d.x) + this.m_axis.y * (f.y - d.y) + this.m_a2 * g - this.m_a1 * e, h = this.m_impulse.Copy(), a = Box2D.Common.Math.b2Vec3.Get(0, 0, 0), this.m_K.Solve33(a, -j, -i, -k), this.m_impulse.Add(a), this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit ? this.m_impulse.z = Math.max(this.m_impulse.z, 0) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
        (this.m_impulse.z = Math.min(this.m_impulse.z, 0)), j = -j - (this.m_impulse.z - h.z) * this.m_K.col3.x, i = -i - (this.m_impulse.z - h.z) * this.m_K.col3.y, k = Box2D.Common.Math.b2Vec2.Get(0, 0), this.m_K.Solve22(k, j, i), k.x += h.x, k.y += h.y, this.m_impulse.x = k.x, this.m_impulse.y = k.y, Box2D.Common.Math.b2Vec2.Free(k), a.x = this.m_impulse.x - h.x, a.y = this.m_impulse.y - h.y, a.z = this.m_impulse.z - h.z, h = a.x * this.m_perp.x + a.z * this.m_axis.x, i = a.x * this.m_perp.y + a.z *
        this.m_axis.y, j = a.x * this.m_s1 + a.y + a.z * this.m_a1, k = a.x * this.m_s2 + a.y + a.z * this.m_a2, Box2D.Common.Math.b2Vec3.Free(a)) : (a = Box2D.Common.Math.b2Vec2.Get(0, 0), this.m_K.Solve22(a, -j, -i), this.m_impulse.x += a.x, this.m_impulse.y += a.y, h = a.x * this.m_perp.x, i = a.x * this.m_perp.y, j = a.x * this.m_s1 + a.y, k = a.x * this.m_s2 + a.y, Box2D.Common.Math.b2Vec2.Free(a));
    d.x -= this.m_invMassA * h;
    d.y -= this.m_invMassA * i;
    e -= this.m_invIA * j;
    f.x += this.m_invMassB * h;
    f.y += this.m_invMassB * i;
    g += this.m_invIB * k;
    b.m_linearVelocity.SetV(d);
    b.m_angularVelocity = e;
    c.m_linearVelocity.SetV(f);
    c.m_angularVelocity = g
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SolvePositionConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = a.m_sweep.c, d = a.m_sweep.a, e = b.m_sweep.c, f = b.m_sweep.a, g = 0, h = 0, i = 0, j = g = 0, k = 0, l = 0, h = !1, n = 0, m = Box2D.Common.Math.b2Mat22.FromAngle(d), l = this.m_localAnchor1.x - this.m_localCenterA.x, o = this.m_localAnchor1.y - this.m_localCenterA.y, g = m.col1.x * l + m.col2.x * o, o = m.col1.y * l + m.col2.y * o;
    Box2D.Common.Math.b2Mat22.Free(m);
    var l = g, j = Box2D.Common.Math.b2Mat22.FromAngle(f), p = this.m_localAnchor2.x - this.m_localCenterB.x, i = this.m_localAnchor2.y - this.m_localCenterB.y, g = j.col1.x * p + j.col2.x * i, i = j.col1.y * p + j.col2.y * i;
    Box2D.Common.Math.b2Mat22.Free(j);
    p = g;
    g = e.x + p - c.x - l;
    j = e.y + i - c.y - o;
    if (this.m_enableLimit)
    {
        Box2D.Common.Math.b2Vec2.Free(this.m_axis);
        this.m_axis = Box2D.Common.Math.b2Math.MulMV(m, this.m_localXAxis1);
        this.m_a1 = (g + l) * this.m_axis.y - (j + o) * this.m_axis.x;
        this.m_a2 = p * this.m_axis.y - i * this.m_axis.x;
        var q = this.m_axis.x * g + this.m_axis.y * j;
        Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Common.b2Settings.b2_linearSlop ? (n = Box2D.Common.Math.b2Math.Clamp(q, -Box2D.Common.b2Settings.b2_maxLinearCorrection, Box2D.Common.b2Settings.b2_maxLinearCorrection), k = Math.abs(q), h = !0) : q <= this.m_lowerTranslation ? (n = Box2D.Common.Math.b2Math.Clamp(q - this.m_lowerTranslation + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), k = this.m_lowerTranslation - q, h = !0) :
            q >= this.m_upperTranslation && (n = Box2D.Common.Math.b2Math.Clamp(q - this.m_upperTranslation + Box2D.Common.b2Settings.b2_linearSlop, 0, Box2D.Common.b2Settings.b2_maxLinearCorrection), k = q - this.m_upperTranslation, h = !0)
    }
    Box2D.Common.Math.b2Vec2.Free(this.m_perp);
    this.m_perp = Box2D.Common.Math.b2Math.MulMV(m, this.m_localYAxis1);
    this.m_s1 = (g + l) * this.m_perp.y - (j + o) * this.m_perp.x;
    this.m_s2 = p * this.m_perp.y - i * this.m_perp.x;
    m = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    o = this.m_perp.x * g + this.m_perp.y * j;
    p = f - d - this.m_refAngle;
    k = Math.max(k, Math.abs(o));
    l = Math.abs(p);
    h ? (h = this.m_invMassA, i = this.m_invMassB, g = this.m_invIA, j = this.m_invIB, this.m_K.col1.x = h + i + g * this.m_s1 * this.m_s1 + j * this.m_s2 * this.m_s2, this.m_K.col1.y = g * this.m_s1 + j * this.m_s2, this.m_K.col1.z = g * this.m_s1 * this.m_a1 + j * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = g + j, this.m_K.col2.z = g * this.m_a1 + j * this.m_a2, this.m_K.col3.x = this.m_K.col1.z, this.m_K.col3.y = this.m_K.col2.z, this.m_K.col3.z = h + i + g * this.m_a1 *
        this.m_a1 + j * this.m_a2 * this.m_a2, this.m_K.Solve33(m, -o, -p, -n)) : (h = this.m_invMassA, i = this.m_invMassB, g = this.m_invIA, j = this.m_invIB, n = g * this.m_s1 + j * this.m_s2, q = g + j, this.m_K.col1.Set(h + i + g * this.m_s1 * this.m_s1 + j * this.m_s2 * this.m_s2, n, 0), this.m_K.col2.Set(n, q, 0), n = Box2D.Common.Math.b2Vec2.Get(0, 0), this.m_K.Solve22(n, -o, -p), m.x = n.x, m.y = n.y, Box2D.Common.Math.b2Vec2.Free(n), m.z = 0);
    n = m.x * this.m_perp.x + m.z * this.m_axis.x;
    h = m.x * this.m_perp.y + m.z * this.m_axis.y;
    o = m.x * this.m_s1 + m.y + m.z * this.m_a1;
    p = m.x * this.m_s2 + m.y + m.z * this.m_a2;
    Box2D.Common.Math.b2Vec3.Free(m);
    c.x -= this.m_invMassA * n;
    c.y -= this.m_invMassA * h;
    d -= this.m_invIA * o;
    e.x += this.m_invMassB * n;
    e.y += this.m_invMassB * h;
    f += this.m_invIB * p;
    a.m_sweep.a = d;
    b.m_sweep.a = f;
    a.SynchronizeTransform();
    b.SynchronizeTransform();
    return k <= Box2D.Common.b2Settings.b2_linearSlop && l <= Box2D.Common.b2Settings.b2_angularSlop
};
Box2D.Dynamics.Joints.b2PrismaticJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAxisA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_prismaticJoint;
    this.localAxisA.Set(1, 0);
    this.referenceAngle = 0;
    this.enableLimit = !1;
    this.upperTranslation = this.lowerTranslation = 0;
    this.enableMotor = !1;
    this.motorSpeed = this.maxMotorForce = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2PrismaticJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2PrismaticJointDef.prototype.Initialize = function (a, b, c, d)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA = this.bodyA.GetLocalPoint(c);
    this.localAnchorB = this.bodyB.GetLocalPoint(c);
    this.localAxisA = this.bodyA.GetLocalVector(d);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
Box2D.Dynamics.Joints.b2PrismaticJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2PrismaticJoint(this)
};
Box2D.Dynamics.Joints.b2WeldJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat33;
    this.m_localAnchorA.SetV(a.localAnchorA);
    this.m_localAnchorB.SetV(a.localAnchorB);
    this.m_referenceAngle = a.referenceAngle
};
goog.inherits(Box2D.Dynamics.Joints.b2WeldJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetReactionForce = function (a)
{
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse.x, a * this.m_impulse.y)
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetReactionTorque = function (a)
{
    return a * this.m_impulse.z
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.InitVelocityConstraints = function (a)
{
    var b, c = 0, d = this.m_bodyA, e = this.m_bodyB;
    b = d.m_xf.R;
    var f = this.m_localAnchorA.x - d.m_sweep.localCenter.x, g = this.m_localAnchorA.y - d.m_sweep.localCenter.y, c = b.col1.x * f + b.col2.x * g, g = b.col1.y * f + b.col2.y * g, f = c;
    b = e.m_xf.R;
    var h = this.m_localAnchorB.x - e.m_sweep.localCenter.x, i = this.m_localAnchorB.y - e.m_sweep.localCenter.y, c = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = c;
    b = d.m_invMass;
    var c = e.m_invMass, j = d.m_invI, k = e.m_invI;
    this.m_mass.col1.x = b + c + g * g * j + i * i * k;
    this.m_mass.col2.x = -g * f * j - i * h * k;
    this.m_mass.col3.x = -g * j - i * k;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = b + c + f * f * j + h * h * k;
    this.m_mass.col3.y = f * j + h * k;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = j + k;
    a.warmStarting ? (this.m_impulse.x *= a.dtRatio, this.m_impulse.y *= a.dtRatio, this.m_impulse.z *= a.dtRatio, d.m_linearVelocity.x -= b * this.m_impulse.x, d.m_linearVelocity.y -= b * this.m_impulse.y, d.m_angularVelocity -= j * (f * this.m_impulse.y - g * this.m_impulse.x + this.m_impulse.z), e.m_linearVelocity.x += c * this.m_impulse.x, e.m_linearVelocity.y += c * this.m_impulse.y, e.m_angularVelocity += k * (h * this.m_impulse.y - i * this.m_impulse.x + this.m_impulse.z)) : this.m_impulse.SetZero()
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.SolveVelocityConstraints = function ()
{
    var a, b = 0, c = this.m_bodyA, d = this.m_bodyB, e = c.m_linearVelocity, f = c.m_angularVelocity, g = d.m_linearVelocity, h = d.m_angularVelocity, i = c.m_invMass, j = d.m_invMass, k = c.m_invI, l = d.m_invI;
    a = c.m_xf.R;
    var n = this.m_localAnchorA.x - c.m_sweep.localCenter.x, m = this.m_localAnchorA.y - c.m_sweep.localCenter.y, b = a.col1.x * n + a.col2.x * m, m = a.col1.y * n + a.col2.y * m, n = b;
    a = d.m_xf.R;
    var o = this.m_localAnchorB.x - d.m_sweep.localCenter.x, p = this.m_localAnchorB.y - d.m_sweep.localCenter.y, b = a.col1.x * o + a.col2.x * p, p = a.col1.y * o + a.col2.y * p, o = b;
    a = g.x - h * p - e.x + f * m;
    var b = g.y + h * o - e.y - f * n, q = h - f, r = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass.Solve33(r, -a, -b, -q);
    this.m_impulse.Add(r);
    e.x -= i * r.x;
    e.y -= i * r.y;
    f -= k * (n * r.y - m * r.x + r.z);
    g.x += j * r.x;
    g.y += j * r.y;
    h += l * (o * r.y - p * r.x + r.z);
    Box2D.Common.Math.b2Vec3.Free(r);
    c.m_angularVelocity = f;
    d.m_angularVelocity = h
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.SolvePositionConstraints = function ()
{
    var a, b = 0, c = this.m_bodyA, d = this.m_bodyB;
    a = c.m_xf.R;
    var e = this.m_localAnchorA.x - c.m_sweep.localCenter.x, f = this.m_localAnchorA.y - c.m_sweep.localCenter.y, b = a.col1.x * e + a.col2.x * f, f = a.col1.y * e + a.col2.y * f, e = b;
    a = d.m_xf.R;
    var g = this.m_localAnchorB.x - d.m_sweep.localCenter.x, h = this.m_localAnchorB.y - d.m_sweep.localCenter.y, b = a.col1.x * g + a.col2.x * h, h = a.col1.y * g + a.col2.y * h, g = b;
    a = c.m_invMass;
    var b = d.m_invMass, i = c.m_invI, j = d.m_invI, k = d.m_sweep.c.x + g - c.m_sweep.c.x - e, l = d.m_sweep.c.y + h - c.m_sweep.c.y - f, n = d.m_sweep.a - c.m_sweep.a - this.m_referenceAngle, m = 10 * Box2D.Common.b2Settings.b2_linearSlop, o = Math.sqrt(k * k + l * l), p = Math.abs(n);
    o > m && (i *= 1, j *= 1);
    this.m_mass.col1.x = a + b + f * f * i + h * h * j;
    this.m_mass.col2.x = -f * e * i - h * g * j;
    this.m_mass.col3.x = -f * i - h * j;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = a + b + e * e * i + g * g * j;
    this.m_mass.col3.y = e * i + g * j;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = i + j;
    m = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass.Solve33(m, -k, -l, -n);
    c.m_sweep.c.x -= a * m.x;
    c.m_sweep.c.y -= a * m.y;
    c.m_sweep.a -= i * (e * m.y - f * m.x + m.z);
    d.m_sweep.c.x += b * m.x;
    d.m_sweep.c.y += b * m.y;
    d.m_sweep.a += j * (g * m.y - h * m.x + m.z);
    Box2D.Common.Math.b2Vec3.Free(m);
    c.SynchronizeTransform();
    d.SynchronizeTransform();
    return o <= Box2D.Common.b2Settings.b2_linearSlop && p <= Box2D.Common.b2Settings.b2_angularSlop
};
Box2D.Dynamics.Joints.b2WeldJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_weldJoint;
    this.referenceAngle = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2WeldJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2WeldJointDef.prototype.Initialize = function (a, b, c)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(c));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(c));
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
Box2D.Dynamics.Joints.b2WeldJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2WeldJoint(this)
};
Box2D.Collision.b2DistanceOutput = function ()
{

    this.pointA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.pointB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.distance = 0
};
Box2D.Collision.b2SimplexVertex = function ()
{

    this.wA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.wB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.w = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.indexB = this.indexA = this.a = 0
};
Box2D.Collision.b2SimplexVertex.prototype.Set = function (a)
{
    this.wA.SetV(a.wA);
    this.wB.SetV(a.wB);
    this.w.SetV(a.w);
    this.a = a.a;
    this.indexA = a.indexA;
    this.indexB = a.indexB
};
Box2D.Collision.b2Simplex = function ()
{

    this.m_v1 = new Box2D.Collision.b2SimplexVertex;
    this.m_v2 = new Box2D.Collision.b2SimplexVertex;
    this.m_v3 = new Box2D.Collision.b2SimplexVertex;
    this.m_vertices = [this.m_v1, this.m_v2, this.m_v3]
};
Box2D.Collision.b2Simplex._freeCache = [];
Box2D.Collision.b2Simplex.Get = function ()
{
    if (0 < Box2D.Collision.b2Simplex._freeCache.length)
    {
        for (var a = Box2D.Collision.b2Simplex._freeCache.pop(), b = 0; b < a.m_vertices.length; b++)
        {
            var c = a.m_vertices[b];
            null != c.wA && c.wA.Set(0, 0);
            null != c.wB && c.wB.Set(0, 0);
            null != c.w && c.w.Set(0, 0);
            c.indexA = 0;
            c.indexB = 0;
            c.a = 0
        }
        return a
    }
    return new Box2D.Collision.b2Simplex
};
Box2D.Collision.b2Simplex.Free = function (a)
{
    null != a && Box2D.Collision.b2Simplex._freeCache.push(a)
};
Box2D.Collision.b2Simplex.prototype.ReadCache = function (a, b, c, d, e)
{
    Box2D.Common.b2Settings.b2Assert(0 <= a.count && 3 >= a.count);
    var f, g;
    this.m_count = a.count;
    for (var h = this.m_vertices, i = 0; i < this.m_count; i++)
    {
        var j = h[i];
        j.indexA = a.indexA[i];
        j.indexB = a.indexB[i];
        f = b.GetVertex(j.indexA);
        g = d.GetVertex(j.indexB);
        Box2D.Common.Math.b2Vec2.Free(j.wA);
        Box2D.Common.Math.b2Vec2.Free(j.wB);
        Box2D.Common.Math.b2Vec2.Free(j.w);
        j.wA = Box2D.Common.Math.b2Math.MulX(c, f);
        j.wB = Box2D.Common.Math.b2Math.MulX(e, g);
        j.w = Box2D.Common.Math.b2Math.SubtractVV(j.wB, j.wA);
        j.a = 0
    }
    if (1 < this.m_count && (a = a.metric, f = this.GetMetric(), f < 0.5 * a || 2 * a < f || f < Number.MIN_VALUE))
    {
        this.m_count = 0
    }
    0 == this.m_count && (j = h[0], j.indexA = 0, j.indexB = 0, f = b.GetVertex(0), g = d.GetVertex(0), Box2D.Common.Math.b2Vec2.Free(j.wA), Box2D.Common.Math.b2Vec2.Free(j.wB), Box2D.Common.Math.b2Vec2.Free(j.w), j.wA = Box2D.Common.Math.b2Math.MulX(c, f), j.wB = Box2D.Common.Math.b2Math.MulX(e, g), j.w = Box2D.Common.Math.b2Math.SubtractVV(j.wB, j.wA), this.m_count = 1)
};
Box2D.Collision.b2Simplex.prototype.WriteCache = function (a)
{
    a.metric = this.GetMetric();
    a.count = this.m_count;
    for (var b = this.m_vertices, c = 0; c < this.m_count; c++)
    {
        a.indexA[c] = b[c].indexA, a.indexB[c] = b[c].indexB
    }
};
Box2D.Collision.b2Simplex.prototype.GetSearchDirection = function ()
{
    if (1 == this.m_count)
    {
        return this.m_v1.w.GetNegative()
    }
    if (2 == this.m_count)
    {
        var a = Box2D.Common.Math.b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), b = this.m_v1.w.GetNegative(), c = Box2D.Common.Math.b2Math.CrossVV(a, b);
        Box2D.Common.Math.b2Vec2.Free(b);
        b = null;
        b = 0 < c ? Box2D.Common.Math.b2Math.CrossFV(1, a) : Box2D.Common.Math.b2Math.CrossVF(a, 1);
        Box2D.Common.Math.b2Vec2.Free(a);
        return b
    }
    Box2D.Common.b2Settings.b2Assert(!1);
    return Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2Simplex.prototype.GetClosestPoint = function ()
{
    if (1 == this.m_count)
    {
        return this.m_v1.w
    }
    if (2 == this.m_count)
    {
        return Box2D.Common.Math.b2Vec2.Get(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y)
    }
    Box2D.Common.b2Settings.b2Assert(!1);
    return Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2Simplex.prototype.GetWitnessPoints = function (a, b)
{
    1 == this.m_count ? (a.SetV(this.m_v1.wA), b.SetV(this.m_v1.wB)) : 2 == this.m_count ? (a.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x, a.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y, b.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x, b.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y) : 3 == this.m_count ? (b.x = a.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x, b.y = a.y = this.m_v1.a *
        this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y) : Box2D.Common.b2Settings.b2Assert(!1)
};
Box2D.Collision.b2Simplex.prototype.GetMetric = function ()
{
    if (1 == this.m_count)
    {
        return 0
    }
    if (2 == this.m_count)
    {
        var a = Box2D.Common.Math.b2Math.SubtractVV(this.m_v1.w, this.m_v2.w), b = a.Length();
        Box2D.Common.Math.b2Vec2.Free(a);
        return b
    }
    if (3 == this.m_count)
    {
        var a = Box2D.Common.Math.b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), c = Box2D.Common.Math.b2Math.SubtractVV(this.m_v3.w, this.m_v1.w), b = Box2D.Common.Math.b2Math.CrossVV(a, c);
        Box2D.Common.Math.b2Vec2.Free(a);
        Box2D.Common.Math.b2Vec2.Free(c);
        return b
    }
    Box2D.Common.b2Settings.b2Assert(!1);
    return 0
};
Box2D.Collision.b2Simplex.prototype.Solve2 = function ()
{
    var a = this.m_v1.w, b = this.m_v2.w, c = Box2D.Common.Math.b2Math.SubtractVV(b, a), a = -(a.x * c.x + a.y * c.y);
    0 >= a ? (Box2D.Common.Math.b2Vec2.Free(c), this.m_count = this.m_v1.a = 1) : (b = b.x * c.x + b.y * c.y, Box2D.Common.Math.b2Vec2.Free(c), 0 >= b ? (this.m_count = this.m_v2.a = 1, this.m_v1.Set(this.m_v2)) : (c = 1 / (b + a), this.m_v1.a = b * c, this.m_v2.a = a * c, this.m_count = 2))
};
Box2D.Collision.b2Simplex.prototype.Solve3 = function ()
{
    var a = this.m_v1.w, b = this.m_v2.w, c = this.m_v3.w, d = Box2D.Common.Math.b2Math.SubtractVV(b, a), e = Box2D.Common.Math.b2Math.Dot(a, d), f = Box2D.Common.Math.b2Math.Dot(b, d), e = -e, g = Box2D.Common.Math.b2Math.SubtractVV(c, a), h = Box2D.Common.Math.b2Math.Dot(a, g), i = Box2D.Common.Math.b2Math.Dot(c, g), j = Box2D.Common.Math.b2Math.CrossVV(d, g);
    Box2D.Common.Math.b2Vec2.Free(d);
    Box2D.Common.Math.b2Vec2.Free(g);
    var d = -h, h = Box2D.Common.Math.b2Math.SubtractVV(c, b), k = Box2D.Common.Math.b2Math.Dot(b, h), g = Box2D.Common.Math.b2Math.Dot(c, h);
    Box2D.Common.Math.b2Vec2.Free(h);
    h = -k;
    k = j * Box2D.Common.Math.b2Math.CrossVV(b, c);
    c = j * Box2D.Common.Math.b2Math.CrossVV(c, a);
    a = j * Box2D.Common.Math.b2Math.CrossVV(a, b);
    0 >= e && 0 >= d ? this.m_count = this.m_v1.a = 1 : 0 < f && 0 < e && 0 >= a ? (i = 1 / (f + e), this.m_v1.a = f * i, this.m_v2.a = e * i, this.m_count = 2) : 0 < i && 0 < d && 0 >= c ? (f = 1 / (i + d), this.m_v1.a = i * f, this.m_v3.a = d * f, this.m_count = 2, this.m_v2.Set(this.m_v3)) : 0 >= f && 0 >= h ? (this.m_count = this.m_v2.a = 1, this.m_v1.Set(this.m_v2)) : 0 >= i && 0 >= g ? (this.m_count = this.m_v3.a = 1, this.m_v1.Set(this.m_v3)) : 0 < g && 0 < h && 0 >= k ? (f = 1 / (g + h), this.m_v2.a =
        g * f, this.m_v3.a = h * f, this.m_count = 2, this.m_v1.Set(this.m_v3)) : (f = 1 / (k + c + a), this.m_v1.a = k * f, this.m_v2.a = c * f, this.m_v3.a = a * f, this.m_count = 3)
};
Box2D.Collision.b2Distance = {};
Box2D.Collision.b2Distance.Distance = function (a, b, c)
{
    var d = Box2D.Collision.b2Simplex.Get();
    d.ReadCache(b, c.proxyA, c.transformA, c.proxyB, c.transformB);
    (1 > d.m_count || 3 < d.m_count) && Box2D.Common.b2Settings.b2Assert(!1);
    for (var e = 0; 20 > e;)
    {
        for (var f = [], g = 0; g < d.m_count; g++)
        {
            f[g] = {}, f[g].indexA = d.m_vertices[g].indexA, f[g].indexB = d.m_vertices[g].indexB
        }
        2 == d.m_count ? d.Solve2() : 3 == d.m_count && d.Solve3();
        if (3 == d.m_count)
        {
            break
        }
        g = d.GetSearchDirection();
        if (g.LengthSquared() < Box2D.Common.b2Settings.MIN_VALUE_SQUARED)
        {
            Box2D.Common.Math.b2Vec2.Free(g);
            break
        }
        Box2D.Common.Math.b2Vec2.Free(d.m_vertices[d.m_count].wA);
        Box2D.Common.Math.b2Vec2.Free(d.m_vertices[d.m_count].wB);
        Box2D.Common.Math.b2Vec2.Free(d.m_vertices[d.m_count].w);
        var h = g.GetNegative(), i = Box2D.Common.Math.b2Math.MulTMV(c.transformA.R, h);
        Box2D.Common.Math.b2Vec2.Free(h);
        d.m_vertices[d.m_count].indexA = c.proxyA.GetSupport(i);
        Box2D.Common.Math.b2Vec2.Free(i);
        d.m_vertices[d.m_count].wA = Box2D.Common.Math.b2Math.MulX(c.transformA, c.proxyA.GetVertex(d.m_vertices[d.m_count].indexA));
        h = Box2D.Common.Math.b2Math.MulTMV(c.transformB.R, g);
        Box2D.Common.Math.b2Vec2.Free(g);
        d.m_vertices[d.m_count].indexB = c.proxyB.GetSupport(h);
        Box2D.Common.Math.b2Vec2.Free(h);
        d.m_vertices[d.m_count].wB = Box2D.Common.Math.b2Math.MulX(c.transformB, c.proxyB.GetVertex(d.m_vertices[d.m_count].indexB));
        d.m_vertices[d.m_count].w = Box2D.Common.Math.b2Math.SubtractVV(d.m_vertices[d.m_count].wB, d.m_vertices[d.m_count].wA);
        e++;
        h = !1;
        for (g = 0; g < f.length; g++)
        {
            if (d.m_vertices[d.m_count].indexA == f[g].indexA && d.m_vertices[d.m_count].indexB == f[g].indexB)
            {
                h = !0;
                break
            }
        }
        if (h)
        {
            break
        }
        d.m_count++
    }
    d.GetWitnessPoints(a.pointA, a.pointB);
    e = Box2D.Common.Math.b2Math.SubtractVV(a.pointA, a.pointB);
    a.distance = e.Length();
    Box2D.Common.Math.b2Vec2.Free(e);
    d.WriteCache(b);
    Box2D.Collision.b2Simplex.Free(d);
    c.useRadii && (b = c.proxyA.m_radius, c = c.proxyB.m_radius, a.distance > b + c && a.distance > Number.MIN_VALUE ? (a.distance -= b + c, d = Box2D.Common.Math.b2Math.SubtractVV(a.pointB, a.pointA), d.Normalize(), a.pointA.x += b * d.x, a.pointA.y += b * d.y, a.pointB.x -= c * d.x, a.pointB.y -= c * d.y, Box2D.Common.Math.b2Vec2.Free(d)) : (c = Box2D.Common.Math.b2Vec2.Get(0, 0), c.x = 0.5 * (a.pointA.x + a.pointB.x), c.y = 0.5 * (a.pointA.y + a.pointB.y), a.pointA.x = a.pointB.x = c.x, a.pointA.y =
        a.pointB.y = c.y, a.distance = 0, Box2D.Common.Math.b2Vec2.Free(c)))
};
Box2D.Collision.b2SimplexCache = function ()
{

    this.indexA = [0, 0, 0];
    this.indexB = [0, 0, 0]
};
Box2D.Collision.b2DistanceInput = function ()
{

    this.useRadii = !1;
    this.transformB = this.transformA = this.proxyB = this.proxyA = null
};
Box2D.Collision.Shapes = {};
Box2D.Collision.Shapes.b2Shape = function ()
{

    this.m_radius = Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Collision.Shapes.b2Shape.prototype.Set = function (a)
{
    this.m_radius = a.m_radius
};
Box2D.Collision.Shapes.b2Shape.TestOverlap = function (a, b, c, d)
{
    var e = new Box2D.Collision.b2DistanceInput;
    e.proxyA = new Box2D.Collision.b2DistanceProxy;
    e.proxyA.Set(a);
    e.proxyB = new Box2D.Collision.b2DistanceProxy;
    e.proxyB.Set(c);
    e.transformA = b;
    e.transformB = d;
    e.useRadii = !0;
    a = new Box2D.Collision.b2SimplexCache;
    a.count = 0;
    b = new Box2D.Collision.b2DistanceOutput;
    Box2D.Collision.b2Distance.Distance(b, a, e);
    Box2D.Common.Math.b2Vec2.Free(b.pointA);
    Box2D.Common.Math.b2Vec2.Free(b.pointB);
    return b.distance < 10 * Number.MIN_VALUE
};
Box2D.Collision.Shapes.b2Shape.e_startsInsideCollide = -1;
Box2D.Collision.Shapes.b2Shape.e_missCollide = 0;
Box2D.Collision.Shapes.b2Shape.e_hitCollide = 1;
Box2D.Collision.Shapes.b2CircleShape = function (a)
{

    Box2D.Collision.Shapes.b2Shape.call(this);
    this.m_radius = a;
    this.m_radiusSquared = a * a;
    this.m_p = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_vertices = [this.m_p]
};
goog.inherits(Box2D.Collision.Shapes.b2CircleShape, Box2D.Collision.Shapes.b2Shape);
Box2D.Collision.Shapes.b2CircleShape.prototype.GetTypeName = function ()
{
    return Box2D.Collision.Shapes.b2CircleShape.NAME
};
Box2D.Collision.Shapes.b2CircleShape.prototype.Copy = function ()
{
    var a = new Box2D.Collision.Shapes.b2CircleShape(this.m_radius);
    a.Set(this);
    return a
};
Box2D.Collision.Shapes.b2CircleShape.prototype.Set = function (a)
{
    Box2D.Collision.Shapes.b2Shape.prototype.Set.call(this, a);
    a instanceof Box2D.Collision.Shapes.b2CircleShape && this.m_p.SetV(a.m_p)
};
Box2D.Collision.Shapes.b2CircleShape.prototype.TestPoint = function (a, b)
{
    var c = b.x - (a.position.x + (a.R.col1.x * this.m_p.x + a.R.col2.x * this.m_p.y)), d = b.y - (a.position.y + (a.R.col1.y * this.m_p.x + a.R.col2.y * this.m_p.y));
    return c * c + d * d <= this.m_radiusSquared
};
Box2D.Collision.Shapes.b2CircleShape.prototype.RayCast = function (a, b, c)
{
    var d = c.R, e = b.p1.x - (c.position.x + (d.col1.x * this.m_p.x + d.col2.x * this.m_p.y)), c = b.p1.y - (c.position.y + (d.col1.y * this.m_p.x + d.col2.y * this.m_p.y)), d = b.p2.x - b.p1.x, f = b.p2.y - b.p1.y, g = e * d + c * f, h = d * d + f * f, i = g * g - h * (e * e + c * c - this.m_radiusSquared);
    if (0 > i || h < Number.MIN_VALUE)
    {
        return!1
    }
    g = -(g + Math.sqrt(i));
    return 0 <= g && g <= b.maxFraction * h ? (g /= h, a.fraction = g, a.normal.x = e + g * d, a.normal.y = c + g * f, a.normal.Normalize(), !0) : !1
};
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeAABB = function (a, b)
{
    var c = b.R, d = b.position.x + (c.col1.x * this.m_p.x + c.col2.x * this.m_p.y), c = b.position.y + (c.col1.y * this.m_p.x + c.col2.y * this.m_p.y);
    a.lowerBound.Set(d - this.m_radius, c - this.m_radius);
    a.upperBound.Set(d + this.m_radius, c + this.m_radius)
};
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeMass = function (a, b)
{
    var c = b * Math.PI * this.m_radiusSquared;
    a.SetV(c, this.m_p, c * (0.5 * this.m_radiusSquared + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y)))
};
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeSubmergedArea = function (a, b, c, d)
{
    var c = Box2D.Common.Math.b2Math.MulX(c, this.m_p), e = -(Box2D.Common.Math.b2Math.Dot(a, c) - b);
    if (e < -this.m_radius + Number.MIN_VALUE)
    {
        return Box2D.Common.Math.b2Vec2.Free(c), 0
    }
    if (e > this.m_radius)
    {
        return Box2D.Common.Math.b2Vec2.Free(c), d.SetV(c), Math.PI * this.m_radiusSquared
    }
    b = e * e;
    e = this.m_radiusSquared * (Math.asin(e / this.m_radius) + Math.PI / 2) + e * Math.sqrt(this.m_radiusSquared - b);
    b = -2 / 3 * Math.pow(this.m_radiusSquared - b, 1.5) / e;
    d.x = c.x + a.x * b;
    d.y = c.y + a.y * b;
    Box2D.Common.Math.b2Vec2.Free(c);
    return e
};
Box2D.Collision.Shapes.b2CircleShape.prototype.SetDistanceProxy = function (a)
{
    a.SetValues(1, this.m_radius, this.m_vertices)
};
Box2D.Collision.Shapes.b2CircleShape.prototype.GetLocalPosition = function ()
{
    return this.m_p
};
Box2D.Collision.Shapes.b2CircleShape.prototype.SetLocalPosition = function (a)
{
    this.m_p.SetV(a)
};
Box2D.Collision.Shapes.b2CircleShape.prototype.GetRadius = function ()
{
    return this.m_radius
};
Box2D.Collision.Shapes.b2CircleShape.prototype.SetRadius = function (a)
{
    this.m_radius = a;
    this.m_radiusSquared = a * a
};
Box2D.Collision.Shapes.b2CircleShape.NAME = "b2CircleShape";
Box2D.Consts = {};
Box2D.Consts.MIN_VALUE_SQUARED = Number.MIN_VALUE * Number.MIN_VALUE;
Box2D.Collision.b2AABB = function ()
{

    this.lowerBound = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.upperBound = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2AABB._freeCache = [];
Box2D.Collision.b2AABB.Get = function ()
{

    if (0 < Box2D.Collision.b2AABB._freeCache.length)
    {
        var a = Box2D.Collision.b2AABB._freeCache.pop();
        a.SetZero();
        return a
    }
    return new Box2D.Collision.b2AABB
};
Box2D.Collision.b2AABB.Free = function (a)
{
    null != a && ( Box2D.Collision.b2AABB._freeCache.push(a))
};
Box2D.Collision.b2AABB.prototype.SetZero = function ()
{
    this.lowerBound.Set(0, 0);
    this.upperBound.Set(0, 0)
};
Box2D.Collision.b2AABB.prototype.IsValid = function ()
{
    return 0 > this.upperBound.x - this.lowerBound.x || 0 > this.upperBound.y - this.lowerBound.y ? !1 : this.lowerBound.IsValid() && this.upperBound.IsValid()
};
Box2D.Collision.b2AABB.prototype.GetCenter = function ()
{
    return Box2D.Common.Math.b2Vec2.Get((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2)
};
Box2D.Collision.b2AABB.prototype.SetCenter = function (a)
{
    var b = this.GetCenter();
    this.lowerBound.Subtract(b);
    this.upperBound.Subtract(b);
    this.lowerBound.Add(a);
    this.upperBound.Add(a);
    Box2D.Common.Math.b2Vec2.Free(b)
};
Box2D.Collision.b2AABB.prototype.GetExtents = function ()
{
    return Box2D.Common.Math.b2Vec2.Get((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2)
};
Box2D.Collision.b2AABB.prototype.Contains = function (a)
{
    var b;
    return b = (b = (b = (b = this.lowerBound.x <= a.lowerBound.x) && this.lowerBound.y <= a.lowerBound.y) && a.upperBound.x <= this.upperBound.x) && a.upperBound.y <= this.upperBound.y
};
Box2D.Collision.b2AABB.prototype.RayCast = function (a, b)
{
    var c = -Number.MAX_VALUE, d = Number.MAX_VALUE, e = b.p2.x - b.p1.x;
    if (Math.abs(e) < Number.MIN_VALUE)
    {
        if (b.p1.x < this.lowerBound.x || this.upperBound.x < b.p1.x)
        {
            return!1
        }
    } else
    {
        var f = 1 / e, e = (this.lowerBound.x - b.p1.x) * f, f = (this.upperBound.x - b.p1.x) * f, g = -1;
        e > f && (g = e, e = f, f = g, g = 1);
        e > c && (a.normal.x = g, a.normal.y = 0, c = e);
        d = Math.min(d, f);
        if (c > d)
        {
            return!1
        }
    }
    e = b.p2.y - b.p1.y;
    if (Math.abs(e) < Number.MIN_VALUE)
    {
        if (b.p1.y < this.lowerBound.y || this.upperBound.y < b.p1.y)
        {
            return!1
        }
    } else
    {
        if (f = 1 / e, e = (this.lowerBound.y - b.p1.y) * f, f *= this.upperBound.y - b.p1.y, g = -1, e > f && (g = e, e = f, f = g, g = 1), e > c && (a.normal.y = g, a.normal.x = 0, c = e), d = Math.min(d, f), c > d)
        {
            return!1
        }
    }
    a.fraction = c;
    return!0
};
Box2D.Collision.b2AABB.prototype.TestOverlap = function (a)
{
    return 0 < a.lowerBound.x - this.upperBound.x || 0 < a.lowerBound.y - this.upperBound.y || 0 < this.lowerBound.x - a.upperBound.x || 0 < this.lowerBound.y - a.upperBound.y ? !1 : !0
};
Box2D.Collision.b2AABB.Combine = function (a, b)
{
    var c = Box2D.Collision.b2AABB.Get();
    c.Combine(a, b);
    return c
};
Box2D.Collision.b2AABB.prototype.Combine = function (a, b)
{
    this.lowerBound.x = Math.min(a.lowerBound.x, b.lowerBound.x);
    this.lowerBound.y = Math.min(a.lowerBound.y, b.lowerBound.y);
    this.upperBound.x = Math.max(a.upperBound.x, b.upperBound.x);
    this.upperBound.y = Math.max(a.upperBound.y, b.upperBound.y)
};
Box2D.Dynamics.b2FixtureListNode = function (a)
{

    this.fixture = a;
    this.previous = this.next = null
};
Box2D.Dynamics.b2FixtureListNode.prototype.SetNextNode = function (a)
{
    this.next = a
};
Box2D.Dynamics.b2FixtureListNode.prototype.SetPreviousNode = function (a)
{
    this.previous = a
};
Box2D.Dynamics.b2FixtureListNode.prototype.GetNextNode = function ()
{
    return this.next
};
Box2D.Dynamics.b2FixtureListNode.prototype.GetPreviousNode = function ()
{
    return this.previous
};
Box2D.Collision.b2ContactID = function ()
{

    this._incidentVertex = this._incidentEdge = this._referenceEdge = this._key = 0
};
Box2D.Collision.b2ContactID.prototype.GetKey = function ()
{
    return this._key
};
Box2D.Collision.b2ContactID.prototype.SetKey = function (a)
{
    this._key = a;
    this._referenceEdge = this._key & 255;
    this._incidentEdge = (this._key & 65280) >> 8 & 255;
    this._incidentVertex = (this._key & 16711680) >> 16 & 255;
    this._flip = (this._key & 4278190080) >> 24 & 255
};
Box2D.Collision.b2ContactID.prototype.Set = function (a)
{
    this.SetKey(a._key)
};
Box2D.Collision.b2ContactID.prototype.SetReferenceEdge = function (a)
{
    this._referenceEdge = a;
    this._key = this._key & 4294967040 | this._referenceEdge & 255
};
Box2D.Collision.b2ContactID.prototype.SetIncidentEdge = function (a)
{
    this._incidentEdge = a;
    this._key = this._key & 4294902015 | this._incidentEdge << 8 & 65280
};
Box2D.Collision.b2ContactID.prototype.SetIncidentVertex = function (a)
{
    this._incidentVertex = a;
    this._key = this._key & 4278255615 | this._incidentVertex << 16 & 16711680
};
Box2D.Collision.b2ContactID.prototype.SetFlip = function (a)
{
    this._flip = a;
    this._key = this._key & 16777215 | this._flip << 24 & 4278190080
};
Box2D.Collision.b2ContactID.prototype.Copy = function ()
{
    var a = new Box2D.Collision.b2ContactID;
    a.Set(this);
    return a
};
Box2D.Collision.b2ManifoldPoint = function ()
{

    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_id = new Box2D.Collision.b2ContactID;
    this.m_tangentImpulse = this.m_normalImpulse = 0
};
Box2D.Collision.b2ManifoldPoint.prototype.Reset = function ()
{
    this.m_localPoint.SetZero();
    this.m_tangentImpulse = this.m_normalImpulse = 0;
    this.m_id.SetKey(0)
};
Box2D.Collision.b2ManifoldPoint.prototype.Set = function (a)
{
    this.m_localPoint.SetV(a.m_localPoint);
    this.m_normalImpulse = a.m_normalImpulse;
    this.m_tangentImpulse = a.m_tangentImpulse;
    this.m_id.Set(a.m_id)
};
Box2D.Collision.b2DynamicTreeNode = function (a)
{

    this.aabb = Box2D.Collision.b2AABB.Get();
    this.parent = this.child2 = this.child1 = null;
    this.fixture = a
};
Box2D.Collision.b2DynamicTreeNode._freeCache = [];
Box2D.Collision.b2DynamicTreeNode.Get = function (a)
{
    "undefined" == typeof a && (a = null);
    if (0 < Box2D.Collision.b2DynamicTreeNode._freeCache.length)
    {
        var b = Box2D.Collision.b2DynamicTreeNode._freeCache.pop();
        b.fixture = a;
        b.aabb.SetZero();
        return b
    }
    return new Box2D.Collision.b2DynamicTreeNode(a)
};
Box2D.Collision.b2DynamicTreeNode.prototype.Destroy = function ()
{
    this.fixture = this.parent = this.child2 = this.child1 = null;
    Box2D.Collision.b2DynamicTreeNode._freeCache.push(this)
};
Box2D.Collision.b2DynamicTreeNode.prototype.IsLeaf = function ()
{
    return null === this.child1
};
Box2D.Collision.b2RayCastInput = function (a, b, c)
{

    this.p1 = Box2D.Common.Math.b2Vec2.Get(a.x, a.y);
    this.p2 = Box2D.Common.Math.b2Vec2.Get(b.x, b.y);
    this.maxFraction = c
};
Box2D.Collision.b2DynamicTree = function ()
{

    this.m_root = null;
    this.m_insertionCount = this.m_path = 0
};
Box2D.Collision.b2DynamicTree.prototype.CreateProxy = function (a, b)
{
    var c = Box2D.Collision.b2DynamicTreeNode.Get(b), d = Box2D.Common.b2Settings.b2_aabbExtension, e = Box2D.Common.b2Settings.b2_aabbExtension;
    c.aabb.lowerBound.x = a.lowerBound.x - d;
    c.aabb.lowerBound.y = a.lowerBound.y - e;
    c.aabb.upperBound.x = a.upperBound.x + d;
    c.aabb.upperBound.y = a.upperBound.y + e;
    this.InsertLeaf(c);
    return c
};
Box2D.Collision.b2DynamicTree.prototype.DestroyProxy = function (a)
{
    this.RemoveLeaf(a);
    a.Destroy()
};
Box2D.Collision.b2DynamicTree.prototype.MoveProxy = function (a, b, c)
{
    Box2D.Common.b2Settings.b2Assert(a.IsLeaf());
    if (a.aabb.Contains(b))
    {
        return!1
    }
    this.RemoveLeaf(a);
    var d = Box2D.Common.b2Settings.b2_aabbExtension + Box2D.Common.b2Settings.b2_aabbMultiplier * Math.abs(c.x), c = Box2D.Common.b2Settings.b2_aabbExtension + Box2D.Common.b2Settings.b2_aabbMultiplier * Math.abs(c.y);
    a.aabb.lowerBound.x = b.lowerBound.x - d;
    a.aabb.lowerBound.y = b.lowerBound.y - c;
    a.aabb.upperBound.x = b.upperBound.x + d;
    a.aabb.upperBound.y = b.upperBound.y + c;
    this.InsertLeaf(a);
    return!0
};
Box2D.Collision.b2DynamicTree.prototype.Rebalance = function (a)
{
    if (null !== this.m_root)
    {
        for (var b = 0; b < a; b++)
        {
            for (var c = this.m_root, d = 0; !c.IsLeaf();)
            {
                c = this.m_path >> d & 1 ? c.child2 : c.child1, d = d + 1 & 31
            }
            this.m_path++;
            this.RemoveLeaf(c);
            this.InsertLeaf(c)
        }
    }
};
Box2D.Collision.b2DynamicTree.prototype.GetFatAABB = function (a)
{
    return a.aabb
};
Box2D.Collision.b2DynamicTree.prototype.Query = function (a, b, c)
{
    if (null !== this.m_root)
    {
        var d = [];
        for (d.push(this.m_root); 0 < d.length;)
        {
            var e = d.pop();
            if (e.aabb.TestOverlap(b))
            {
                if (e.IsLeaf())
                {
                    if (!a.call(c, e.fixture))
                    {
                        break
                    }
                } else
                {
                    d.push(e.child1), d.push(e.child2)
                }
            }
        }
    }
};
Box2D.Collision.b2DynamicTree.prototype.RayCast = function (a, b)
{
    if (null !== this.m_root)
    {
        var c = Box2D.Common.Math.b2Math.SubtractVV(b.p1, b.p2);
        c.Normalize();
        var d = Box2D.Common.Math.b2Math.CrossFV(1, c);
        Box2D.Common.Math.b2Vec2.Free(c);
        var c = Box2D.Common.Math.b2Math.AbsV(d), e = b.maxFraction, f = b.p1.x + e * (b.p2.x - b.p1.x), e = b.p1.y + e * (b.p2.y - b.p1.y), g = Box2D.Collision.b2AABB.Get();
        g.lowerBound.x = Math.min(b.p1.x, f);
        g.lowerBound.y = Math.min(b.p1.y, e);
        g.upperBound.x = Math.max(b.p1.x, f);
        g.upperBound.y = Math.max(b.p1.y, e);
        var h = [];
        for (h.push(this.m_root); 0 < h.length;)
        {
            if (f = h.pop(), f.aabb.TestOverlap(g))
            {
                var e = f.aabb.GetCenter(), i = f.aabb.GetExtents(), j = Math.abs(d.x * (b.p1.x - e.x) + d.y * (b.p1.y - e.y)) - c.x * i.x - c.y * i.y;
                Box2D.Common.Math.b2Vec2.Free(e);
                Box2D.Common.Math.b2Vec2.Free(i);
                if (!(0 < j))
                {
                    if (f.IsLeaf())
                    {
                        new Box2D.Collision.b2RayCastInput(b.p1, b.p2, b.maxFraction);
                        e = a(b, f.fixture);
                        if (0 == e)
                        {
                            break
                        }
                        0 < e && (f = b.p1.x + e * (b.p2.x - b.p1.x), e = b.p1.y + e * (b.p2.y - b.p1.y), g.lowerBound.x = Math.min(b.p1.x, f), g.lowerBound.y = Math.min(b.p1.y, e), g.upperBound.x = Math.max(b.p1.x, f), g.upperBound.y = Math.max(b.p1.y, e))
                    } else
                    {
                        h.push(f.child1), h.push(f.child2)
                    }
                }
            }
        }
        Box2D.Common.Math.b2Vec2.Free(d);
        Box2D.Common.Math.b2Vec2.Free(c);
        Box2D.Collision.b2AABB.Free(g)
    }
};
Box2D.Collision.b2DynamicTree.prototype.InsertLeaf = function (a)
{
    this.m_insertionCount++;
    if (null === this.m_root)
    {
        this.m_root = a, this.m_root.parent = null
    } else
    {
        var b = this.GetBestSibling(a), c = b.parent, d = Box2D.Collision.b2DynamicTreeNode.Get();
        d.parent = c;
        d.aabb.Combine(a.aabb, b.aabb);
        if (c)
        {
            b.parent.child1 == b ? c.child1 = d : c.child2 = d;
            d.child1 = b;
            d.child2 = a;
            b.parent = d;
            for (a.parent = d; c && !c.aabb.Contains(d.aabb);)
            {
                c.aabb.Combine(c.child1.aabb, c.child2.aabb), d = c, c = c.parent
            }
        } else
        {
            d.child1 = b, d.child2 = a, b.parent = d, this.m_root = a.parent = d
        }
    }
};
Box2D.Collision.b2DynamicTree.prototype.GetBestSibling = function (a)
{
    for (var a = a.aabb.GetCenter(), b = this.m_root; !b.IsLeaf();)
    {
        var c = b.child1, b = b.child2, d = Math.abs((c.aabb.lowerBound.x + c.aabb.upperBound.x) / 2 - a.x) + Math.abs((c.aabb.lowerBound.y + c.aabb.upperBound.y) / 2 - a.y), e = Math.abs((b.aabb.lowerBound.x + b.aabb.upperBound.x) / 2 - a.x) + Math.abs((b.aabb.lowerBound.y + b.aabb.upperBound.y) / 2 - a.y), b = d < e ? c : b
    }
    Box2D.Common.Math.b2Vec2.Free(a);
    return b
};
Box2D.Collision.b2DynamicTree.prototype.RemoveLeaf = function (a)
{
    if (a == this.m_root)
    {
        this.m_root = null
    } else
    {
        var b = a.parent, c = b.parent, a = b.child1 == a ? b.child2 : b.child1;
        if (c)
        {
            c.child1 == b ? c.child1 = a : c.child2 = a;
            for (a.parent = c; c;)
            {
                a = c.aabb;
                c.aabb.Combine(c.child1.aabb, c.child2.aabb);
                if (a.Contains(c.aabb))
                {
                    break
                }
                c = c.parent
            }
        } else
        {
            this.m_root = a, a.parent = null
        }
        b.Destroy()
    }
};
Box2D.Collision.ClipVertex = function ()
{

    this.v = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.id = new Box2D.Collision.b2ContactID
};
Box2D.Collision.ClipVertex.prototype.Set = function (a)
{
    this.v.SetV(a.v);
    this.id.Set(a.id)
};
Box2D.Collision.b2Manifold = function ()
{

    this.m_type = this.m_pointCount = 0;
    this.m_points = [];
    for (var a = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.m_points[a] = new Box2D.Collision.b2ManifoldPoint
    }
    this.m_localPlaneNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2Manifold.prototype.Reset = function ()
{
    for (var a = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.m_points[a].Reset()
    }
    this.m_localPlaneNormal.SetZero();
    this.m_localPoint.SetZero();
    this.m_pointCount = this.m_type = 0
};
Box2D.Collision.b2Manifold.prototype.Set = function (a)
{
    this.m_pointCount = a.m_pointCount;
    for (var b = 0; b < Box2D.Common.b2Settings.b2_maxManifoldPoints; b++)
    {
        this.m_points[b].Set(a.m_points[b])
    }
    this.m_localPlaneNormal.SetV(a.m_localPlaneNormal);
    this.m_localPoint.SetV(a.m_localPoint);
    this.m_type = a.m_type
};
Box2D.Collision.b2Manifold.prototype.Copy = function ()
{
    var a = new Box2D.Collision.b2Manifold;
    a.Set(this);
    return a
};
Box2D.Collision.b2Manifold.e_circles = 1;
Box2D.Collision.b2Manifold.e_faceA = 2;
Box2D.Collision.b2Manifold.e_faceB = 4;
Box2D.Collision.b2Collision = {};
Box2D.Collision.b2Collision.ClipSegmentToLine = function (a, b, c, d)
{
    var e = 0, f = b[0].v, g = b[1].v, h = c.x * f.x + c.y * f.y - d, c = c.x * g.x + c.y * g.y - d;
    0 >= h && a[e++].Set(b[0]);
    0 >= c && a[e++].Set(b[1]);
    0 > h * c && (c = h / (h - c), d = a[e].v, d.x = f.x + c * (g.x - f.x), d.y = f.y + c * (g.y - f.y), a[e].id = 0 < h ? b[0].id : b[1].id, e++);
    return e
};
Box2D.Collision.b2Collision.EdgeSeparation = function (a, b, c, d, e)
{
    for (var f = b.R.col1.x * a.m_normals[c].x + b.R.col2.x * a.m_normals[c].y, g = b.R.col1.y * a.m_normals[c].x + b.R.col2.y * a.m_normals[c].y, h = e.R.col1.x * f + e.R.col1.y * g, i = e.R.col2.x * f + e.R.col2.y * g, j = 0, k = Number.MAX_VALUE, l = 0; l < d.m_vertexCount; l++)
    {
        var n = d.m_vertices[l].x * h + d.m_vertices[l].y * i;
        n < k && (k = n, j = l)
    }
    return(e.position.x + (e.R.col1.x * d.m_vertices[j].x + e.R.col2.x * d.m_vertices[j].y) - (b.position.x + (b.R.col1.x * a.m_vertices[c].x + b.R.col2.x * a.m_vertices[c].y))) * f + (e.position.y + (e.R.col1.y * d.m_vertices[j].x + e.R.col2.y * d.m_vertices[j].y) - (b.position.y + (b.R.col1.y * a.m_vertices[c].x + b.R.col2.y * a.m_vertices[c].y))) * g
};
Box2D.Collision.b2Collision.FindMaxSeparation = function (a, b, c, d)
{
    for (var e = d.position.x + (d.R.col1.x * c.m_centroid.x + d.R.col2.x * c.m_centroid.y), f = d.position.y + (d.R.col1.y * c.m_centroid.x + d.R.col2.y * c.m_centroid.y), e = e - (b.position.x + (b.R.col1.x * a.m_centroid.x + b.R.col2.x * a.m_centroid.y)), f = f - (b.position.y + (b.R.col1.y * a.m_centroid.x + b.R.col2.y * a.m_centroid.y)), g = e * b.R.col1.x + f * b.R.col1.y, f = e * b.R.col2.x + f * b.R.col2.y, e = 0, h = -Number.MAX_VALUE, i = 0; i < a.m_vertexCount; ++i)
    {
        var j = a.m_normals[i].x * g + a.m_normals[i].y * f;
        j > h && (h = j, e = i)
    }
    g = Box2D.Collision.b2Collision.EdgeSeparation(a, b, e, c, d);
    f = e - 1;
    0 > f && (f = a.m_vertexCount - 1);
    h = Box2D.Collision.b2Collision.EdgeSeparation(a, b, f, c, d);
    i = e + 1;
    i >= a.m_vertexCount && (i = 0);
    var j = Box2D.Collision.b2Collision.EdgeSeparation(a, b, i, c, d), k = 0, l = 0;
    if (h > g && h > j)
    {
        k = f;
        for (l = h; ;)
        {
            if (e = k - 1, 0 > e && (e = a.m_vertexCount - 1), g = Box2D.Collision.b2Collision.EdgeSeparation(a, b, e, c, d), g > l)
            {
                k = e, l = g
            } else
            {
                break
            }
        }
    } else
    {
        if (j > g)
        {
            k = i;
            for (l = j; ;)
            {
                if (e = k + 1, e >= a.m_vertexCount && (e = 0), g = Box2D.Collision.b2Collision.EdgeSeparation(a, b, e, c, d), g > l)
                {
                    k = e, l = g
                } else
                {
                    break
                }
            }
        } else
        {
            k = e, l = g
        }
    }
    return{bestEdge:k, separation:l}
};
Box2D.Collision.b2Collision.FindIncidentEdge = function (a, b, c, d, e, f)
{
    for (var g = c.R.col1.x * b.m_normals[d].x + c.R.col2.x * b.m_normals[d].y, b = c.R.col1.y * b.m_normals[d].x + c.R.col2.y * b.m_normals[d].y, c = f.R.col1.x * g + f.R.col1.y * b, b = f.R.col2.x * g + f.R.col2.y * b, g = c, c = 0, h = Number.MAX_VALUE, i = 0; i < e.m_vertexCount; i++)
    {
        var j = g * e.m_normals[i].x + b * e.m_normals[i].y;
        j < h && (h = j, c = i)
    }
    g = c + 1;
    g >= e.m_vertexCount && (g = 0);
    a[0].v.x = f.position.x + (f.R.col1.x * e.m_vertices[c].x + f.R.col2.x * e.m_vertices[c].y);
    a[0].v.y = f.position.y + (f.R.col1.y * e.m_vertices[c].x + f.R.col2.y * e.m_vertices[c].y);
    a[0].id.SetReferenceEdge(d);
    a[0].id.SetIncidentEdge(c);
    a[0].id.SetIncidentVertex(0);
    a[1].v.x = f.position.x + (f.R.col1.x * e.m_vertices[g].x + f.R.col2.x * e.m_vertices[g].y);
    a[1].v.y = f.position.y + (f.R.col1.y * e.m_vertices[g].x + f.R.col2.y * e.m_vertices[g].y);
    a[1].id.SetReferenceEdge(d);
    a[1].id.SetIncidentEdge(g);
    a[1].id.SetIncidentVertex(1)
};
Box2D.Collision.b2Collision.MakeClipPointVector = function ()
{
    return[new Box2D.Collision.ClipVertex, new Box2D.Collision.ClipVertex]
};
Box2D.Collision.b2Collision.CollidePolygons = function (a, b, c, d, e)
{
    a.m_pointCount = 0;
    var f = b.m_radius + d.m_radius, g = Box2D.Collision.b2Collision.FindMaxSeparation(b, c, d, e);
    if (!(g.separation > f))
    {
        var h = Box2D.Collision.b2Collision.FindMaxSeparation(d, e, b, c);
        if (!(h.separation > f))
        {
            var i = b, j = d, k = c, l = e, n = 0, m = g.bestEdge;
            a.m_type = Box2D.Collision.b2Manifold.e_faceA;
            h.separation > 0.98 * g.separation + 0.0010 && (i = d, j = b, k = e, l = c, m = h.bestEdge, a.m_type = Box2D.Collision.b2Manifold.e_faceB, n = 1);
            b = Box2D.Collision.b2Collision.s_incidentEdge;
            Box2D.Collision.b2Collision.FindIncidentEdge(b, i, k, m, j, l);
            j = i.m_vertices[m];
            i = m + 1 < i.m_vertexCount ? i.m_vertices[m + 1] : i.m_vertices[0];
            Box2D.Collision.b2Collision.s_localTangent.Set(i.x - j.x, i.y - j.y);
            Box2D.Collision.b2Collision.s_localTangent.Normalize();
            Box2D.Collision.b2Collision.s_localNormal.x = Box2D.Collision.b2Collision.s_localTangent.y;
            Box2D.Collision.b2Collision.s_localNormal.y = -Box2D.Collision.b2Collision.s_localTangent.x;
            Box2D.Collision.b2Collision.s_planePoint.Set(0.5 * (j.x + i.x), 0.5 * (j.y + i.y));
            Box2D.Collision.b2Collision.s_tangent.x = k.R.col1.x * Box2D.Collision.b2Collision.s_localTangent.x + k.R.col2.x * Box2D.Collision.b2Collision.s_localTangent.y;
            Box2D.Collision.b2Collision.s_tangent.y = k.R.col1.y * Box2D.Collision.b2Collision.s_localTangent.x + k.R.col2.y * Box2D.Collision.b2Collision.s_localTangent.y;
            Box2D.Collision.b2Collision.s_tangent2.x = -Box2D.Collision.b2Collision.s_tangent.x;
            Box2D.Collision.b2Collision.s_tangent2.y = -Box2D.Collision.b2Collision.s_tangent.y;
            Box2D.Collision.b2Collision.s_normal.x = Box2D.Collision.b2Collision.s_tangent.y;
            Box2D.Collision.b2Collision.s_normal.y = -Box2D.Collision.b2Collision.s_tangent.x;
            Box2D.Collision.b2Collision.s_v11.x = k.position.x + (k.R.col1.x * j.x + k.R.col2.x * j.y);
            Box2D.Collision.b2Collision.s_v11.y = k.position.y + (k.R.col1.y * j.x + k.R.col2.y * j.y);
            Box2D.Collision.b2Collision.s_v12.x = k.position.x + (k.R.col1.x * i.x + k.R.col2.x * i.y);
            Box2D.Collision.b2Collision.s_v12.y = k.position.y + (k.R.col1.y * i.x + k.R.col2.y * i.y);
            if (!(2 > Box2D.Collision.b2Collision.ClipSegmentToLine(Box2D.Collision.b2Collision.s_clipPoints1, b, Box2D.Collision.b2Collision.s_tangent2, -Box2D.Collision.b2Collision.s_tangent.x * Box2D.Collision.b2Collision.s_v11.x - Box2D.Collision.b2Collision.s_tangent.y * Box2D.Collision.b2Collision.s_v11.y + f)) && !(2 > Box2D.Collision.b2Collision.ClipSegmentToLine(Box2D.Collision.b2Collision.s_clipPoints2, Box2D.Collision.b2Collision.s_clipPoints1, Box2D.Collision.b2Collision.s_tangent, Box2D.Collision.b2Collision.s_tangent.x *
                Box2D.Collision.b2Collision.s_v12.x + Box2D.Collision.b2Collision.s_tangent.y * Box2D.Collision.b2Collision.s_v12.y + f)))
            {
                a.m_localPlaneNormal.SetV(Box2D.Collision.b2Collision.s_localNormal);
                a.m_localPoint.SetV(Box2D.Collision.b2Collision.s_planePoint);
                k = Box2D.Collision.b2Collision.s_normal.x * Box2D.Collision.b2Collision.s_v11.x + Box2D.Collision.b2Collision.s_normal.y * Box2D.Collision.b2Collision.s_v11.y;
                for (m = i = 0; m < Box2D.Common.b2Settings.b2_maxManifoldPoints; ++m)
                {
                    Box2D.Collision.b2Collision.s_normal.x * Box2D.Collision.b2Collision.s_clipPoints2[m].v.x + Box2D.Collision.b2Collision.s_normal.y * Box2D.Collision.b2Collision.s_clipPoints2[m].v.y - k <= f && (j = Box2D.Collision.b2Collision.s_clipPoints2[m].v.x - l.position.x, b = Box2D.Collision.b2Collision.s_clipPoints2[m].v.y - l.position.y, a.m_points[i].m_localPoint.x = j * l.R.col1.x + b * l.R.col1.y, a.m_points[i].m_localPoint.y = j * l.R.col2.x + b * l.R.col2.y, a.m_points[i].m_id.Set(Box2D.Collision.b2Collision.s_clipPoints2[m].id),
                        a.m_points[i].m_id.SetFlip(n), i++)
                }
                a.m_pointCount = i
            }
        }
    }
};
Box2D.Collision.b2Collision.CollideCircles = function (a, b, c, d, e)
{
    a.m_pointCount = 0;
    var f = e.position.x + (e.R.col1.x * d.m_p.x + e.R.col2.x * d.m_p.y) - (c.position.x + (c.R.col1.x * b.m_p.x + c.R.col2.x * b.m_p.y)), c = e.position.y + (e.R.col1.y * d.m_p.x + e.R.col2.y * d.m_p.y) - (c.position.y + (c.R.col1.y * b.m_p.x + c.R.col2.y * b.m_p.y)), e = b.m_radius + d.m_radius;
    f * f + c * c > e * e || (a.m_type = Box2D.Collision.b2Manifold.e_circles, a.m_localPoint.SetV(b.m_p), a.m_localPlaneNormal.SetZero(), a.m_pointCount = 1, a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0))
};
Box2D.Collision.b2Collision.CollidePolygonAndCircle = function (a, b, c, d, e)
{
    a.m_pointCount = 0;
    for (var f = e.position.x + (e.R.col1.x * d.m_p.x + e.R.col2.x * d.m_p.y) - c.position.x, g = e.position.y + (e.R.col1.y * d.m_p.x + e.R.col2.y * d.m_p.y) - c.position.y, e = f * c.R.col1.x + g * c.R.col1.y, c = f * c.R.col2.x + g * c.R.col2.y, f = 0, g = -Number.MAX_VALUE, h = b.m_radius + d.m_radius, i = 0; i < b.m_vertexCount; ++i)
    {
        var j = b.m_normals[i].x * (e - b.m_vertices[i].x) + b.m_normals[i].y * (c - b.m_vertices[i].y);
        if (j > h)
        {
            return
        }
        j > g && (g = j, f = i)
    }
    j = f + 1;
    j >= b.m_vertexCount && (j = 0);
    var i = b.m_vertices[f], k = b.m_vertices[j];
    g < Number.MIN_VALUE ? (a.m_pointCount = 1, a.m_type = Box2D.Collision.b2Manifold.e_faceA, a.m_localPlaneNormal.SetV(b.m_normals[f]), a.m_localPoint.x = 0.5 * (i.x + k.x), a.m_localPoint.y = 0.5 * (i.y + k.y), a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0)) : 0 >= (e - i.x) * (k.x - i.x) + (c - i.y) * (k.y - i.y) ? (e - i.x) * (e - i.x) + (c - i.y) * (c - i.y) > h * h || (a.m_pointCount = 1, a.m_type = Box2D.Collision.b2Manifold.e_faceA, a.m_localPlaneNormal.x = e - i.x, a.m_localPlaneNormal.y =
        c - i.y, a.m_localPlaneNormal.Normalize(), a.m_localPoint.SetV(i), a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0)) : 0 >= (e - k.x) * (i.x - k.x) + (c - k.y) * (i.y - k.y) ? (e - k.x) * (e - k.x) + (c - k.y) * (c - k.y) > h * h || (a.m_pointCount = 1, a.m_type = Box2D.Collision.b2Manifold.e_faceA, a.m_localPlaneNormal.x = e - k.x, a.m_localPlaneNormal.y = c - k.y, a.m_localPlaneNormal.Normalize(), a.m_localPoint.SetV(k), a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0)) :
        (j = 0.5 * (i.x + k.x), i = 0.5 * (i.y + k.y), g = (e - j) * b.m_normals[f].x + (c - i) * b.m_normals[f].y, g > h || (a.m_pointCount = 1, a.m_type = Box2D.Collision.b2Manifold.e_faceA, a.m_localPlaneNormal.x = b.m_normals[f].x, a.m_localPlaneNormal.y = b.m_normals[f].y, a.m_localPlaneNormal.Normalize(), a.m_localPoint.Set(j, i), a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0)))
};
Box2D.Collision.b2Collision.s_incidentEdge = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_clipPoints1 = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_clipPoints2 = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_localTangent = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_localNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_planePoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_tangent = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_tangent2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_v11 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_v12 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2SeparationFunction = function ()
{

    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_proxyB = this.m_proxyA = null
};
Box2D.Collision.b2SeparationFunction.prototype.Initialize = function (a, b, c, d, e)
{
    this.m_proxyA = b;
    this.m_proxyB = d;
    var f = a.count;
    Box2D.Common.b2Settings.b2Assert(0 < f && 3 > f);
    var g, h, i = h = g = 0, j = 0, d = b = 0, k, l, i = 0;
    1 == f ? (this.m_type = Box2D.Collision.b2SeparationFunction.e_points, f = this.m_proxyA.GetVertex(a.indexA[0]), a = this.m_proxyB.GetVertex(a.indexB[0]), l = f, k = c.R, g = c.position.x + (k.col1.x * l.x + k.col2.x * l.y), h = c.position.y + (k.col1.y * l.x + k.col2.y * l.y), l = a, k = e.R, i = e.position.x + (k.col1.x * l.x + k.col2.x * l.y), j = e.position.y + (k.col1.y * l.x + k.col2.y * l.y), this.m_axis.x = i - g, this.m_axis.y = j - h, this.m_axis.Normalize()) : a.indexB[0] == a.indexB[1] ?
        (this.m_type = Box2D.Collision.b2SeparationFunction.e_faceA, b = this.m_proxyA.GetVertex(a.indexA[0]), d = this.m_proxyA.GetVertex(a.indexA[1]), a = this.m_proxyB.GetVertex(a.indexB[0]), this.m_localPoint.x = 0.5 * (b.x + d.x), this.m_localPoint.y = 0.5 * (b.y + d.y), j = Box2D.Common.Math.b2Math.SubtractVV(d, b), Box2D.Common.Math.b2Vec2.Free(this.m_axis), this.m_axis = Box2D.Common.Math.b2Math.CrossVF(j, 1), Box2D.Common.Math.b2Vec2.Free(j), this.m_axis.Normalize(), l = this.m_axis, k = c.R,
            b = k.col1.x * l.x + k.col2.x * l.y, d = k.col1.y * l.x + k.col2.y * l.y, l = this.m_localPoint, k = c.R, g = c.position.x + (k.col1.x * l.x + k.col2.x * l.y), h = c.position.y + (k.col1.y * l.x + k.col2.y * l.y), l = a, k = e.R, i = e.position.x + (k.col1.x * l.x + k.col2.x * l.y), j = e.position.y + (k.col1.y * l.x + k.col2.y * l.y), 0 > (i - g) * b + (j - h) * d && this.m_axis.NegativeSelf()) : a.indexA[0] == a.indexA[0] ? (this.m_type = Box2D.Collision.b2SeparationFunction.e_faceB, g = this.m_proxyB.GetVertex(a.indexB[0]),
        h = this.m_proxyB.GetVertex(a.indexB[1]), f = this.m_proxyA.GetVertex(a.indexA[0]), this.m_localPoint.x = 0.5 * (g.x + h.x), this.m_localPoint.y = 0.5 * (g.y + h.y), j = Box2D.Common.Math.b2Math.SubtractVV(h, g), Box2D.Common.Math.b2Vec2.Free(this.m_axis), this.m_axis = Box2D.Common.Math.b2Math.CrossVF(j, 1), Box2D.Common.Math.b2Vec2.Free(j), this.m_axis.Normalize(), l = this.m_axis, k = e.R, b = k.col1.x * l.x + k.col2.x * l.y, d = k.col1.y * l.x + k.col2.y * l.y, l = this.m_localPoint, k = e.R,
        i = e.position.x + (k.col1.x * l.x + k.col2.x * l.y), j = e.position.y + (k.col1.y * l.x + k.col2.y * l.y), l = f, k = c.R, g = c.position.x + (k.col1.x * l.x + k.col2.x * l.y), h = c.position.y + (k.col1.y * l.x + k.col2.y * l.y), 0 > (g - i) * b + (h - j) * d && this.m_axis.NegativeSelf()) : (b = this.m_proxyA.GetVertex(a.indexA[0]), d = this.m_proxyA.GetVertex(a.indexA[1]), g = this.m_proxyB.GetVertex(a.indexB[0]), h = this.m_proxyB.GetVertex(a.indexB[1]), j = Box2D.Common.Math.b2Math.SubtractVV(d,
        b), i = Box2D.Common.Math.b2Math.MulMV(c.R, j), Box2D.Common.Math.b2Vec2.Free(j), j = Box2D.Common.Math.b2Math.SubtractVV(h, g), k = Box2D.Common.Math.b2Math.MulMV(e.R, j), Box2D.Common.Math.b2Vec2.Free(j), e = i.x * i.x + i.y * i.y, c = k.x * k.x + k.y * k.y, j = Box2D.Common.Math.b2Math.SubtractVV(k, i), a = i.x * j.x + i.y * j.y, f = k.x * j.x + k.y * j.y, Box2D.Common.Math.b2Vec2.Free(j), j = i.x * k.x + i.y * k.y, k = e * c - j * j, i = 0, 0 != k && (i = Box2D.Common.Math.b2Math.Clamp((j *
        f - a * c) / k, 0, 1)), 0 > (j * i + f) / c && (i = Box2D.Common.Math.b2Math.Clamp((j - a) / e, 0, 1)), f = Box2D.Common.Math.b2Vec2.Get(0, 0), f.x = b.x + i * (d.x - b.x), f.y = b.y + i * (d.y - b.y), a = Box2D.Common.Math.b2Vec2.Get(0, 0), a.x = g.x + i * (h.x - g.x), a.y = g.y + i * (h.y - g.y), 0 == i || 1 == i ? (this.m_type = Box2D.Collision.b2SeparationFunction.e_faceB, j = Box2D.Common.Math.b2Math.SubtractVV(h, g), Box2D.Common.Math.b2Vec2.Free(this.m_axis), this.m_axis = Box2D.Common.Math.b2Math.CrossVF(j,
        1), Box2D.Common.Math.b2Vec2.Free(j), this.m_axis.Normalize(), this.m_localPoint = a) : (this.m_type = Box2D.Collision.b2SeparationFunction.e_faceA, j = Box2D.Common.Math.b2Math.SubtractVV(d, b), Box2D.Common.Math.b2Vec2.Free(this.m_axis), this.m_axis = Box2D.Common.Math.b2Math.CrossVF(j, 1), Box2D.Common.Math.b2Vec2.Free(j), this.m_localPoint = f), 0 > i && this.m_axis.NegativeSelf(), Box2D.Common.Math.b2Vec2.Free(f), Box2D.Common.Math.b2Vec2.Free(a))
};
Box2D.Collision.b2SeparationFunction.prototype.Evaluate = function (a, b)
{
    var c = 0;
    switch (this.m_type)
    {
        case Box2D.Collision.b2SeparationFunction.e_points:
            var c = Box2D.Common.Math.b2Math.MulTMV(a.R, this.m_axis), d = this.m_axis.GetNegative(), e = Box2D.Common.Math.b2Math.MulTMV(b.R, d);
            Box2D.Common.Math.b2Vec2.Free(d);
            var f = this.m_proxyA.GetSupportVertex(c);
            Box2D.Common.Math.b2Vec2.Free(c);
            c = this.m_proxyB.GetSupportVertex(e);
            Box2D.Common.Math.b2Vec2.Free(e);
            e = Box2D.Common.Math.b2Math.MulX(a, f);
            f = Box2D.Common.Math.b2Math.MulX(b, c);
            c = (f.x - e.x) * this.m_axis.x + (f.y - e.y) * this.m_axis.y;
            Box2D.Common.Math.b2Vec2.Free(e);
            Box2D.Common.Math.b2Vec2.Free(f);
            break;
        case Box2D.Collision.b2SeparationFunction.e_faceA:
            d = Box2D.Common.Math.b2Math.MulMV(a.R, this.m_axis);
            f = d.GetNegative();
            e = Box2D.Common.Math.b2Math.MulTMV(b.R, f);
            Box2D.Common.Math.b2Vec2.Free(f);
            c = this.m_proxyB.GetSupportVertex(e);
            Box2D.Common.Math.b2Vec2.Free(e);
            e = Box2D.Common.Math.b2Math.MulX(a, this.m_localPoint);
            f = Box2D.Common.Math.b2Math.MulX(b, c);
            c = (f.x - e.x) * d.x + (f.y - e.y) * d.y;
            Box2D.Common.Math.b2Vec2.Free(d);
            Box2D.Common.Math.b2Vec2.Free(e);
            Box2D.Common.Math.b2Vec2.Free(f);
            break;
        case Box2D.Collision.b2SeparationFunction.e_faceB:
            d = Box2D.Common.Math.b2Math.MulMV(b.R, this.m_axis);
            f = d.GetNegative();
            c = Box2D.Common.Math.b2Math.MulTMV(a.R, f);
            Box2D.Common.Math.b2Vec2.Free(f);
            f = this.m_proxyA.GetSupportVertex(c);
            Box2D.Common.Math.b2Vec2.Free(c);
            e = Box2D.Common.Math.b2Math.MulX(a, f);
            f = Box2D.Common.Math.b2Math.MulX(b, this.m_localPoint);
            c = (e.x - f.x) * d.x + (e.y - f.y) * d.y;
            Box2D.Common.Math.b2Vec2.Free(d);
            Box2D.Common.Math.b2Vec2.Free(e);
            Box2D.Common.Math.b2Vec2.Free(f);
            break;
        default:
            Box2D.Common.b2Settings.b2Assert(!1)
    }
    return c
};
Box2D.Collision.b2SeparationFunction.e_points = 1;
Box2D.Collision.b2SeparationFunction.e_faceA = 2;
Box2D.Collision.b2SeparationFunction.e_faceB = 4;
Box2D.Common.Math.b2Transform = function (a, b)
{

    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.R = new Box2D.Common.Math.b2Mat22;
    a && this.position.SetV(a);
    b && this.R.SetM(b)
};
Box2D.Common.Math.b2Transform.prototype.Initialize = function (a, b)
{
    this.position.SetV(a);
    this.R.SetM(b)
};
Box2D.Common.Math.b2Transform.prototype.SetIdentity = function ()
{
    this.position.SetZero();
    this.R.SetIdentity()
};
Box2D.Common.Math.b2Transform.prototype.Set = function (a)
{
    this.position.SetV(a.position);
    this.R.SetM(a.R)
};
Box2D.Common.Math.b2Transform.prototype.GetAngle = function ()
{
    return Math.atan2(this.R.col1.y, this.R.col1.x)
};
Box2D.Collision.b2TimeOfImpact = {};
Box2D.Collision.b2TimeOfImpact.TimeOfImpact = function (a)
{
    Box2D.Collision.b2TimeOfImpact.b2_toiCalls++;
    var b = a.proxyA, c = a.proxyB, d = a.sweepA, e = a.sweepB;
    Box2D.Common.b2Settings.b2Assert(d.t0 == e.t0);
    Box2D.Common.b2Settings.b2Assert(1 - d.t0 > Number.MIN_VALUE);
    var f = b.m_radius + c.m_radius, a = a.tolerance, g = 0, h = 0, i = 0;
    Box2D.Collision.b2TimeOfImpact.s_cache.count = 0;
    for (Box2D.Collision.b2TimeOfImpact.s_distanceInput.useRadii = !1; ;)
    {
        d.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, g);
        e.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, g);
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.proxyA = b;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.proxyB = c;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.transformA = Box2D.Collision.b2TimeOfImpact.s_xfA;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.transformB = Box2D.Collision.b2TimeOfImpact.s_xfB;
        Box2D.Collision.b2Distance.Distance(Box2D.Collision.b2TimeOfImpact.s_distanceOutput, Box2D.Collision.b2TimeOfImpact.s_cache, Box2D.Collision.b2TimeOfImpact.s_distanceInput);
        if (0 >= Box2D.Collision.b2TimeOfImpact.s_distanceOutput.distance)
        {
            g = 1;
            break
        }
        Box2D.Collision.b2TimeOfImpact.s_fcn.Initialize(Box2D.Collision.b2TimeOfImpact.s_cache, b, Box2D.Collision.b2TimeOfImpact.s_xfA, c, Box2D.Collision.b2TimeOfImpact.s_xfB);
        var j = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
        if (0 >= j)
        {
            g = 1;
            break
        }
        0 == h && (i = j > f ? Math.max(f - a, 0.75 * f) : Math.max(j - a, 0.02 * f));
        if (j - i < 0.5 * a)
        {
            if (0 == h)
            {
                g = 1;
                break
            }
            break
        }
        var k = g, l = g, n = 1;
        d.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, n);
        e.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, n);
        var m = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
        if (m >= i)
        {
            g = 1;
            break
        }
        for (var o = 0; ;)
        {
            var p = 0, p = o & 1 ? l + (i - j) * (n - l) / (m - j) : 0.5 * (l + n);
            d.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, p);
            e.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, p);
            var q = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
            if (Math.abs(q - i) < 0.025 * a)
            {
                k = p;
                break
            }
            q > i ? (l = p, j = q) : (n = p, m = q);
            o++;
            Box2D.Collision.b2TimeOfImpact.b2_toiRootIters++;
            if (50 == o)
            {
                break
            }
        }
        Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = Math.max(Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters, o);
        if (k < (1 + 100 * Number.MIN_VALUE) * g)
        {
            break
        }
        g = k;
        h++;
        Box2D.Collision.b2TimeOfImpact.b2_toiIters++;
        if (1E3 == h)
        {
            break
        }
    }
    Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = Math.max(Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters, h);
    return g
};
Box2D.Collision.b2TimeOfImpact.b2_toiCalls = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiRootIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = 0;
Box2D.Collision.b2TimeOfImpact.s_cache = new Box2D.Collision.b2SimplexCache;
Box2D.Collision.b2TimeOfImpact.s_distanceInput = new Box2D.Collision.b2DistanceInput;
Box2D.Collision.b2TimeOfImpact.s_xfA = new Box2D.Common.Math.b2Transform;
Box2D.Collision.b2TimeOfImpact.s_xfB = new Box2D.Common.Math.b2Transform;
Box2D.Collision.b2TimeOfImpact.s_fcn = new Box2D.Collision.b2SeparationFunction;
Box2D.Collision.b2TimeOfImpact.s_distanceOutput = new Box2D.Collision.b2DistanceOutput;
Box2D.Dynamics.b2BodyDef = function ()
{

    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearVelocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.angularDamping = this.linearDamping = this.angularVelocity = this.angle = 0;
    this.awake = this.allowSleep = !0;
    this.bullet = this.fixedRotation = !1;
    this.type = Box2D.Dynamics.b2BodyDef.b2_staticBody;
    this.active = !0;
    this.inertiaScale = 1
};
Box2D.Dynamics.b2BodyDef.b2_staticBody = 0;
Box2D.Dynamics.b2BodyDef.b2_kinematicBody = 1;
Box2D.Dynamics.b2BodyDef.b2_dynamicBody = 2;
Box2D.Dynamics.Contacts = {};
Box2D.Dynamics.Contacts.b2Contact = function (a, b)
{

    this.ID = "Contact" + Box2D.Dynamics.Contacts.b2Contact.NEXT_ID++;
    this.m_manifold = new Box2D.Collision.b2Manifold;
    this.m_oldManifold = new Box2D.Collision.b2Manifold;
    this.touching = !1;
    var c = a.GetBody(), d = b.GetBody();
    this.continuous = c.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || c.IsBullet() || d.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || d.IsBullet();
    this.sensor = a.IsSensor() || b.IsSensor();
    this.filtering = !1;
    this.m_fixtureA = a;
    this.m_fixtureB = b;
    this.enabled = !0;
    this.bodyAList = c.GetContactList();
    this.bodyBList = d.GetContactList();
    this.worldList = d.GetWorld().GetContactList();
    this.AddToLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.Reset = function (a, b)
{
    this.m_manifold.Reset();
    this.m_oldManifold.Reset();
    this.touching = !1;
    var c = a.GetBody(), d = b.GetBody();
    this.continuous = c.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || c.IsBullet() || d.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || d.IsBullet();
    this.sensor = a.IsSensor() || b.IsSensor();
    this.filtering = !1;
    this.m_fixtureA = a;
    this.m_fixtureB = b;
    this.enabled = !0;
    this.bodyAList = c.GetContactList();
    this.bodyBList = d.GetContactList();
    this.worldList = d.GetWorld().GetContactList();
    this.AddToLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.AddToLists = function ()
{
    this.bodyAList.AddContact(this);
    this.bodyBList.AddContact(this);
    this.worldList.AddContact(this);
    this.UpdateLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.UpdateLists = function ()
{
    var a = !1, b = !1;
    !this.IsSensor() && this.IsEnabled() && (this.IsTouching() && (a = !0), this.IsContinuous() && (b = !0));
    this.bodyAList.UpdateContact(this, a, b);
    this.bodyBList.UpdateContact(this, a, b);
    this.worldList.UpdateContact(this, a, b)
};
Box2D.Dynamics.Contacts.b2Contact.prototype.RemoveFromLists = function ()
{
    this.bodyAList.RemoveContact(this);
    this.bodyBList.RemoveContact(this);
    this.worldList.RemoveContact(this)
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetManifold = function ()
{
    return this.m_manifold
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetWorldManifold = function (a)
{
    var b = this.m_fixtureA.GetBody(), c = this.m_fixtureB.GetBody(), d = this.m_fixtureA.GetShape(), e = this.m_fixtureB.GetShape();
    a.Initialize(this.m_manifold, b.GetTransform(), d.m_radius, c.GetTransform(), e.m_radius)
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsTouching = function ()
{
    return this.touching
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsContinuous = function ()
{
    return this.continuous
};
Box2D.Dynamics.Contacts.b2Contact.prototype.SetSensor = function (a)
{
    this.sensor = a;
    this.UpdateLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsSensor = function ()
{
    return this.sensor
};
Box2D.Dynamics.Contacts.b2Contact.prototype.SetEnabled = function (a)
{
    this.enabled = a;
    this.UpdateLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsEnabled = function ()
{
    return this.enabled
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetNext = function ()
{
    return this.m_next
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetFixtureA = function ()
{
    return this.m_fixtureA
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetFixtureB = function ()
{
    return this.m_fixtureB
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetOther = function (a)
{
    var b = this.m_fixtureA.GetBody();
    return b != a ? b : this.m_fixtureB.GetBody()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.FlagForFiltering = function ()
{
    this.filtering = !0
};
Box2D.Dynamics.Contacts.b2Contact.prototype.ClearFiltering = function ()
{
    this.filtering = !1
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsFiltering = function ()
{
    return this.filtering
};
Box2D.Dynamics.Contacts.b2Contact.prototype.Update = function (a)
{
    var b = this.m_oldManifold;
    this.m_oldManifold = this.m_manifold;
    this.m_manifold = b;
    this.enabled = !0;
    var b = !1, c = this.IsTouching(), d = this.m_fixtureA.GetBody(), e = this.m_fixtureB.GetBody(), f = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
    if (this.sensor)
    {
        f && (b = Box2D.Collision.Shapes.b2Shape.TestOverlap(this.m_fixtureA.GetShape(), d.GetTransform(), this.m_fixtureB.GetShape(), e.GetTransform())), this.m_manifold.m_pointCount = 0
    } else
    {
        this.continuous = d.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || d.IsBullet() || e.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || e.IsBullet() ? !0 : !1;
        if (f)
        {
            this.Evaluate();
            b = 0 < this.m_manifold.m_pointCount;
            for (f = 0; f < this.m_manifold.m_pointCount; f++)
            {
                var g = this.m_manifold.m_points[f];
                g.m_normalImpulse = 0;
                for (var h = g.m_tangentImpulse = 0; h < this.m_oldManifold.m_pointCount; h++)
                {
                    var i = this.m_oldManifold.m_points[h];
                    if (i.m_id.GetKey() == g.m_id.GetKey())
                    {
                        g.m_normalImpulse = i.m_normalImpulse;
                        g.m_tangentImpulse = i.m_tangentImpulse;
                        break
                    }
                }
            }
        } else
        {
            this.m_manifold.m_pointCount = 0
        }
        b != c && (d.SetAwake(!0), e.SetAwake(!0))
    }
    this.touching = b;
    b != c && this.UpdateLists();
    !c && b && a.BeginContact(this);
    c && !b && a.EndContact(this);
    this.sensor || a.PreSolve(this, this.m_oldManifold)
};
Box2D.Dynamics.Contacts.b2Contact.prototype.Evaluate = function ()
{
};
Box2D.Dynamics.Contacts.b2Contact.prototype.ComputeTOI = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
    Box2D.Dynamics.Contacts.b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
    Box2D.Dynamics.Contacts.b2Contact.s_input.sweepA = a;
    Box2D.Dynamics.Contacts.b2Contact.s_input.sweepB = b;
    Box2D.Dynamics.Contacts.b2Contact.s_input.tolerance = Box2D.Common.b2Settings.b2_linearSlop;
    return Box2D.Collision.b2TimeOfImpact.TimeOfImpact(Box2D.Dynamics.Contacts.b2Contact.s_input)
};
Box2D.Dynamics.Contacts.b2Contact.s_input = new Box2D.Collision.b2TOIInput;
Box2D.Dynamics.Contacts.b2Contact.NEXT_ID = 0;
Box2D.Collision.Shapes.b2MassData = function ()
{

    this.mass = 0;
    this.center = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.I = 0
};
Box2D.Collision.Shapes.b2MassData._freeCache = [];
Box2D.Collision.Shapes.b2MassData.Get = function ()
{

    if (0 < Box2D.Collision.Shapes.b2MassData._freeCache.length)
    {
        var a = Box2D.Collision.Shapes.b2MassData._freeCache.pop();
        a.mass = 0;
        a.center.SetZero();
        a.I = 0;
        return a
    }
    return new Box2D.Collision.Shapes.b2MassData
};
Box2D.Collision.Shapes.b2MassData.Free = function (a)
{
    null != a && ( Box2D.Collision.Shapes.b2MassData._freeCache.push(a))
};
Box2D.Collision.Shapes.b2MassData.prototype.SetV = function (a, b, c)
{
    this.mass = a;
    this.center.SetV(b);
    this.I = c
};
Box2D.Collision.Shapes.b2MassData.prototype.Set = function (a, b, c, d)
{
    this.mass = a;
    this.center.Set(b, c);
    this.I = d
};
Box2D.Collision.Shapes.b2PolygonShape = function ()
{

    Box2D.Collision.Shapes.b2Shape.call(this);
    this.m_centroid = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_vertices = [];
    this.m_normals = []
};
goog.inherits(Box2D.Collision.Shapes.b2PolygonShape, Box2D.Collision.Shapes.b2Shape);
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetTypeName = function ()
{
    return Box2D.Collision.Shapes.b2PolygonShape.NAME
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.Copy = function ()
{
    var a = new Box2D.Collision.Shapes.b2PolygonShape;
    a.Set(this);
    return a
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.Set = function (a)
{
    Box2D.Collision.Shapes.b2Shape.prototype.Set.call(this, a);
    if (a instanceof Box2D.Collision.Shapes.b2PolygonShape)
    {
        this.m_centroid.SetV(a.m_centroid);
        this.m_vertexCount = a.m_vertexCount;
        this.Reserve(this.m_vertexCount);
        for (var b = 0; b < this.m_vertexCount; b++)
        {
            this.m_vertices[b].SetV(a.m_vertices[b]), this.m_normals[b].SetV(a.m_normals[b])
        }
    }
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsArray = function (a)
{
    this.SetAsVector(a)
};
Box2D.Collision.Shapes.b2PolygonShape.AsArray = function (a)
{
    var b = new Box2D.Collision.Shapes.b2PolygonShape;
    b.SetAsArray(a);
    return b
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsVector = function (a)
{
    var b = a.length;
    Box2D.Common.b2Settings.b2Assert(2 <= b);
    this.m_vertexCount = b;
    this.Reserve(b);
    for (b = b = 0; b < this.m_vertexCount; b++)
    {
        this.m_vertices[b].SetV(a[b])
    }
    for (b = 0; b < this.m_vertexCount; ++b)
    {
        a = Box2D.Common.Math.b2Math.SubtractVV(this.m_vertices[b + 1 < this.m_vertexCount ? b + 1 : 0], this.m_vertices[b]);
        Box2D.Common.b2Settings.b2Assert(a.LengthSquared() > Number.MIN_VALUE);
        var c = Box2D.Common.Math.b2Math.CrossVF(a, 1);
        Box2D.Common.Math.b2Vec2.Free(a);
        this.m_normals[b].SetV(c);
        Box2D.Common.Math.b2Vec2.Free(c);
        this.m_normals[b].Normalize()
    }
    this.m_centroid = Box2D.Collision.Shapes.b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount)
};
Box2D.Collision.Shapes.b2PolygonShape.AsVector = function (a)
{
    var b = new Box2D.Collision.Shapes.b2PolygonShape;
    b.SetAsVector(a);
    return b
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsBox = function (a, b)
{
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set(-a, -b);
    this.m_vertices[1].Set(a, -b);
    this.m_vertices[2].Set(a, b);
    this.m_vertices[3].Set(-a, b);
    this.m_normals[0].Set(0, -1);
    this.m_normals[1].Set(1, 0);
    this.m_normals[2].Set(0, 1);
    this.m_normals[3].Set(-1, 0);
    this.m_centroid.SetZero()
};
Box2D.Collision.Shapes.b2PolygonShape.AsBox = function (a, b)
{
    var c = new Box2D.Collision.Shapes.b2PolygonShape;
    c.SetAsBox(a, b);
    return c
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsOrientedBox = function (a, b, c, d)
{
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set(-a, -b);
    this.m_vertices[1].Set(a, -b);
    this.m_vertices[2].Set(a, b);
    this.m_vertices[3].Set(-a, b);
    this.m_normals[0].Set(0, -1);
    this.m_normals[1].Set(1, 0);
    this.m_normals[2].Set(0, 1);
    this.m_normals[3].Set(-1, 0);
    this.m_centroid = c;
    a = new Box2D.Common.Math.b2Mat22;
    a.Set(d);
    c = new Box2D.Common.Math.b2Transform(c, a);
    for (d = 0; d < this.m_vertexCount; ++d)
    {
        this.m_vertices[d] = Box2D.Common.Math.b2Math.MulX(c, this.m_vertices[d]), this.m_normals[d] = Box2D.Common.Math.b2Math.MulMV(c.R, this.m_normals[d])
    }
};
Box2D.Collision.Shapes.b2PolygonShape.AsOrientedBox = function (a, b, c, d)
{
    var e = new Box2D.Collision.Shapes.b2PolygonShape;
    e.SetAsOrientedBox(a, b, c, d);
    return e
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsEdge = function (a, b)
{
    this.m_vertexCount = 2;
    this.Reserve(2);
    this.m_vertices[0].SetV(a);
    this.m_vertices[1].SetV(b);
    this.m_centroid.x = 0.5 * (a.x + b.x);
    this.m_centroid.y = 0.5 * (a.y + b.y);
    var c = Box2D.Common.Math.b2Math.SubtractVV(b, a), d = Box2D.Common.Math.b2Math.CrossVF(c, 1);
    Box2D.Common.Math.b2Vec2.Free(c);
    this.m_normals[0] = d;
    Box2D.Common.Math.b2Vec2.Free(d);
    this.m_normals[0].Normalize();
    this.m_normals[1].x = -this.m_normals[0].x;
    this.m_normals[1].y = -this.m_normals[0].y
};
Box2D.Collision.Shapes.b2PolygonShape.AsEdge = function (a, b)
{
    var c = new Box2D.Collision.Shapes.b2PolygonShape;
    c.SetAsEdge(a, b);
    return c
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.TestPoint = function (a, b)
{
    var c;
    c = a.R;
    for (var d = b.x - a.position.x, e = b.y - a.position.y, f = d * c.col1.x + e * c.col1.y, g = d * c.col2.x + e * c.col2.y, h = 0; h < this.m_vertexCount; ++h)
    {
        if (c = this.m_vertices[h], d = f - c.x, e = g - c.y, c = this.m_normals[h], 0 < c.x * d + c.y * e)
        {
            return!1
        }
    }
    return!0
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.RayCast = function (a, b, c)
{
    var d = 0, e = b.maxFraction, f = 0, g = 0, h, i, f = b.p1.x - c.position.x, g = b.p1.y - c.position.y;
    h = c.R;
    var j = f * h.col1.x + g * h.col1.y, k = f * h.col2.x + g * h.col2.y, f = b.p2.x - c.position.x, g = b.p2.y - c.position.y;
    h = c.R;
    b = f * h.col1.x + g * h.col1.y - j;
    h = f * h.col2.x + g * h.col2.y - k;
    for (var l = -1, n = 0; n < this.m_vertexCount; ++n)
    {
        i = this.m_vertices[n];
        f = i.x - j;
        g = i.y - k;
        i = this.m_normals[n];
        f = i.x * f + i.y * g;
        g = i.x * b + i.y * h;
        if (0 == g)
        {
            if (0 > f)
            {
                return!1
            }
        } else
        {
            0 > g && f < d * g ? (d = f / g, l = n) : 0 < g && f < e * g && (e = f / g)
        }
        if (e < d - Number.MIN_VALUE)
        {
            return!1
        }
    }
    return 0 <= l ? (a.fraction = d, h = c.R, i = this.m_normals[l], a.normal.x = h.col1.x * i.x + h.col2.x * i.y, a.normal.y = h.col1.y * i.x + h.col2.y * i.y, !0) : !1
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeAABB = function (a, b)
{
    for (var c = b.R, d = this.m_vertices[0], e = b.position.x + (c.col1.x * d.x + c.col2.x * d.y), f = b.position.y + (c.col1.y * d.x + c.col2.y * d.y), g = e, h = f, i = 1; i < this.m_vertexCount; ++i)
    {
        var d = this.m_vertices[i], j = b.position.x + (c.col1.x * d.x + c.col2.x * d.y), d = b.position.y + (c.col1.y * d.x + c.col2.y * d.y), e = e < j ? e : j, f = f < d ? f : d, g = g > j ? g : j, h = h > d ? h : d
    }
    a.lowerBound.x = e - this.m_radius;
    a.lowerBound.y = f - this.m_radius;
    a.upperBound.x = g + this.m_radius;
    a.upperBound.y = h + this.m_radius
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeMass = function (a, b)
{
    if (2 == this.m_vertexCount)
    {
        a.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x), a.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y), a.mass = 0, a.I = 0
    } else
    {
        for (var c = 0, d = 0, e = 0, f = 0, g = 1 / 3, h = 0; h < this.m_vertexCount; ++h)
        {
            var i = this.m_vertices[h], j = h + 1 < this.m_vertexCount ? this.m_vertices[h + 1] : this.m_vertices[0], k = i.x - 0, l = i.y - 0, n = j.x - 0, m = j.y - 0, o = k * m - l * n, p = 0.5 * o, e = e + p, c = c + p * g * (0 + i.x + j.x), d = d + p * g * (0 + i.y + j.y), i = k, f = f + o * (g * (0.25 * (i * i + n * i + n * n) + (0 * i + 0 * n)) + 0 + (g * (0.25 * (l * l + m * l + m * m) + (0 * l + 0 * m)) + 0))
        }
        a.Set(b * e, c * (1 / e), d * (1 / e), b * f)
    }
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeSubmergedArea = function (a, b, c, d)
{
    for (var e = Box2D.Common.Math.b2Math.MulTMV(c.R, a), f = b - Box2D.Common.Math.b2Math.Dot(a, c.position), g = [], h = 0, i = -1, b = -1, j = !1, a = a = 0; a < this.m_vertexCount; ++a)
    {
        g[a] = Box2D.Common.Math.b2Math.Dot(e, this.m_vertices[a]) - f;
        var k = g[a] < -Number.MIN_VALUE;
        0 < a && (k ? j || (i = a - 1, h++) : j && (b = a - 1, h++));
        j = k
    }
    Box2D.Common.Math.b2Vec2.Free(e);
    switch (h)
    {
        case 0:
            return j ? (a = Box2D.Collision.Shapes.b2MassData.Get(), this.ComputeMass(a, 1), c = Box2D.Common.Math.b2Math.MulX(c, a.center), d.SetV(c), Box2D.Common.Math.b2Vec2.Free(c), d = a.mass, Box2D.Collision.Shapes.b2MassData.Free(a), d) : 0;
        case 1:
            -1 == i ? i = this.m_vertexCount - 1 : b = this.m_vertexCount - 1
    }
    a = (i + 1) % this.m_vertexCount;
    e = (b + 1) % this.m_vertexCount;
    f = (0 - g[i]) / (g[a] - g[i]);
    g = (0 - g[b]) / (g[e] - g[b]);
    i = Box2D.Common.Math.b2Vec2.Get(this.m_vertices[i].x * (1 - f) + this.m_vertices[a].x * f, this.m_vertices[i].y * (1 - f) + this.m_vertices[a].y * f);
    f = Box2D.Common.Math.b2Vec2.Get(this.m_vertices[b].x * (1 - g) + this.m_vertices[e].x * g, this.m_vertices[b].y * (1 - g) + this.m_vertices[e].y * g);
    b = 0;
    g = Box2D.Common.Math.b2Vec2.Get(0, 0);
    for (h = this.m_vertices[a]; a != e;)
    {
        a = (a + 1) % this.m_vertexCount, j = a == e ? f : this.m_vertices[a], k = 0.5 * ((h.x - i.x) * (j.y - i.y) - (h.y - i.y) * (j.x - i.x)), b += k, g.x += k * (i.x + h.x + j.x) / 3, g.y += k * (i.y + h.y + j.y) / 3, h = j
    }
    Box2D.Common.Math.b2Vec2.Free(i);
    Box2D.Common.Math.b2Vec2.Free(f);
    g.Multiply(1 / b);
    c = Box2D.Common.Math.b2Math.MulX(c, g);
    Box2D.Common.Math.b2Vec2.Free(g);
    d.SetV(c);
    Box2D.Common.Math.b2Vec2.Free(c);
    return b
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetDistanceProxy = function (a)
{
    a.SetValues(this.m_vertexCount, this.m_radius, this.m_vertices)
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertexCount = function ()
{
    return this.m_vertexCount
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertices = function ()
{
    return this.m_vertices
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetNormals = function ()
{
    return this.m_normals
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetSupport = function (a)
{
    for (var b = 0, c = this.m_vertices[0].x * a.x + this.m_vertices[0].y * a.y, d = 1; d < this.m_vertexCount; ++d)
    {
        var e = this.m_vertices[d].x * a.x + this.m_vertices[d].y * a.y;
        e > c && (b = d, c = e)
    }
    return b
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetSupportVertex = function (a)
{
    for (var b = 0, c = this.m_vertices[0].x * a.x + this.m_vertices[0].y * a.y, d = 1; d < this.m_vertexCount; ++d)
    {
        var e = this.m_vertices[d].x * a.x + this.m_vertices[d].y * a.y;
        e > c && (b = d, c = e)
    }
    return this.m_vertices[b]
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.Reserve = function (a)
{
    for (var b = 0; b < this.m_vertices.length; b++)
    {
        Box2D.Common.Math.b2Vec2.Free(this.m_vertices[b]), Box2D.Common.Math.b2Vec2.Free(this.m_normals[b])
    }
    this.m_vertices = [];
    this.m_normals = [];
    for (b = 0; b < a; b++)
    {
        this.m_vertices[b] = Box2D.Common.Math.b2Vec2.Get(0, 0), this.m_normals[b] = Box2D.Common.Math.b2Vec2.Get(0, 0)
    }
};
Box2D.Collision.Shapes.b2PolygonShape.ComputeCentroid = function (a, b)
{
    for (var c = Box2D.Common.Math.b2Vec2.Get(0, 0), d = 0, e = 1 / 3, f = 0; f < b; ++f)
    {
        var g = a[f], h = f + 1 < b ? a[f + 1] : a[0], i = 0.5 * ((g.x - 0) * (h.y - 0) - (g.y - 0) * (h.x - 0)), d = d + i;
        c.x += i * e * (0 + g.x + h.x);
        c.y += i * e * (0 + g.y + h.y)
    }
    c.x *= 1 / d;
    c.y *= 1 / d;
    return c
};
Box2D.Collision.Shapes.b2PolygonShape.s_mat = new Box2D.Common.Math.b2Mat22;
Box2D.Collision.Shapes.b2PolygonShape.NAME = "b2PolygonShape";
Box2D.Collision.Shapes.b2EdgeShape = function (a, b)
{

    Box2D.Collision.Shapes.b2Shape.call(this);
    this.m_nextEdge = this.m_prevEdge = null;
    this.m_v1 = a;
    this.m_v2 = b;
    this.m_direction = Box2D.Common.Math.b2Vec2.Get(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
    this.m_length = this.m_direction.Normalize();
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(this.m_direction.y, -this.m_direction.x);
    this.m_coreV1 = Box2D.Common.Math.b2Vec2.Get(-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y);
    this.m_coreV2 = Box2D.Common.Math.b2Vec2.Get(-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y);
    this.m_cornerDir1 = this.m_normal;
    this.m_cornerDir2 = Box2D.Common.Math.b2Vec2.Get(-this.m_normal.x, -this.m_normal.y);
    this.m_cornerConvex2 = this.m_cornerConvex1 = !1
};
goog.inherits(Box2D.Collision.Shapes.b2EdgeShape, Box2D.Collision.Shapes.b2Shape);
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetTypeName = function ()
{
    return Box2D.Collision.Shapes.b2EdgeShape.NAME
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.TestPoint = function ()
{
    return!1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.RayCast = function (a, b, c)
{
    var d = b.p2.x - b.p1.x, e = b.p2.y - b.p1.y, f = c.R, g = c.position.x + (f.col1.x * this.m_v1.x + f.col2.x * this.m_v1.y), h = c.position.y + (f.col1.y * this.m_v1.x + f.col2.y * this.m_v1.y), i = c.position.y + (f.col1.y * this.m_v2.x + f.col2.y * this.m_v2.y) - h, c = -(c.position.x + (f.col1.x * this.m_v2.x + f.col2.x * this.m_v2.y) - g), f = 100 * Number.MIN_VALUE, j = -(d * i + e * c);
    if (j > f)
    {
        var g = b.p1.x - g, k = b.p1.y - h, h = g * i + k * c;
        if (0 <= h && h <= b.maxFraction * j && (b = -d * k + e * g, -f * j <= b && b <= j * (1 + f)))
        {
            return a.fraction = h / j, b = Math.sqrt(i * i + c * c), a.normal.x = i / b, a.normal.y = c / b, !0
        }
    }
    return!1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeAABB = function (a, b)
{
    var c = b.R, d = b.position.x + (c.col1.x * this.m_v1.x + c.col2.x * this.m_v1.y), e = b.position.y + (c.col1.y * this.m_v1.x + c.col2.y * this.m_v1.y), f = b.position.x + (c.col1.x * this.m_v2.x + c.col2.x * this.m_v2.y), c = b.position.y + (c.col1.y * this.m_v2.x + c.col2.y * this.m_v2.y);
    d < f ? (a.lowerBound.x = d, a.upperBound.x = f) : (a.lowerBound.x = f, a.upperBound.x = d);
    e < c ? (a.lowerBound.y = e, a.upperBound.y = c) : (a.lowerBound.y = c, a.upperBound.y = e)
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeMass = function (a)
{
    a.mass = 0;
    a.center.SetV(this.m_v1);
    a.I = 0
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeSubmergedArea = function (a, b, c, d)
{
    void 0 === b && (b = 0);
    var e = Box2D.Common.Math.b2Vec2.Get(a.x * b, a.y * b), f = Box2D.Common.Math.b2Math.MulX(c, this.m_v1), c = Box2D.Common.Math.b2Math.MulX(c, this.m_v2), g = Box2D.Common.Math.b2Math.Dot(a, f) - b, a = Box2D.Common.Math.b2Math.Dot(a, c) - b;
    if (0 < g)
    {
        if (0 < a)
        {
            return 0
        }
        f.x = -a / (g - a) * f.x + g / (g - a) * c.x;
        f.y = -a / (g - a) * f.y + g / (g - a) * c.y
    } else
    {
        0 < a && (c.x = -a / (g - a) * f.x + g / (g - a) * c.x, c.y = -a / (g - a) * f.y + g / (g - a) * c.y)
    }
    d.x = (e.x + f.x + c.x) / 3;
    d.y = (e.y + f.y + c.y) / 3;
    return 0.5 * ((f.x - e.x) * (c.y - e.y) - (f.y - e.y) * (c.x - e.x))
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetLength = function ()
{
    return this.m_length
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetVertex1 = function ()
{
    return this.m_v1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetVertex2 = function ()
{
    return this.m_v2
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCoreVertex1 = function ()
{
    return this.m_coreV1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCoreVertex2 = function ()
{
    return this.m_coreV2
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetNormalVector = function ()
{
    return this.m_normal
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetDirectionVector = function ()
{
    return this.m_direction
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCorner1Vector = function ()
{
    return this.m_cornerDir1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCorner2Vector = function ()
{
    return this.m_cornerDir2
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.Corner1IsConvex = function ()
{
    return this.m_cornerConvex1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.Corner2IsConvex = function ()
{
    return this.m_cornerConvex2
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetFirstVertex = function (a)
{
    var b = a.R;
    return Box2D.Common.Math.b2Vec2.Get(a.position.x + (b.col1.x * this.m_coreV1.x + b.col2.x * this.m_coreV1.y), a.position.y + (b.col1.y * this.m_coreV1.x + b.col2.y * this.m_coreV1.y))
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetNextEdge = function ()
{
    return this.m_nextEdge
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetPrevEdge = function ()
{
    return this.m_prevEdge
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.Support = function (a, b, c)
{
    var d = a.R, e = a.position.x + (d.col1.x * this.m_coreV1.x + d.col2.x * this.m_coreV1.y), f = a.position.y + (d.col1.y * this.m_coreV1.x + d.col2.y * this.m_coreV1.y), g = a.position.x + (d.col1.x * this.m_coreV2.x + d.col2.x * this.m_coreV2.y), a = a.position.y + (d.col1.y * this.m_coreV2.x + d.col2.y * this.m_coreV2.y);
    return e * b + f * c > g * b + a * c ? Box2D.Common.Math.b2Vec2.Get(e, f) : Box2D.Common.Math.b2Vec2.Get(g, a)
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.SetPrevEdge = function (a, b, c, d)
{
    this.m_prevEdge = a;
    this.m_coreV1 = b;
    this.m_cornerDir1 = c;
    this.m_cornerConvex1 = d
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.SetNextEdge = function (a, b, c, d)
{
    this.m_nextEdge = a;
    this.m_coreV2 = b;
    this.m_cornerDir2 = c;
    this.m_cornerConvex2 = d
};
Box2D.Collision.Shapes.b2EdgeShape.NAME = "b2EdgeShape";
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(a.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(b.GetShape() instanceof Box2D.Collision.Shapes.b2EdgeShape);
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2PolyAndEdgeContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.Reset = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(a.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(b.GetShape() instanceof Box2D.Collision.Shapes.b2EdgeShape);
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.Evaluate = function ()
{
    this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf)
};
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function ()
{
};
Box2D.Dynamics.b2TimeStep = function (a, b, c, d, e)
{

    this.Reset(a, b, c, d, e)
};
Box2D.Dynamics.b2TimeStep.prototype.Reset = function (a, b, c, d, e)
{
    this.dt = a;
    var f = 0;
    0 < a && (f = 1 / a);
    this.inv_dt = f;
    this.dtRatio = b;
    this.positionIterations = c;
    this.velocityIterations = d;
    this.warmStarting = e
};
Box2D.Dynamics.Joints.b2FrictionJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_linearMass = new Box2D.Common.Math.b2Mat22;
    this.m_linearImpulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorA.SetV(a.localAnchorA);
    this.m_localAnchorB.SetV(a.localAnchorB);
    this.m_linearMass.SetZero();
    this.m_angularMass = 0;
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0;
    this.m_maxForce = a.maxForce;
    this.m_maxTorque = a.maxTorque
};
goog.inherits(Box2D.Dynamics.Joints.b2FrictionJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return new Box2D.Common.Math.b2Vec2.Get(a * this.m_linearImpulse.x, a * this.m_linearImpulse.y)
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    return a * this.m_angularImpulse
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SetMaxForce = function (a)
{
    void 0 === a && (a = 0);
    this.m_maxForce = a
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetMaxForce = function ()
{
    return this.m_maxForce
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SetMaxTorque = function (a)
{
    void 0 === a && (a = 0);
    this.m_maxTorque = a
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetMaxTorque = function ()
{
    return this.m_maxTorque
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.InitVelocityConstraints = function (a)
{
    var b, c = 0, d = this.m_bodyA, e = this.m_bodyB;
    b = d.m_xf.R;
    var f = this.m_localAnchorA.x - d.m_sweep.localCenter.x, g = this.m_localAnchorA.y - d.m_sweep.localCenter.y, c = b.col1.x * f + b.col2.x * g, g = b.col1.y * f + b.col2.y * g, f = c;
    b = e.m_xf.R;
    var h = this.m_localAnchorB.x - e.m_sweep.localCenter.x, i = this.m_localAnchorB.y - e.m_sweep.localCenter.y, c = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = c;
    b = d.m_invMass;
    var c = e.m_invMass, j = d.m_invI, k = e.m_invI, l = new b2Mat22;
    l.col1.x = b + c;
    l.col2.x = 0;
    l.col1.y = 0;
    l.col2.y = b + c;
    l.col1.x += j * g * g;
    l.col2.x += -j * f * g;
    l.col1.y += -j * f * g;
    l.col2.y += j * f * f;
    l.col1.x += k * i * i;
    l.col2.x += -k * h * i;
    l.col1.y += -k * h * i;
    l.col2.y += k * h * h;
    l.GetInverse(this.m_linearMass);
    this.m_angularMass = j + k;
    0 < this.m_angularMass && (this.m_angularMass = 1 / this.m_angularMass);
    a.warmStarting ? (this.m_linearImpulse.x *= a.dtRatio, this.m_linearImpulse.y *= a.dtRatio, this.m_angularImpulse *= a.dtRatio, a = this.m_linearImpulse, d.m_linearVelocity.x -= b * a.x, d.m_linearVelocity.y -= b * a.y, d.m_angularVelocity -= j * (f * a.y - g * a.x + this.m_angularImpulse), e.m_linearVelocity.x += c * a.x, e.m_linearVelocity.y += c * a.y, e.m_angularVelocity += k * (h * a.y - i * a.x + this.m_angularImpulse)) : (this.m_linearImpulse.SetZero(), this.m_angularImpulse = 0)
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b, c = 0, d = this.m_bodyA, e = this.m_bodyB, f = d.m_linearVelocity, g = d.m_angularVelocity, h = e.m_linearVelocity, i = e.m_angularVelocity, j = d.m_invMass, k = e.m_invMass, l = d.m_invI, n = e.m_invI;
    b = d.m_xf.R;
    var m = this.m_localAnchorA.x - d.m_sweep.localCenter.x, o = this.m_localAnchorA.y - d.m_sweep.localCenter.y, c = b.col1.x * m + b.col2.x * o, o = b.col1.y * m + b.col2.y * o, m = c;
    b = e.m_xf.R;
    var p = this.m_localAnchorB.x - e.m_sweep.localCenter.x, q = this.m_localAnchorB.y - e.m_sweep.localCenter.y, c = b.col1.x * p + b.col2.x * q, q = b.col1.y * p + b.col2.y * q, p = c;
    b = 0;
    var c = -this.m_angularMass * (i - g), r = this.m_angularImpulse;
    b = a.dt * this.m_maxTorque;
    this.m_angularImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_angularImpulse + c, -b, b);
    c = this.m_angularImpulse - r;
    g -= l * c;
    i += n * c;
    b = Box2D.Common.Math.b2Vec2.Get(-(h.x - i * q - f.x + g * o), -(h.y + i * p - f.y - g * m));
    b.MulM(this.m_linearMass);
    c = this.m_linearImpulse.Copy();
    this.m_linearImpulse.Add(b);
    Box2D.Common.Math.b2Vec2.Free(b);
    b = a.dt * this.m_maxForce;
    this.m_linearImpulse.LengthSquared() > b * b && (this.m_linearImpulse.Normalize(), this.m_linearImpulse.Multiply(b));
    b = Box2D.Common.Math.b2Math.SubtractVV(this.m_linearImpulse, c);
    Box2D.Common.Math.b2Vec2.Free(c);
    f.x -= j * b.x;
    f.y -= j * b.y;
    g -= l * (m * b.y - o * b.x);
    h.x += k * b.x;
    h.y += k * b.y;
    i += n * (p * b.y - q * b.x);
    Box2D.Common.Math.b2Vec2.Free(b);
    d.m_angularVelocity = g;
    e.m_angularVelocity = i
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SolvePositionConstraints = function ()
{
    return!0
};
Box2D.Dynamics.b2DestructionListener = function ()
{
};
Box2D.Dynamics.b2DestructionListener.prototype.SayGoodbyeJoint = function ()
{
};
Box2D.Dynamics.b2DestructionListener.prototype.SayGoodbyeFixture = function ()
{
};
Box2D.Dynamics.b2FilterData = function ()
{

    this.categoryBits = 1;
    this.maskBits = 65535;
    this.groupIndex = 0
};
Box2D.Dynamics.b2FilterData.prototype.Copy = function ()
{
    var a = new Box2D.Dynamics.b2FilterData;
    a.categoryBits = this.categoryBits;
    a.maskBits = this.maskBits;
    a.groupIndex = this.groupIndex;
    return a
};
Box2D.Dynamics.b2Fixture = function (a, b, c)
{

    this.ID = "Fixture" + Box2D.Dynamics.b2Fixture.NEXT_ID++;
    this.m_filter = c.filter.Copy();
    this.m_aabb = Box2D.Collision.b2AABB.Get();
    this.m_aabb_temp = Box2D.Collision.b2AABB.Get();
    this.m_body = a;
    this.m_shape = c.shape.Copy();
    this.m_density = c.density;
    this.m_friction = c.friction;
    this.m_restitution = c.restitution;
    this.m_isSensor = c.isSensor
};
Box2D.Dynamics.b2Fixture.prototype.GetShape = function ()
{
    return this.m_shape
};
Box2D.Dynamics.b2Fixture.prototype.SetSensor = function (a)
{
    if (this.m_isSensor != a && (this.m_isSensor = a, null != this.m_body))
    {
        for (a = this.m_body.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            var b = a.contact.GetFixtureA(), c = a.contact.GetFixtureB();
            if (b == this || c == this)
            {
                a.contact.SetSensor(b.IsSensor() || c.IsSensor())
            }
        }
    }
};
Box2D.Dynamics.b2Fixture.prototype.IsSensor = function ()
{
    return this.m_isSensor
};
Box2D.Dynamics.b2Fixture.prototype.SetFilterData = function (a)
{
    this.m_filter = a.Copy();
    if (null != this.m_body)
    {
        for (a = this.m_body.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            (a.contact.GetFixtureA() == this || a.contact.GetFixtureB() == this) && a.contact.FlagForFiltering()
        }
    }
};
Box2D.Dynamics.b2Fixture.prototype.GetFilterData = function ()
{
    return this.m_filter
};
Box2D.Dynamics.b2Fixture.prototype.GetBody = function ()
{
    return this.m_body
};
Box2D.Dynamics.b2Fixture.prototype.TestPoint = function (a)
{
    return this.m_shape.TestPoint(this.m_body.GetTransform(), a)
};
Box2D.Dynamics.b2Fixture.prototype.RayCast = function (a, b)
{
    return this.m_shape.RayCast(a, b, this.m_body.GetTransform())
};
Box2D.Dynamics.b2Fixture.prototype.GetMassData = function (a)
{
    a || (a = Box2D.Collision.Shapes.b2MassData.Get());
    this.m_shape.ComputeMass(a, this.m_density);
    return a
};
Box2D.Dynamics.b2Fixture.prototype.SetDensity = function (a)
{
    this.m_density = a
};
Box2D.Dynamics.b2Fixture.prototype.GetDensity = function ()
{
    return this.m_density
};
Box2D.Dynamics.b2Fixture.prototype.GetFriction = function ()
{
    return this.m_friction
};
Box2D.Dynamics.b2Fixture.prototype.SetFriction = function (a)
{
    this.m_friction = a
};
Box2D.Dynamics.b2Fixture.prototype.GetRestitution = function ()
{
    return this.m_restitution
};
Box2D.Dynamics.b2Fixture.prototype.SetRestitution = function (a)
{
    this.m_restitution = a
};
Box2D.Dynamics.b2Fixture.prototype.GetAABB = function ()
{
    return this.m_aabb
};
Box2D.Dynamics.b2Fixture.prototype.Destroy = function ()
{
    Box2D.Collision.b2AABB.Free(this.m_aabb)
};
Box2D.Dynamics.b2Fixture.prototype.CreateProxy = function (a, b)
{
    this.m_shape.ComputeAABB(this.m_aabb, b);
    this.m_proxy = a.CreateProxy(this.m_aabb, this)
};
Box2D.Dynamics.b2Fixture.prototype.DestroyProxy = function (a)
{
    null != this.m_proxy && (a.DestroyProxy(this.m_proxy), this.m_proxy = null)
};
Box2D.Dynamics.b2Fixture.prototype.Synchronize = function (a, b, c)
{
    this.m_proxy && (this.m_shape.ComputeAABB(this.m_aabb, b), this.m_shape.ComputeAABB(this.m_aabb_temp, c), this.m_aabb.Combine(this.m_aabb, this.m_aabb_temp), b = Box2D.Common.Math.b2Math.SubtractVV(c.position, b.position), a.MoveProxy(this.m_proxy, this.m_aabb, b), Box2D.Common.Math.b2Vec2.Free(b))
};
Box2D.Dynamics.b2Fixture.NEXT_ID = 0;
Box2D.Dynamics.iContactListener = function ()
{
};
Box2D.Dynamics.iContactListener.prototype.BeginContact = function ()
{
};
Box2D.Dynamics.iContactListener.prototype.EndContact = function ()
{
};
Box2D.Dynamics.iContactListener.prototype.PreSolve = function ()
{
};
Box2D.Dynamics.iContactListener.prototype.PostSolve = function ()
{
};
Box2D.Dynamics.Contacts.b2CircleContact = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2CircleContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2CircleContact.prototype.Reset = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2CircleContact.prototype.Evaluate = function ()
{
    var a = this.m_fixtureA.GetShape(), b = this.m_fixtureB.GetShape();
    Box2D.Collision.b2Collision.CollideCircles(this.m_manifold, a, this.m_fixtureA.GetBody().m_xf, b, this.m_fixtureB.GetBody().m_xf)
};
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2EdgeAndCircleContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.Reset = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.Evaluate = function ()
{
    this.m_fixtureA.GetBody();
    this.m_fixtureB.GetBody();
    this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf)
};
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function ()
{
};
Box2D.Dynamics.Joints.b2FrictionJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_frictionJoint;
    this.maxTorque = this.maxForce = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2FrictionJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2FrictionJointDef.prototype.Initialize = function (a, b, c)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(c));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(c))
};
Box2D.Dynamics.Joints.b2FrictionJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2FrictionJoint(this)
};
Box2D.Dynamics.Joints.b2RevoluteJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.K = new Box2D.Common.Math.b2Mat22;
    this.K1 = new Box2D.Common.Math.b2Mat22;
    this.K2 = new Box2D.Common.Math.b2Mat22;
    this.K3 = new Box2D.Common.Math.b2Mat22;
    this.impulse3 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.impulse2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.reduced = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat33;
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_referenceAngle = a.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0;
    this.m_lowerAngle = a.lowerAngle;
    this.m_upperAngle = a.upperAngle;
    this.m_maxMotorTorque = a.maxMotorTorque;
    this.m_motorSpeed = a.motorSpeed;
    this.m_enableLimit = a.enableLimit;
    this.m_enableMotor = a.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_motorMass = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2RevoluteJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse.x, a * this.m_impulse.y)
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    return a * this.m_impulse.z
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetJointAngle = function ()
{
    return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetJointSpeed = function ()
{
    return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.IsLimitEnabled = function ()
{
    return this.m_enableLimit
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.EnableLimit = function (a)
{
    this.m_enableLimit = a
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetLowerLimit = function ()
{
    return this.m_lowerAngle
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetUpperLimit = function ()
{
    return this.m_upperAngle
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetLimits = function (a, b)
{
    void 0 === a && (a = 0);
    void 0 === b && (b = 0);
    this.m_lowerAngle = a;
    this.m_upperAngle = b
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.IsMotorEnabled = function ()
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    return this.m_enableMotor
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.EnableMotor = function (a)
{
    this.m_enableMotor = a
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetMotorSpeed = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_motorSpeed = a
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetMotorSpeed = function ()
{
    return this.m_motorSpeed
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetMaxMotorTorque = function (a)
{
    void 0 === a && (a = 0);
    this.m_maxMotorTorque = a
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetMotorTorque = function ()
{
    return this.m_maxMotorTorque
};


Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.InitVelocityConstraints = function (step)
{
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX = 0;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var m1 = bA.m_invMass;
    var m2 = bB.m_invMass;
    var i1 = bA.m_invI;
    var i2 = bB.m_invI;
    this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
    this.m_mass.col2.x = (-r1Y * r1X * i1) - r2Y * r2X * i2;
    this.m_mass.col3.x = (-r1Y * i1) - r2Y * i2;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
    this.m_mass.col3.y = r1X * i1 + r2X * i2;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = i1 + i2;
    if (i1 + i2 == 0)
    {
        this.m_motorMass = 0;
    } else
    {
        this.m_motorMass = 0.01;//1.0 / (i1 + i2);
    }
    if (!this.m_enableMotor)
    {
        this.m_motorImpulse = 0.0;
    }
    if (this.m_enableLimit)
    {
        var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
        if (Math.abs(this.m_upperAngle - this.m_lowerAngle) < 2.0 * Box2D.Common.b2Settings.b2_angularSlop)
        {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits;
        } else if (jointAngle <= this.m_lowerAngle)
        {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit)
            {
                this.m_impulse.z = 0.0;
            }
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit;
        } else if (jointAngle >= this.m_upperAngle)
        {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit)
            {
                this.m_impulse.z = 0.0;
            }
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
        } else
        {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
            this.m_impulse.z = 0.0;
        }
    } else
    {
        this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    }
    if (step.warmStarting)
    {
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x;
        var PY = this.m_impulse.y;
        bA.m_linearVelocity.x -= m1 * PX;
        bA.m_linearVelocity.y -= m1 * PY;
        bA.m_angularVelocity -= i1 * ((r1X * PY - r1Y * PX) + this.m_motorImpulse + this.m_impulse.z);
        bB.m_linearVelocity.x += m2 * PX;
        bB.m_linearVelocity.y += m2 * PY;
        bB.m_angularVelocity += i2 * ((r2X * PY - r2Y * PX) + this.m_motorImpulse + this.m_impulse.z);
    } else
    {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0.0;
    }
};


Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d = 0, e = d = 0, f = 0, g = 0, h = 0, i = b.m_linearVelocity, j = b.m_angularVelocity, k = c.m_linearVelocity, l = c.m_angularVelocity, n = b.m_invMass, m = c.m_invMass, o = b.m_invI, p = c.m_invI;
    this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits && (e = this.m_motorMass * -(l - j - this.m_motorSpeed), f = this.m_motorImpulse, g = a.dt * this.m_maxMotorTorque, this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + e, -g, g), e = this.m_motorImpulse - f, j -= o * e, l += p * e);
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit)
    {
        var a = b.m_xf.R, e = this.m_localAnchor1.x - b.m_sweep.localCenter.x, f = this.m_localAnchor1.y - b.m_sweep.localCenter.y, d = a.col1.x * e + a.col2.x * f, f = a.col1.y * e + a.col2.y * f, e = d, a = c.m_xf.R, g = this.m_localAnchor2.x - c.m_sweep.localCenter.x, h = this.m_localAnchor2.y - c.m_sweep.localCenter.y, d = a.col1.x * g + a.col2.x * h, h = a.col1.y * g + a.col2.y * h, g = d, a = k.x + -l * h - i.x - -j * f, q = k.y + l * g - i.y - j * e;
        this.m_mass.Solve33(this.impulse3, -a, -q, -(l - j));
        this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_equalLimits ? this.m_impulse.Add(this.impulse3) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit ? (d = this.m_impulse.z + this.impulse3.z, 0 > d && (this.m_mass.Solve22(this.reduced, -a, -q), this.impulse3.x = this.reduced.x, this.impulse3.y = this.reduced.y, this.impulse3.z = -this.m_impulse.z, this.m_impulse.x += this.reduced.x, this.m_impulse.y += this.reduced.y, this.m_impulse.z = 0)) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
            (d = this.m_impulse.z + this.impulse3.z, 0 < d && (this.m_mass.Solve22(this.reduced, -a, -q), this.impulse3.x = this.reduced.x, this.impulse3.y = this.reduced.y, this.impulse3.z = -this.m_impulse.z, this.m_impulse.x += this.reduced.x, this.m_impulse.y += this.reduced.y, this.m_impulse.z = 0));
        i.x -= n * this.impulse3.x;
        i.y -= n * this.impulse3.y;
        j -= o * (e * this.impulse3.y - f * this.impulse3.x + this.impulse3.z);
        k.x += m * this.impulse3.x;
        k.y += m * this.impulse3.y;
        l += p * (g * this.impulse3.y - h * this.impulse3.x + this.impulse3.z)
    } else
    {
        a = b.m_xf.R, e = this.m_localAnchor1.x - b.m_sweep.localCenter.x, f = this.m_localAnchor1.y - b.m_sweep.localCenter.y, d = a.col1.x * e + a.col2.x * f, f = a.col1.y * e + a.col2.y * f, e = d, a = c.m_xf.R, g = this.m_localAnchor2.x - c.m_sweep.localCenter.x, h = this.m_localAnchor2.y - c.m_sweep.localCenter.y, d = a.col1.x * g + a.col2.x * h, h = a.col1.y * g + a.col2.y * h, g = d, this.m_mass.Solve22(this.impulse2, -(k.x + -l * h - i.x - -j * f), -(k.y + l * g - i.y - j * e)), this.m_impulse.x +=
            this.impulse2.x, this.m_impulse.y += this.impulse2.y, i.x -= n * this.impulse2.x, i.y -= n * this.impulse2.y, j -= o * (e * this.impulse2.y - f * this.impulse2.x), k.x += m * this.impulse2.x, k.y += m * this.impulse2.y, l += p * (g * this.impulse2.y - h * this.impulse2.x)
    }
    b.m_linearVelocity.SetV(i);
    b.m_angularVelocity = j;
    c.m_linearVelocity.SetV(k);
    c.m_angularVelocity = l
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SolvePositionConstraints = function ()
{
    var a = 0, b, c = this.m_bodyA, d = this.m_bodyB, e = 0, f = b = 0, g = 0, h = 0;
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit)
    {
        var a = d.m_sweep.a - c.m_sweep.a - this.m_referenceAngle, i = 0;
        this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_equalLimits ? (a = Box2D.Common.Math.b2Math.Clamp(a - this.m_lowerAngle, -Box2D.Common.b2Settings.b2_maxAngularCorrection, Box2D.Common.b2Settings.b2_maxAngularCorrection), i = -this.m_motorMass * a, e = Math.abs(a)) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit ? (a -= this.m_lowerAngle, e = -a, a = Box2D.Common.Math.b2Math.Clamp(a + Box2D.Common.b2Settings.b2_angularSlop, -Box2D.Common.b2Settings.b2_maxAngularCorrection,
            0), i = -this.m_motorMass * a) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (e = a -= this.m_upperAngle, a = Box2D.Common.Math.b2Math.Clamp(a - Box2D.Common.b2Settings.b2_angularSlop, 0, Box2D.Common.b2Settings.b2_maxAngularCorrection), i = -this.m_motorMass * a);
        c.m_sweep.a -= c.m_invI * i;
        d.m_sweep.a += d.m_invI * i;
        c.SynchronizeTransform();
        d.SynchronizeTransform()
    }
    b = c.m_xf.R;
    i = this.m_localAnchor1.x - c.m_sweep.localCenter.x;
    a = this.m_localAnchor1.y - c.m_sweep.localCenter.y;
    f = b.col1.x * i + b.col2.x * a;
    a = b.col1.y * i + b.col2.y * a;
    i = f;
    b = d.m_xf.R;
    var j = this.m_localAnchor2.x - d.m_sweep.localCenter.x, k = this.m_localAnchor2.y - d.m_sweep.localCenter.y, f = b.col1.x * j + b.col2.x * k, k = b.col1.y * j + b.col2.y * k, j = f, g = d.m_sweep.c.x + j - c.m_sweep.c.x - i, h = d.m_sweep.c.y + k - c.m_sweep.c.y - a, l = g * g + h * h;
    b = Math.sqrt(l);
    var f = c.m_invMass, n = d.m_invMass, m = c.m_invI, o = d.m_invI, p = 10 * Box2D.Common.b2Settings.b2_linearSlop;
    l > p * p && (l = 1 / (f + n), g = l * -g, h = l * -h, c.m_sweep.c.x -= 0.5 * f * g, c.m_sweep.c.y -= 0.5 * f * h, d.m_sweep.c.x += 0.5 * n * g, d.m_sweep.c.y += 0.5 * n * h, g = d.m_sweep.c.x + j - c.m_sweep.c.x - i, h = d.m_sweep.c.y + k - c.m_sweep.c.y - a);
    this.K1.col1.x = f + n;
    this.K1.col2.x = 0;
    this.K1.col1.y = 0;
    this.K1.col2.y = f + n;
    this.K2.col1.x = m * a * a;
    this.K2.col2.x = -m * i * a;
    this.K2.col1.y = -m * i * a;
    this.K2.col2.y = m * i * i;
    this.K3.col1.x = o * k * k;
    this.K3.col2.x = -o * j * k;
    this.K3.col1.y = -o * j * k;
    this.K3.col2.y = o * j * j;
    this.K.SetM(this.K1);
    this.K.AddM(this.K2);
    this.K.AddM(this.K3);
    this.K.Solve(Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse, -g, -h);
    g = Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse.x;
    h = Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse.y;
    c.m_sweep.c.x -= c.m_invMass * g;
    c.m_sweep.c.y -= c.m_invMass * h;
    c.m_sweep.a -= c.m_invI * (i * h - a * g);
    d.m_sweep.c.x += d.m_invMass * g;
    d.m_sweep.c.y += d.m_invMass * h;
    d.m_sweep.a += d.m_invI * (j * h - k * g);
    c.SynchronizeTransform();
    d.SynchronizeTransform();
    return b <= Box2D.Common.b2Settings.b2_linearSlop && e <= Box2D.Common.b2Settings.b2_angularSlop
};
Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Dynamics.Joints.b2RevoluteJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint;
    this.localAnchorA.SetZero();
    this.localAnchorB.SetZero();
    this.motorSpeed = this.maxMotorTorque = this.upperAngle = this.lowerAngle = this.referenceAngle = 0;
    this.enableMotor = this.enableLimit = !1
};
goog.inherits(Box2D.Dynamics.Joints.b2RevoluteJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2RevoluteJointDef.prototype.Initialize = function (a, b, c)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA = this.bodyA.GetLocalPoint(c);
    this.localAnchorB = this.bodyB.GetLocalPoint(c);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
Box2D.Dynamics.Joints.b2RevoluteJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2RevoluteJoint(this)
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold = function ()
{
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_separations = [];
    this.m_points = [];
    for (var a = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.m_points[a] = Box2D.Common.Math.b2Vec2.Get(0, 0)
    }
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype.Initialize = function (a)
{
    Box2D.Common.b2Settings.b2Assert(0 < a.pointCount);
    switch (a.type)
    {
        case Box2D.Collision.b2Manifold.e_circles:
            this._InitializeCircles(a);
            break;
        case Box2D.Collision.b2Manifold.e_faceA:
            this._InitializeFaceA(a);
            break;
        case Box2D.Collision.b2Manifold.e_faceB:
            this._InitializeFaceB(a)
    }
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeCircles = function (a)
{
    var b = a.bodyA.m_xf.R, c = a.localPoint, d = a.bodyA.m_xf.position.x + (b.col1.x * c.x + b.col2.x * c.y), e = a.bodyA.m_xf.position.y + (b.col1.y * c.x + b.col2.y * c.y), b = a.bodyB.m_xf.R, c = a.points[0].localPoint, f = a.bodyB.m_xf.position.x + (b.col1.x * c.x + b.col2.x * c.y), b = a.bodyB.m_xf.position.y + (b.col1.y * c.x + b.col2.y * c.y), c = f - d, g = b - e, h = c * c + g * g;
    h > Box2D.Common.b2Settings.MIN_VALUE_SQUARED ? (h = Math.sqrt(h), this.m_normal.x = c / h, this.m_normal.y = g / h) : (this.m_normal.x = 1, this.m_normal.y = 0);
    this.m_points[0].x = 0.5 * (d + f);
    this.m_points[0].y = 0.5 * (e + b);
    this.m_separations[0] = c * this.m_normal.x + g * this.m_normal.y - a.radius
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeFaceA = function (a)
{
    this.m_normal.x = a.bodyA.m_xf.R.col1.x * a.localPlaneNormal.x + a.bodyA.m_xf.R.col2.x * a.localPlaneNormal.y;
    this.m_normal.y = a.bodyA.m_xf.R.col1.y * a.localPlaneNormal.x + a.bodyA.m_xf.R.col2.y * a.localPlaneNormal.y;
    for (var b = a.bodyA.m_xf.position.x + (a.bodyA.m_xf.R.col1.x * a.localPoint.x + a.bodyA.m_xf.R.col2.x * a.localPoint.y), c = a.bodyA.m_xf.position.y + (a.bodyA.m_xf.R.col1.y * a.localPoint.x + a.bodyA.m_xf.R.col2.y * a.localPoint.y), d = 0; d < a.pointCount; d++)
    {
        var e = a.bodyB.m_xf.position.x + (a.bodyB.m_xf.R.col1.x * a.points[d].localPoint.x + a.bodyB.m_xf.R.col2.x * a.points[d].localPoint.y), f = a.bodyB.m_xf.position.y + (a.bodyB.m_xf.R.col1.y * a.points[d].localPoint.x + a.bodyB.m_xf.R.col2.y * a.points[d].localPoint.y);
        this.m_separations[d] = (e - b) * this.m_normal.x + (f - c) * this.m_normal.y - a.radius;
        this.m_points[d].x = e;
        this.m_points[d].y = f
    }
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeFaceB = function (a)
{
    this.m_normal.x = a.bodyB.m_xf.R.col1.x * a.localPlaneNormal.x + a.bodyB.m_xf.R.col2.x * a.localPlaneNormal.y;
    this.m_normal.y = a.bodyB.m_xf.R.col1.y * a.localPlaneNormal.x + a.bodyB.m_xf.R.col2.y * a.localPlaneNormal.y;
    for (var b = a.bodyB.m_xf.position.x + (a.bodyB.m_xf.R.col1.x * a.localPoint.x + a.bodyB.m_xf.R.col2.x * a.localPoint.y), c = a.bodyB.m_xf.position.y + (a.bodyB.m_xf.R.col1.y * a.localPoint.x + a.bodyB.m_xf.R.col2.y * a.localPoint.y), d = 0; d < a.pointCount; d++)
    {
        var e = a.bodyA.m_xf.position.x + (a.bodyA.m_xf.R.col1.x * a.points[d].localPoint.x + a.bodyA.m_xf.R.col2.x * a.points[d].localPoint.y), f = a.bodyA.m_xf.position.y + (a.bodyA.m_xf.R.col1.y * a.points[d].localPoint.x + a.bodyA.m_xf.R.col2.y * a.points[d].localPoint.y);
        this.m_separations[d] = (e - b) * this.m_normal.x + (f - c) * this.m_normal.y - a.radius;
        this.m_points[d].Set(e, f)
    }
    this.m_normal.x *= -1;
    this.m_normal.y *= -1
};
Box2D.Dynamics.Contacts.b2PolyAndCircleContact = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(a.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(b.GetShape() instanceof Box2D.Collision.Shapes.b2CircleShape);
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2PolyAndCircleContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2PolyAndCircleContact.prototype.Reset = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(a.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(b.GetShape() instanceof Box2D.Collision.Shapes.b2CircleShape);
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2PolyAndCircleContact.prototype.Evaluate = function ()
{
    var a = this.m_fixtureA.GetShape(), b = this.m_fixtureB.GetShape();
    Box2D.Collision.b2Collision.CollidePolygonAndCircle(this.m_manifold, a, this.m_fixtureA.GetBody().m_xf, b, this.m_fixtureB.GetBody().m_xf)
};
Box2D.Dynamics.Contacts.b2ContactConstraintPoint = function ()
{

    this.localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.rA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.rB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.tangentImpulse = this.normalImpulse = 0
};
Box2D.Dynamics.Contacts.b2ContactConstraintPoint.prototype.Reset = function ()
{
    this.localPoint.Set(0, 0);
    this.rA.Set(0, 0);
    this.rB.Set(0, 0);
    this.tangentImpulse = this.normalImpulse = 0
};
Box2D.Dynamics.Contacts.b2ContactConstraint = function ()
{

    this.localPlaneNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normalMass = new Box2D.Common.Math.b2Mat22;
    this.K = new Box2D.Common.Math.b2Mat22;
    this.points = [];
    for (var a = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.points[a] = new Box2D.Dynamics.Contacts.b2ContactConstraintPoint
    }
};
Box2D.Dynamics.b2FixtureList = function ()
{

    this.fixtureLastNode = this.fixtureFirstNode = null;
    this.fixtureNodeLookup = {};
    this.fixtureCount = 0
};
Box2D.Dynamics.b2FixtureList.prototype.GetFirstNode = function ()
{
    return this.fixtureFirstNode
};
Box2D.Dynamics.b2FixtureList.prototype.AddFixture = function (a)
{
    var b = a.ID;
    if (null == this.fixtureNodeLookup[b])
    {
        var a = new Box2D.Dynamics.b2FixtureListNode(a), c = this.fixtureLastNode;
        null != c ? c.SetNextNode(a) : this.fixtureFirstNode = a;
        a.SetPreviousNode(c);
        this.fixtureLastNode = a;
        this.fixtureNodeLookup[b] = a;
        this.fixtureCount++
    }
};
Box2D.Dynamics.b2FixtureList.prototype.RemoveFixture = function (a)
{
    var a = a.ID, b = this.fixtureNodeLookup[a];
    if (null != b)
    {
        var c = b.GetPreviousNode(), b = b.GetNextNode();
        null == c ? this.fixtureFirstNode = b : c.SetNextNode(b);
        null == b ? this.fixtureLastNode = c : b.SetPreviousNode(c);
        delete this.fixtureNodeLookup[a];
        this.fixtureCount--
    }
};
Box2D.Dynamics.b2FixtureList.prototype.GetFixtureCount = function ()
{
    return this.fixtureCount
};
Box2D.Dynamics.Joints.b2Jacobian = function ()
{
    this.linearA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearB = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.SetZero = function ()
{
    this.linearA.SetZero();
    this.angularA = 0;
    this.linearB.SetZero();
    this.angularB = 0
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.Set = function (a, b, c, d)
{
    void 0 === b && (b = 0);
    void 0 === d && (d = 0);
    this.linearA.SetV(a);
    this.angularA = b;
    this.linearB.SetV(c);
    this.angularB = d
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.Compute = function (a, b, c, d)
{
    void 0 === b && (b = 0);
    void 0 === d && (d = 0);
    return this.linearA.x * a.x + this.linearA.y * a.y + this.angularA * b + (this.linearB.x * c.x + this.linearB.y * c.y) + this.angularB * d
};
Box2D.Dynamics.Joints.b2GearJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_groundAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_groundAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_J = new Box2D.Dynamics.Joints.b2Jacobian;
    var b = a.joint1.m_type, c = a.joint2.m_type;
    this.m_prismatic2 = this.m_revolute2 = this.m_prismatic1 = this.m_revolute1 = null;
    var d = 0, e = 0;
    this.m_ground1 = a.joint1.GetBodyA();
    this.m_bodyA = a.joint1.GetBodyB();
    b == Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint ? (this.m_revolute1 = a.joint1, this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1), this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2), d = this.m_revolute1.GetJointAngle()) : (this.m_prismatic1 = a.joint1, this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1), this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2), d = this.m_prismatic1.GetJointTranslation());
    this.m_ground2 = a.joint2.GetBodyA();
    this.m_bodyB = a.joint2.GetBodyB();
    c == Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint ? (this.m_revolute2 = a.joint2, this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1), this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2), e = this.m_revolute2.GetJointAngle()) : (this.m_prismatic2 = a.joint2, this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1), this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2), e = this.m_prismatic2.GetJointTranslation());
    this.m_ratio = a.ratio;
    this.m_constant = d + this.m_ratio * e;
    this.m_impulse = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2GearJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse * this.m_J.linearB.x, a * this.m_impulse * this.m_J.linearB.y)
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    var b = this.m_bodyB.m_xf.R, c = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x, d = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y, e = b.col1.x * c + b.col2.x * d, d = b.col1.y * c + b.col2.y * d;
    return a * (this.m_impulse * this.m_J.angularB - e * this.m_impulse * this.m_J.linearB.y + d * this.m_impulse * this.m_J.linearB.x)
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetRatio = function ()
{
    return this.m_ratio
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SetRatio = function (a)
{
    void 0 === a && (a = 0);
    this.m_ratio = a
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_ground1, c = this.m_ground2, d = this.m_bodyA, e = this.m_bodyB, f = 0, g = 0, h = 0, i = 0, j = h = 0, k = 0;
    this.m_J.SetZero();
    this.m_revolute1 ? (this.m_J.angularA = -1, k += d.m_invI) : (b = b.m_xf.R, g = this.m_prismatic1.m_localXAxis1, f = b.col1.x * g.x + b.col2.x * g.y, g = b.col1.y * g.x + b.col2.y * g.y, b = d.m_xf.R, h = this.m_localAnchor1.x - d.m_sweep.localCenter.x, i = this.m_localAnchor1.y - d.m_sweep.localCenter.y, j = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = j * g - i * f, this.m_J.linearA.Set(-f, -g), this.m_J.angularA = -h, k += d.m_invMass + d.m_invI * h * h);
    this.m_revolute2 ? (this.m_J.angularB = -this.m_ratio, k += this.m_ratio * this.m_ratio * e.m_invI) : (b = c.m_xf.R, g = this.m_prismatic2.m_localXAxis1, f = b.col1.x * g.x + b.col2.x * g.y, g = b.col1.y * g.x + b.col2.y * g.y, b = e.m_xf.R, h = this.m_localAnchor2.x - e.m_sweep.localCenter.x, i = this.m_localAnchor2.y - e.m_sweep.localCenter.y, j = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = j * g - i * f, this.m_J.linearB.Set(-this.m_ratio * f, -this.m_ratio * g), this.m_J.angularB =
        -this.m_ratio * h, k += this.m_ratio * this.m_ratio * (e.m_invMass + e.m_invI * h * h));
    this.m_mass = 0 < k ? 1 / k : 0;
    a.warmStarting ? (d.m_linearVelocity.x += d.m_invMass * this.m_impulse * this.m_J.linearA.x, d.m_linearVelocity.y += d.m_invMass * this.m_impulse * this.m_J.linearA.y, d.m_angularVelocity += d.m_invI * this.m_impulse * this.m_J.angularA, e.m_linearVelocity.x += e.m_invMass * this.m_impulse * this.m_J.linearB.x, e.m_linearVelocity.y += e.m_invMass * this.m_impulse * this.m_J.linearB.y, e.m_angularVelocity += e.m_invI * this.m_impulse * this.m_J.angularB) : this.m_impulse = 0
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SolveVelocityConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = -this.m_mass * this.m_J.Compute(a.m_linearVelocity, a.m_angularVelocity, b.m_linearVelocity, b.m_angularVelocity);
    this.m_impulse += c;
    a.m_linearVelocity.x += a.m_invMass * c * this.m_J.linearA.x;
    a.m_linearVelocity.y += a.m_invMass * c * this.m_J.linearA.y;
    a.m_angularVelocity += a.m_invI * c * this.m_J.angularA;
    b.m_linearVelocity.x += b.m_invMass * c * this.m_J.linearB.x;
    b.m_linearVelocity.y += b.m_invMass * c * this.m_J.linearB.y;
    b.m_angularVelocity += b.m_invI * c * this.m_J.angularB
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SolvePositionConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = 0, d = 0, c = this.m_revolute1 ? this.m_revolute1.GetJointAngle() : this.m_prismatic1.GetJointTranslation(), d = this.m_revolute2 ? this.m_revolute2.GetJointAngle() : this.m_prismatic2.GetJointTranslation(), c = -this.m_mass * (this.m_constant - (c + this.m_ratio * d));
    a.m_sweep.c.x += a.m_invMass * c * this.m_J.linearA.x;
    a.m_sweep.c.y += a.m_invMass * c * this.m_J.linearA.y;
    a.m_sweep.a += a.m_invI * c * this.m_J.angularA;
    b.m_sweep.c.x += b.m_invMass * c * this.m_J.linearB.x;
    b.m_sweep.c.y += b.m_invMass * c * this.m_J.linearB.y;
    b.m_sweep.a += b.m_invI * c * this.m_J.angularB;
    a.SynchronizeTransform();
    b.SynchronizeTransform();
    return 0 < Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Joints.b2GearJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_gearJoint;
    this.joint2 = this.joint1 = null;
    this.ratio = 1
};
goog.inherits(Box2D.Dynamics.Joints.b2GearJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2GearJointDef.prototype.Initialize = function (a, b, c)
{
    this.joint1 = a;
    this.bodyA = a.GetBodyA();
    this.joint2 = b;
    this.bodyB = b.GetBodyA();
    this.ratio = c
};
Box2D.Dynamics.Joints.b2GearJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2GearJoint(this)
};
Box2D.Dynamics.Joints.b2PulleyJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_groundAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_groundAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_ground = this.m_bodyA.m_world.m_groundBody;
    this.m_groundAnchor1.x = a.groundAnchorA.x - this.m_ground.m_xf.position.x;
    this.m_groundAnchor1.y = a.groundAnchorA.y - this.m_ground.m_xf.position.y;
    this.m_groundAnchor2.x = a.groundAnchorB.x - this.m_ground.m_xf.position.x;
    this.m_groundAnchor2.y = a.groundAnchorB.y - this.m_ground.m_xf.position.y;
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_ratio = a.ratio;
    this.m_constant = a.lengthA + this.m_ratio * a.lengthB;
    this.m_maxLength1 = Math.min(a.maxLengthA, this.m_constant - this.m_ratio * Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength);
    this.m_maxLength2 = Math.min(a.maxLengthB, (this.m_constant - Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
    this.m_limitImpulse2 = this.m_limitImpulse1 = this.m_impulse = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2PulleyJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse * this.m_u2.x, a * this.m_impulse * this.m_u2.y)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetReactionTorque = function ()
{
    return 0
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetGroundAnchorA = function ()
{
    var a = this.m_ground.m_xf.position.Copy();
    a.Add(this.m_groundAnchor1);
    return a
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetGroundAnchorB = function ()
{
    var a = this.m_ground.m_xf.position.Copy();
    a.Add(this.m_groundAnchor2);
    return a
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetLength1 = function ()
{
    var a = this.m_bodyA.GetWorldPoint(this.m_localAnchor1), b = a.x - (this.m_ground.m_xf.position.x + this.m_groundAnchor1.x), a = a.y - (this.m_ground.m_xf.position.y + this.m_groundAnchor1.y);
    return Math.sqrt(b * b + a * a)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetLength2 = function ()
{
    var a = this.m_bodyB.GetWorldPoint(this.m_localAnchor2), b = a.x - (this.m_ground.m_xf.position.x + this.m_groundAnchor2.x), a = a.y - (this.m_ground.m_xf.position.y + this.m_groundAnchor2.y);
    return Math.sqrt(b * b + a * a)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetRatio = function ()
{
    return this.m_ratio
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d;
    d = b.m_xf.R;
    var e = this.m_localAnchor1.x - b.m_sweep.localCenter.x, f = this.m_localAnchor1.y - b.m_sweep.localCenter.y, g = d.col1.x * e + d.col2.x * f, f = d.col1.y * e + d.col2.y * f, e = g;
    d = c.m_xf.R;
    var h = this.m_localAnchor2.x - c.m_sweep.localCenter.x, i = this.m_localAnchor2.y - c.m_sweep.localCenter.y, g = d.col1.x * h + d.col2.x * i, i = d.col1.y * h + d.col2.y * i, h = g;
    d = c.m_sweep.c.x + h;
    var g = c.m_sweep.c.y + i, j = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x, k = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
    this.m_u1.Set(b.m_sweep.c.x + e - (this.m_ground.m_xf.position.x + this.m_groundAnchor1.x), b.m_sweep.c.y + f - (this.m_ground.m_xf.position.y + this.m_groundAnchor1.y));
    this.m_u2.Set(d - j, g - k);
    d = this.m_u1.Length();
    g = this.m_u2.Length();
    d > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u1.Multiply(1 / d) : this.m_u1.SetZero();
    g > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u2.Multiply(1 / g) : this.m_u2.SetZero();
    0 < this.m_constant - d - this.m_ratio * g ? (this.m_state = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_impulse = 0) : this.m_state = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    d < this.m_maxLength1 ? (this.m_limitState1 = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_limitImpulse1 = 0) : this.m_limitState1 = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    g < this.m_maxLength2 ? (this.m_limitState2 = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_limitImpulse2 = 0) : this.m_limitState2 = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    d = e * this.m_u1.y - f * this.m_u1.x;
    g = h * this.m_u2.y - i * this.m_u2.x;
    this.m_limitMass1 = b.m_invMass + b.m_invI * d * d;
    this.m_limitMass2 = c.m_invMass + c.m_invI * g * g;
    this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
    this.m_limitMass1 = 1 / this.m_limitMass1;
    this.m_limitMass2 = 1 / this.m_limitMass2;
    this.m_pulleyMass = 1 / this.m_pulleyMass;
    a.warmStarting ? (this.m_impulse *= a.dtRatio, this.m_limitImpulse1 *= a.dtRatio, this.m_limitImpulse2 *= a.dtRatio, a = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x, d = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y, g = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x, j = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y, b.m_linearVelocity.x += b.m_invMass * a, b.m_linearVelocity.y += b.m_invMass * d, b.m_angularVelocity += b.m_invI *
        (e * d - f * a), c.m_linearVelocity.x += c.m_invMass * g, c.m_linearVelocity.y += c.m_invMass * j, c.m_angularVelocity += c.m_invI * (h * j - i * g)) : this.m_limitImpulse2 = this.m_limitImpulse1 = this.m_impulse = 0
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.SolveVelocityConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c;
    c = a.m_xf.R;
    var d = this.m_localAnchor1.x - a.m_sweep.localCenter.x, e = this.m_localAnchor1.y - a.m_sweep.localCenter.y, f = c.col1.x * d + c.col2.x * e, e = c.col1.y * d + c.col2.y * e, d = f;
    c = b.m_xf.R;
    var g = this.m_localAnchor2.x - b.m_sweep.localCenter.x, h = this.m_localAnchor2.y - b.m_sweep.localCenter.y, f = c.col1.x * g + c.col2.x * h, h = c.col1.y * g + c.col2.y * h, g = f, i = f = c = 0, j = 0;
    c = j = c = j = i = f = c = 0;
    this.m_state == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = a.m_linearVelocity.x + -a.m_angularVelocity * e, f = a.m_linearVelocity.y + a.m_angularVelocity * d, i = b.m_linearVelocity.x + -b.m_angularVelocity * h, j = b.m_linearVelocity.y + b.m_angularVelocity * g, c = -(this.m_u1.x * c + this.m_u1.y * f) - this.m_ratio * (this.m_u2.x * i + this.m_u2.y * j), j = this.m_pulleyMass * -c, c = this.m_impulse, this.m_impulse = Math.max(0, this.m_impulse + j), j = this.m_impulse - c, c = -j *
        this.m_u1.x, f = -j * this.m_u1.y, i = -this.m_ratio * j * this.m_u2.x, j = -this.m_ratio * j * this.m_u2.y, a.m_linearVelocity.x += a.m_invMass * c, a.m_linearVelocity.y += a.m_invMass * f, a.m_angularVelocity += a.m_invI * (d * f - e * c), b.m_linearVelocity.x += b.m_invMass * i, b.m_linearVelocity.y += b.m_invMass * j, b.m_angularVelocity += b.m_invI * (g * j - h * i));
    this.m_limitState1 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = a.m_linearVelocity.x + -a.m_angularVelocity * e, f = a.m_linearVelocity.y + a.m_angularVelocity * d, c = -(this.m_u1.x * c + this.m_u1.y * f), j = -this.m_limitMass1 * c, c = this.m_limitImpulse1, this.m_limitImpulse1 = Math.max(0, this.m_limitImpulse1 + j), j = this.m_limitImpulse1 - c, c = -j * this.m_u1.x, f = -j * this.m_u1.y, a.m_linearVelocity.x += a.m_invMass * c, a.m_linearVelocity.y += a.m_invMass * f, a.m_angularVelocity +=
        a.m_invI * (d * f - e * c));
    this.m_limitState2 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (i = b.m_linearVelocity.x + -b.m_angularVelocity * h, j = b.m_linearVelocity.y + b.m_angularVelocity * g, c = -(this.m_u2.x * i + this.m_u2.y * j), j = -this.m_limitMass2 * c, c = this.m_limitImpulse2, this.m_limitImpulse2 = Math.max(0, this.m_limitImpulse2 + j), j = this.m_limitImpulse2 - c, i = -j * this.m_u2.x, j = -j * this.m_u2.y, b.m_linearVelocity.x += b.m_invMass * i, b.m_linearVelocity.y += b.m_invMass * j, b.m_angularVelocity +=
        b.m_invI * (g * j - h * i))
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.SolvePositionConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c, d = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x, e = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y, f = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x, g = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y, h = 0, i = 0, j = 0, k = 0, l = c = 0, n = 0, m = 0, o = l = m = c = l = c = 0;
    this.m_state == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = a.m_xf.R, h = this.m_localAnchor1.x - a.m_sweep.localCenter.x, i = this.m_localAnchor1.y - a.m_sweep.localCenter.y, l = c.col1.x * h + c.col2.x * i, i = c.col1.y * h + c.col2.y * i, h = l, c = b.m_xf.R, j = this.m_localAnchor2.x - b.m_sweep.localCenter.x, k = this.m_localAnchor2.y - b.m_sweep.localCenter.y, l = c.col1.x * j + c.col2.x * k, k = c.col1.y * j + c.col2.y * k, j = l, c = a.m_sweep.c.x + h, l = a.m_sweep.c.y + i, n =
        b.m_sweep.c.x + j, m = b.m_sweep.c.y + k, this.m_u1.Set(c - d, l - e), this.m_u2.Set(n - f, m - g), c = this.m_u1.Length(), l = this.m_u2.Length(), c > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u1.Multiply(1 / c) : this.m_u1.SetZero(), l > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u2.Multiply(1 / l) : this.m_u2.SetZero(), c = this.m_constant - c - this.m_ratio * l, o = Math.max(o, -c), c = Box2D.Common.Math.b2Math.Clamp(c + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection,
        0), m = -this.m_pulleyMass * c, c = -m * this.m_u1.x, l = -m * this.m_u1.y, n = -this.m_ratio * m * this.m_u2.x, m = -this.m_ratio * m * this.m_u2.y, a.m_sweep.c.x += a.m_invMass * c, a.m_sweep.c.y += a.m_invMass * l, a.m_sweep.a += a.m_invI * (h * l - i * c), b.m_sweep.c.x += b.m_invMass * n, b.m_sweep.c.y += b.m_invMass * m, b.m_sweep.a += b.m_invI * (j * m - k * n), a.SynchronizeTransform(), b.SynchronizeTransform());
    this.m_limitState1 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = a.m_xf.R, h = this.m_localAnchor1.x - a.m_sweep.localCenter.x, i = this.m_localAnchor1.y - a.m_sweep.localCenter.y, l = c.col1.x * h + c.col2.x * i, i = c.col1.y * h + c.col2.y * i, h = l, c = a.m_sweep.c.x + h, l = a.m_sweep.c.y + i, this.m_u1.Set(c - d, l - e), c = this.m_u1.Length(), c > Box2D.Common.b2Settings.b2_linearSlop ? (this.m_u1.x *= 1 / c, this.m_u1.y *= 1 / c) : this.m_u1.SetZero(), c = this.m_maxLength1 -
        c, o = Math.max(o, -c), c = Box2D.Common.Math.b2Math.Clamp(c + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), m = -this.m_limitMass1 * c, c = -m * this.m_u1.x, l = -m * this.m_u1.y, a.m_sweep.c.x += a.m_invMass * c, a.m_sweep.c.y += a.m_invMass * l, a.m_sweep.a += a.m_invI * (h * l - i * c), a.SynchronizeTransform());
    this.m_limitState2 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = b.m_xf.R, j = this.m_localAnchor2.x - b.m_sweep.localCenter.x, k = this.m_localAnchor2.y - b.m_sweep.localCenter.y, l = c.col1.x * j + c.col2.x * k, k = c.col1.y * j + c.col2.y * k, j = l, n = b.m_sweep.c.x + j, m = b.m_sweep.c.y + k, this.m_u2.Set(n - f, m - g), l = this.m_u2.Length(), l > Box2D.Common.b2Settings.b2_linearSlop ? (this.m_u2.x *= 1 / l, this.m_u2.y *= 1 / l) : this.m_u2.SetZero(), c = this.m_maxLength2 -
        l, o = Math.max(o, -c), c = Box2D.Common.Math.b2Math.Clamp(c + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), m = -this.m_limitMass2 * c, n = -m * this.m_u2.x, m = -m * this.m_u2.y, b.m_sweep.c.x += b.m_invMass * n, b.m_sweep.c.y += b.m_invMass * m, b.m_sweep.a += b.m_invI * (j * m - k * n), b.SynchronizeTransform());
    return o < Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength = 1;
Box2D.Dynamics.b2ContactImpulse = function ()
{

    this.normalImpulses = [];
    this.tangentImpulses = []
};
Box2D.Dynamics.b2ContactImpulse.prototype.Reset = function ()
{
    this.normalImpulses = [];
    this.tangentImpulses = []
};
Box2D.Dynamics.Contacts.b2ContactListNode = function (a)
{
    this.contact = a;
    this.previous = this.next = null
};
Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes = [];
Box2D.Dynamics.Contacts.b2ContactListNode.GetNode = function (a)
{
    if (0 < Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.length)
    {
        var b = Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.pop();
        b.next = null;
        b.previous = null;
        b.contact = a;
        return b
    }
    return new Box2D.Dynamics.Contacts.b2ContactListNode(a)
};
Box2D.Dynamics.Contacts.b2ContactListNode.FreeNode = function (a)
{
    Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.push(a)
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.SetNextNode = function (a)
{
    this.next = a
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.SetPreviousNode = function (a)
{
    this.previous = a
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetContact = function ()
{
    return this.contact
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetNextNode = function ()
{
    return this.next
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetPreviousNode = function ()
{
    return this.previous
};
Box2D.Dynamics.Contacts.b2ContactList = function ()
{
    this.contactFirstNodes = [];
    for (var a = 0; a <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; a++)
    {
        this.contactFirstNodes[a] = null
    }
    this.contactLastNodes = [];
    for (a = 0; a <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; a++)
    {
        this.contactLastNodes[a] = null
    }
    this.contactNodeLookup = {};
    this.contactCount = 0
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.GetFirstNode = function (a)
{
    return this.contactFirstNodes[a]
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.AddContact = function (a)
{
    var b = a.ID;
    if (null == this.contactNodeLookup[b])
    {
        this.contactNodeLookup[b] = [];
        for (var c = 0; c <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; c++)
        {
            this.contactNodeLookup[b][c] = null
        }
        this.CreateNode(a, b, Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts);
        this.contactCount++
    }
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.UpdateContact = function (a, b, c)
{
    b ? this.CreateNode(a, a.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts) : this.RemoveNode(a.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts);
    c ? this.CreateNode(a, a.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts) : this.RemoveNode(a.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts)
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.RemoveContact = function (a)
{
    a = a.ID;
    if (null != this.contactNodeLookup[a])
    {
        for (var b = 0; b <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; b++)
        {
            this.RemoveNode(a, b)
        }
        delete this.contactNodeLookup[a];
        this.contactCount--
    }
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.RemoveNode = function (a, b)
{
    var c = this.contactNodeLookup[a];
    if (null != c)
    {
        var d = c[b];
        if (null != d)
        {
            c[b] = null;
            var c = d.GetPreviousNode(), e = d.GetNextNode();
            null == c ? this.contactFirstNodes[b] = e : c.SetNextNode(e);
            null == e ? this.contactLastNodes[b] = c : e.SetPreviousNode(c);
            Box2D.Dynamics.Contacts.b2ContactListNode.FreeNode(d)
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.CreateNode = function (a, b, c)
{
    b = this.contactNodeLookup[b];
    null == b[c] && (b[c] = Box2D.Dynamics.Contacts.b2ContactListNode.GetNode(a), a = this.contactLastNodes[c], null != a ? (a.SetNextNode(b[c]), b[c].SetPreviousNode(a)) : this.contactFirstNodes[c] = b[c], this.contactLastNodes[c] = b[c])
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.GetContactCount = function ()
{
    return this.contactCount
};
Box2D.Dynamics.Contacts.b2ContactList.TYPES = {nonSensorEnabledTouchingContacts:0, nonSensorEnabledContinuousContacts:1, allContacts:2};
Box2D.Collision.b2Segment = function ()
{

    this.p1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.p2 = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2Segment.prototype.TestSegment = function (a, b, c, d)
{
    var e = c.p1, f = c.p2.x - e.x, g = c.p2.y - e.y, c = this.p2.y - this.p1.y, h = -(this.p2.x - this.p1.x), i = 100 * Number.MIN_VALUE, j = -(f * c + g * h);
    if (j > i)
    {
        var k = e.x - this.p1.x, l = e.y - this.p1.y, e = k * c + l * h;
        if (0 <= e && e <= d * j && (d = -f * l + g * k, -i * j <= d && d <= j * (1 + i)))
        {
            return e /= j, d = Math.sqrt(c * c + h * h), a[0] = e, b.Set(c / d, h / d), !0
        }
    }
    return!1
};
Box2D.Collision.b2Segment.prototype.Extend = function (a)
{
    this.ExtendForward(a);
    this.ExtendBackward(a)
};
Box2D.Collision.b2Segment.prototype.ExtendForward = function (a)
{
    var b = this.p2.x - this.p1.x, c = this.p2.y - this.p1.y, a = Math.min(0 < b ? (a.upperBound.x - this.p1.x) / b : 0 > b ? (a.lowerBound.x - this.p1.x) / b : Number.POSITIVE_INFINITY, 0 < c ? (a.upperBound.y - this.p1.y) / c : 0 > c ? (a.lowerBound.y - this.p1.y) / c : Number.POSITIVE_INFINITY);
    this.p2.x = this.p1.x + b * a;
    this.p2.y = this.p1.y + c * a
};
Box2D.Collision.b2Segment.prototype.ExtendBackward = function (a)
{
    var b = -this.p2.x + this.p1.x, c = -this.p2.y + this.p1.y, a = Math.min(0 < b ? (a.upperBound.x - this.p2.x) / b : 0 > b ? (a.lowerBound.x - this.p2.x) / b : Number.POSITIVE_INFINITY, 0 < c ? (a.upperBound.y - this.p2.y) / c : 0 > c ? (a.lowerBound.y - this.p2.y) / c : Number.POSITIVE_INFINITY);
    this.p1.x = this.p2.x + b * a;
    this.p1.y = this.p2.y + c * a
};
Box2D.Dynamics.Joints.b2MouseJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.K = new Box2D.Common.Math.b2Mat22;
    this.K1 = new Box2D.Common.Math.b2Mat22;
    this.K2 = new Box2D.Common.Math.b2Mat22;
    this.m_localAnchor = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_target = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat22;
    this.m_C = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_target.SetV(a.target);
    var b = this.m_target.x - this.m_bodyB.m_xf.position.x, c = this.m_target.y - this.m_bodyB.m_xf.position.y, d = this.m_bodyB.m_xf.R;
    this.m_localAnchor.x = b * d.col1.x + c * d.col1.y;
    this.m_localAnchor.y = b * d.col2.x + c * d.col2.y;
    this.m_maxForce = a.maxForce;
    this.m_impulse.SetZero();
    this.m_frequencyHz = a.frequencyHz;
    this.m_dampingRatio = a.dampingRatio;
    this.m_gamma = this.m_beta = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2MouseJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetAnchorA = function ()
{
    return Box2D.Common.Math.b2Vec2.Get(this.m_target.x, this.m_target.y)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse.x, a * this.m_impulse.y)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetReactionTorque = function ()
{
    return 0
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetTarget = function ()
{
    return this.m_target
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SetTarget = function (a)
{
    !1 == this.m_bodyB.IsAwake() && this.m_bodyB.SetAwake(!0);
    this.m_target = a
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetMaxForce = function ()
{
    return this.m_maxForce
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SetMaxForce = function (a)
{
    void 0 === a && (a = 0);
    this.m_maxForce = a
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetFrequency = function ()
{
    return this.m_frequencyHz
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SetFrequency = function (a)
{
    void 0 === a && (a = 0);
    this.m_frequencyHz = a
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetDampingRatio = function ()
{
    return this.m_dampingRatio
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SetDampingRatio = function (a)
{
    void 0 === a && (a = 0);
    this.m_dampingRatio = a
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_bodyB, c = b.GetMass(), d = 2 * Math.PI * this.m_frequencyHz, e = c * d * d;
    this.m_gamma = a.dt * (2 * c * this.m_dampingRatio * d + a.dt * e);
    this.m_gamma = 0 != this.m_gamma ? 1 / this.m_gamma : 0;
    this.m_beta = a.dt * e * this.m_gamma;
    var e = b.m_xf.R, c = this.m_localAnchor.x - b.m_sweep.localCenter.x, d = this.m_localAnchor.y - b.m_sweep.localCenter.y, f = e.col1.x * c + e.col2.x * d, d = e.col1.y * c + e.col2.y * d, c = f, e = b.m_invMass, f = b.m_invI;
    this.K1.col1.x = e;
    this.K1.col2.x = 0;
    this.K1.col1.y = 0;
    this.K1.col2.y = e;
    this.K2.col1.x = f * d * d;
    this.K2.col2.x = -f * c * d;
    this.K2.col1.y = -f * c * d;
    this.K2.col2.y = f * c * c;
    this.K.SetM(this.K1);
    this.K.AddM(this.K2);
    this.K.col1.x += this.m_gamma;
    this.K.col2.y += this.m_gamma;
    this.K.GetInverse(this.m_mass);
    this.m_C.x = b.m_sweep.c.x + c - this.m_target.x;
    this.m_C.y = b.m_sweep.c.y + d - this.m_target.y;
    b.m_angularVelocity *= 0.98;
    this.m_impulse.x *= a.dtRatio;
    this.m_impulse.y *= a.dtRatio;
    b.m_linearVelocity.x += e * this.m_impulse.x;
    b.m_linearVelocity.y += e * this.m_impulse.y;
    b.m_angularVelocity += f * (c * this.m_impulse.y - d * this.m_impulse.x)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b = this.m_bodyB, c, d = 0, e = 0;
    c = b.m_xf.R;
    var f = this.m_localAnchor.x - b.m_sweep.localCenter.x, g = this.m_localAnchor.y - b.m_sweep.localCenter.y, d = c.col1.x * f + c.col2.x * g, g = c.col1.y * f + c.col2.y * g, f = d, d = b.m_linearVelocity.x + -b.m_angularVelocity * g, h = b.m_linearVelocity.y + b.m_angularVelocity * f;
    c = this.m_mass;
    d = d + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
    e = h + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
    h = -(c.col1.x * d + c.col2.x * e);
    e = -(c.col1.y * d + c.col2.y * e);
    c = this.m_impulse.x;
    d = this.m_impulse.y;
    this.m_impulse.x += h;
    this.m_impulse.y += e;
    a = a.dt * this.m_maxForce;
    this.m_impulse.LengthSquared() > a * a && this.m_impulse.Multiply(a / this.m_impulse.Length());
    h = this.m_impulse.x - c;
    e = this.m_impulse.y - d;
    b.m_linearVelocity.x += b.m_invMass * h;
    b.m_linearVelocity.y += b.m_invMass * e;
    b.m_angularVelocity += b.m_invI * (f * e - g * h)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SolvePositionConstraints = function ()
{
    return!0
};
Box2D.Dynamics.b2BodyListNode = function (a)
{

    this.body = a;
    this.previous = this.next = null
};
Box2D.Dynamics.b2BodyListNode.prototype.SetNextNode = function (a)
{
    this.next = a
};
Box2D.Dynamics.b2BodyListNode.prototype.SetPreviousNode = function (a)
{
    this.previous = a
};
Box2D.Dynamics.b2BodyListNode.prototype.GetBody = function ()
{
    return this.body
};
Box2D.Dynamics.b2BodyListNode.prototype.GetNextNode = function ()
{
    return this.next
};
Box2D.Dynamics.b2BodyListNode.prototype.GetPreviousNode = function ()
{
    return this.previous
};
Box2D.Common.b2Color = function (a, b, c)
{

    this._r = 255 * Box2D.Common.Math.b2Math.Clamp(a, 0, 1);
    this._g = 255 * Box2D.Common.Math.b2Math.Clamp(b, 0, 1);
    this._b = 255 * Box2D.Common.Math.b2Math.Clamp(c, 0, 1)
};
Box2D.Common.b2Color.prototype.Set = function (a, b, c)
{
    this._r = 255 * Box2D.Common.Math.b2Math.Clamp(a, 0, 1);
    this._g = 255 * Box2D.Common.Math.b2Math.Clamp(b, 0, 1);
    this._b = 255 * Box2D.Common.Math.b2Math.Clamp(c, 0, 1)
};
Box2D.Common.b2Color.prototype.GetColor = function ()
{
    return this._r << 16 | this._g << 8 | this._b
};
Box2D.Dynamics.b2BodyList = function ()
{

    this.bodyFirstNodes = [];
    for (var a = 0; a <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; a++)
    {
        this.bodyFirstNodes[a] = null
    }
    this.bodyLastNodes = [];
    for (a = 0; a <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; a++)
    {
        this.bodyLastNodes[a] = null
    }
    this.bodyNodeLookup = {};
    this.bodyCount = 0
};
Box2D.Dynamics.b2BodyList.prototype.GetFirstNode = function (a)
{
    return this.bodyFirstNodes[a]
};
Box2D.Dynamics.b2BodyList.prototype.AddBody = function (a)
{
    var b = a.ID;
    null == this.bodyNodeLookup[b] && (this.CreateNode(a, b, Box2D.Dynamics.b2BodyList.TYPES.allBodies), this.UpdateBody(a), a.m_lists.push(this), this.bodyCount++)
};
Box2D.Dynamics.b2BodyList.prototype.UpdateBody = function (a)
{
    var b = a.GetType(), c = a.ID, d = a.IsAwake(), e = a.IsActive();
    b == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies);
    b != Box2D.Dynamics.b2BodyDef.b2_staticBody ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.nonStaticBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.nonStaticBodies);
    b != Box2D.Dynamics.b2BodyDef.b2_staticBody && e && d ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies);
    d ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.awakeBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.awakeBodies);
    e ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.activeBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.activeBodies)
};
Box2D.Dynamics.b2BodyList.prototype.RemoveBody = function (a)
{
    var b = a.ID;
    if (null != this.bodyNodeLookup[b])
    {
        goog.array.remove(a.m_lists, this);
        for (a = 0; a <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; a++)
        {
            this.RemoveNode(b, a)
        }
        delete this.bodyNodeLookup[b];
        this.bodyCount--
    }
};
Box2D.Dynamics.b2BodyList.prototype.RemoveNode = function (a, b)
{
    var c = this.bodyNodeLookup[a];
    if (null != c)
    {
        var d = c[b];
        null != d && (c[b] = null, c = d.GetPreviousNode(), d = d.GetNextNode(), null == c ? this.bodyFirstNodes[b] = d : c.SetNextNode(d), null == d ? this.bodyLastNodes[b] = c : d.SetPreviousNode(c))
    }
};
Box2D.Dynamics.b2BodyList.prototype.CreateNode = function (a, b, c)
{
    var d = this.bodyNodeLookup[b];
    if (null == d)
    {
        for (var d = [], e = 0; e <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; e++)
        {
            d[e] = null
        }
        this.bodyNodeLookup[b] = d
    }
    null == d[c] && (d[c] = new Box2D.Dynamics.b2BodyListNode(a), a = this.bodyLastNodes[c], null != a ? a.SetNextNode(d[c]) : this.bodyFirstNodes[c] = d[c], d[c].SetPreviousNode(a), this.bodyLastNodes[c] = d[c])
};
Box2D.Dynamics.b2BodyList.prototype.GetBodyCount = function ()
{
    return this.bodyCount
};
Box2D.Dynamics.b2BodyList.TYPES = {dynamicBodies:0, nonStaticBodies:1, activeBodies:2, nonStaticActiveAwakeBodies:3, awakeBodies:4, allBodies:5};
Box2D.Dynamics.Controllers = {};
Box2D.Dynamics.Controllers.b2Controller = function ()
{
    this.ID = "Controller" + Box2D.Dynamics.Controllers.b2Controller.NEXT_ID++;
    this.m_world = null;
    this.bodyList = new Box2D.Dynamics.b2BodyList
};
Box2D.Dynamics.Controllers.b2Controller.prototype.Step = function ()
{
};
Box2D.Dynamics.Controllers.b2Controller.prototype.Draw = function ()
{
};
Box2D.Dynamics.Controllers.b2Controller.prototype.AddBody = function (a)
{
    this.bodyList.AddBody(a);
    a.AddController(this)
};
Box2D.Dynamics.Controllers.b2Controller.prototype.RemoveBody = function (a)
{
    this.bodyList.RemoveBody(a);
    a.RemoveController(this)
};
Box2D.Dynamics.Controllers.b2Controller.prototype.Clear = function ()
{
    for (var a = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); a; a = a.GetNextNode())
    {
        this.RemoveBody(a.body)
    }
};
Box2D.Dynamics.Controllers.b2Controller.prototype.GetBodyList = function ()
{
    return this.bodyList
};
Box2D.Dynamics.Controllers.b2Controller.NEXT_ID = 0;
Box2D.Dynamics.Controllers.b2ConstantAccelController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.A = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
goog.inherits(Box2D.Dynamics.Controllers.b2ConstantAccelController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2ConstantAccelController.prototype.Step = function (a)
{
    for (var a = Box2D.Common.Math.b2Vec2.Get(this.A.x * a.dt, this.A.y * a.dt), b = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); b; b = b.GetNextNode())
    {
        var c = b.body, d = c.GetLinearVelocity(), d = Box2D.Common.Math.b2Vec2.Get(d.x + a.x, d.y + a.y);
        c.SetLinearVelocity(d);
        Box2D.Common.Math.b2Vec2.Free(d)
    }
    Box2D.Common.Math.b2Vec2.Free(a)
};
Box2D.Dynamics.Contacts.b2PolygonContact = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2PolygonContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2PolygonContact.prototype.Reset = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2PolygonContact.prototype.Evaluate = function ()
{
    var a = this.m_fixtureA.GetShape(), b = this.m_fixtureB.GetShape();
    Box2D.Collision.b2Collision.CollidePolygons(this.m_manifold, a, this.m_fixtureA.GetBody().m_xf, b, this.m_fixtureB.GetBody().m_xf)
};
Box2D.Collision.IBroadPhase = "Box2D.Collision.IBroadPhase";
Box2D.Dynamics.b2Island = function (a, b)
{

    this.m_listener = a;
    this.m_contactSolver = b;
    this.m_bodies = [];
    this.m_dynamicBodies = [];
    this.m_nonStaticBodies = [];
    this.m_contacts = [];
    this.m_joints = [];
    this.impulse = new Box2D.Dynamics.b2ContactImpulse
};
Box2D.Dynamics.b2Island.prototype.Reset = function (a, b)
{
    this.m_listener = a;
    this.m_contactSolver = b
};
Box2D.Dynamics.b2Island.prototype.Clear = function ()
{
    this.m_bodies = [];
    this.m_dynamicBodies = [];
    this.m_nonStaticBodies = [];
    this.m_contacts = [];
    this.m_joints = []
};
Box2D.Dynamics.b2Island.prototype.Solve = function (a, b, c)
{
    this._InitializeVelocities(a, b);
    this.m_contactSolver.Initialize(a, this.m_contacts, this.m_contacts.length);
    this._SolveVelocityConstraints(a);
    this._SolveBodies(a);
    this._SolvePositionConstraints(a);
    this.Report(this.m_contactSolver.m_constraints);
    c && this._SleepIfTired(a)
};
Box2D.Dynamics.b2Island.prototype._InitializeVelocities = function (a, gravity)
{
    // playcraft/pc -- modified to allow for each body to have it's own overriding gravity
    for (var c = 0; c < this.m_dynamicBodies.length; c++)
    {
        var d = this.m_dynamicBodies[c];
        var gx = gravity.x;
        var gy = gravity.y;
        if (d._pc_gravityX != undefined)
            gx = d._pc_gravityX;
        if (d._pc_gravityY != undefined)
            gy = d._pc_gravityY;

        d.m_linearVelocity.x += a.dt * (gx + d.m_invMass * d.m_force.x);
        d.m_linearVelocity.y += a.dt * (gy + d.m_invMass * d.m_force.y);
        d.m_angularVelocity += a.dt * d.m_invI * d.m_torque;
        d.m_linearVelocity.Multiply(Box2D.Common.Math.b2Math.Clamp(1 - a.dt * d.m_linearDamping, 0, 1));
        d.m_angularVelocity *= Box2D.Common.Math.b2Math.Clamp(1 - a.dt * d.m_angularDamping, 0, 1)
    }
};
Box2D.Dynamics.b2Island.prototype._SolveVelocityConstraints = function (a)
{
    this.m_contactSolver.InitVelocityConstraints(a);
    for (var b = 0; b < this.m_joints.length; b++)
    {
        this.m_joints[b].InitVelocityConstraints(a)
    }
    for (b = 0; b < a.velocityIterations; b++)
    {
        for (var c = 0; c < this.m_joints.length; c++)
        {
            this.m_joints[c].SolveVelocityConstraints(a)
        }
        this.m_contactSolver.SolveVelocityConstraints()
    }
    for (a = 0; a < this.m_joints.length; a++)
    {
        this.m_joints[a].FinalizeVelocityConstraints()
    }
    this.m_contactSolver.FinalizeVelocityConstraints()
};
Box2D.Dynamics.b2Island.prototype._SolveBodies = function (a)
{
    for (var b = 0; b < this.m_nonStaticBodies.length; ++b)
    {
        var c = this.m_nonStaticBodies[b], d = a.dt * c.m_linearVelocity.x, e = a.dt * c.m_linearVelocity.y;
        d * d + e * e > Box2D.Common.b2Settings.b2_maxTranslationSquared && (c.m_linearVelocity.Normalize(), c.m_linearVelocity.x *= Box2D.Common.b2Settings.b2_maxTranslation * a.inv_dt, c.m_linearVelocity.y *= Box2D.Common.b2Settings.b2_maxTranslation * a.inv_dt);
        d = a.dt * c.m_angularVelocity;
        d * d > Box2D.Common.b2Settings.b2_maxRotationSquared && (c.m_angularVelocity = 0 > c.m_angularVelocity ? -Box2D.Common.b2Settings.b2_maxRotation * a.inv_dt : Box2D.Common.b2Settings.b2_maxRotation * a.inv_dt);
        c.m_sweep.c0.SetV(c.m_sweep.c);
        c.m_sweep.a0 = c.m_sweep.a;
        c.m_sweep.c.x += a.dt * c.m_linearVelocity.x;
        c.m_sweep.c.y += a.dt * c.m_linearVelocity.y;
        c.m_sweep.a += a.dt * c.m_angularVelocity;
        c.SynchronizeTransform()
    }
};
Box2D.Dynamics.b2Island.prototype._SolvePositionConstraints = function (a)
{
    for (var b = 0; b < a.positionIterations; b++)
    {
        for (var c = this.m_contactSolver.SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte), d = !0, e = 0; e < this.m_joints.length; e++)
        {
            var f = this.m_joints[e].SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte), d = d && f
        }
        if (c && d)
        {
            break
        }
    }
};
Box2D.Dynamics.b2Island.prototype._SleepIfTired = function (a)
{
    for (var b = Number.MAX_VALUE, c = 0; c < this.m_nonStaticBodies.length; c++)
    {
        var d = this.m_nonStaticBodies[c];
        !d.m_allowSleep || Math.abs(d.m_angularVelocity) > Box2D.Common.b2Settings.b2_angularSleepTolerance || Box2D.Common.Math.b2Math.Dot(d.m_linearVelocity, d.m_linearVelocity) > Box2D.Common.b2Settings.b2_linearSleepToleranceSquared ? b = d.m_sleepTime = 0 : (d.m_sleepTime += a.dt, b = Math.min(b, d.m_sleepTime))
    }
    if (b >= Box2D.Common.b2Settings.b2_timeToSleep)
    {
        for (a = 0; a < this.m_bodies.length; a++)
        {
            this.m_bodies[a].SetAwake(!1)
        }
    }
};
Box2D.Dynamics.b2Island.prototype.SolveTOI = function (a)
{
    var b = 0, c = 0;
    this.m_contactSolver.Initialize(a, this.m_contacts, this.m_contacts.length);
    for (var d = this.m_contactSolver, b = 0; b < this.m_joints.length; ++b)
    {
        this.m_joints[b].InitVelocityConstraints(a)
    }
    for (b = 0; b < a.velocityIterations; ++b)
    {
        d.SolveVelocityConstraints();
        for (c = 0; c < this.m_joints.length; ++c)
        {
            this.m_joints[c].SolveVelocityConstraints(a)
        }
    }
    for (b = 0; b < this.m_nonStaticBodies.length; ++b)
    {
        var c = this.m_nonStaticBodies[b], e = a.dt * c.m_linearVelocity.x, f = a.dt * c.m_linearVelocity.y;
        e * e + f * f > Box2D.Common.b2Settings.b2_maxTranslationSquared && (c.m_linearVelocity.Normalize(), c.m_linearVelocity.x *= Box2D.Common.b2Settings.b2_maxTranslation * a.inv_dt, c.m_linearVelocity.y *= Box2D.Common.b2Settings.b2_maxTranslation * a.inv_dt);
        e = a.dt * c.m_angularVelocity;
        e * e > Box2D.Common.b2Settings.b2_maxRotationSquared && (c.m_angularVelocity = 0 > c.m_angularVelocity ? -Box2D.Common.b2Settings.b2_maxRotation * a.inv_dt : Box2D.Common.b2Settings.b2_maxRotation * a.inv_dt);
        c.m_sweep.c0.SetV(c.m_sweep.c);
        c.m_sweep.a0 = c.m_sweep.a;
        c.m_sweep.c.x += a.dt * c.m_linearVelocity.x;
        c.m_sweep.c.y += a.dt * c.m_linearVelocity.y;
        c.m_sweep.a += a.dt * c.m_angularVelocity;
        c.SynchronizeTransform()
    }
    for (b = 0; b < a.positionIterations; ++b)
    {
        e = d.SolvePositionConstraints(0.75);
        f = !0;
        for (c = 0; c < this.m_joints.length; ++c)
        {
            var g = this.m_joints[c].SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte), f = f && g
        }
        if (e && f)
        {
            break
        }
    }
    this.Report(d.m_constraints)
};
Box2D.Dynamics.b2Island.prototype.Report = function (a)
{
    if (null != this.m_listener)
    {
        for (var b = 0; b < this.m_contacts.length; ++b)
        {
            var c = this.m_contacts[b], d = a[b];
            this.impulse.Reset();
            for (var e = 0; e < d.pointCount; ++e)
            {
                this.impulse.normalImpulses[e] = d.points[e].normalImpulse, this.impulse.tangentImpulses[e] = d.points[e].tangentImpulse
            }
            this.m_listener.PostSolve(c, this.impulse)
        }
    }
};
Box2D.Dynamics.b2Island.prototype.AddBody = function (a)
{
    this.m_bodies.push(a);
    a.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody && (this.m_nonStaticBodies.push(a), a.GetType() == Box2D.Dynamics.b2BodyDef.b2_dynamicBody && this.m_dynamicBodies.push(a))
};
Box2D.Dynamics.b2Island.prototype.AddContact = function (a)
{
    this.m_contacts.push(a)
};
Box2D.Dynamics.b2Island.prototype.AddJoint = function (a)
{
    this.m_joints.push(a)
};
Box2D.Dynamics.Contacts.b2ContactRegister = function ()
{
    this.pool = null;
    this.poolCount = 0
};
Box2D.Collision.b2DynamicTreePair = function (a, b)
{

    this.fixtureA = a;
    this.fixtureB = b
};
Box2D.Collision.b2DynamicTreePair._freeCache = [];
Box2D.Collision.b2DynamicTreePair.Get = function (a, b)
{

    if (0 < Box2D.Collision.b2DynamicTreePair._freeCache.length)
    {
        var c = Box2D.Collision.b2DynamicTreePair._freeCache.pop();
        c.fixtureA = a;
        c.fixtureB = b;
        return c
    }
    return new Box2D.Collision.b2DynamicTreePair(a, b)
};
Box2D.Collision.b2DynamicTreePair.Free = function (a)
{
    null != a && ( Box2D.Collision.b2DynamicTreePair._freeCache.push(a))
};
Box2D.Dynamics.b2DebugDraw = function ()
{

    this.m_xformScale = this.m_fillAlpha = this.m_alpha = this.m_lineThickness = this.m_drawScale = 1;
    this.m_drawFlags = 0;
    this.m_originX = 0;
    this.m_originY = 0;

    this.m_ctx = null
};

Box2D.Dynamics.b2DebugDraw.prototype.SetOrigin = function(x, y)
{
    this.m_originX = x;
    this.m_originY = y;
};

Box2D.Dynamics.b2DebugDraw.prototype.Clear = function ()
{
//  this.m_ctx.clearRect(0, 0, this.m_ctx.canvas.width, this.m_ctx.canvas.height)
};
Box2D.Dynamics.b2DebugDraw.prototype._color = function (a, b)
{
    return"rgba(" + ((a & 16711680) >> 16) + "," + ((a & 65280) >> 8) + "," + (a & 255) + "," + b + ")"
};
Box2D.Dynamics.b2DebugDraw.prototype.SetFlags = function (a)
{
    this.m_drawFlags = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetFlags = function ()
{
    return this.m_drawFlags
};
Box2D.Dynamics.b2DebugDraw.prototype.AppendFlags = function (a)
{
    this.m_drawFlags |= a
};
Box2D.Dynamics.b2DebugDraw.prototype.ClearFlags = function (a)
{
    this.m_drawFlags &= ~a
};
Box2D.Dynamics.b2DebugDraw.prototype.SetSprite = function (a)
{
    this.m_ctx = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetSprite = function ()
{
    return this.m_ctx
};
Box2D.Dynamics.b2DebugDraw.prototype.SetDrawScale = function (a)
{
    this.m_drawScale = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetDrawScale = function ()
{
    return this.m_drawScale
};
Box2D.Dynamics.b2DebugDraw.prototype.SetLineThickness = function (a)
{
    this.m_lineThickness = a;
    this.m_ctx.strokeWidth = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetLineThickness = function ()
{
    return this.m_lineThickness
};
Box2D.Dynamics.b2DebugDraw.prototype.SetAlpha = function (a)
{
    this.m_alpha = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetAlpha = function ()
{
    return this.m_alpha
};
Box2D.Dynamics.b2DebugDraw.prototype.SetFillAlpha = function (a)
{
    this.m_fillAlpha = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetFillAlpha = function ()
{
    return this.m_fillAlpha
};
Box2D.Dynamics.b2DebugDraw.prototype.SetXFormScale = function (a)
{
    this.m_xformScale = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetXFormScale = function ()
{
    return this.m_xformScale
};
(function (a)
{
    a.prototype.DrawPolygon = function (a, c, d)
    {
        if (c)
        {
            var e = this.m_ctx, f = this.m_drawScale;
            e.beginPath();
            e.strokeStyle = this._color(d.GetColor(), this.m_alpha);
            e.moveTo((a[0].x * f)-this.m_originX, (a[0].y * f)- this.m_originY);
            for (d = 1; d < c; d++)
            {
                e.lineTo((a[d].x*f) - this.m_originX, (a[d].y*f) - this.m_originY)
            }
            e.lineTo((a[0].x*f) - this.m_originX, (a[0].y*f) - this.m_originY);
            e.closePath();
            e.stroke()
        }
    };
    a.prototype.DrawSolidPolygon = function (a, c, d)
    {
        if (c)
        {
            var e = this.m_ctx, f = this.m_drawScale;
            e.beginPath();
            e.strokeStyle = this._color(d.GetColor(), this.m_alpha);
            e.fillStyle = this._color(d.GetColor(), this.m_fillAlpha);
            e.moveTo((a[0].x * f)-this.m_originX, (a[0].y * f) - this.m_originY);
            for (d = 1; d < c; d++)
            {
                e.lineTo((a[d].x * f) - this.m_originX, (a[d].y * f) - this.m_originY);
            }
            e.lineTo((a[0].x* f) - this.m_originX, (a[0].y* f) - this.m_originY);
            e.closePath();
            e.fill();
            e.stroke()
        }
    };
    a.prototype.DrawCircle = function (a, c, d)
    {
        if (c)
        {
            var e = this.m_ctx, f = this.m_drawScale;
            e.beginPath();
            e.strokeStyle = this._color(d.GetColor(), this.m_alpha);
            e.arc((a.x * f) - this.m_originX, (a.y * f)-this.m_originY, c * f, 0, 2 * Math.PI, !0);
            e.closePath();
            e.stroke()
        }
    };
    a.prototype.DrawSolidCircle = function (a, c, d, e)
    {
        if (c)
        {
            var f = this.m_ctx, g = this.m_drawScale, h = (a.x * g) - this.m_originX, i = (a.y * g) - this.m_originY;
            f.moveTo(0, 0);
            f.beginPath();
            f.strokeStyle = this._color(e.GetColor(), this.m_alpha);
            f.fillStyle = this._color(e.GetColor(), this.m_fillAlpha);
            f.arc(h, i, c * g, 0, 2 * Math.PI, !0);
            f.moveTo(h, i);
            f.lineTo(((a.x + d.x * c) * g)-this.m_originX, ((a.y + d.y * c) * g)-this.m_originY);
            f.closePath();
            f.fill();
            f.stroke()
        }
    };
    a.prototype.DrawSegment = function (a, c, d)
    {
        var e = this.m_ctx, f = this.m_drawScale;
        e.strokeStyle = this._color(d.GetColor(), this.m_alpha);
        e.beginPath();
        e.moveTo((a.x * f) - this.m_originX, (a.y * f) - this.m_originY);
        e.lineTo((c.x * f) - this.m_originX, (c.y * f) - this.m_originY);
        e.closePath();
        e.stroke()
    };
    a.prototype.DrawTransform = function (a)
    {
        var c = this.m_ctx, d = this.m_drawScale;
        c.beginPath();
        c.strokeStyle = this._color(16711680, this.m_alpha);
        c.moveTo((a.position.x * d) - this.m_originX, (a.position.y * d) - this.m_originY);
        c.lineTo(((a.position.x + this.m_xformScale * a.R.col1.x) * d) - this.m_originX,
            ((a.position.y + this.m_xformScale * a.R.col1.y) * d) - this.m_originY);
        c.strokeStyle = this._color(65280, this.m_alpha);
        c.moveTo((a.position.x * d) - this.m_originX, (a.position.y * d) - this.m_originY);
        c.lineTo(((a.position.x + this.m_xformScale * a.R.col2.x) * d) - this.m_originX,
            ((a.position.y + this.m_xformScale * a.R.col2.y) * d) - this.m_originY);
        c.closePath();
        c.stroke()
    }
})(Box2D.Dynamics.b2DebugDraw);
Box2D.Dynamics.b2DebugDraw.e_shapeBit = 1;
Box2D.Dynamics.b2DebugDraw.e_jointBit = 2;
Box2D.Dynamics.b2DebugDraw.e_aabbBit = 4;
Box2D.Dynamics.b2DebugDraw.e_pairBit = 8;
Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit = 16;
Box2D.Dynamics.b2DebugDraw.e_controllerBit = 32;
Box2D.Collision.b2RayCastOutput = function ()
{

    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Dynamics.iContactFilter = function ()
{
};
Box2D.Dynamics.iContactFilter.prototype.ShouldCollide = function ()
{
};
Box2D.Dynamics.b2ContactFilter = function ()
{

};
Box2D.Dynamics.b2ContactFilter.prototype.ShouldCollide = function (a, b)
{
    var c = a.GetFilterData(), d = b.GetFilterData();
    return c.groupIndex == d.groupIndex && 0 != c.groupIndex ? 0 < c.groupIndex : 0 != (c.maskBits & d.categoryBits) && 0 != (c.categoryBits & d.maskBits)
};
Box2D.Dynamics.b2ContactFilter.b2_defaultFilter = new Box2D.Dynamics.b2ContactFilter;
Box2D.Dynamics.Joints.b2MouseJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.target = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_mouseJoint;
    this.maxForce = 0;
    this.frequencyHz = 5;
    this.dampingRatio = 0.7
};
goog.inherits(Box2D.Dynamics.Joints.b2MouseJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2MouseJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2MouseJoint(this)
};
Box2D.Dynamics.Contacts.b2ContactFactory = function ()
{
    this.m_registers = {};
    this.m_freeContacts = {};
    this.AddType(Box2D.Dynamics.Contacts.b2CircleContact, Box2D.Collision.Shapes.b2CircleShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolyAndCircleContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolygonContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2PolygonShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2EdgeAndCircleContact, Box2D.Collision.Shapes.b2EdgeShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolyAndEdgeContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2EdgeShape.NAME)
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.AddType = function (a, b, c)
{
    this.m_freeContacts[b] = this.m_freeContacts[b] || {};
    this.m_freeContacts[b][c] = this.m_freeContacts[b][c] || [];
    this.m_registers[b] = this.m_registers[b] || {};
    this.m_registers[b][c] = new Box2D.Dynamics.Contacts.b2ContactRegister;
    this.m_registers[b][c].ctor = a;
    this.m_registers[b][c].primary = !0;
    b != c && (this.m_registers[c] = this.m_registers[c] || {}, this.m_registers[c][b] = new Box2D.Dynamics.Contacts.b2ContactRegister, this.m_registers[c][b].ctor = a, this.m_registers[c][b].primary = !1)
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.Create = function (a, b)
{

    var c = a.GetShape().GetTypeName(), d = b.GetShape().GetTypeName(), e = this.m_registers[c][d], f = e.ctor;
    return null != f ? e.primary ? 0 < this.m_freeContacts[c][d].length ? (c = this.m_freeContacts[c][d].pop(), c.Reset(a, b), c) : new f(a, b) : 0 < this.m_freeContacts[d][c].length ? (c = this.m_freeContacts[d][c].pop(), c.Reset(b, a), c) : new f(b, a) : null
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.Destroy = function (a)
{

    var b = a.GetFixtureA().GetShape().GetTypeName(), c = a.GetFixtureB().GetShape().GetTypeName();
    this.m_freeContacts[b][c].push(a)
};
Box2D.Dynamics.b2ContactListener = function ()
{

};
Box2D.Dynamics.b2ContactListener.prototype.BeginContact = function ()
{
};
Box2D.Dynamics.b2ContactListener.prototype.EndContact = function ()
{
};
Box2D.Dynamics.b2ContactListener.prototype.PreSolve = function ()
{
};
Box2D.Dynamics.b2ContactListener.prototype.PostSolve = function ()
{
};
Box2D.Dynamics.b2ContactListener.b2_defaultListener = new Box2D.Dynamics.b2ContactListener;
Box2D.Collision.b2ContactPoint = function ()
{

    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.velocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.id = new Box2D.Collision.b2ContactID
};
Box2D.Collision.b2DynamicTreeBroadPhase = function ()
{

    this.m_tree = new Box2D.Collision.b2DynamicTree;
    this.m_moveBuffer = [];
    this.queryProxy = this.updatePairsCallback = this.lastQueryFixtureB = this.lastQueryFixtureA = null
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.CreateProxy = function (a, b)
{
    var c = this.m_tree.CreateProxy(a, b);
    this.BufferMove(c);
    return c
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.DestroyProxy = function (a)
{
    this.UnBufferMove(a);
    this.m_tree.DestroyProxy(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.MoveProxy = function (a, b, c)
{
    this.m_tree.MoveProxy(a, b, c) && this.BufferMove(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.TestOverlap = function (a, b)
{
    var c = this.m_tree.GetFatAABB(a), d = this.m_tree.GetFatAABB(b);
    return c.TestOverlap(d)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.GetFatAABB = function (a)
{
    return this.m_tree.GetFatAABB(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.GetProxyCount = function ()
{
    return this.m_tree.length
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.UpdatePairs = function (a)
{
    this.lastQueryFixtureB = this.lastQueryFixtureA = null;
    for (this.updatePairsCallback = a; 0 < this.m_moveBuffer.length;)
    {
        this.queryProxy = this.m_moveBuffer.pop(), this.m_tree.Query(this.QueryCallback, this.m_tree.GetFatAABB(this.queryProxy), this)
    }
    this.queryProxy = this.updatePairsCallback = this.lastQueryFixtureB = this.lastQueryFixtureA = null
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.QueryCallback = function (a)
{
    a != this.queryProxy.fixture && (!(this.queryProxy.fixture == this.lastQueryFixtureA && a == this.lastQueryFixtureB) && !(this.queryProxy.fixture == this.lastQueryFixtureB && a == this.lastQueryFixtureA)) && (this.updatePairsCallback(this.queryProxy.fixture, a), this.lastQueryFixtureA = this.queryProxy.fixture, this.lastQueryFixtureB = a);
    return!0
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.Query = function (a, b)
{
    this.m_tree.Query(a, b)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.RayCast = function (a, b)
{
    this.m_tree.RayCast(a, b)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.Rebalance = function (a)
{
    this.m_tree.Rebalance(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.BufferMove = function (a)
{
    this.m_moveBuffer.push(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.UnBufferMove = function (a)
{
    goog.array.remove(this.m_moveBuffer, a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.__implements = {};
Box2D.Collision.b2DynamicTreeBroadPhase.__implements[Box2D.Collision.IBroadPhase] = !0;
Box2D.Dynamics.b2ContactManager = function (a)
{

    this.m_world = a;
    this.m_contactFilter = Box2D.Dynamics.b2ContactFilter.b2_defaultFilter;
    this.m_contactListener = Box2D.Dynamics.b2ContactListener.b2_defaultListener;
    this.m_contactFactory = new Box2D.Dynamics.Contacts.b2ContactFactory;
    this.m_broadPhase = new Box2D.Collision.b2DynamicTreeBroadPhase
};
Box2D.Dynamics.b2ContactManager.prototype.AddPair = function (a, b)
{
    var c = a.GetBody(), d = b.GetBody();
    if (c != d && d.ShouldCollide(c) && this.m_contactFilter.ShouldCollide(a, b))
    {
        for (c = d.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); c; c = c.GetNextNode())
        {
            if (d = c.contact.GetFixtureA(), d == a)
            {
                if (d = c.contact.GetFixtureB(), d == b)
                {
                    return
                }
            } else
            {
                if (d == b && (d = c.contact.GetFixtureB(), d == a))
                {
                    return
                }
            }
        }
        this.m_contactFactory.Create(a, b)
    }
};
Box2D.Dynamics.b2ContactManager.prototype.FindNewContacts = function ()
{
    var a = this;
    this.m_broadPhase.UpdatePairs(function (b, c)
    {
        a.AddPair(b, c)
    })
};
Box2D.Dynamics.b2ContactManager.prototype.Destroy = function (a)
{
    var b = a.GetFixtureA(), c = a.GetFixtureB(), b = b.GetBody(), c = c.GetBody();
    a.IsTouching() && this.m_contactListener.EndContact(a);
    0 < a.m_manifold.m_pointCount && (b.SetAwake(!0), c.SetAwake(!0));
    a.RemoveFromLists();
    this.m_contactFactory.Destroy(a)
};
Box2D.Dynamics.b2ContactManager.prototype.Collide = function ()
{
    for (var a = this.m_world.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
    {
        var b = a.contact, c = b.GetFixtureA(), d = b.GetFixtureB(), e = c.GetBody(), f = d.GetBody();
        if (e.IsAwake() || f.IsAwake())
        {
            if (b.IsFiltering())
            {
                if (!f.ShouldCollide(e))
                {
                    this.Destroy(b);
                    continue
                }
                if (!this.m_contactFilter.ShouldCollide(c, d))
                {
                    this.Destroy(b);
                    continue
                }
                b.ClearFiltering()
            }
            this.m_broadPhase.TestOverlap(c.m_proxy, d.m_proxy) ? b.Update(this.m_contactListener) : this.Destroy(b)
        }
    }
};
Box2D.Dynamics.b2ContactManager.s_evalCP = new Box2D.Collision.b2ContactPoint;
Box2D.Dynamics.Joints.b2DistanceJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_length = a.length;
    this.m_frequencyHz = a.frequencyHz;
    this.m_dampingRatio = a.dampingRatio;
    this.m_bias = this.m_gamma = this.m_impulse = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2DistanceJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetReactionForce = function (a)
{
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse * this.m_u.x, a * this.m_impulse * this.m_u.y)
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetReactionTorque = function ()
{
    return 0
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetLength = function ()
{
    return this.m_length
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetLength = function (a)
{
    this.m_length = a
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetFrequency = function ()
{
    return this.m_frequencyHz
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetFrequency = function (a)
{
    this.m_frequencyHz = a
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetDampingRatio = function ()
{
    return this.m_dampingRatio
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetDampingRatio = function (a)
{
    this.m_dampingRatio = a
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.InitVelocityConstraints = function (a)
{
    var b, c = 0, d = this.m_bodyA, e = this.m_bodyB;
    b = d.m_xf.R;
    var f = this.m_localAnchor1.x - d.m_sweep.localCenter.x, g = this.m_localAnchor1.y - d.m_sweep.localCenter.y, c = b.col1.x * f + b.col2.x * g, g = b.col1.y * f + b.col2.y * g, f = c;
    b = e.m_xf.R;
    var h = this.m_localAnchor2.x - e.m_sweep.localCenter.x, i = this.m_localAnchor2.y - e.m_sweep.localCenter.y, c = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = c;
    this.m_u.x = e.m_sweep.c.x + h - d.m_sweep.c.x - f;
    this.m_u.y = e.m_sweep.c.y + i - d.m_sweep.c.y - g;
    c = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
    c > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u.Multiply(1 / c) : this.m_u.SetZero();
    b = f * this.m_u.y - g * this.m_u.x;
    var j = h * this.m_u.y - i * this.m_u.x;
    b = d.m_invMass + d.m_invI * b * b + e.m_invMass + e.m_invI * j * j;
    this.m_mass = 0 != b ? 1 / b : 0;
    if (0 < this.m_frequencyHz)
    {
        var c = c - this.m_length, j = 2 * Math.PI * this.m_frequencyHz, k = this.m_mass * j * j;
        this.m_gamma = a.dt * (2 * this.m_mass * this.m_dampingRatio * j + a.dt * k);
        this.m_gamma = 0 != this.m_gamma ? 1 / this.m_gamma : 0;
        this.m_bias = c * a.dt * k * this.m_gamma;
        this.m_mass = b + this.m_gamma;
        this.m_mass = 0 != this.m_mass ? 1 / this.m_mass : 0
    }
    a.warmStarting ? (this.m_impulse *= a.dtRatio, a = this.m_impulse * this.m_u.x, b = this.m_impulse * this.m_u.y, d.m_linearVelocity.x -= d.m_invMass * a, d.m_linearVelocity.y -= d.m_invMass * b, d.m_angularVelocity -= d.m_invI * (f * b - g * a), e.m_linearVelocity.x += e.m_invMass * a, e.m_linearVelocity.y += e.m_invMass * b, e.m_angularVelocity += e.m_invI * (h * b - i * a)) : this.m_impulse = 0
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SolveVelocityConstraints = function ()
{
    var a = this.m_localAnchor1.x - this.m_bodyA.m_sweep.localCenter.x, b = this.m_localAnchor1.y - this.m_bodyA.m_sweep.localCenter.y, c = this.m_bodyA.m_xf.R.col1.x * a + this.m_bodyA.m_xf.R.col2.x * b, b = this.m_bodyA.m_xf.R.col1.y * a + this.m_bodyA.m_xf.R.col2.y * b, a = c, d = this.m_localAnchor2.x - this.m_bodyB.m_sweep.localCenter.x, e = this.m_localAnchor2.y - this.m_bodyB.m_sweep.localCenter.y, c = this.m_bodyB.m_xf.R.col1.x * d + this.m_bodyB.m_xf.R.col2.x * e, e = this.m_bodyB.m_xf.R.col1.y *
        d + this.m_bodyB.m_xf.R.col2.y * e, d = c, f = -this.m_mass * (this.m_u.x * (this.m_bodyB.m_linearVelocity.x - this.m_bodyB.m_angularVelocity * e - (this.m_bodyA.m_linearVelocity.x - this.m_bodyA.m_angularVelocity * b)) + this.m_u.y * (this.m_bodyB.m_linearVelocity.y + this.m_bodyB.m_angularVelocity * d - (this.m_bodyA.m_linearVelocity.y + this.m_bodyA.m_angularVelocity * a)) + this.m_bias + this.m_gamma * this.m_impulse);
    this.m_impulse += f;
    c = f * this.m_u.x;
    f *= this.m_u.y;
    this.m_bodyA.m_linearVelocity.x -= this.m_bodyA.m_invMass * c;
    this.m_bodyA.m_linearVelocity.y -= this.m_bodyA.m_invMass * f;
    this.m_bodyA.m_angularVelocity -= this.m_bodyA.m_invI * (a * f - b * c);
    this.m_bodyB.m_linearVelocity.x += this.m_bodyB.m_invMass * c;
    this.m_bodyB.m_linearVelocity.y += this.m_bodyB.m_invMass * f;
    this.m_bodyB.m_angularVelocity += this.m_bodyB.m_invI * (d * f - e * c)
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SolvePositionConstraints = function ()
{
    if (0 < this.m_frequencyHz)
    {
        return!0
    }
    var a = this.m_localAnchor1.x - this.m_bodyA.m_sweep.localCenter.x, b = this.m_localAnchor1.y - this.m_bodyA.m_sweep.localCenter.y, c = this.m_bodyA.m_xf.R.col1.x * a + this.m_bodyA.m_xf.R.col2.x * b, b = this.m_bodyA.m_xf.R.col1.y * a + this.m_bodyA.m_xf.R.col2.y * b, a = c, d = this.m_localAnchor2.x - this.m_bodyB.m_sweep.localCenter.x, e = this.m_localAnchor2.y - this.m_bodyB.m_sweep.localCenter.y, c = this.m_bodyB.m_xf.R.col1.x * d + this.m_bodyB.m_xf.R.col2.x * e, e = this.m_bodyB.m_xf.R.col1.y *
        d + this.m_bodyB.m_xf.R.col2.y * e, d = c, f = this.m_bodyB.m_sweep.c.x + d - this.m_bodyA.m_sweep.c.x - a, g = this.m_bodyB.m_sweep.c.y + e - this.m_bodyA.m_sweep.c.y - b, c = Math.sqrt(f * f + g * g), f = f / c, g = g / c, c = Box2D.Common.Math.b2Math.Clamp(c - this.m_length, -Box2D.Common.b2Settings.b2_maxLinearCorrection, Box2D.Common.b2Settings.b2_maxLinearCorrection), h = -this.m_mass * c;
    this.m_u.Set(f, g);
    f = h * this.m_u.x;
    g = h * this.m_u.y;
    this.m_bodyA.m_sweep.c.x -= this.m_bodyA.m_invMass * f;
    this.m_bodyA.m_sweep.c.y -= this.m_bodyA.m_invMass * g;
    this.m_bodyA.m_sweep.a -= this.m_bodyA.m_invI * (a * g - b * f);
    this.m_bodyB.m_sweep.c.x += this.m_bodyB.m_invMass * f;
    this.m_bodyB.m_sweep.c.y += this.m_bodyB.m_invMass * g;
    this.m_bodyB.m_sweep.a += this.m_bodyB.m_invI * (d * g - e * f);
    this.m_bodyA.SynchronizeTransform();
    this.m_bodyB.SynchronizeTransform();
    return Math.abs(c) < Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Joints.b2DistanceJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_distanceJoint;
    this.length = 1;
    this.dampingRatio = this.frequencyHz = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2DistanceJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2DistanceJointDef.prototype.Initialize = function (a, b, c, d)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(c));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(d));
    a = d.x - c.x;
    c = d.y - c.y;
    this.length = Math.sqrt(a * a + c * c);
    this.dampingRatio = this.frequencyHz = 0
};
Box2D.Dynamics.Joints.b2DistanceJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2DistanceJoint(this)
};
Box2D.Dynamics.Controllers.b2BuoyancyController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, -1);
    this.density = this.offset = 0;
    this.velocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearDrag = 2;
    this.angularDrag = 1;
    this.useDensity = !1;
    this.useWorldGravity = !0;
    this.gravity = null
};
goog.inherits(Box2D.Dynamics.Controllers.b2BuoyancyController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2BuoyancyController.prototype.Step = function ()
{
    this.useWorldGravity && (this.gravity = this.m_world.GetGravity());
    for (var a = Box2D.Common.Math.b2Vec2.Get(0, 0), b = Box2D.Common.Math.b2Vec2.Get(0, 0), c = Box2D.Common.Math.b2Vec2.Get(0, 0), d = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); d; d = d.GetNextNode())
    {
        b.Set(0, 0);
        a.Set(0, 0);
        for (var e = d.body, f = 0, g = 0, h = e.GetFixtureList().GetFirstNode(); h; h = h.GetNextNode())
        {
            c.Set(0, 0);
            var i = h.fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, e.GetTransform(), c), f = f + i;
            a.x += i * c.x;
            a.y += i * c.y;
            var j = 0, j = 1, g = g + i * j;
            b.x += i * c.x * j;
            b.y += i * c.y * j
        }
        f < Number.MIN_VALUE || (a.x /= f, a.y /= f, b.x /= g, b.y /= g, g = this.gravity.GetNegative(), g.Multiply(this.density * f), e.ApplyForce(g, b), Box2D.Common.Math.b2Vec2.Free(g), g = e.GetLinearVelocityFromWorldPoint(a), g.Subtract(this.velocity), g.Multiply(-this.linearDrag * f), e.ApplyForce(g, a), Box2D.Common.Math.b2Vec2.Free(g), e.ApplyTorque(-e.GetInertia() / e.GetMass() * f * e.GetAngularVelocity() * this.angularDrag))
    }
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(b);
    Box2D.Common.Math.b2Vec2.Free(a)
};
Box2D.Dynamics.Controllers.b2BuoyancyController.prototype.Draw = function (a)
{
    var b = Box2D.Common.Math.b2Vec2.Get(this.normal.x * this.offset + 1E3 * this.normal.y, this.normal.y * this.offset - 1E3 * this.normal.x), c = Box2D.Common.Math.b2Vec2.Get(this.normal.x * this.offset - 1E3 * this.normal.y, this.normal.y * this.offset + 1E3 * this.normal.x);
    a.DrawSegment(b, c, Box2D.Dynamics.Controllers.b2BuoyancyController.color);
    Box2D.Common.Math.b2Vec2.Free(b);
    Box2D.Common.Math.b2Vec2.Free(c)
};
Box2D.Dynamics.Controllers.b2BuoyancyController.color = new Box2D.Common.b2Color(0, 0, 1);
Box2D.Dynamics.Controllers.b2GravityController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.G = 1;
    this.invSqr = !0
};
goog.inherits(Box2D.Dynamics.Controllers.b2GravityController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2GravityController.prototype.Step = function ()
{
    var a = null, b = null, c = 0, d = null, e = null, f = 0, g = 0, h = 0, f = null;
    if (this.invSqr)
    {
        for (var i = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); i; i = i.GetNextNode())
        {
            for (var a = i.body, b = a.GetWorldCenter(), c = a.GetMass(), j = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); j; j = j.GetNextNode())
            {
                if (d = j.body, a.IsAwake() || d.IsAwake())
                {
                    e = d.GetWorldCenter(), f = e.x - b.x, g = e.y - b.y, h = f * f + g * g, h < Number.MIN_VALUE || (f = Box2D.Common.Math.b2Vec2.Get(f, g), f.Multiply(this.G / h / Math.sqrt(h) * c * d.GetMass()), a.IsAwake() && a.ApplyForce(f, b), f.Multiply(-1), d.IsAwake() && d.ApplyForce(f, e), Box2D.Common.Math.b2Vec2.Free(f))
                }
            }
        }
    } else
    {
        for (i = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); i; i = i.GetNextNode())
        {
            a = bodyNode.body;
            b = a.GetWorldCenter();
            c = a.GetMass();
            for (j = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); j; j = j.GetNextNode())
            {
                if (d = bodyNode.body, a.IsAwake() || d.IsAwake())
                {
                    e = d.GetWorldCenter(), f = e.x - b.x, g = e.y - b.y, h = f * f + g * g, h < Number.MIN_VALUE || (f = Box2D.Common.Math.b2Vec2.Get(f, g), f.Multiply(this.G / h * c * d.GetMass()), a.IsAwake() && a.ApplyForce(f, b), f.Multiply(-1), d.IsAwake() && d.ApplyForce(f, e), Box2D.Common.Math.b2Vec2.Free(f))
                }
            }
        }
    }
};
Box2D.Collision.b2WorldManifold = function ()
{

    this.m_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_points = [];
    for (var a = this.m_pointCount = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.m_points[a] = Box2D.Common.Math.b2Vec2.Get(0, 0)
    }
};
Box2D.Collision.b2WorldManifold.prototype.Initialize = function (a, b, c, d, e)
{
    if (0 != a.m_pointCount)
    {
        var f = 0, g, h, i = 0, j = 0, k = 0, l = 0, n = 0;
        g = 0;
        switch (a.m_type)
        {
            case Box2D.Collision.b2Manifold.e_circles:
                h = b.R;
                g = a.m_localPoint;
                f = b.position.x + h.col1.x * g.x + h.col2.x * g.y;
                b = b.position.y + h.col1.y * g.x + h.col2.y * g.y;
                h = d.R;
                g = a.m_points[0].m_localPoint;
                a = d.position.x + h.col1.x * g.x + h.col2.x * g.y;
                d = d.position.y + h.col1.y * g.x + h.col2.y * g.y;
                g = a - f;
                h = d - b;
                i = g * g + h * h;
                i > Box2D.Common.b2Settings.MIN_VALUE_SQUARED ? (i = Math.sqrt(i), this.m_normal.x = g / i, this.m_normal.y = h / i) : (this.m_normal.x = 1, this.m_normal.y = 0);
                g = b + c * this.m_normal.y;
                d -= e * this.m_normal.y;
                this.m_points[0].x = 0.5 * (f + c * this.m_normal.x + (a - e * this.m_normal.x));
                this.m_points[0].y = 0.5 * (g + d);
                break;
            case Box2D.Collision.b2Manifold.e_faceA:
                h = b.R;
                g = a.m_localPlaneNormal;
                i = h.col1.x * g.x + h.col2.x * g.y;
                j = h.col1.y * g.x + h.col2.y * g.y;
                h = b.R;
                g = a.m_localPoint;
                k = b.position.x + h.col1.x * g.x + h.col2.x * g.y;
                l = b.position.y + h.col1.y * g.x + h.col2.y * g.y;
                this.m_normal.x = i;
                this.m_normal.y = j;
                for (f = 0; f < a.m_pointCount; f++)
                {
                    h = d.R, g = a.m_points[f].m_localPoint, n = d.position.x + h.col1.x * g.x + h.col2.x * g.y, g = d.position.y + h.col1.y * g.x + h.col2.y * g.y, this.m_points[f].x = n + 0.5 * (c - (n - k) * i - (g - l) * j - e) * i, this.m_points[f].y = g + 0.5 * (c - (n - k) * i - (g - l) * j - e) * j
                }
                break;
            case Box2D.Collision.b2Manifold.e_faceB:
                h = d.R;
                g = a.m_localPlaneNormal;
                i = h.col1.x * g.x + h.col2.x * g.y;
                j = h.col1.y * g.x + h.col2.y * g.y;
                h = d.R;
                g = a.m_localPoint;
                k = d.position.x + h.col1.x * g.x + h.col2.x * g.y;
                l = d.position.y + h.col1.y * g.x + h.col2.y * g.y;
                this.m_normal.x = -i;
                this.m_normal.y = -j;
                for (f = 0; f < a.m_pointCount; f++)
                {
                    h = b.R, g = a.m_points[f].m_localPoint, n = b.position.x + h.col1.x * g.x + h.col2.x * g.y, g = b.position.y + h.col1.y * g.x + h.col2.y * g.y, this.m_points[f].x = n + 0.5 * (e - (n - k) * i - (g - l) * j - c) * i, this.m_points[f].y = g + 0.5 * (e - (n - k) * i - (g - l) * j - c) * j
                }
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver = function ()
{
    this.m_constraints = []
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.Initialize = function (a, b, c)
{
    for (this.m_constraintCount = c; this.m_constraints.length < this.m_constraintCount;)
    {
        this.m_constraints[this.m_constraints.length] = new Box2D.Dynamics.Contacts.b2ContactConstraint
    }
    for (a = 0; a < c; a++)
    {
        var d = b[a], e = d.m_fixtureA, f = d.m_fixtureB, g = e.m_shape.m_radius, h = f.m_shape.m_radius, i = e.GetBody(), j = f.GetBody(), k = d.GetManifold(), l = Box2D.Common.b2Settings.b2MixFriction(e.GetFriction(), f.GetFriction()), n = Box2D.Common.b2Settings.b2MixRestitution(e.GetRestitution(), f.GetRestitution()), m = i.m_linearVelocity.x, o = i.m_linearVelocity.y, p = j.m_linearVelocity.x, q = j.m_linearVelocity.y, r = i.m_angularVelocity, x = j.m_angularVelocity;
        Box2D.Common.b2Settings.b2Assert(0 < k.m_pointCount);
        Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.Initialize(k, i.m_xf, g, j.m_xf, h);
        f = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_normal.x;
        d = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_normal.y;
        e = this.m_constraints[a];
        e.bodyA = i;
        e.bodyB = j;
        e.manifold = k;
        e.normal.x = f;
        e.normal.y = d;
        e.pointCount = k.m_pointCount;
        e.friction = l;
        e.restitution = n;
        e.localPlaneNormal.x = k.m_localPlaneNormal.x;
        e.localPlaneNormal.y = k.m_localPlaneNormal.y;
        e.localPoint.x = k.m_localPoint.x;
        e.localPoint.y = k.m_localPoint.y;
        e.radius = g + h;
        e.type = k.m_type;
        for (g = 0; g < e.pointCount; ++g)
        {
            l = k.m_points[g];
            h = e.points[g];
            h.normalImpulse = l.m_normalImpulse;
            h.tangentImpulse = l.m_tangentImpulse;
            h.localPoint.SetV(l.m_localPoint);
            var l = h.rA.x = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[g].x - i.m_sweep.c.x, n = h.rA.y = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[g].y - i.m_sweep.c.y, v = h.rB.x = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[g].x - j.m_sweep.c.x, w = h.rB.y = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[g].y - j.m_sweep.c.y, t = l * d - n * f, s = v * d - w * f, t = t * t, s = s * s;
            h.normalMass = 1 / (i.m_invMass + j.m_invMass + i.m_invI * t + j.m_invI * s);
            var u = i.m_mass * i.m_invMass + j.m_mass * j.m_invMass, u = u + (i.m_mass * i.m_invI * t + j.m_mass * j.m_invI * s);
            h.equalizedMass = 1 / u;
            s = d;
            u = -f;
            t = l * u - n * s;
            s = v * u - w * s;
            t *= t;
            s *= s;
            h.tangentMass = 1 / (i.m_invMass + j.m_invMass + i.m_invI * t + j.m_invI * s);
            h.velocityBias = 0;
            l = e.normal.x * (p + -x * w - m - -r * n) + e.normal.y * (q + x * v - o - r * l);
            l < -Box2D.Common.b2Settings.b2_velocityThreshold && (h.velocityBias += -e.restitution * l)
        }
        2 == e.pointCount && (q = e.points[0], p = e.points[1], k = i.m_invMass, i = i.m_invI, m = j.m_invMass, j = j.m_invI, o = q.rA.x * d - q.rA.y * f, q = q.rB.x * d - q.rB.y * f, r = p.rA.x * d - p.rA.y * f, p = p.rB.x * d - p.rB.y * f, f = k + m + i * o * o + j * q * q, d = k + m + i * r * r + j * p * p, j = k + m + i * o * r + j * q * p, f * f < 100 * (f * d - j * j) ? (e.K.col1.Set(f, j), e.K.col2.Set(j, d), e.K.GetInverse(e.normalMass)) : e.pointCount = 1)
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.InitVelocityConstraints = function (a)
{
    for (var b = 0; b < this.m_constraintCount; ++b)
    {
        var c = this.m_constraints[b], d = c.bodyA, e = c.bodyB, f = d.m_invMass, g = d.m_invI, h = e.m_invMass, i = e.m_invI, j = c.normal.x, k = c.normal.y, l = k, n = -j, m = 0, o = 0;
        if (a.warmStarting)
        {
            o = c.pointCount;
            for (m = 0; m < o; ++m)
            {
                var p = c.points[m];
                p.normalImpulse *= a.dtRatio;
                p.tangentImpulse *= a.dtRatio;
                var q = p.normalImpulse * j + p.tangentImpulse * l, r = p.normalImpulse * k + p.tangentImpulse * n;
                d.m_angularVelocity -= g * (p.rA.x * r - p.rA.y * q);
                d.m_linearVelocity.x -= f * q;
                d.m_linearVelocity.y -= f * r;
                e.m_angularVelocity += i * (p.rB.x * r - p.rB.y * q);
                e.m_linearVelocity.x += h * q;
                e.m_linearVelocity.y += h * r
            }
        } else
        {
            o = c.pointCount;
            for (m = 0; m < o; ++m)
            {
                d = c.points[m], d.normalImpulse = 0, d.tangentImpulse = 0
            }
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints = function ()
{
    for (var a = 0; a < this.m_constraintCount; a++)
    {
        this.SolveVelocityConstraints_Constraint(this.m_constraints[a])
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_Constraint = function (a)
{
    for (var b = a.normal.x, c = a.normal.y, d = 0; d < a.pointCount; d++)
    {
        Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPoint(a, a.points[d])
    }
    if (1 == a.pointCount)
    {
        var d = a.points[0], e = d.normalImpulse - d.normalMass * ((a.bodyB.m_linearVelocity.x - a.bodyB.m_angularVelocity * d.rB.y - a.bodyA.m_linearVelocity.x + a.bodyA.m_angularVelocity * d.rA.y) * b + (a.bodyB.m_linearVelocity.y + a.bodyB.m_angularVelocity * d.rB.x - a.bodyA.m_linearVelocity.y - a.bodyA.m_angularVelocity * d.rA.x) * c - d.velocityBias), e = 0 < e ? e : 0, f = e - d.normalImpulse, g = f * b, c = f * c;
        a.bodyA.m_linearVelocity.x -= a.bodyA.m_invMass * g;
        a.bodyA.m_linearVelocity.y -= a.bodyA.m_invMass * c;
        a.bodyA.m_angularVelocity -= a.bodyA.m_invI * (d.rA.x * c - d.rA.y * g);
        a.bodyB.m_linearVelocity.x += a.bodyB.m_invMass * g;
        a.bodyB.m_linearVelocity.y += a.bodyB.m_invMass * c;
        a.bodyB.m_angularVelocity += a.bodyB.m_invI * (d.rB.x * c - d.rB.y * g);
        d.normalImpulse = e
    } else
    {
        for (var d = a.points[0], e = a.points[1], f = d.normalImpulse, g = e.normalImpulse, h = (a.bodyB.m_linearVelocity.x - a.bodyB.m_angularVelocity * d.rB.y - a.bodyA.m_linearVelocity.x + a.bodyA.m_angularVelocity * d.rA.y) * b + (a.bodyB.m_linearVelocity.y + a.bodyB.m_angularVelocity * d.rB.x - a.bodyA.m_linearVelocity.y - a.bodyA.m_angularVelocity * d.rA.x) * c - d.velocityBias, c = (a.bodyB.m_linearVelocity.x - a.bodyB.m_angularVelocity * e.rB.y - a.bodyA.m_linearVelocity.x + a.bodyA.m_angularVelocity *
            e.rA.y) * b + (a.bodyB.m_linearVelocity.y + a.bodyB.m_angularVelocity * e.rB.x - a.bodyA.m_linearVelocity.y - a.bodyA.m_angularVelocity * e.rA.x) * c - e.velocityBias, h = h - (a.K.col1.x * f + a.K.col2.x * g), c = c - (a.K.col1.y * f + a.K.col2.y * g); ;)
        {
            b = -(a.normalMass.col1.x * h + a.normalMass.col2.x * c);
            if (0 <= b)
            {
                var i = -(a.normalMass.col1.y * h + a.normalMass.col2.y * c);
                if (0 <= i)
                {
                    this.SolveVelocityConstraints_ConstraintPointUpdate(a, d, e, b - f, i - g);
                    d.normalImpulse = b;
                    e.normalImpulse = i;
                    break
                }
            }
            b = -d.normalMass * h;
            if (0 <= b && 0 <= a.K.col1.y * b + c)
            {
                this.SolveVelocityConstraints_ConstraintPointUpdate(a, d, e, b - f, -g);
                d.normalImpulse = b;
                e.normalImpulse = 0;
                break
            }
            b = -e.normalMass * c;
            if (0 <= b && 0 <= a.K.col2.x * b + h)
            {
                this.SolveVelocityConstraints_ConstraintPointUpdate(a, d, e, -f, b - g);
                d.normalImpulse = 0;
                e.normalImpulse = b;
                break
            }
            if (0 <= h && 0 <= c)
            {
                this.SolveVelocityConstraints_ConstraintPointUpdate(a, d, e, -f, -g);
                d.normalImpulse = 0;
                e.normalImpulse = 0;
                break
            }
            break
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPoint = function (a, b)
{
    var c = a.normal.y, d = -a.normal.x, e = a.friction * b.normalImpulse, e = Box2D.Common.Math.b2Math.Clamp(b.tangentImpulse - b.tangentMass * ((a.bodyB.m_linearVelocity.x - a.bodyB.m_angularVelocity * b.rB.y - a.bodyA.m_linearVelocity.x + a.bodyA.m_angularVelocity * b.rA.y) * c + (a.bodyB.m_linearVelocity.y + a.bodyB.m_angularVelocity * b.rB.x - a.bodyA.m_linearVelocity.y - a.bodyA.m_angularVelocity * b.rA.x) * d), -e, e), f = e - b.tangentImpulse, c = f * c, d = f * d;
    a.bodyA.m_linearVelocity.x -= a.bodyA.m_invMass * c;
    a.bodyA.m_linearVelocity.y -= a.bodyA.m_invMass * d;
    a.bodyA.m_angularVelocity -= a.bodyA.m_invI * (b.rA.x * d - b.rA.y * c);
    a.bodyB.m_linearVelocity.x += a.bodyB.m_invMass * c;
    a.bodyB.m_linearVelocity.y += a.bodyB.m_invMass * d;
    a.bodyB.m_angularVelocity += a.bodyB.m_invI * (b.rB.x * d - b.rB.y * c);
    b.tangentImpulse = e
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPointUpdate = function (a, b, c, d, e)
{
    var f = d * a.normal.x, d = d * a.normal.y, g = e * a.normal.x, e = e * a.normal.y;
    a.bodyA.m_linearVelocity.x -= a.bodyA.m_invMass * (f + g);
    a.bodyA.m_linearVelocity.y -= a.bodyA.m_invMass * (d + e);
    a.bodyA.m_angularVelocity -= a.bodyA.m_invI * (b.rA.x * d - b.rA.y * f + c.rA.x * e - c.rA.y * g);
    a.bodyB.m_linearVelocity.x += a.bodyB.m_invMass * (f + g);
    a.bodyB.m_linearVelocity.y += a.bodyB.m_invMass * (d + e);
    a.bodyB.m_angularVelocity += a.bodyB.m_invI * (b.rB.x * d - b.rB.y * f + c.rB.x * e - c.rB.y * g);
    b.normalImpulse = 0;
    c.normalImpulse = 0
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.FinalizeVelocityConstraints = function ()
{
    for (var a = 0; a < this.m_constraintCount; ++a)
    {
        for (var b = this.m_constraints[a], c = b.manifold, d = 0; d < b.pointCount; ++d)
        {
            var e = c.m_points[d], f = b.points[d];
            e.m_normalImpulse = f.normalImpulse;
            e.m_tangentImpulse = f.tangentImpulse
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolvePositionConstraints = function (a)
{
    void 0 === a && (a = 0);
    for (var b = 0, c = 0; c < this.m_constraintCount; c++)
    {
        var d = this.m_constraints[c], e = d.bodyA, f = d.bodyB, g = e.m_mass * e.m_invMass, h = e.m_mass * e.m_invI, i = f.m_mass * f.m_invMass, j = f.m_mass * f.m_invI;
        Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.Initialize(d);
        for (var k = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_normal, l = 0; l < d.pointCount; l++)
        {
            var n = d.points[l], m = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_points[l], o = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_separations[l], p = m.x - e.m_sweep.c.x, q = m.y - e.m_sweep.c.y, r = m.x - f.m_sweep.c.x, m = m.y - f.m_sweep.c.y, b = b < o ? b : o, o = Box2D.Common.Math.b2Math.Clamp(a * (o + Box2D.Common.b2Settings.b2_linearSlop), -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), o = -n.equalizedMass * o, n = o * k.x, o = o * k.y;
            e.m_sweep.c.x -= g * n;
            e.m_sweep.c.y -= g * o;
            e.m_sweep.a -= h * (p * o - q * n);
            e.SynchronizeTransform();
            f.m_sweep.c.x += i * n;
            f.m_sweep.c.y += i * o;
            f.m_sweep.a += j * (r * o - m * n);
            f.SynchronizeTransform()
        }
    }
    return b > -1.5 * Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolvePositionConstraints_NEW = function (a)
{
    void 0 === a && (a = 0);
    for (var b = 0, c = 0; c < this.m_constraintCount; c++)
    {
        var d = this.m_constraints[c], e = d.bodyA, f = d.bodyB, g = e.m_mass * e.m_invMass, h = e.m_mass * e.m_invI, i = f.m_mass * f.m_invMass, j = f.m_mass * f.m_invI;
        Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.Initialize(d);
        for (var k = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_normal, l = 0; l < d.pointCount; l++)
        {
            var n = d.points[l], m = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_points[l], o = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_separations[l], p = m.x - e.m_sweep.c.x, q = m.y - e.m_sweep.c.y, r = m.x - f.m_sweep.c.x, m = m.y - f.m_sweep.c.y;
            o < b && (b = o);
            0 != a && Box2D.Common.Math.b2Math.Clamp(a * (o + Box2D.Common.b2Settings.b2_linearSlop), -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0);
            o = 0 * -n.equalizedMass;
            n = o * k.x;
            o *= k.y;
            e.m_sweep.c.x -= g * n;
            e.m_sweep.c.y -= g * o;
            e.m_sweep.a -= h * (p * o - q * n);
            e.SynchronizeTransform();
            f.m_sweep.c.x += i * n;
            f.m_sweep.c.y += i * o;
            f.m_sweep.a += j * (r * o - m * n);
            f.SynchronizeTransform()
        }
    }
    return b > -1.5 * Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold = new Box2D.Collision.b2WorldManifold;
Box2D.Dynamics.Contacts.b2ContactSolver.s_psm = new Box2D.Dynamics.Contacts.b2PositionSolverManifold;
Box2D.Dynamics.Controllers.b2ControllerListNode = function (a)
{
    this.controller = a;
    this.previous = this.next = null
};
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.SetNextNode = function (a)
{
    this.next = a
};
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.SetPreviousNode = function (a)
{
    this.previous = a
};
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.GetNextNode = function ()
{
    return this.next
};
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.GetPreviousNode = function ()
{
    return this.previous
};
Box2D.Dynamics.Controllers.b2ControllerList = function ()
{
    this.controllerLastNode = this.controllerFirstNode = null;
    this.controllerNodeLookup = {};
    this.controllerCount = 0
};
Box2D.Dynamics.Controllers.b2ControllerList.prototype.GetFirstNode = function ()
{
    return this.controllerFirstNode
};
Box2D.Dynamics.Controllers.b2ControllerList.prototype.AddController = function (a)
{
    var b = a.ID;
    if (null == this.controllerNodeLookup[b])
    {
        var a = new Box2D.Dynamics.Controllers.b2ControllerListNode(a), c = this.controllerLastNode;
        null != c ? c.SetNextNode(a) : this.controllerFirstNode = a;
        a.SetPreviousNode(c);
        this.controllerLastNode = a;
        this.controllerNodeLookup[b] = a;
        this.controllerCount++
    }
};
Box2D.Dynamics.Controllers.b2ControllerList.prototype.RemoveController = function (a)
{
    var a = a.ID, b = this.controllerNodeLookup[a];
    if (null != b)
    {
        var c = b.GetPreviousNode(), b = b.GetNextNode();
        null == c ? this.controllerFirstNode = b : c.SetNextNode(b);
        null == b ? this.controllerLastNode = c : b.SetPreviousNode(c);
        delete this.controllerNodeLookup[a];
        this.controllerCount--
    }
};
Box2D.Dynamics.Controllers.b2ControllerList.prototype.GetControllerCount = function ()
{
    return this.controllerCount
};
Box2D.Dynamics.b2FixtureDef = function ()
{

    this.filter = new Box2D.Dynamics.b2FilterData;
    this.filter.categoryBits = 1;
    this.filter.maskBits = 65535;
    this.filter.groupIndex = 0;
    this.shape = null;
    this.friction = 0.2;
    this.density = this.restitution = 0;
    this.isSensor = !1
};
Box2D.Dynamics.b2Body = function (a, b)
{

    this.ID = "Body" + Box2D.Dynamics.b2Body.NEXT_ID++;
    this.m_xf = new Box2D.Common.Math.b2Transform;
    this.m_xf.position.SetV(a.position);
    this.m_xf.R.Set(a.angle);
    this.m_sweep = new Box2D.Common.Math.b2Sweep;
    this.m_sweep.localCenter.SetZero();
    this.m_sweep.t0 = 1;
    this.m_sweep.a0 = this.m_sweep.a = a.angle;
    this.m_sweep.c.x = this.m_xf.R.col1.x * this.m_sweep.localCenter.x + this.m_xf.R.col2.x * this.m_sweep.localCenter.y;
    this.m_sweep.c.y = this.m_xf.R.col1.y * this.m_sweep.localCenter.x + this.m_xf.R.col2.y * this.m_sweep.localCenter.y;
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    this.m_linearVelocity = a.linearVelocity.Copy();
    this.m_force = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_bullet = a.bullet;
    this.m_fixedRotation = a.fixedRotation;
    this.m_allowSleep = a.allowSleep;
    this.m_awake = a.awake;
    this.m_active = a.active;
    this.m_world = b;
    this.m_userData = null;
    this.m_jointList = null;
    this.contactList = new Box2D.Dynamics.Contacts.b2ContactList;
    this.controllerList = new Box2D.Dynamics.Controllers.b2ControllerList;
    this.m_controllerCount = 0;
    this.m_angularVelocity = a.angularVelocity;
    this.m_linearDamping = a.linearDamping;
    this.m_angularDamping = a.angularDamping;
    this.m_sleepTime = this.m_torque = 0;
    this.m_type = a.type;
    this.m_mass = this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? 1 : 0;
    this.m_invMass = this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? 1 : 0;
    this.m_invI = this.m_I = 0;
    this.m_inertiaScale = a.inertiaScale;
    this.fixtureList = new Box2D.Dynamics.b2FixtureList;
    this.m_lists = []
};
Box2D.Dynamics.b2Body.prototype.CreateFixture = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    a = new Box2D.Dynamics.b2Fixture(this, this.m_xf, a);
    this.m_active && a.CreateProxy(this.m_world.m_contactManager.m_broadPhase, this.m_xf);
    this.fixtureList.AddFixture(a);
    a.m_body = this;
    0 < a.m_density && this.ResetMassData();
    this.m_world.m_newFixture = !0;
    return a
};
Box2D.Dynamics.b2Body.prototype.CreateFixture2 = function (a, b)
{
    var c = new Box2D.Dynamics.b2FixtureDef;
    c.shape = a;
    c.density = b;
    return this.CreateFixture(c)
};
Box2D.Dynamics.b2Body.prototype.Destroy = function ()
{
    Box2D.Common.Math.b2Vec2.Free(this.m_linearVelocity);
    Box2D.Common.Math.b2Vec2.Free(this.m_force)
};
Box2D.Dynamics.b2Body.prototype.DestroyFixture = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    this.fixtureList.RemoveFixture(a);
    for (var b = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); b; b = b.GetNextNode())
    {
        (a == b.contact.GetFixtureA() || a == b.contact.GetFixtureB()) && this.m_world.m_contactManager.Destroy(b.contact)
    }
    this.m_active && a.DestroyProxy(this.m_world.m_contactManager.m_broadPhase);
    a.Destroy();
    this.ResetMassData()
};
Box2D.Dynamics.b2Body.prototype.SetPositionAndAngle = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    this.m_xf.R.Set(b);
    this.m_xf.position.SetV(a);
    var c = this.m_xf.R, d = this.m_sweep.localCenter;
    this.m_sweep.c.x = c.col1.x * d.x + c.col2.x * d.y;
    this.m_sweep.c.y = c.col1.y * d.x + c.col2.y * d.y;
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    this.m_sweep.a0 = this.m_sweep.a = b;
    c = this.m_world.m_contactManager.m_broadPhase;
    for (d = this.fixtureList.GetFirstNode(); d; d = d.GetNextNode())
    {
        d.fixture.Synchronize(c, this.m_xf, this.m_xf)
    }
    this.m_world.m_contactManager.FindNewContacts()
};
Box2D.Dynamics.b2Body.prototype.SetTransform = function (a)
{
    this.SetPositionAndAngle(a.position, a.GetAngle())
};
Box2D.Dynamics.b2Body.prototype.GetTransform = function ()
{
    return this.m_xf
};
Box2D.Dynamics.b2Body.prototype.GetPosition = function ()
{
    return this.m_xf.position
};
Box2D.Dynamics.b2Body.prototype.SetPosition = function (a)
{
    this.SetPositionAndAngle(a, this.GetAngle())
};
Box2D.Dynamics.b2Body.prototype.GetAngle = function ()
{
    return this.m_sweep.a
};
Box2D.Dynamics.b2Body.prototype.SetAngle = function (a)
{
    this.SetPositionAndAngle(this.GetPosition(), a)
};
Box2D.Dynamics.b2Body.prototype.GetWorldCenter = function ()
{
    return this.m_sweep.c
};
Box2D.Dynamics.b2Body.prototype.GetUserData = function ()
{
    return this.m_userData;
};
Box2D.Dynamics.b2Body.prototype.SetUserData = function (data)
{
    this.m_userData = data;
};
Box2D.Dynamics.b2Body.prototype.GetLocalCenter = function ()
{
    return this.m_sweep.localCenter
};
Box2D.Dynamics.b2Body.prototype.SetLinearVelocity = function (a)
{
    this.m_type != Box2D.Dynamics.b2BodyDef.b2_staticBody && this.m_linearVelocity.SetV(a)
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function ()
{
    return this.m_linearVelocity
};
Box2D.Dynamics.b2Body.prototype.SetAngularVelocity = function (a)
{
    this.m_type != Box2D.Dynamics.b2BodyDef.b2_staticBody && (this.m_angularVelocity = a)
};
Box2D.Dynamics.b2Body.prototype.GetAngularVelocity = function ()
{
    return this.m_angularVelocity
};
Box2D.Dynamics.b2Body.prototype.GetDefinition = function ()
{
    var a = new Box2D.Dynamics.b2BodyDef;
    a.type = this.GetType();
    a.allowSleep = this.m_allowSleep;
    a.angle = this.GetAngle();
    a.angularDamping = this.m_angularDamping;
    a.angularVelocity = this.m_angularVelocity;
    a.fixedRotation = this.m_fixedRotation;
    a.bullet = this.m_bullet;
    a.active = this.m_active;
    a.awake = this.m_awake;
    a.linearDamping = this.m_linearDamping;
    a.linearVelocity.SetV(this.GetLinearVelocity());
    a.position.SetV(this.GetPosition());
    return a
};
Box2D.Dynamics.b2Body.prototype.ApplyForce = function (a, b)
{
    this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody && (this.SetAwake(!0), this.m_force.x += a.x, this.m_force.y += a.y, this.m_torque += (b.x - this.m_sweep.c.x) * a.y - (b.y - this.m_sweep.c.y) * a.x)
};
Box2D.Dynamics.b2Body.prototype.ApplyTorque = function (a)
{
    this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody && (this.SetAwake(!0), this.m_torque += a)
};
Box2D.Dynamics.b2Body.prototype.ApplyImpulse = function (a, b)
{
    this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody && (this.SetAwake(!0), this.m_linearVelocity.x += this.m_invMass * a.x, this.m_linearVelocity.y += this.m_invMass * a.y, this.m_angularVelocity += this.m_invI * ((b.x - this.m_sweep.c.x) * a.y - (b.y - this.m_sweep.c.y) * a.x))
};
Box2D.Dynamics.b2Body.prototype.Split = function (a)
{
    for (var b = this.GetLinearVelocity().Copy(), c = this.GetAngularVelocity(), d = this.GetWorldCenter(), e = this.m_world.CreateBody(this.GetDefinition()), f = this.fixtureList.GetFirstNode(); f; f = f.GetNextNode())
    {
        var g = f.fixture;
        a(g) && (this.fixtureList.RemoveFixture(g), e.fixtureList.AddFixture(g))
    }
    this.ResetMassData();
    e.ResetMassData();
    f = this.GetWorldCenter();
    a = e.GetWorldCenter();
    g = Box2D.Common.Math.b2Math.SubtractVV(f, d);
    f = Box2D.Common.Math.b2Math.CrossFV(c, g);
    Box2D.Common.Math.b2Vec2.Free(g);
    g = Box2D.Common.Math.b2Math.AddVV(b, f);
    Box2D.Common.Math.b2Vec2.Free(f);
    this.SetLinearVelocity(g);
    Box2D.Common.Math.b2Vec2.Free(g);
    a = Box2D.Common.Math.b2Math.SubtractVV(a, d);
    d = Box2D.Common.Math.b2Math.CrossFV(c, a);
    Box2D.Common.Math.b2Vec2.Free(a);
    a = Box2D.Common.Math.b2Math.AddVV(b, d);
    Box2D.Common.Math.b2Vec2.Free(d);
    e.SetLinearVelocity(a);
    Box2D.Common.Math.b2Vec2.Free(a);
    Box2D.Common.Math.b2Vec2.Free(b);
    this.SetAngularVelocity(c);
    e.SetAngularVelocity(c);
    this.SynchronizeFixtures();
    e.SynchronizeFixtures();
    return e
};
Box2D.Dynamics.b2Body.prototype.Merge = function (a)
{
    for (var b = a.fixtureList.GetFirstNode(); b; b = b.GetNextNode())
    {
        this.fixtureList.AddFixture(b.fixture), a.fixtureList.RemoveFixture(b.fixture)
    }
    a.ResetMassData();
    this.ResetMassData();
    this.SynchronizeFixtures()
};
Box2D.Dynamics.b2Body.prototype.GetMass = function ()
{
    return this.m_mass
};
Box2D.Dynamics.b2Body.prototype.GetInertia = function ()
{
    return this.m_I
};
Box2D.Dynamics.b2Body.prototype.GetMassData = function (a)
{
    a || (a = Box2D.Collision.Shapes.b2MassData.Get());
    a.mass = this.m_mass;
    a.I = this.m_I;
    a.center.SetV(this.m_sweep.localCenter);
    return a
};
Box2D.Dynamics.b2Body.prototype.SetMassData = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody)
    {
        this.m_invI = this.m_I = this.m_invMass = 0;
        this.m_mass = a.mass;
        0 >= this.m_mass && (this.m_mass = 1);
        this.m_invMass = 1 / this.m_mass;
        0 < a.I && !this.m_fixedRotation && (this.m_I = a.I - this.m_mass * (a.center.x * a.center.x + a.center.y * a.center.y), this.m_invI = 1 / this.m_I);
        var b = this.m_sweep.c.Copy();
        this.m_sweep.localCenter.SetV(a.center);
        this.m_sweep.c0.SetV(Box2D.Common.Math.b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
        this.m_sweep.c.SetV(this.m_sweep.c0);
        this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - b.y);
        this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - b.x);
        Box2D.Common.Math.b2Vec2.Free(b)
    }
};
Box2D.Dynamics.b2Body.prototype.ResetMassData = function ()
{
    this.m_invI = this.m_I = this.m_invMass = this.m_mass = 0;
    this.m_sweep.localCenter.SetZero();
    if (!(this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody || this.m_type == Box2D.Dynamics.b2BodyDef.b2_kinematicBody))
    {
        for (var a = Box2D.Common.Math.b2Vec2.Get(0, 0), b = this.fixtureList.GetFirstNode(); b; b = b.GetNextNode())
        {
            var c = b.fixture;
            0 != c.m_density && (c = c.GetMassData(), this.m_mass += c.mass, a.x += c.center.x * c.mass, a.y += c.center.y * c.mass, this.m_I += c.I)
        }
        0 < this.m_mass ? (this.m_invMass = 1 / this.m_mass, a.x *= this.m_invMass, a.y *= this.m_invMass) : this.m_invMass = this.m_mass = 1;
        0 < this.m_I && !this.m_fixedRotation ? (this.m_I -= this.m_mass * (a.x * a.x + a.y * a.y), this.m_I *= this.m_inertiaScale, Box2D.Common.b2Settings.b2Assert(0 < this.m_I), this.m_invI = 1 / this.m_I) : this.m_invI = this.m_I = 0;
        b = this.m_sweep.c.Copy();
        this.m_sweep.localCenter.SetV(a);
        this.m_sweep.c0.SetV(Box2D.Common.Math.b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
        this.m_sweep.c.SetV(this.m_sweep.c0);
        this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - b.y);
        this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - b.x);
        Box2D.Common.Math.b2Vec2.Free(a);
        Box2D.Common.Math.b2Vec2.Free(b)
    }
};
Box2D.Dynamics.b2Body.prototype.GetWorldPoint = function (a)
{
    var b = this.m_xf.R, a = Box2D.Common.Math.b2Vec2.Get(b.col1.x * a.x + b.col2.x * a.y, b.col1.y * a.x + b.col2.y * a.y);
    a.x += this.m_xf.position.x;
    a.y += this.m_xf.position.y;
    return a
};
Box2D.Dynamics.b2Body.prototype.GetWorldVector = function (a)
{
    return Box2D.Common.Math.b2Math.MulMV(this.m_xf.R, a)
};
Box2D.Dynamics.b2Body.prototype.GetLocalPoint = function (a)
{
    return Box2D.Common.Math.b2Math.MulXT(this.m_xf, a)
};
Box2D.Dynamics.b2Body.prototype.GetLocalVector = function (a)
{
    return Box2D.Common.Math.b2Math.MulTMV(this.m_xf.R, a)
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocityFromWorldPoint = function (a)
{
    return Box2D.Common.Math.b2Vec2.Get(this.m_linearVelocity.x - this.m_angularVelocity * (a.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (a.x - this.m_sweep.c.x))
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocityFromLocalPoint = function (a)
{
    var b = this.m_xf.R, a = Box2D.Common.Math.b2Vec2.Get(b.col1.x * a.x + b.col2.x * a.y, b.col1.y * a.x + b.col2.y * a.y);
    a.x += this.m_xf.position.x;
    a.y += this.m_xf.position.y;
    b = Box2D.Common.Math.b2Vec2.Get(this.m_linearVelocity.x - this.m_angularVelocity * (a.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (a.x - this.m_sweep.c.x));
    Box2D.Common.Math.b2Vec2.Free(a);
    return b
};
Box2D.Dynamics.b2Body.prototype.GetLinearDamping = function ()
{
    return this.m_linearDamping
};
Box2D.Dynamics.b2Body.prototype.SetLinearDamping = function (a)
{
    this.m_linearDamping = a
};
Box2D.Dynamics.b2Body.prototype.GetAngularDamping = function ()
{
    return this.m_angularDamping
};
Box2D.Dynamics.b2Body.prototype.SetAngularDamping = function (a)
{
    this.m_angularDamping = a
};
Box2D.Dynamics.b2Body.prototype.SetType = function (a)
{
    if (this.m_type != a)
    {
        this.m_type = a;
        this.ResetMassData();
        this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody && (this.m_linearVelocity.SetZero(), this.m_angularVelocity = 0);
        this.SetAwake(!0);
        this.m_force.SetZero();
        this.m_torque = 0;
        for (a = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            a.contact.FlagForFiltering()
        }
        for (a = 0; a < this.m_lists.length; a++)
        {
            this.m_lists[a].UpdateBody(this)
        }
    }
};
Box2D.Dynamics.b2Body.prototype.GetType = function ()
{
    return this.m_type
};
Box2D.Dynamics.b2Body.prototype.SetBullet = function (a)
{
    this.m_bullet = a
};
Box2D.Dynamics.b2Body.prototype.IsBullet = function ()
{
    return this.m_bullet
};
Box2D.Dynamics.b2Body.prototype.SetSleepingAllowed = function (a)
{
    (this.m_allowSleep = a) || this.SetAwake(!0)
};
Box2D.Dynamics.b2Body.prototype.SetAwake = function (a)
{
    if (this.m_awake != a)
    {
        this.m_awake = a;
        this.m_sleepTime = 0;
        a || (this.m_linearVelocity.SetZero(), this.m_angularVelocity = 0, this.m_force.SetZero(), this.m_torque = 0);
        for (a = 0; a < this.m_lists.length; a++)
        {
            this.m_lists[a].UpdateBody(this)
        }
    }
};
Box2D.Dynamics.b2Body.prototype.IsAwake = function ()
{
    return this.m_awake
};
Box2D.Dynamics.b2Body.prototype.SetFixedRotation = function (a)
{
    this.m_fixedRotation = a;
    this.ResetMassData()
};
Box2D.Dynamics.b2Body.prototype.IsFixedRotation = function ()
{
    return this.m_fixedRotation
};
Box2D.Dynamics.b2Body.prototype.SetActive = function (a)
{
    if (a != this.m_active)
    {
        if (a)
        {
            this.m_active = !0;
            for (var a = this.m_world.m_contactManager.m_broadPhase, b = this.fixtureList.GetFirstNode(); b; b = b.GetNextNode())
            {
                b.fixture.CreateProxy(a, this.m_xf)
            }
        } else
        {
            this.m_active = !1;
            a = this.m_world.m_contactManager.m_broadPhase;
            for (b = this.fixtureList.GetFirstNode(); b; b = b.GetNextNode())
            {
                b.fixture.DestroyProxy(a)
            }
            for (a = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
            {
                this.m_world.m_contactManager.Destroy(a.contact)
            }
        }
        for (a = 0; a < this.m_lists.length; a++)
        {
            this.m_lists[a].UpdateBody(this)
        }
    }
};
Box2D.Dynamics.b2Body.prototype.IsActive = function ()
{
    return this.m_active
};
Box2D.Dynamics.b2Body.prototype.IsSleepingAllowed = function ()
{
    return this.m_allowSleep
};
Box2D.Dynamics.b2Body.prototype.GetFixtureList = function ()
{
    return this.fixtureList
};
Box2D.Dynamics.b2Body.prototype.GetJointList = function ()
{
    return this.m_jointList
};
Box2D.Dynamics.b2Body.prototype.GetControllerList = function ()
{
    return this.controllerList
};
Box2D.Dynamics.b2Body.prototype.AddController = function (a)
{
    this.controllerList.AddController(a)
};
Box2D.Dynamics.b2Body.prototype.RemoveController = function (a)
{
    this.controllerList.RemoveController(a)
};
Box2D.Dynamics.b2Body.prototype.GetContactList = function ()
{
    return this.contactList
};
Box2D.Dynamics.b2Body.prototype.GetWorld = function ()
{
    return this.m_world
};
Box2D.Dynamics.b2Body.prototype.SynchronizeFixtures = function ()
{
    var a = Box2D.Dynamics.b2Body.s_xf1;
    a.R.Set(this.m_sweep.a0);
    var b = a.R, c = this.m_sweep.localCenter;
    a.position.x = this.m_sweep.c0.x - (b.col1.x * c.x + b.col2.x * c.y);
    a.position.y = this.m_sweep.c0.y - (b.col1.y * c.x + b.col2.y * c.y);
    b = this.m_world.m_contactManager.m_broadPhase;
    for (c = this.fixtureList.GetFirstNode(); c; c = c.GetNextNode())
    {
        c.fixture.Synchronize(b, a, this.m_xf)
    }
};
Box2D.Dynamics.b2Body.prototype.SynchronizeTransform = function ()
{
    this.m_xf.R.Set(this.m_sweep.a);
    var a = this.m_xf.R, b = this.m_sweep.localCenter;
    this.m_xf.position.x = this.m_sweep.c.x - (a.col1.x * b.x + a.col2.x * b.y);
    this.m_xf.position.y = this.m_sweep.c.y - (a.col1.y * b.x + a.col2.y * b.y)
};
Box2D.Dynamics.b2Body.prototype.ShouldCollide = function (a)
{
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody && a.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody)
    {
        return!1
    }
    for (var b = this.m_jointList; b; b = b.next)
    {
        if (b.other == a && !1 == b.joint.m_collideConnected)
        {
            return!1
        }
    }
    return!0
};
Box2D.Dynamics.b2Body.prototype.Advance = function (a)
{
    this.m_sweep.Advance(a);
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_sweep.a = this.m_sweep.a0;
    this.SynchronizeTransform()
};
Box2D.Dynamics.b2Body.NEXT_ID = 0;
Box2D.Dynamics.b2Body.s_xf1 = new Box2D.Common.Math.b2Transform;
Box2D.Dynamics.b2World = function (a, b)
{
    this.m_contactManager = new Box2D.Dynamics.b2ContactManager(this);
    this.m_contactSolver = new Box2D.Dynamics.Contacts.b2ContactSolver;
    this.m_newFixture = this.m_isLocked = !1;
    this.m_debugDraw = this.m_destructionListener = null;
    this.bodyList = new Box2D.Dynamics.b2BodyList;
    this.contactList = new Box2D.Dynamics.Contacts.b2ContactList;
    this.m_jointList = null;
    this.controllerList = new Box2D.Dynamics.Controllers.b2ControllerList;
    this.m_jointCount = 0;
    this.m_continuousPhysics = this.m_warmStarting = !0;
    this.m_allowSleep = b;
    this.m_gravity = a;
    this.m_inv_dt0 = 0;
    this.m_groundBody = this.CreateBody(new Box2D.Dynamics.b2BodyDef);
    this.mainTimeStep = new Box2D.Dynamics.b2TimeStep(0, 0, 0, 0, this.m_warmStarting);
    this.islandTimeStep = new Box2D.Dynamics.b2TimeStep(0, 0, 0, 0, this.m_warmStarting);
    this.island = new Box2D.Dynamics.b2Island(this.m_contactManager.m_contactListener, this.m_contactSolver)
};
Box2D.Dynamics.b2World.MAX_TOI = 1 - 100 * Number.MIN_VALUE;
Box2D.Dynamics.b2World.prototype.SetDestructionListener = function (a)
{
    this.m_destructionListener = a
};
Box2D.Dynamics.b2World.prototype.SetContactFilter = function (a)
{
    this.m_contactManager.m_contactFilter = a
};
Box2D.Dynamics.b2World.prototype.SetContactListener = function (a)
{
    this.m_contactManager.m_contactListener = a
};
Box2D.Dynamics.b2World.prototype.SetDebugDraw = function (a)
{
    this.m_debugDraw = a
};
Box2D.Dynamics.b2World.prototype.SetBroadPhase = function (a)
{
    var b = this.m_contactManager.m_broadPhase;
    this.m_contactManager.m_broadPhase = a;
    for (var c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); c; c = c.GetNextNode())
    {
        for (var d = c.body.GetFixtureList().GetFirstNode(); d; d = d.GetNextNode())
        {
            var e = d.fixture;
            e.m_proxy = a.CreateProxy(b.GetFatAABB(e.m_proxy), e)
        }
    }
};
Box2D.Dynamics.b2World.prototype.GetProxyCount = function ()
{
    return this.m_contactManager.m_broadPhase.GetProxyCount()
};
Box2D.Dynamics.b2World.prototype.CreateBody = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.IsLocked());
    a = new Box2D.Dynamics.b2Body(a, this);
    this.bodyList.AddBody(a);
    return a
};
Box2D.Dynamics.b2World.prototype.DestroyBody = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.IsLocked());
    for (var b = a.m_jointList; b;)
    {
        var c = b, b = b.next;
        this.m_destructionListener && this.m_destructionListener.SayGoodbyeJoint(c.joint);
        this.DestroyJoint(c.joint)
    }
    for (b = a.GetControllerList().GetFirstNode(); b; b = b.GetNextNode())
    {
        b.controller.RemoveBody(a)
    }
    for (b = a.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); b; b = b.GetNextNode())
    {
        this.m_contactManager.Destroy(b.contact)
    }
    for (b = a.GetFixtureList().GetFirstNode(); b; b = b.GetNextNode())
    {
        this.m_destructionListener && this.m_destructionListener.SayGoodbyeFixture(b.fixture), a.DestroyFixture(b.fixture)
    }
    a.Destroy();
    this.bodyList.RemoveBody(a)
};
Box2D.Dynamics.b2World.prototype.CreateJoint = function (a)
{
    var b = Box2D.Dynamics.Joints.b2Joint.Create(a);
    b.m_prev = null;
    if (b.m_next = this.m_jointList)
    {
        this.m_jointList.m_prev = b
    }
    this.m_jointList = b;
    this.m_jointCount++;
    b.m_edgeA.joint = b;
    b.m_edgeA.other = b.m_bodyB;
    b.m_edgeA.prev = null;
    if (b.m_edgeA.next = b.m_bodyA.m_jointList)
    {
        b.m_bodyA.m_jointList.prev = b.m_edgeA
    }
    b.m_bodyA.m_jointList = b.m_edgeA;
    b.m_edgeB.joint = b;
    b.m_edgeB.other = b.m_bodyA;
    b.m_edgeB.prev = null;
    if (b.m_edgeB.next = b.m_bodyB.m_jointList)
    {
        b.m_bodyB.m_jointList.prev = b.m_edgeB
    }
    b.m_bodyB.m_jointList = b.m_edgeB;
    var c = a.bodyA, d = a.bodyB;
    if (!a.collideConnected)
    {
        for (a = d.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            a.contact.GetOther(d) == c && a.contact.FlagForFiltering()
        }
    }
    return b
};
Box2D.Dynamics.b2World.prototype.DestroyJoint = function (a)
{
    var b = a.m_collideConnected;
    a.m_prev && (a.m_prev.m_next = a.m_next);
    a.m_next && (a.m_next.m_prev = a.m_prev);
    a == this.m_jointList && (this.m_jointList = a.m_next);
    var c = a.m_bodyA, d = a.m_bodyB;
    c.SetAwake(!0);
    d.SetAwake(!0);
    a.m_edgeA.prev && (a.m_edgeA.prev.next = a.m_edgeA.next);
    a.m_edgeA.next && (a.m_edgeA.next.prev = a.m_edgeA.prev);
    a.m_edgeA == c.m_jointList && (c.m_jointList = a.m_edgeA.next);
    a.m_edgeA.prev = null;
    a.m_edgeA.next = null;
    a.m_edgeB.prev && (a.m_edgeB.prev.next = a.m_edgeB.next);
    a.m_edgeB.next && (a.m_edgeB.next.prev = a.m_edgeB.prev);
    a.m_edgeB == d.m_jointList && (d.m_jointList = a.m_edgeB.next);
    a.m_edgeB.prev = null;
    a.m_edgeB.next = null;
    this.m_jointCount--;
    if (!b)
    {
        for (a = d.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            a.contact.GetOther(d) == c && a.contact.FlagForFiltering()
        }
    }
};
Box2D.Dynamics.b2World.prototype.GetControllerList = function ()
{
    return this.controllerList
};
Box2D.Dynamics.b2World.prototype.AddController = function (a)
{
    if (null !== a.m_world && a.m_world != this)
    {
        throw Error("Controller can only be a member of one world");
    }
    this.controllerList.AddController(a);
    a.m_world = this;
    return a
};
Box2D.Dynamics.b2World.prototype.RemoveController = function (a)
{
    this.controllerList.RemoveController(a);
    a.m_world = null;
    a.Clear()
};
Box2D.Dynamics.b2World.prototype.CreateController = function (a)
{
    return this.AddController(a)
};
Box2D.Dynamics.b2World.prototype.DestroyController = function (a)
{
    this.RemoveController(a)
};
Box2D.Dynamics.b2World.prototype.SetWarmStarting = function (a)
{
    this.m_warmStarting = a
};
Box2D.Dynamics.b2World.prototype.SetContinuousPhysics = function (a)
{
    this.m_continuousPhysics = a
};
Box2D.Dynamics.b2World.prototype.GetBodyCount = function ()
{
    return this.bodyList.GetBodyCount()
};
Box2D.Dynamics.b2World.prototype.GetJointCount = function ()
{
    return this.m_jointCount
};
Box2D.Dynamics.b2World.prototype.GetContactCount = function ()
{
    return this.contactList.GetContactCount()
};
Box2D.Dynamics.b2World.prototype.SetGravity = function (a)
{
    this.m_gravity = a
};
Box2D.Dynamics.b2World.prototype.GetGravity = function ()
{
    return this.m_gravity
};
Box2D.Dynamics.b2World.prototype.GetGroundBody = function ()
{
    return this.m_groundBody
};
Box2D.Dynamics.b2World.prototype.Step = function (a, b, c)
{
    this.m_newFixture && (this.m_contactManager.FindNewContacts(), this.m_newFixture = !1);
    this.m_isLocked = !0;
    this.mainTimeStep.Reset(a, this.m_inv_dt0 * a, b, c, this.m_warmStarting);
    this.m_contactManager.Collide();
    0 < this.mainTimeStep.dt && (this.Solve(this.mainTimeStep), this.m_continuousPhysics && this.SolveTOI(this.mainTimeStep), this.m_inv_dt0 = this.mainTimeStep.inv_dt);
    this.m_isLocked = !1
};
Box2D.Dynamics.b2World.prototype.ClearForces = function ()
{
    for (var a = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies); a; a = a.GetNextNode())
    {
        a.body.m_force.SetZero(), a.body.m_torque = 0
    }
};
Box2D.Dynamics.b2World.prototype.DrawDebugData = function ()
{
    if (null !== this.m_debugDraw)
    {
        this.m_debugDraw.Clear();
        var a = this.m_debugDraw.GetFlags();
        if (a & Box2D.Dynamics.b2DebugDraw.e_shapeBit)
        {
            for (var b = Box2D.Dynamics.b2World.s_color_inactive, c = Box2D.Dynamics.b2World.s_color_static, d = Box2D.Dynamics.b2World.s_color_kinematic, e = Box2D.Dynamics.b2World.s_color_dynamic_sleeping, f = Box2D.Dynamics.b2World.s_color_dynamic_awake, g = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); g; g = g.GetNextNode())
            {
                for (var h = g.body, i = h.GetFixtureList().GetFirstNode(); i; i = i.GetNextNode())
                {
                    var j = i.fixture, j = j.GetShape();
                    h.IsActive() ? h.GetType() == Box2D.Dynamics.b2BodyDef.b2_staticBody ? this.DrawShape(j, h.m_xf, c) : h.GetType() == Box2D.Dynamics.b2BodyDef.b2_kinematicBody ? this.DrawShape(j, h.m_xf, d) : h.IsAwake() ? this.DrawShape(j, h.m_xf, f) : this.DrawShape(j, h.m_xf, e) : this.DrawShape(j, h.m_xf, b)
                }
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_jointBit)
        {
            for (g = this.m_jointList; g; g = g.m_next)
            {
                this.DrawJoint(g)
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_controllerBit)
        {
            for (g = this.controllerList.GetFirstNode(); g; g = g.GetNextNode())
            {
                g.controller.Draw(this.m_debugDraw)
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_pairBit)
        {
            g = Box2D.Dynamics.b2World.s_pairColor;
            for (i = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); i; i = i.GetNextNode())
            {
                b = i.contact.GetFixtureA(), h = i.contact.GetFixtureB(), b = b.GetAABB().GetCenter(), h = h.GetAABB().GetCenter(), this.m_debugDraw.DrawSegment(b, h, g), Box2D.Common.Math.b2Vec2.Free(b), Box2D.Common.Math.b2Vec2.Free(h)
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_aabbBit)
        {
            b = Box2D.Dynamics.b2World.s_aabbColor;
            for (g = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.activeBodies); g; g = g.GetNextNode())
            {
                h = g.body;
                for (i = h.GetFixtureList().GetFirstNode(); i; i = i.GetNextNode())
                {
                    j = i.fixture, h = this.m_contactManager.m_broadPhase.GetFatAABB(j.m_proxy), h = [Box2D.Common.Math.b2Vec2.Get(h.lowerBound.x, h.lowerBound.y), Box2D.Common.Math.b2Vec2.Get(h.upperBound.x, h.lowerBound.y), Box2D.Common.Math.b2Vec2.Get(h.upperBound.x, h.upperBound.y), Box2D.Common.Math.b2Vec2.Get(h.lowerBound.x, h.upperBound.y)], this.m_debugDraw.DrawPolygon(h, 4, b), Box2D.Common.Math.b2Vec2.Free(h[0]), Box2D.Common.Math.b2Vec2.Free(h[1]), Box2D.Common.Math.b2Vec2.Free(h[2]), Box2D.Common.Math.b2Vec2.Free(h[3])
                }
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit)
        {
            for (g = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); g; g = g.GetNextNode())
            {
                h = g.body, Box2D.Dynamics.b2World.s_xf.R = h.m_xf.R, Box2D.Dynamics.b2World.s_xf.position = h.GetWorldCenter(), this.m_debugDraw.DrawTransform(Box2D.Dynamics.b2World.s_xf)
            }
        }
    }
};
Box2D.Dynamics.b2World.prototype.QueryAABB = function (a, b)
{
    this.m_contactManager.m_broadPhase.Query(a, b)
};
Box2D.Dynamics.b2World.prototype.QueryPoint = function (a, b)
{
    var c = Box2D.Collision.b2AABB.Get();
    c.lowerBound.Set(b.x - Box2D.Common.b2Settings.b2_linearSlop, b.y - Box2D.Common.b2Settings.b2_linearSlop);
    c.upperBound.Set(b.x + Box2D.Common.b2Settings.b2_linearSlop, b.y + Box2D.Common.b2Settings.b2_linearSlop);
    this.m_contactManager.m_broadPhase.Query(function (c)
    {
        return c.TestPoint(b) ? a(c) : !0
    }, c);
    Box2D.Collision.b2AABB.Free(c)
};
Box2D.Dynamics.b2World.prototype.RayCast = function (a, b, c)
{
    var d = this.m_contactManager.m_broadPhase, e = new Box2D.Collision.b2RayCastOutput, f = new Box2D.Collision.b2RayCastInput(b, c, 1);
    d.RayCast(function (d, f)
    {
        if (f.RayCast(e, d))
        {
            var i = 1 - e.fraction, i = Box2D.Common.Math.b2Vec2.Get(i * b.x + e.fraction * c.x, i * b.y + e.fraction * c.y), j = a(f, i, e.normal, e.fraction);
            Box2D.Common.Math.b2Vec2.Free(i);
            return j
        }
        return d.maxFraction
    }, f)
};
Box2D.Dynamics.b2World.prototype.RayCastOne = function (a, b)
{
    var c = null;
    this.RayCast(function (a, b, f, g)
    {
        c = a;
        return g
    }, a, b);
    return c
};
Box2D.Dynamics.b2World.prototype.RayCastAll = function (a, b)
{
    var c = [];
    this.RayCast(function (a)
    {
        c.push(a);
        return 1
    }, a, b);
    return c
};
Box2D.Dynamics.b2World.prototype.GetBodyList = function ()
{
    return this.bodyList
};
Box2D.Dynamics.b2World.prototype.GetJointList = function ()
{
    return this.m_jointList
};
Box2D.Dynamics.b2World.prototype.GetContactList = function ()
{
    return this.contactList
};
Box2D.Dynamics.b2World.prototype.IsLocked = function ()
{
    return this.m_isLocked
};
Box2D.Dynamics.b2World.prototype.Solve = function (a)
{
    for (var b = this.controllerList.GetFirstNode(); b; b = b.GetNextNode())
    {
        b.controller.Step(a)
    }
    b = this.island;
    b.Reset(this.m_contactManager.m_contactListener, this.m_contactSolver);
    for (var c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); c; c = c.GetNextNode())
    {
        c.body.m_islandFlag = !1
    }
    for (var d = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); d; d = d.GetNextNode())
    {
        d.contact.m_islandFlag = !1
    }
    for (c = this.m_jointList; c; c = c.m_next)
    {
        c.m_islandFlag = !1
    }
    for (c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies); c; c = c.GetNextNode())
    {
        if (d = c.body, !d.m_islandFlag)
        {
            b.Clear();
            var e = [];
            e.push(d);
            for (d.m_islandFlag = !0; 0 < e.length;)
            {
                var f = e.pop();
                b.AddBody(f);
                f.IsAwake() || f.SetAwake(!0);
                if (f.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody)
                {
                    for (d = f.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts); d; d = d.GetNextNode())
                    {
                        var g = d.contact;
                        g.m_islandFlag || (b.AddContact(g), g.m_islandFlag = !0, g = g.GetOther(f), g.m_islandFlag || (e.push(g), g.m_islandFlag = !0))
                    }
                    for (d = f.m_jointList; d; d = d.next)
                    {
                        !d.joint.m_islandFlag && d.other.IsActive() && (b.AddJoint(d.joint), d.joint.m_islandFlag = !0, d.other.m_islandFlag || (e.push(d.other), d.other.m_islandFlag = !0))
                    }
                }
            }

            b.Solve(a, this.m_gravity, this.m_allowSleep)
        }
    }
    for (c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies); c; c = c.GetNextNode())
    {
        c.body.SynchronizeFixtures()
    }
    this.m_contactManager.FindNewContacts()
};
Box2D.Dynamics.b2World.prototype.SolveTOI = function (a)
{
    var b = this.island;
    b.Reset(this.m_contactManager.m_contactListener, this.m_contactSolver);
    for (var c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); c; c = c.GetNextNode())
    {
        var d = c.body;
        d.m_islandFlag = !1;
        d.m_sweep.t0 = 0
    }
    for (var e = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); e; e = e.GetNextNode())
    {
        e.contact.m_islandFlag = !1, e.contact.m_toi = null
    }
    for (c = this.m_jointList; c; c = c.m_next)
    {
        c.m_islandFlag = !1
    }
    for (; ;)
    {
        var c = this._SolveTOI2(a), f = c.minContact, c = c.minTOI;
        if (null === f || Box2D.Dynamics.b2World.MAX_TOI < c)
        {
            break
        }
        e = f.m_fixtureA.GetBody();
        d = f.m_fixtureB.GetBody();
        Box2D.Dynamics.b2World.s_backupA.Set(e.m_sweep);
        Box2D.Dynamics.b2World.s_backupB.Set(d.m_sweep);
        e.Advance(c);
        d.Advance(c);
        f.Update(this.m_contactManager.m_contactListener);
        f.m_toi = null;
        if (f.IsSensor() || !f.IsEnabled())
        {
            e.m_sweep.Set(Box2D.Dynamics.b2World.s_backupA), d.m_sweep.Set(Box2D.Dynamics.b2World.s_backupB), e.SynchronizeTransform(), d.SynchronizeTransform()
        } else
        {
            if (f.IsTouching())
            {
                e.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody && (e = d);
                b.Clear();
                f = new goog.structs.Queue;
                f.enqueue(e);
                for (e.m_islandFlag = !0; 0 < f.size;)
                {
                    if (d = f.dequeue(), b.AddBody(d), d.IsAwake() || d.SetAwake(!0), d.GetType() == Box2D.Dynamics.b2BodyDef.b2_dynamicBody)
                    {
                        for (e = d.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts); e && b.m_contactCount != Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland; e = e.GetNextNode())
                        {
                            var g = e.contact;
                            g.m_islandFlag || (b.AddContact(g), g.m_islandFlag = !0, g = g.GetOther(d), g.m_islandFlag || (g.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody && (g.Advance(c), g.SetAwake(!0), f.enqueue(g)), g.m_islandFlag = !0))
                        }
                        for (d = d.m_jointList; d; d = d.next)
                        {
                            b.m_jointCount != Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland && (!d.joint.m_islandFlag && d.other.IsActive()) && (b.AddJoint(d.joint), d.joint.m_islandFlag = !0, d.other.m_islandFlag || (d.other.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody && (d.other.Advance(c), d.other.SetAwake(!0), f.enqueue(d.other)), d.other.m_islandFlag = !0))
                        }
                    }
                }
                this.islandTimeStep.Reset((1 - c) * a.dt, 0, a.velocityIterations, a.positionIterations, !1);
                b.SolveTOI(this.islandTimeStep);
                for (c = 0; c < b.m_bodies.length; c++)
                {
                    if (b.m_bodies[c].m_islandFlag = !1, b.m_bodies[c].IsAwake() && b.m_bodies[c].GetType() == Box2D.Dynamics.b2BodyDef.b2_dynamicBody)
                    {
                        b.m_bodies[c].SynchronizeFixtures();
                        for (e = b.m_bodies[c].contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); e; e = e.GetNextNode())
                        {
                            e.contact.m_toi = null
                        }
                    }
                }
                for (c = 0; c < b.m_contactCount; c++)
                {
                    b.m_contacts[c].m_islandFlag = !1, b.m_contacts[c].m_toi = null
                }
                for (c = 0; c < b.m_jointCount; c++)
                {
                    b.m_joints[c].m_islandFlag = !1
                }
                this.m_contactManager.FindNewContacts()
            }
        }
    }
};
Box2D.Dynamics.b2World.prototype._SolveTOI2 = function (a)
{
    for (var b = null, c = 1, d = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts); d; d = d.GetNextNode())
    {
        var e = d.contact;
        if (!this._SolveTOI2SkipContact(a, e))
        {
            var f = 1;
            if (null != e.m_toi)
            {
                f = e.m_toi
            } else
            {
                if (e.IsTouching())
                {
                    f = 1
                } else
                {
                    var f = e.m_fixtureA.GetBody(), g = e.m_fixtureB.GetBody(), h = f.m_sweep.t0;
                    f.m_sweep.t0 < g.m_sweep.t0 ? (h = g.m_sweep.t0, f.m_sweep.Advance(h)) : g.m_sweep.t0 < f.m_sweep.t0 && (h = f.m_sweep.t0, g.m_sweep.Advance(h));
                    f = e.ComputeTOI(f.m_sweep, g.m_sweep);
                    Box2D.Common.b2Settings.b2Assert(0 <= f && 1 >= f);
                    0 < f && 1 > f && (f = (1 - f) * h + f)
                }
                e.m_toi = f
            }
            Number.MIN_VALUE < f && f < c && (b = e, c = f)
        }
    }
    return{minContact:b, minTOI:c}
};
Box2D.Dynamics.b2World.prototype._SolveTOI2SkipContact = function (a, b)
{
    var c = b.m_fixtureA.GetBody(), d = b.m_fixtureB.GetBody();
    return(c.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || !c.IsAwake()) && (d.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || !d.IsAwake()) ? !0 : !1
};
Box2D.Dynamics.b2World.prototype.DrawJoint = function (a)
{
    if (a instanceof Box2D.Dynamics.Joints.b2DistanceJoint || a instanceof Box2D.Dynamics.Joints.b2MouseJoint)
    {
        var b = a.GetAnchorA(), c = a.GetAnchorB();
        this.m_debugDraw.DrawSegment(b, c, Box2D.Dynamics.b2World.s_jointColor);
        Box2D.Common.Math.b2Vec2.Free(b);
        Box2D.Common.Math.b2Vec2.Free(c)
    } else
    {
        if (a instanceof Box2D.Dynamics.Joints.b2PulleyJoint)
        {
            var b = a.GetAnchorA(), c = a.GetAnchorB(), d = a.GetGroundAnchorA(), a = a.GetGroundAnchorB();
            this.m_debugDraw.DrawSegment(d, b, Box2D.Dynamics.b2World.s_jointColor);
            this.m_debugDraw.DrawSegment(a, c, Box2D.Dynamics.b2World.s_jointColor);
            this.m_debugDraw.DrawSegment(d, a, Box2D.Dynamics.b2World.s_jointColor);
            Box2D.Common.Math.b2Vec2.Free(b);
            Box2D.Common.Math.b2Vec2.Free(c);
            Box2D.Common.Math.b2Vec2.Free(d);
            Box2D.Common.Math.b2Vec2.Free(a)
        } else
        {
            b = a.GetAnchorA(), c = a.GetAnchorB(), a.GetBodyA() != this.m_groundBody && this.m_debugDraw.DrawSegment(a.GetBodyA().m_xf.position, b, Box2D.Dynamics.b2World.s_jointColor), this.m_debugDraw.DrawSegment(b, c, Box2D.Dynamics.b2World.s_jointColor), a.GetBodyB() != this.m_groundBody && this.m_debugDraw.DrawSegment(a.GetBodyB().m_xf.position, c, Box2D.Dynamics.b2World.s_jointColor), Box2D.Common.Math.b2Vec2.Free(b), Box2D.Common.Math.b2Vec2.Free(c)
        }
    }
};
Box2D.Dynamics.b2World.prototype.DrawShape = function (a, b, c)
{
    if (a instanceof Box2D.Collision.Shapes.b2CircleShape)
    {
        var d = Box2D.Common.Math.b2Math.MulX(b, a.m_p);
        this.m_debugDraw.DrawSolidCircle(d, a.m_radius, b.R.col1, c);
        Box2D.Common.Math.b2Vec2.Free(d)
    } else
    {
        if (a instanceof Box2D.Collision.Shapes.b2PolygonShape)
        {
            for (var d = 0, e = a.GetVertexCount(), a = a.GetVertices(), f = [], d = 0; d < e; d++)
            {
                f[d] = Box2D.Common.Math.b2Math.MulX(b, a[d])
            }
            this.m_debugDraw.DrawSolidPolygon(f, e, c);
            for (d = 0; d < e; d++)
            {
                Box2D.Common.Math.b2Vec2.Free(f[d])
            }
        } else
        {
            a instanceof Box2D.Collision.Shapes.b2EdgeShape && (d = Box2D.Common.Math.b2Math.MulX(b, a.GetVertex1()), b = Box2D.Common.Math.b2Math.MulX(b, a.GetVertex2()), this.m_debugDraw.DrawSegment(d, b, c), Box2D.Common.Math.b2Vec2.Free(d), Box2D.Common.Math.b2Vec2.Free(b))
        }
    }
};
Box2D.Dynamics.b2World.s_xf = new Box2D.Common.Math.b2Transform;
Box2D.Dynamics.b2World.s_backupA = new Box2D.Common.Math.b2Sweep;
Box2D.Dynamics.b2World.s_backupB = new Box2D.Common.Math.b2Sweep;
Box2D.Dynamics.b2World.s_jointColor = new Box2D.Common.b2Color(0.5, 0.8, 0.8);
Box2D.Dynamics.b2World.s_color_inactive = new Box2D.Common.b2Color(0.5, 0.5, 0.3);
Box2D.Dynamics.b2World.s_color_static = new Box2D.Common.b2Color(0.3, 0.3, 0.3);
Box2D.Dynamics.b2World.s_color_kinematic = new Box2D.Common.b2Color(0.5, 0.5, 0.9);
Box2D.Dynamics.b2World.s_color_dynamic_sleeping = new Box2D.Common.b2Color(0.6, 0.6, 0.6);
Box2D.Dynamics.b2World.s_color_dynamic_awake = new Box2D.Common.b2Color(0.6, 0.9, 0.6);
Box2D.Dynamics.b2World.s_pairColor = new Box2D.Common.b2Color(0.3, 0.9, 0.9);
Box2D.Dynamics.b2World.s_aabbColor = new Box2D.Common.b2Color(0, 0, 0.8);
Box2D.generateCallback = function (a, b)
{
    return function ()
    {
        b.apply(a, arguments)
    }
};
Box2D.Dynamics.Controllers.b2TensorDampingController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.T = new Box2D.Common.Math.b2Mat22;
    this.maxTimestep = 0
};
goog.inherits(Box2D.Dynamics.Controllers.b2TensorDampingController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2TensorDampingController.prototype.SetAxisAligned = function (a, b)
{
    this.T.col1.x = -a;
    this.T.col1.y = 0;
    this.T.col2.x = 0;
    this.T.col2.y = -b;
    this.maxTimestep = 0 < a || 0 < b ? 1 / Math.max(a, b) : 0
};
Box2D.Dynamics.Controllers.b2TensorDampingController.prototype.Step = function (a)
{
    a = a.dt;
    if (!(a <= Number.MIN_VALUE))
    {
        a > this.maxTimestep && 0 < this.maxTimestep && (a = this.maxTimestep);
        for (var b = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); b; b = b.GetNextNode())
        {
            var c = b.body, d = c.GetLocalVector(c.GetLinearVelocity()), e = Box2D.Common.Math.b2Math.MulMV(this.T, d);
            Box2D.Common.Math.b2Vec2.Free(d);
            d = c.GetWorldVector(e);
            Box2D.Common.Math.b2Vec2.Free(e);
            e = Box2D.Common.Math.b2Vec2.Get(c.GetLinearVelocity().x + d.x * a, c.GetLinearVelocity().y + d.y * a);
            Box2D.Common.Math.b2Vec2.Free(d);
            c.SetLinearVelocity(e);
            Box2D.Common.Math.b2Vec2.Free(e)
        }
    }
};
Box2D.Collision.Shapes.b2EdgeChainDef = function ()
{

    this.vertexCount = 0;
    this.isALoop = !0;
    this.vertices = []
};
Box2D.Dynamics.Controllers.b2ConstantForceController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.F = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
goog.inherits(Box2D.Dynamics.Controllers.b2ConstantForceController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2ConstantForceController.prototype.Step = function ()
{
    for (var a = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); a; a = a.GetNextNode())
    {
        var b = a.body;
        b.ApplyForce(this.F, b.GetWorldCenter())
    }
};
Box2D.Dynamics.Joints.b2PulleyJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.groundAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.groundAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_pulleyJoint;
    this.groundAnchorA.Set(-1, 1);
    this.groundAnchorB.Set(1, 1);
    this.localAnchorA.Set(-1, 0);
    this.localAnchorB.Set(1, 0);
    this.maxLengthB = this.lengthB = this.maxLengthA = this.lengthA = 0;
    this.ratio = 1;
    this.collideConnected = !0
};
goog.inherits(Box2D.Dynamics.Joints.b2PulleyJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2PulleyJointDef.prototype.Initialize = function (a, b, c, d, e, f, g)
{
    void 0 === g && (g = 0);
    this.bodyA = a;
    this.bodyB = b;
    this.groundAnchorA.SetV(c);
    this.groundAnchorB.SetV(d);
    this.localAnchorA = this.bodyA.GetLocalPoint(e);
    this.localAnchorB = this.bodyB.GetLocalPoint(f);
    a = e.x - c.x;
    c = e.y - c.y;
    this.lengthA = Math.sqrt(a * a + c * c);
    c = f.x - d.x;
    d = f.y - d.y;
    this.lengthB = Math.sqrt(c * c + d * d);
    this.ratio = g;
    g = this.lengthA + this.ratio * this.lengthB;
    this.maxLengthA = g - this.ratio * Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength;
    this.maxLengthB = (g - Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength) / this.ratio
};
Box2D.Dynamics.Joints.b2PulleyJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2PulleyJoint(this)
};
