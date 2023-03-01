var comments = require("../../../controllers/comments.controller")

// The route urls presented here are going to  
module.exports = function (app) {
	app.route("/comment")
		.get(comments.read)
		.post(comments.create)
		.put(comments.update)
		.delete(comments.remove);
}