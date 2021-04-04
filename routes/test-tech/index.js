const express = require("express");
const router = express.Router();
const { listCash } = require("../../model/questions-tech");

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Включаючи мінімум та максимум
};

router.get("/", async (_req, res, next) => {
  try {
    const list = await listCash();
    const arrInt = [];
    const newList = [];
    while (arrInt.length < 12) {
      let idQa = getRandomIntInclusive(1, list.length);
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
    const list = await listCash();
    const answers = req.body;
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