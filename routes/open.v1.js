var express = require('express');
var router = express.Router();
var consign = require('consign');

consign({ cwd:"routes", extensions: [ '.js' ]})
  .include('v1/open')
  .into(router);
module.exports = router;

