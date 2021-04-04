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

const QuestionTheorySchema = model("qa-theory", questionSchema);
module.exports = QuestionTheorySchema;
