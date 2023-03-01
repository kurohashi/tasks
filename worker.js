// worker Node instance


var app = require("express")();
var conf = require("./configs/app.conf");
var bodyParser = require("body-parser");
var send = require("./configs/response.conf");
var auth = require("./utils/auth");
var utils = require("./utils/lib");
let console = conf.console;
module.exports ={
	init : init,
	close : close
}

function close(){
	console.log("here....");
	if(conf.server)
		conf.server.close();
}
// init();

function init(){
	app.set('conf', conf);
	app.engine('html',require('ejs').renderFile);
	app.use('/assets', require("express").static(__dirname+'/views/assets'));
	app.use(bodyParser.json()); //supprts JSON encoded bodies
	app.use(bodyParser.text()); //for navigator.sendBeacon api call 
	app.use(bodyParser.urlencoded({extended: true})); //supports URL encoded bodies
	app.use(require("cookie-parser")());
	app.use(require('helmet')());
	app.use(require("hpp")());
	// check the necessary conf
	if(!(conf.sys.versions || conf.sys.hasViews || conf.sys.port))
	{
		console.log("Missing mandatory config Variable. Please goto configs/env.conf.json and set versions, hasViews and port");
		return ;
	}

	for(var i in conf.sys.versions)
	{
		app.use("/apis/"+conf.sys.versions[i], auth.isAuthenticated, require("./routes/auth."+conf.sys.versions[i]), utils.authFailed);
		app.use("/apis/open/"+conf.sys.versions[i], require("./routes/open."+conf.sys.versions[i]));
	}
	

	// if there are views involved	
	if(conf.sys.hasViews == "yes")
	{
		app.set('views', __dirname+'/html/views');
		// all APIs or routes that render FE
		app.use("/", require("./html/"))
	}

	app.use(function(req,res){
		console.log("Unimplemented API called", req.url);
		send.notImplemented(res);
	})

	conf.server = app.listen(conf.sys.port, function(){
		console.log(conf.sys);
		console.log("App listening on port "+conf.sys.port);
	});

	process.on('uncaughtException',function(err){
		console.log("uncaughtException ",err);
	});
}