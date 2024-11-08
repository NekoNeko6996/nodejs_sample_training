const express = require("express");
const cors = require("cors");
const env = require("dotenv");

//

const file_router = require("./routers/file_router");
const grades_router = require("./routers/grades_router");

//
env.config();

// init
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// routers
app.use("/file", file_router);
app.use("", grades_router);

// listening on port 3000
app.listen(port, () => console.log(`[Server] App listening on port ${process.env.MAIN_PORT}, at http://localhost:${process.env.MAIN_PORT}!`));
