
module.exports = new (function () {
	Object.assign(this, require("../utils/parse.arguments"));
	this.console = require("tracer").colorConsole();
	this.appid = "986146a7a343594be0e9aa78fcb5a8808cd3472c";

	// Put the env variables for production inside
	if (this.env == "prod") {
		this.appid = "";		// put production appid here
	}

	this.crypto = {
		gen: {
			salt: "general-random-salt",
			iterations: 10,
			keyLen: 80,
		}
	};

	this.limits = {
		tasks: 10,
	};

	this.urlMap = {
		token: "token",
	};

	this.getUrl = (urlMap, ...params) => {
		let apis = {
			token: this.sys.idService + "/verify",
		};
		return apis[urlMap];
	};

	this.allowedFields = ((type, data) => {
		let mapper = {
			task: ["date", "task", "status"],
		};
		return mapper[type];
	});

	this.requiredFields = ((type, data) => {
		let mapper = {
			task: ["date", "task", "status"],
		};
		return mapper[type];
	});
})();
