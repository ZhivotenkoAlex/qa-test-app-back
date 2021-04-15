// const QuestionTheoryShema = require("./schemas/questions-theory");

const { MongoClient } = require("mongodb");
require("dotenv").config();
const uriDb = process.env.URI_DB;

const listQuestionsTech = async () => {
  const client = await new MongoClient(uriDb, {
    useUnifiedTopology: true,
  }).connect();
  const results = await client.db().collection("qa-teches").find().toArray();
  return results;
};
module.exports = {
  listQuestionsTech,
};
