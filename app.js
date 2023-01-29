const { ObjectID } = require("bson");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to the database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
  });
mongoose.set("strictQuery", true);
mongoose.set("strictQuery", true);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// Schema for User
const userSchema = new mongoose.Schema({
  user_name: String,
  user_image: Number,
  email: { type: String, unique: true },
  password: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});
const User = mongoose.model("user", userSchema);
const user1 = new User({
  user_name: "Robera",
  user_image: 2345,
  email: "robera@gmail.com",
  password: "123abc",
  posts: [ObjectID("63ccfbbe7e28f61ffe1f660d")],
});
// user1.save();

// Schema for Post
const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  date: { type: Date, default: Date.now },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const Post = mongoose.model("Post", postSchema);

const post1 = new Post({
  title: "This is the second title",
  body: "Hello world this the second post body of the body of the post",
  author: ObjectID("63ccfe0399c9cbaed8cfabca"),
  likes: 21,
  comments: [],
});
// post1.save();

// Schema for Comment
const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  content: String,
  likes: Number,
});
const Comment = mongoose.model("Comment", CommentSchema);

const JobSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  description: String,
  requirements: String,
  salary: Number,
  location: String,
  posted_date: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", JobSchema);
const job1 = new Job({
  title: "Web developer",
  description: "Junior web developer at sun tech",
  requirements: "CS degree",
  salary: 35621,
  location: "A.A",
});
// job1.save();

// Routes for Api

// get routes

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ message: "Hello" }));
});

app.get("/posts", async (req, res) => {
  // console.log(res);
  const post = await Post.find();
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(post));
});

app.get("/job", async (req, res) => {
  const comment = await Job.find();
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(comment));
});

app.get("/login", (req, res) => {
  const comment = User.find({ email: req.query.email }, (err, user) => {
    if (!err) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(user));
    } else {
      res.end(JSON.stringify(err));
    }
  });
});

app.get("/search-post", (req, res) => {
  Post.find(
    { title: _.upperFirst(_.lowerCase(req.query.title)) },
    (err, result) => {
      if (!err) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
      } else {
        res.end(JSON.stringify(err));
      }
    }
  );
});

app.get("/search-job", (req, res) => {
  Job.find(
    { title: _.upperFirst(_.lowerCase(req.query.title)) },
    (err, result) => {
      if (!err) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
      } else {
        res.end(JSON.stringify(err));
      }
    }
  );
});

// app.get("/profile", async (req, res) => {
//   const user = await User.find();
//   res.setHeader("Content-Type", "application/json");
//   res.end(JSON.stringify(user));
// });

app.get("/user_id", async (req, res) => {
  User.find(
    { _id: req.query.id },
    { _id: 0, user_name: 1 },
    (err, username) => {
      if (!err) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(username));
      }
    }
  );
});

// post routes

app.post("/posts", async (req, res) => {
  const newPost = new Post({
    title: _.upperFirst(_.lowerCase(req.body.title)),
    body: req.body.body,
    author: mongoose.Types.ObjectId(req.body.author),
  });
  newPost.save();
});

app.post("/like", (req, res) => {
  const updatedlike = Post.findOneAndUpdate(
    { _id: req.body._id },
    { $set: { likes: req.body.likes } },
    (err) => {}
  );
  res.redirect("/posts");
});

app.post("/job-post", (req, res) => {
  const newjobpost = new Job({
    author: req.body.poster_id,
    title: _.upperFirst(_.lowerCase(req.body.title)),
    description: req.body.description,
    requirements: req.body.requirements,
    salary: req.body.salary,
    location: req.body.location,
  });
  newjobpost.save();
});

app.post("/register", async (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!err) {
      if (!user) {
        const newUser = new User({
          user_name: req.body.user_name,
          user_image: 1,
          email: req.body.email,
          password: req.body.password,
        });
        newUser.save();
      } else {
        console.log("existes");
      }
    }
  });
});

// delete routes

app.delete("/delete/:id", (req, res) => {
  Post.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

app.delete("/delete-job/:job_id", (req, res) => {
  Job.deleteOne({ _id: req.params.job_id }, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("server started on port 4000");
});
