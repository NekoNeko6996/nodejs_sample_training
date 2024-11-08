const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");

// view file
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/view_all_file.html"));
});

router.get("/upload-file", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/upload_file.html"));
});

router.get("/img/view/all", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/views/view_all_img.html"));
});

// api upload file
router.post(`/api/v1/upload-file`, async (req, res) => {
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

    const filePath = path.join(__dirname, "../public/resources/img", newFileName);

    try {
      fs.renameSync(file.filepath, filePath);
      res.send(`
        File uploaded and saved successfully.<br>
        View at: <a target="_blank" href="http://localhost:3000/file/view/${newFileName}">${newFileName}</a>
      `);
    } catch (err) {
      console.error("Error saving file:", err);
      res.status(500).send("File upload failed");
    }
  });
});

router.get(`/view/:file`, async (req, res) => {
  const file = req.params.file;
  const filePath = path.join(__dirname, "../public/resources/img", file);
  res.status(200).sendFile(filePath);
});

router.get(`/get/all/img`, (req, res) => {
  const folder = path.join(__dirname, "../public/resources/img");

  fs.readdir(folder, (err, files) => {
    if (err) {
      console.error("Error reading folder:", err);
      return res.status(500).send("Internal Server Error");
    }

    const imgLink = [];

    for (let fileName of files) {
      const filePath = path.join(folder, fileName);
      const stats = fs.statSync(filePath);

      imgLink.push({
        url: `http://localhost:3000/file/view/${fileName}`,
        name: fileName,
        type: "img",
        fileSize: stats.size,
        imgSize: null,
        date: stats.mtime,
      });
    }

    res.status(200).send(imgLink);
  });
});

router.delete("/api/v1/delete-file", (req, res) => {
  const { file } = req.body;
  const filePath = path.join(__dirname, "../public/resources/img", file);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).send({
        status: "error",
        message: "File deletion failed",
      });
    }
    res.status(200).send({
      status: "success",
      message: "File deleted successfully",
    });
  });
});
module.exports = router;