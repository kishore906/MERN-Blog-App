require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

const User = require("./models/userModel");
const Post = require("./models/blogPostModel");

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Database Connected..");
    app.listen(process.env.PORT, () => {
      console.log("Listening to port", process.env.PORT);
    });
  })
  .catch((err) => console.log(err));

// register route
app.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res
        .status(400)
        .json({ error: "Email already exists Please choose another email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPswd = await bcrypt.hash(password, salt);
    const user = await User.create({ fullname, email, password: hashPswd });
    res.status(200).json({ msg: "Registration Successful Please login.." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Invalid EmailId" });
    }

    const pswdMatch = await bcrypt.compare(password, user.password);

    if (!pswdMatch) {
      return res.status(400).json({ error: "Invalid Password" });
    }

    // token generation
    jwt.sign(
      { email, id: user._id },
      process.env.SECRET,
      {
        //expiresIn: "15s",
      },
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, {
            //httpOnly: true,
            //secure: true,
            //maxAge: 1000000,
            //signed: true
          })
          .json({ id: user._id, email });
      }
    );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// route to get profile
app.get("/profile", (req, res) => {
  const { token } = req.cookies; // const token = req.cookies.token;
  try {
    jwt.verify(token, process.env.SECRET, {}, (err, userInfo) => {
      if (err) throw err;
      res.status(200).json(userInfo);
    });
  } catch (err) {
    if (err.message === "jwt expired") {
      res.clearCookie("token");
      return res.status(401).json({ error: "token expired" });
    }
    res.status(400).json({ error: err.message });
  }
});

// route for creating a new blog post
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { token } = req.cookies;

  try {
    const user = jwt.verify(token, process.env.SECRET, {}, (err, info) => {
      if (err) {
        return "jwt expired";
      }
      return info;
    });

    if (user === "jwt expired") {
      res.clearCookie("token");
      return res.status(401).json({ error: "token expired" });
    } else {
      // res.json({files: req.file}) // here we will get the complete file details we uploaded as object
      const { originalname, path } = req.file; // orginalname will be: filename.type -> flower.jpg, path will be: "uploads/filename"(without type extension)
      const parts = originalname.split("."); // here we splitting the originalname to get file extension type (.jpg, .png, .webp etc)
      const ext = parts[parts.length - 1]; // accessing last element in the array which will be the file type
      const newPath = path + "." + ext; // here we are attaching the file type to the path like this -> "uploads/filename.filetype"
      fs.renameSync(path, newPath); // this will store the updated path in the uploads folder with file type

      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: user.id,
      });

      res.status(200).json(postDoc);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// route to update the post
app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { token } = req.cookies;

  try {
    const info = jwt.verify(token, process.env.SECRET, {}, (err, info) => {
      if (err) return "jwt expired";
      return info;
    });

    if (info === "jwt expired") {
      res.clearCookie("token");
      return res.status(401).json({ error: "token expired" });
    } else {
      let newPath = null;

      if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split(".");
        const ext = parts[parts.length - 1];
        newPath = path + "." + ext;
        fs.renameSync(path, newPath);
      }

      const { id, title, summary, content } = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor =
        JSON.stringify(postDoc.author) === JSON.stringify(info.id);

      if (!isAuthor) {
        return res.status(400).json("you are not the author");
      }

      await postDoc.updateOne({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });

      res.status(200).json(postDoc);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// route for getting all posts
app.get("/posts", async (req, res) => {
  try {
    res
      .status(200)
      .json(
        await Post.find()
          .populate("author", ["fullname"])
          .sort({ createdAt: -1 })
          .limit(20)
      );
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// route to get specific post
app.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const postDoc = await Post.findById({ _id: id })
      .populate("author", ["fullname"])
      .populate("reviews.user", "fullname");
    res.status(200).json(postDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/logout", (req, res) => {
  //res.cookie("token", "").json("ok");
  res.clearCookie("token").json("ok");
});

// creating a post review
app.put("/createReview", async (req, res) => {
  const { token } = req.cookies;

  try {
    const info = jwt.verify(token, process.env.SECRET, {}, (err, info) => {
      if (err) return "jwt expired";
      return info;
    });

    if (info === "jwt expired") {
      res.clearCookie("token");
      return res.status(401).json({ error: "token expired" });
    } else {
      const review = {
        user: info.id,
        comment: req.body.comment,
        reviewDate: new Date().toUTCString(),
      };

      const post = await Post.findById({ _id: req.body.postId });

      if (!post) {
        return res.status(404).json({ message: "Post Not Found" });
      }

      // finding whether user given review or not
      const isUserReviewed = post.reviews.find(
        (review) => review.user.toString() === info.id
      );

      console.log(isUserReviewed);

      // if user already reviewed then updating the review, if not reviewed inserting the new review into reviews array
      if (isUserReviewed) {
        isUserReviewed.comment = req.body.comment;
        isUserReviewed.reviewDate = new Date().toUTCString();
      } else {
        post.reviews.push(review);
        post.numOfReviews = post.reviews.length;
      }

      await post.save({ validateBeforeSave: false });

      res.status(200).json({ message: "Review Posted Successfully" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
