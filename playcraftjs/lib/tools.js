/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 *
 * xmlToJSON function:
 * This work is licensed under Creative Commons GNU LGPL License.
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * Version: 0.9
 * Author:  Stefan Goessner/2006
 * Web:     http://goessner.net/
 */

/**
 * @class pc.Tools
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A collection of useful tools. This is a static class, so you can just call methods directly, i.e.
 * <p><pre><code>
 * var cleanValue = pc.Tools.checked(value, 'default');
 * </code></pre>
 * There are shortcuts for the following common tools functions to make like a little easier:
 * <p><pre><code>
 * pc.valid = pc.Tools.isValid;
 * pc.checked = pc.Tools.checked;
 * pc.assert = pc.Tools.assert;
 * </code></pre>
 */
pc.Tools = pc.Base.extend('pc.Tools',
    /** @lends pc.Tools */
    {
        /**
         * Checks if a param is valid (null or undefined) in which case the default value will be returned
         * @param {*} p Parameter to check
         * @param {*} def Default value to return if p is either null or undefined
         * @return {*} p if valid, otherwise def (default)
         */
        checked:function (p, def)
        {
            if (!pc.valid(p))
                return def;
            return p;
        },

        /**
         * Check if a value is valid (not null or undefined)
         * @param {*} p A value
         * @return {Boolean} true if the value is not undefined and not null
         */
        isValid:function (p)
        {
            return !(p == null || typeof p === 'undefined');
        },

        /**
         * Tests a boolean evaluation and throws an exception with the error string.
         * @param {Boolean} test A boolean result test
         * @param {String} error A string to throw with the exception
         */
        assert:function (test, error)
        {
            if (!test) throw error;
        },

        /**
         * Removes an element from an array
         * @param {Array} array The array to remove the element from
         * @param {*} e The element to remove
         */
        arrayRemove:function (array, e)
        {

            //for (var i = 0; i < array.length; i++)
            for (var i = array.length - 1; i >= 0; i--)
            {
                if (array[i] == e)
                    array.splice(i, 1);
            }
        },

        /**
         * Adds an element to an array, but only if it isn't already there
         * @param array the array to add to
         * @param e the element to add
         */
        arrayExclusiveAdd:function (array, e)
        {
            if (array.indexOf(e) == -1)
                array.push(e);
        },

        /**
         * Convers XML to a json string
         * @param {String} xml XML source data as a string
         * @param {String} tab String to use for tabulation
         * @return {String} JSON string form of the XML
         */
        xmlToJson:function (xml, tab)
        {
            var X = {
                toObj:function (xml)
                {
                    var o = {};
                    if (xml.nodeType == 1)
                    {   // element node ..
                        if (xml.attributes.length)   // element with attributes  ..
                            for (var i = 0; i < xml.attributes.length; i++)
                                o[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                        if (xml.firstChild)
                        { // element has child nodes ..
                            var textChild = 0, cdataChild = 0, hasElementChild = false;
                            for (var n = xml.firstChild; n; n = n.nextSibling)
                            {
                                if (n.nodeType == 1) hasElementChild = true;
                                else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                                else if (n.nodeType == 4) cdataChild++; // cdata section node
                            }
                            if (hasElementChild)
                            {
                                if (textChild < 2 && cdataChild < 2)
                                { // structured element with evtl. a single text or/and cdata node ..
                                    X.removeWhite(xml);
                                    for (var n = xml.firstChild; n; n = n.nextSibling)
                                    {
                                        if (n.nodeType == 3)  // text node
                                            o["#text"] = X.escape(n.nodeValue);
                                        else if (n.nodeType == 4)  // cdata node
                                            o["#cdata"] = X.escape(n.nodeValue);
                                        else if (o[n.nodeName])
                                        {  // multiple occurence of element ..
                                            if (o[n.nodeName] instanceof Array)
                                                o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                            else
                                                o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                        }
                                        else  // first occurence of element..
                                            o[n.nodeName] = X.toObj(n);
                                    }
                                }
                                else
                                { // mixed content
                                    if (!xml.attributes.length)
                                        o = X.escape(X.innerXml(xml));
                                    else
                                        o["#text"] = X.escape(X.innerXml(xml));
                                }
                            }
                            else if (textChild)
                            { // pure text
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                            else if (cdataChild)
                            { // cdata
                                if (cdataChild > 1)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    for (var n = xml.firstChild; n; n = n.nextSibling)
                                        o["#cdata"] = X.escape(n.nodeValue);
                            }
                        }
                        if (!xml.attributes.length && !xml.firstChild) o = null;
                    }
                    else if (xml.nodeType == 9)
                    { // document.node
                        o = X.toObj(xml.documentElement);
                    }
                    else
                        alert("unhandled node type: " + xml.nodeType);
                    return o;
                },
                toJson:function (o, name, ind)
                {
                    var json = name ? ("\"" + name + "\"") : "";
                    if (o instanceof Array)
                    {
                        for (var i = 0, n = o.length; i < n; i++)
                            o[i] = X.toJson(o[i], "", ind + "\t");
                        json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                    }
                    else if (o == null)
                        json += (name && ":") + "null";
                    else if (typeof(o) == "object")
                    {
                        var arr = [];
                        for (var m in o)
                            arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                        json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                    }
                    else if (typeof(o) == "string")
                        json += (name && ":") + "\"" + o.toString() + "\"";
                    else
                        json += (name && ":") + o.toString();
                    return json;
                },
                innerXml:function (node)
                {
                    var s = ""
                    if ("innerHTML" in node)
                        s = node.innerHTML;
                    else
                    {
                        var asXml = function (n)
                        {
                            var s = "";
                            if (n.nodeType == 1)
                            {
                                s += "<" + n.nodeName;
                                for (var i = 0; i < n.attributes.length; i++)
                                    s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                                if (n.firstChild)
                                {
                                    s += ">";
                                    for (var c = n.firstChild; c; c = c.nextSibling)
                                        s += asXml(c);
                                    s += "</" + n.nodeName + ">";
                                }
                                else
                                    s += "/>";
                            }
                            else if (n.nodeType == 3)
                                s += n.nodeValue;
                            else if (n.nodeType == 4)
                                s += "<![CDATA[" + n.nodeValue + "]]>";
                            return s;
                        };
                        for (var c = node.firstChild; c; c = c.nextSibling)
                            s += asXml(c);
                    }
                    return s;
                },
                escape:function (txt)
                {
                    return txt.replace(/[\\]/g, "\\\\")
                        .replace(/[\"]/g, '\\"')
                        .replace(/[\n]/g, '\\n')
                        .replace(/[\r]/g, '\\r');
                },
                removeWhite:function (e)
                {
                    e.normalize();
                    for (var n = e.firstChild; n;)
                    {
                        if (n.nodeType == 3)
                        {  // text node
                            if (!n.nodeValue.match(/[^ \f\n\r\t\v]/))
                            { // pure whitespace text node
                                var nxt = n.nextSibling;
                                e.removeChild(n);
                                n = nxt;
                            }
                            else
                                n = n.nextSibling;
                        }
                        else if (n.nodeType == 1)
                        {  // element node
                            X.removeWhite(n);
                            n = n.nextSibling;
                        }
                        else                      // any other node
                            n = n.nextSibling;
                    }
                    return e;
                }
            };
            if (xml.nodeType == 9) // document node
                xml = xml.documentElement;
            var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
            return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
        }
    },
    {
        // Static class, so nothing required here
    }
)
;


pc.tools = new pc.Tools();

// quick short cuts for common tools
pc.valid = pc.Tools.isValid;
pc.checked = pc.Tools.checked;
pc.assert = pc.Tools.assert;


/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/




pc.Base64 = pc.Base.extend('pc.Base64',
    {
        // private property
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = pc.Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode : function (input) {
            var output = [];
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output.push(String.fromCharCode(chr1));

                if (enc3 != 64) {
                    output.push(String.fromCharCode(chr2));
                }
                if (enc4 != 64) {
                    output.push(String.fromCharCode(chr3));
                }

            }

            return output.join('');

        },

        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode : function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    },
    {});

// fix for browsers that don't natively support atob or btoa (ie. IE)
if (!window.btoa) window.btoa = pc.Base64.encode
if (!window.atob) window.atob = pc.Base64.decode