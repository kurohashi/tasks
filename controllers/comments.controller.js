'use strict';
var send = require("../configs/response.conf");
var conf = require("../configs/app.conf");
var lib = require("../utils/lib");
let console = conf.console;


module.exports = {
	create, read, update, remove,
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function create(req, res) {
	(async _ => {
		let user = await lib.getAuthDetails(req.headers.authorization);
		let data = await lib.filterData(req.body, "comment");
		if (!(await lib.validate(data, "comment")))
			return send.invalid(res, "invalid data");
		let sysData = {
			user: user.uid,
			startTime: Date.now(),
			id: lib.createId(null, 10),
			gid: req.headers.gid,
		};
		Object.assign(data, sysData);
		data.startTime = new Date(data.startTime);
		console.log("comment inserting", JSON.stringify(data));
		await conf.collections.comments.insertOne(data);
		return send.ok(res, data);
	})().catch(err => {
		console.error(err);
		send.serverError(res);
	});
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function read(req, res) {
	(async _ => {
		let gid = req.headers.gid;
		if (!gid)
			return send.invalid(res);
		let sort = { startTime: -1 };
		if (req.query.sort) {
			let dir = -1;
			if (req.query.dir == "asc")
				dir = 1;
			sort = { [req.query.sort]: dir };
		}
		delete req.query.sort;
		delete req.query.dir;
		let limits = conf.limits.comments;
		let skip = 0;
		if (!isNaN(req.query.limit)) {
			limits = Number(req.query.limit);
		}
		delete req.query.limit;
		if (!isNaN(req.query.skip)) {
			skip = Number(req.query.skip);
		}
		delete req.query.skip;
		let query = { gid: gid };
		if (req.query.search) {
			query.comment = new RegExp(req.query.search, "i");
			delete req.query.search;
		}
		Object.assign(query, req.query);

		console.log("GET comments", JSON.stringify(query));
		let comments = await conf.collections.comments.find(query).sort(sort).skip(skip).limit(limits).project({ _id: 0 }).toArray();
		return send.ok(res, comments);
	})().catch(err => {
		console.error(err);
		send.serverError(res);
	});
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function update(req, res) {
	(async _ => {
		let user = await lib.getAuthDetails(req.headers.authorization);
		let data = await lib.filterData(req.body, "comment");
		let query = { id: req.query.id };
		let oldComment = await conf.collections.comments.find(query).toArray();
		oldComment = oldComment[0];
		delete oldComment._id;
		if (!oldComment)
			return send.invalid(res, "invalid comment");
		if (oldComment.user != user.uid)
			return send.forbidden(res, "the user is forbidden to edit the comment");
		let sysData = {
			editTime: new Date(),
		};
		Object.assign(data, sysData);
		console.log("updating comment", query, JSON.stringify(data));
		await conf.collections.comments.updateOne(query, { $set: data });
		data.editTime = data.editTime.getTime();
		Object.assign(oldComment, data);
		return send.ok(res, oldComment);
	})().catch(err => {
		console.error(err);
		send.serverError(res);
	});
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function remove(req, res) {
	(async _ => {
		let user = await lib.getAuthDetails(req.headers.authorization);
		let query = { id: req.query.id };
		let oldComment = await conf.collections.comments.find(query).toArray();
		oldComment = oldComment[0];
		if (oldComment.user != user.uid)
			return send.forbidden(res, "the user is forbidden to delete the comment");
		await conf.collections.comments.deleteOne(query);
		return send.ok(res);
	})().catch(err => {
		console.error(err);
		send.serverError(res);
	});
}