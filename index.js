const express = require("express");
const { check, validationResult } = require("express-validator");
const PORT = process.env.PORT || 3000;

const app = express();

//config parser -> get data from form
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//config view engine
app.set("view engine", "ejs");
app.set("views", "./views");

const AWS = require("aws-sdk");

//config sdk
const config = new AWS.Config({
  accessKeyId: "AKIAQWHSU6T6GZL2CBNE",
  secretAccessKey: "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",
  region: "ap-southeast-1",
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "paperdb";

//get all data from dymongoDB
app.get("/", (req, res) => {
  const params = {
    TableName: tableName,
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.log(err);
      res.send("Internal server error");
    } else {
      return res.render("index", { papers: data.Items });
    }
  });
});

// Get Form add
app.get("/add", (req, res) => {
  res.render("add");
});

app.post(
  "/add",
  [
    check("actor", "Tên bài báo không dưới 3 kí tự")
      .exists()
      .isLength({ min: 3 }),
    check("group_actor", "Tác giả không dưới 3 kí tự")
      .exists()
      .isLength({ min: 3 }),
    check("isbn", "Không rỗng").exists().isLength({ min: 1 }),
  ],

  (req, res) => {
    const { id, actor, group_actor, isbn, page_number, year } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json(errors.array());
      const alert = errors.array();
      res.render("add", { alert });
    } else {
      const params = {
        TableName: tableName,
        Item: {
          id: id,
          actor: actor,
          group_actor: group_actor,
          isbn: isbn,
          page_number: page_number,
          year: year,
        },
      };

      docClient.put(params, (err, data) => {
        if (err) {
          console.log(err);

          res.send("Internal server error");
        } else {
          console.log(data);
          res.redirect("/");
        }
      });
    }
  }
);

// DeleteItem
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  const params = {
    TableName: tableName,
    Key: {
      id: id,
    },
  };

  docClient.delete(params, (err, data) => {
    if (err) {
      console.log(err);
      res.send("Internal server error");
    } else {
      console.log(data);
      return res.redirect("/");
    }
  });
});
app.listen(PORT, () => console.log(`App listening port -> ${PORT}`));
