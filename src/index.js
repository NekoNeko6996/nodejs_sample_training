const express = require("express");
const cors = require("cors");
const fs = require("fs");
const mongoose = require("mongoose");
const formidable = require("formidable");
const { ObjectId } = require("mongodb");
const path = require("path");
const env = require("dotenv");

//
const Grade = require("./schema/Grades");
const { dir } = require("console");

const app = express();
env.config();

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("[Mongo] Connected to MongoDB"))
  .catch((err) => console.error(err));

// set port
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// routes
app.get("/", (req, res) =>
  res.sendFile(__dirname + "/public/views/view_all_student_score.html")
);

app.get(`${process.env.BASE_API_PATH}/get/grades`, async (req, res) => {
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

app.get(`/view/grade/:id`, async (req, res) => {
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
      `${__dirname}/public/views/view_student_score.html`,
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

app.get(`/add/grade`, async (req, res) => {
  res.sendFile(__dirname + "/public/views/new_student_score.html");
});

app.get(`/edit/grade/:id`, async (req, res) => {
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
      `${__dirname}/public/views/edit_student_score.html`,
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

app.put(`${process.env.BASE_API_PATH}/edit/score`, async (req, res) => {
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

app.post(`${process.env.BASE_API_PATH}/add/grade`, async (req, res) => {
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

app.delete(
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

app.get(`/upload-file`, async (req, res) => {
  res.sendFile(__dirname + "/public/views/upload_file.html");
});

app.post("/api/v1/upload-file", async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }

    console.log("Uploaded file:", files.uploadedFile);
    const file = files.uploadedFile[0];

    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalFilename);
    const newFileName = `file_${timestamp}${fileExtension}`;

    const filePath = path.join(__dirname, "public/resources", newFileName);

    try {
      fs.renameSync(file.filepath, filePath);
      res.send(`
        File uploaded and saved successfully.<br>
        View at: <a href="http://localhost:3000/view/file/${newFileName}">http://localhost:3000/view/file/${newFileName}</a>
      `);
    } catch (err) {
      console.error("Error saving file:", err);
      res.status(500).send("File upload failed");
    }
  });
});

app.get(`/view/file/:file`, async (req, res) => {
  const file = req.params.file;
  const filePath = path.join(__dirname, "public/resources", file);
  console.log("File path:", filePath);
  res.status(200).sendFile(filePath);
});

// listening on port 3000
app.listen(port, () => console.log(`[Server] App listening on port ${port}!`));
