
var cluster = require("cluster");
var worker = require("./worker");
var database = require("./configs/database");
var conf = require("./configs/app.conf");
let console = conf.console;

global.__base = __dirname + '/';
// console = conf.console;

module.exports.close = function(){
        console.log(">>>>>> here...");
        worker.close()
};

if(conf.cluster != "yes")
{
        console.log("this should show something");
        worker.init();
        return;
}
if(cluster.isMaster){
	var cpus = require("os").cpus().length;

        for(var i=0; i<  cpus; i++)
                cluster.fork();

       
        cluster.on( 'exit', function( worker, code, signal ) {
                console.log( 'worker ' + worker.process.pid + ' died.' );
                cluster.fork();
        });
}
else{
	worker.init();
}

