### 1. Cài đặt thư viện

`npm i express ejs nodemon body-parser`

### 1. Cấu hình Server

```js
const express = require("express");

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => console.log(`App listening port -> ${PORT}`));
```

### 3. Cấu hình các midleware & config view engine

```js
//config parser -> get data from form
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//config view engine
app.set("view engine", "ejs");
app.set("views", "./views");
```

### 4. Tạo view cho index

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CRUd</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
      crossorigin="anonymous"
    />
    <style>
      .title {
        color: red;
        font-weight: bold;
      }
      .header__title{
        color: blue;
      }
    </style>
  </head>
  <body>
    <div class="container mt-4">

      <div class="container">
        <h4 class="title">Nhà xuất bản ABZ</h2>
       <div class="row"> <h2 class="text-center header__title col">Danh mục các bài báo</h1>
        <a class="btn btn-primary col-1" href="/add" role="button">Thêm</a>


    </div>

      </div>

      <table class="table">
        <thead>
          <tr>
            <th scope="col">STT</th>
            <th scope="col">Tên bài báo</th>
            <th scope="col">Tên nhóm tác giả</th>
            <th scope="col">Chỉ số BSIN</th>
            <th scope="col">Số trang </th>
            <th scope="col">Năm xuất bản</th>
            <th scope="col">Actions</th>
          </tr>

        </thead>
        <tbody>

          <% for (var i = 0; i < papers.length; i++) { %>
            <tr>
          <% let count= i+1 %>
              <td scope="row"><%= count++ %>
              </td>
              <td scope="row"><%= papers[i].actor %></td>
              <td scope="row"><%= papers[i].group_actor %></td>
              <td scope="row"><%= papers[i].isbn %></td>
              <td scope="row"><%= papers[i].page_number %></td>
              <td scope="row"><%= papers[i].year %></td>
              <td>
                <a href="/delete/<%=papers[i].id%>">Xóa</a>
              </td>
            </tr>
            <% } %>
        </tbody>
      </table>
    </div>
  </body>
</html>
```

### 5. Cài đặt sdk aws

`npm i aws-sdk`

### 6. Config sdk cho server

- config ở file index

  - Import thư viện

    ```js
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
    ```

  - Lấy data từ server

    ```js
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
    ```

  - Thêm 1 Item vào database

    ```js
    // Get Form add
    app.get("/add-item", (req, res) => {
      res.render("add-item");
    });

    app.post("/add", (req, res) => {
      const { id, actor, group_actor, isbn, page_number, year } = req.body;
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
          res.send(err);
        } else {
          res.redirect("/");
        }
      });
    });
    ```

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
        crossorigin="anonymous"
        />
    </head>
    <style>
        .container{
        width: 80%;
        margin-top: 20px;
        }
    </style>
    <body>
        <div class="container">
        <form action="/add" method="post">
            <h3 class="text-center">Thêm mới 01 bài báo</h3>
            <div class="mb-3 row justify-content-md-center">
            <label for="lable" class="form-label">id:</label>
            <input type="text" name="id" class="form-control" id="ma_sp" />
            <label for="lable" class="form-label">Tên bài báo:</label>
            <input type="text" name="actor" class="form-control" id="ma_sp" />

            <label for="lable" class="form-label">	Tên nhóm tác giả: </label>
            <input
                type="text"
                name="group_actor"
                class="form-control"
            />

            <label for="lable" class="form-label">Chỉ số BSIN: </label>
            <input
                type="number"
                name="isbn"
                class="form-control"
            />

            <label for="lable" class="form-label">Số trang: </label>
            <input
                type="number"
                name="page_number"
                class="form-control"
            />
            <label for="lable" class="form-label">	Năm xuất bản: </label>
            <input
                type="number"
                name="year"
                class="form-control"
            />
            <div class="d-flex flex-row-reverse bd-highlight ">
                <input  class="btn btn-primary col-1 mt-3" type="submit" value="Thêm">
            </div>
            </div>
        </form>
        </div>
        </div>
    </body>
    </html>
    ```

  - Xóa một Item

    ```js
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
    ```

### 7. Validation

`npm i express-validator`

```js
const { check, validationResult } = require("express-validator");
```

- Post Validation'

```js
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
```

- add.ejs

  ```html
  <% if(typeof alert !='undefined' ) {%> <% alert.forEach(function(errors){ %>
  <div class="alert alert-warning alert-dismissible fade show" role="alert">
    <%= errors.msg %>
  </div>
  <% }) %> <% } %>
  ```
  ```html
  <td scope="row"><%= papers[i].gender == 'true' ? 'Nam' : 'Nu' %></td>
  ```
  ```html
  <input type="radio" name="gender" id="genderMale" value="true" > Female
  <input type="radio" name="gender" id="genderFemale" value="false"> Male
  ```
  
