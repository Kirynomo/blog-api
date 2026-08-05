const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
PORT = 8080;

const userRouter = require("./routes/users");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/blogapi");
}

main()
  .then(() => console.log("mongoDB connected"))
  .catch((err) => console.log(err));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ msg: "hi gng" });
});

app.use("/", userRouter);

app.listen(PORT, () => {
  console.log(`server listening on port : ${PORT}`);
});
