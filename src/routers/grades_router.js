const express = require("express");
const router = express.Router();
const fs = require("fs");
const { ObjectId } = require("mongodb");
const path = require("path");
const env = require("dotenv");
const Grade = require("../schema/Grades");
const mongoose = require("../mongoose_db");

//
env.config()

//
router.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/views/view_all_student_score.html"))
);

router.get(`${process.env.BASE_API_PATH}/get/grades`, async (req, res) => {
  const limit = req.query.limit || 20;
  const page = req.query.page || 1;

  const grades = await Grade.find()
    .skip((page - 1) * limit)
    .limit(limit);
  const gradesCount = await Grade.countDocuments();

  res.send({
    status: "success",
    data: grades,
    count: gradesCount,
    page,
  });
});

router.get(`/view/grade/:id`, async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const grade = await Grade.findById(new ObjectId(id));
    if (!grade) {
      return res.status(404).send("Grade not found");
    }

    fs.readFile(
      path.join(__dirname, "../public/views/view_student_score.html"),
      "utf8",
      (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }

        const id = grade._id.toString();
        const studentId = grade.student_id.toString();
        const classId = grade.class_id;

        const modifiedData = data
          .replace("{{_id}}", id || "")
          .replace("{{student_id}}", studentId || "")
          .replace("{{class_id}}", classId || "")
          .replace("{{exam}}", grade.scores[0].score || "")
          .replace("{{quiz}}", grade.scores[1].score || "")
          .replace("{{homework_1}}", grade.scores[2].score || "")
          .replace("{{homework_2}}", grade.scores[3].score || "");

        res.status(200).send(modifiedData);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get(`/add/grade`, async (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/new_student_score.html"));
});

router.get(`/edit/grade/:id`, async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const grade = await Grade.findById(new ObjectId(id));
    if (!grade) {
      return res.status(404).send("Grade not found");
    }

    fs.readFile(
      path.join(__dirname, "../public/views/edit_student_score.html"),
      "utf8",
      (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }

        const id = grade._id.toString();
        const studentId = grade.student_id.toString();
        const classId = grade.class_id;
        const exam = grade.scores[0].score;
        const quiz = grade.scores[1].score;
        const homework_1 = grade.scores[2].score;
        const homework_2 = grade.scores[3].score;

        const modifiedData = data
          .replace("{{_id}}", id || "")
          .replace("{{student_id}}", studentId || "")
          .replace("{{class_id}}", classId || "")
          .replace("{{exam}}", exam || "")
          .replace("{{quiz}}", quiz || "")
          .replace("{{homework_1}}", homework_1 || "")
          .replace("{{homework_2}}", homework_2 || "");

        res.status(200).send(modifiedData);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.put(`${process.env.BASE_API_PATH}/edit/score`, async (req, res) => {
  try {
    const { _id, student_id, class_id, exam, quiz, homework_1, homework_2 } =
      await req.body;

    console.log(req.body);

    if (!ObjectId.isValid(_id)) {
      return res.status(400).send({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      new ObjectId(_id),
      {
        student_id,
        class_id,
        scores: [
          {
            score: exam,
            score_name: "exam",
          },
          {
            score: quiz,
            score_name: "quiz",
          },
          {
            score: homework_1,
            score_name: "homework_1",
          },
          {
            score: homework_2,
            score_name: "homework_2",
          },
        ],
      },
      { new: true }
    );

    if (!updatedGrade) {
      return res
        .status(404)
        .send({ status: "error", message: "Grade not found" });
    }

    res.status(200).send({
      status: "success",
      message: "Grade updated successfully",
    });
  } catch (error) {
    console.error("Caught error:", error);
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});

router.post(`${process.env.BASE_API_PATH}/add/grade`, async (req, res) => {
  try {
    const { student_id, class_id, exam, quiz, homework_1, homework_2 } =
      req.body;
    const newGrade = new Grade({
      student_id,
      class_id,
      scores: [
        {
          score: exam,
          type: "exam",
        },
        {
          score: quiz,
          type: "quiz",
        },
        {
          score: homework_1,
          type: "homework",
        },
        {
          score: homework_2,
          type: "homework",
        },
      ],
    });

    await newGrade.save();
    res.status(200).send({
      status: "success",
      message: "Grade added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", message: "Internal Server Error" });
  }
});

router.delete(
  `${process.env.BASE_API_PATH}/delete/grade/:id`,
  async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID format");
    }

    try {
      const grade = await Grade.findByIdAndDelete(new ObjectId(id));
      if (!grade) {
        return res.status(404).send("Grade not found");
      }
      res.status(200).send("Grade deleted successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;