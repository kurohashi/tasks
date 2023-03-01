const fs = require("fs");
const dotenv = require("dotenv");
var env = require("../configs/env.conf.json");
let conf = {};
conf.env = "dev";
conf.cluster = "no";
conf.sys = env[conf.env];

for (var i = 2; i <= process.argv.length - 1; i++) {
	eval(process.argv[i], i);
}

function eval(arg, index) {
	// defaults

	// all the flags this server supports
	var check = {
		cluster: ["yes", "no"],
		env: ["prod", "stage", "dev"],
		view: ["yes", "no"]

	}
	switch (arg) {
		case "--cluster":
			// defaults to no cluster
			if (check.cluster.indexOf(process.argv[index + 1]) < 0) {
				console.error("ERROR : Bad argument for cluster")
				return process.exit(1);
			}
			else
				conf.cluster = process.argv[index + 1]
			break;
		case "--env":
			if (check.env.indexOf(process.argv[index + 1]) < 0) {
				console.error("ERROR : Bad argument for env")
				return process.exit(0);
			}
			else
				conf.env = process.argv[index + 1]
			conf.sys = env[conf.env];
			break;
		case "--view":
			if (check.view.indexOf(process.argv[index + 1]) < 0) {
				console.error("ERROR : Bad argument for view")
				return process.exit(1);
			}
			else
				conf.sys.hasViews = process.argv[index + 1]
			break;
		case "--help":
			console.log("Supported Flags");
			console.log("--cluster\t\t Supports 'yes' and 'no' to start the server with cluster option");
			console.log("--env\t\t Works for 3 environments prod, stage and dev");
			console.log("--view\t\t To set the server with HTML view options 'yes' and 'no'  are supported");
			console.log("put sys.env in root file for more sys options");
			return process.exit(0);
			break;
	}
}
try {
	Object.assign(conf.sys, dotenv.parse(fs.readFileSync('sys.env')));
} catch (error) { }
// conf.sys.host = conf.sys.host || "http://localhost:12200";
module.exports = conf;