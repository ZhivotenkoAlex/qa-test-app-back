const QuestionTechShema = require("./schemas/questions-tech");
const QuestionTheoryShema = require("./schemas/questions-theory");

const listQuestionsTech = async () => {
  const results = await QuestionTechShema.find({});
  return results;
};
const listQuestionsTheory = async () => {
  const results = await QuestionTheoryShema.find({});
  return results;
};

module.exports = {
  listQuestionsTech,
  listQuestionsTheory,
};
