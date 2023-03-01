var mongo = require('mongodb').MongoClient;
var conf = require('../configs/app.conf');
let console = conf.console;
const server = 'localhost:27017'; 
const database = 'kaliper_annotations';
class Database {
  constructor() {
    this._connect().then(_ => console.log("database connected")).catch(err => console.log("Database connection error", err));
  }
  async _connect() {
    let d = await mongo.connect(`mongodb://${server}/${database}`);
    let db = d.db();
    conf.db = db;

    let comments = db.collection("comments");
    await comments.createIndexes([{
      key: { id: 1 },
      unique: true,
    }, {
      key: { parentId: 1, parentType: 1, section: 1, key: 1 },
    }, {
      key: { comment: "text" },
    }, {
      key: { gid: 1, user: 1 },
    }, {
      key: { startTime: -1 },
    }, {
      key: { editTime: -1 },
    }]);

    conf.collections = {
      comments: comments,
    };
  }
}
module.exports = new Database()