let conf = require("../configs/app.conf");
let send = require("../configs/response.conf");
let console = conf.console;

exports.isAuthenticated = function(req, res, cb){
	console.log(JSON.stringify(req.query), JSON.stringify(req.body));
	cb(null, req);
}