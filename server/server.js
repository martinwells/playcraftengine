//
// Playcraft Engine Simpler Server
// This is a simple example server to run games locally, it's not intended for production use
//

var requirejs = require('requirejs');
var express = require('express');
var app = express(2020);
var path = require('path');
var webRoot = path.resolve(process.env.PLAYCRAFT_WEBROOT || '.');
var playcraftHome = path.resolve(process.env.PLAYCRAFT_HOME || '..');

// Configuration
app.configure(function()
{
  app.use(express.logger());
  app.set('view engine', 'jade');
  app.set('view options', { doctype:'html', pretty:true, layout:false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  ['playcraftjs/lib', 'demos', 'projects'].forEach(function(p) {
    app.use('/'+p, express.static(path.resolve(playcraftHome+'/'+p)));
  });
  app.use(express.static(webRoot));

  // if you want to make your own projects appear using different directories, add a static line here, e.g.
  //app.use(express.static('/myprojects/mygame/'));

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
  app.set('views', webRoot);
  res.render('index.html');
});

/**
 * Note the trailing slash in the routes here. Without it the /js/demoname.js will be included in
 * the route wildcard, which will send over the index.html again (instead of the js)
 */
app.get('/demos/:demoName/', function (req, res)
{
    app.set('views', playcraftHome+'/demos/' + req.params.demoName);
    res.render('index.html');
});

app.get('/projects/:projectName/', function (req, res)
{
    app.set('views', playcraftHome+'/projects/' + req.params.projectName);
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
var port = 2020;
app.listen(port, function ()
{
  console.log("Playcraft Engine is running from "+webRoot+" with demos, projects, and lib in "+playcraftHome);
  console.log("Connect using http://localhost:"+port+" or http://127.0.0.1:"+port);
});



