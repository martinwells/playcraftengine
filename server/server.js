
var express = require('express');
var app = express(2020);
var watch = require('watch');

// Configuration
app.configure(function()
{
    app.use(express.logger());
    app.set('view engine', 'jade');
    app.set('view options', { doctype:'html', pretty:true, layout:false });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static('../'));
    app.use(express.static('static'));
    app.engine('html', require('ejs').renderFile);

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
    app.set('views', './');
    res.render('index.html');
});

/**
 * Note the trailing slash in the routes here. Without it the /js/demoname.js will be included in
 * the route wildcard, which will send over the index.html again (instead of the js)
 */
app.get('/demos/:demoName/', function (req, res)
{
    app.set('views', '../demos/' + req.params.demoName);
    res.render('index.html');
});

app.get('/projects/:projectName/', function (req, res)
{
    app.set('views', '../projects/' + req.params.projectName);
    res.render('index.html');
});


// -- file watcher for the monitor system, not yet implemented fully
/*
watch.createMonitor('../', function (monitor)
{
//    monitor.files['../../'];
    monitor.on("created", function (f, stat)
    {
        // Handle file changes
        console.log('created '+f);
    });
    monitor.on("changed", function (f, curr, prev)
    {
        // Handle new files
        console.log('changed ' + f);
    });
    monitor.on("removed", function (f, stat)
    {
        // Handle removed files
        console.log('removed ' + f);
    });
});
*/

//////////////////////////////////////////////////////////////////////////////
//
// Fire it all up!
//
//////////////////////////////////////////////////////////////////////////////


// Start the app server
app.listen(2020, function ()
{
    console.log("Playcraft Engine is running");
    console.log("Connect using http://localhost:2020");
});



