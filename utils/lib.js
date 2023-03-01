
var crypto = require("crypto");
var send = require("../configs/response.conf");
var conf = require("../configs/app.conf");
var moment = require("moment-timezone");
var request = require("request");
let console = conf.console;

module.exports = {
	createId, authFailed, preupdate, ISODate, regex, createHash,
	getAuthDetails, validate, filterData, apiReq,
}

/**
 * 
 * @param {*} conf 
 */
async function apiReq(conf) {
	return new Promise(function (resolve, reject) {
		request(conf, function (err, resp, body) {
			if (err)
				return reject(err);
			try {
				body = JSON.parse(body);
			} catch (error) { }
			resolve(body || {});
		});
	});
}

function regex(val, type) {
	return new RegExp(val, type);
}

function ISODate(val) {
	return new Date(val);
}

function preupdate(req, res, next) {
	req.body.updateTS = moment().unix();
	// if some logging has to be done.. it can be added here...
	next();
}

/**
 *  General response for failing Autharization. It can fail for various reasons. 
 * 		- 	forbidden actions (user control)
 * 		-	invalid token or credentials
 * 		-	Payment required (premium features)
 * @param {*} req 
 * @param {*} res 
 */
function authFailed(err, req, res, next) {
	console.error("Forbidden", err);
	if (err == 426)
		return send.upgrade(res);
	if (err == 401)
		return send.unauthorized(res);
	send.forbidden(res);
}

/**
 * 
 * @param {*} type  : Base64 or Hex type
 * @param {*} len 	: length of the id
 */
function createId(type, len) {
	const supported_types = ["hex", "base64"];
	var foo = "";
	if (supported_types.indexOf(type) < 0)
		foo = "hex";
	else
		foo = type;
	if (!len)
		len = 20;

	return crypto.randomBytes(Math.ceil(len))
		.toString(foo) // convert to given format
		.slice(0, len);
}

/**
 * Create hash from given fields in an array
 * @param {*} key : key string to be created hash for
 * @param {*} type? : (optional) type of hash
 */
function createHash(key, type) {
	type = type || "gen";
	return Buffer.from(crypto.pbkdf2Sync(key, conf.crypto[type].salt, conf.crypto[type].iterations, conf.crypto[type].keyLen, "SHA256"), 'binary').toString('base64');
}

/**
 * Get auth token details from id_service
 * @param {*} token 
 */
async function getAuthDetails(token) {
	let resp = await apiReq({
		url: conf.getUrl(conf.urlMap.token),
		method: "GET",
		headers: { token: token }
	});
	console.log("Auth details", JSON.stringify(resp));
	if (resp.statusCode != 200)
		return false;
	return true;
}

/**
 * Filter data based on type
 * @param {*} data 
 * @param {*} type 
 */
async function filterData(data, type) {
	let result = {};
	let allowedFields = conf.allowedFields(type, data) || [];
	allowedFields.forEach(fld => {
		if (fld in data)
			result[fld] = data[fld];
	});
	return result;
}

/**
 * Validate the data based on the type
 * @param {*} data 
 * @param {*} type 
 */
async function validate(data, type) {
	let requiredFields = conf.requiredFields(type, data) || [];
	for (let i of requiredFields) {
		if (!data.hasOwnProperty(i))
			return false;
	}
	return true;
}