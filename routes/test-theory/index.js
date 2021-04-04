const express = require("express");
const router = express.Router();
const { listQuestionsTheory } = require("../../model/questions");

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

router.get("/", async (_req, res, next) => {
  try {
    const list = await listQuestionsTheory();
    const arrInt = [];
    const newList = [];
    while (arrInt.length < 12) {
      const idQa = getRandomIntInclusive(1, list.length);
      if (!arrInt.includes(idQa)) {
        arrInt.push(idQa);
        newList.push(list.find(({ questionId }) => questionId === idQa));
      }
    }
    console.log(arrInt);
    console.log(newList.length);
    res.json({
      status: "success",
      code: 200,
      data: newList,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let rightAnswer = 0;
    const list = await listQuestionsTheory();
    const answers = req.body;
    // eslint-disable-next-line array-callback-return
    answers.map((objAns) => {
      if (
        list.some(
          (objList) =>
            objAns.questionId === objList.questionId &&
            objAns.currentAnswer === objList.rightAnswer
        )
      ) {
        rightAnswer++;
      }
    });
    res.json({
      status: "success",
      code: 201,
      data: { rightAnswer },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
