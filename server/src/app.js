
var net = require("net");
var rest = require('restler');
var http = require('http');

// expressjs.com, a web framework
var express = require('express');


//
// SETTINGS
//

var MAX_USERS_BEFORE_REALLOCATE = 5000;

//
// UTILS
//

Array.prototype.remove = function(e)
{
    for (var i = 0; i < this.length; i++)
    {
        if (e == this[i])
        {
            return this.splice(i, 1);
        }
    }
};


//
// Logging stuff
//

var log = require('winston');
log.cli();
sep = ' > '; // separator string between names and events for logging

//
// socket.io -- real time communications for websocket connections
//
var io = require('socket.io');
var socket;

//
// Setup the express app server -- the web server component
//
var app = module.exports = express.createServer();

// Configuration
app.configure(function()
{
    app.use(express.logger());
//    app.set('views', '../demos');
    app.set("view options", {layout: false});
    app.register('.html', {
        compile: function(str, options)
        {
            return function(locals)
            {
                return str;
            };
        }
    });

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static('../../'));
});


app.configure('development', function()
{
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function()
{
    app.use(express.logger());
    app.use(express.errorHandler());
});

// Routes
app.get('/', function(req, res)
{
    res.render('index.html');
});

app.get('/demos/particles', function(req, res)
{
    app.set('views', '../../demos/particles');
    res.render('index.html');
});

app.get('/demos/asteroids', function (req, res)
{
    app.set('views', '../../demos/asteroids');
    res.render('index.html');
});


app.get('/demos/layering', function(req, res)
{
    app.set('views', '../../demos/layering');
    res.render('layering.html');
});


//////////////////////////////////////////////////////////////////////////////
//
// Fire it all up!
//
//////////////////////////////////////////////////////////////////////////////

log.info("Playcraft Engine is running");

// Start the app server
app.listen(2020);



