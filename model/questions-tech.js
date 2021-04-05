const QuestionTechShema = require("./schemas/questions-tech");

// const { MongoClient } = require("mongodb");
// require("dotenv").config();
// const uriDb = process.env.URI_DB;
// const client = new MongoClient(uriDb, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
// }).connect();

const listQuestionsTech = async () => {
  const results = await QuestionTechShema.find({});
  return results;
};

module.exports = {
  listQuestionsTech,
};
