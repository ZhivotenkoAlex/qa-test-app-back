const QuestionShema = require("./schemas/questions-tech");
// const db = require("./db");

const listQuestions = async () => {
  const results = await QuestionShema.find({});
  return results;
};
module.exports = {
  listQuestions,
};
