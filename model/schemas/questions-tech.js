const { Schema, model } = require("mongoose"); 

const questionSchema = new Schema(
  {
    question: String,
    questionId: Number,
    answers: Array,
    rightAnswer: String,
  },
  { versionKey: false, timestamps: true }
);

const QuestionSchema = model("qa-teches", questionSchema);
module.exports = QuestionSchema;
