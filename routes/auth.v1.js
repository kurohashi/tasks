var express = require('express');
var router = express.Router();
var consign = require('consign');

// get all routes inside the api directory and attach them to the api router
// all of these routes should be behind authorization
consign({ cwd:"routes", extensions: [ '.js' ]})
  .include('v1/auth')
  .into(router);
module.exports = router;

