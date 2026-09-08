const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongoSanitize = require("./middlewares/mongoSanitize");
PORT = 8080;

const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const commentRouter = require("./routes/comments");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/blogapi");
}

main()
  .then(() => console.log("mongoDB connected"))
  .catch((err) => console.log(err));

app.use(mongoSanitize);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(limiter);

app.get("/", (req, res) => {
  res.json({ msg: "hi gng" });
});

app.use("/", userRouter);
app.use("/", postRouter);
app.use("/", commentRouter);

app.listen(PORT, () => {
  console.log(`server listening on port : ${PORT}`);
});
