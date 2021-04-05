// const QuestionTheoryShema = require("./schemas/questions-theory");

const { MongoClient } = require("mongodb");
require("dotenv").config();
const uriDb = process.env.URI_DB;

const listQuestionsTheory = async () => {
  const client = await new MongoClient(uriDb, {
    useUnifiedTopology: true,
  }).connect();
  const results = await client.db().collection("qa-theory").find().toArray();
  console.log(results);
  return results;
};
module.exports = {
  listQuestionsTheory,
};
