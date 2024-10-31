const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  student_id: { type: Number, required: true },
  scores: [
    {
      type: {
        type: String,
        required: true,
        enum: ["exam", "quiz", "homework"],
      },
      score: { type: Number, required: true },
    },
  ],
  class_id: { type: Number, required: true },
});

const Grade = mongoose.model("grades", gradeSchema);
module.exports = Grade;
