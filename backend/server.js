var express = require("express");
var cors = require("cors");
var db = require("./sqlitedb.js");
var cloud= require("./readBucket.js");
var app = express();
app.use(cors());
const corsOptions = {
  origin:['https://frontend-llm-tk7ash3eaa-uc.a.run.app', 'http://localhost:4200'],
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));
app.options('*', cors()); // Enable preflight requests for all routes

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const bucketName = 'storage-awarri_llm';
var HTTP_PORT = 8000;
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});


app.get("/", (req, res, next) => {
  res.json({ message: "Ok" });
});


app.get("/api/expense", (req, res, next) => {
  var sql = "select * from expense";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// app.get("/api/expense/:id", (req, res, next) => {
//   var sql = "select * from expense where id = ?";
//   var params = [req.params.id];
//   db.get(sql, params, (err, row) => {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     res.json(row);
//   });
// });

// app.post("/api/expense/", (req, res, next) => {
//   var errors = [];
//   if (!req.body.item) {
//     errors.push("No item specified");
//   }
//   var data = {
//     item: req.body.item,
//     amount: req.body.amount,
//     category: req.body.category,
//     location: req.body.location,
//     spendOn: req.body.spendOn,
//     createdOn: req.body.createdOn,
//   };
//   var sql =
//     "INSERT INTO expense (item, amount, category, location, spendOn, createdOn) VALUES (?,?,?,?,?,?)";
//   var params = [
//     data.item,
//     data.amount,
//     data.category,
//     data.location,
//     data.spendOn,
//     data.createdOn,
//   ];
//   db.run(sql, params, function (err, result) {
//     if (err) {
//       res.status(400).json({ error: err.message });
//       return;
//     }
//     data.id = this.lastID;
//     res.json(data);
//   });
// });


// app.put("/api/expense/:id", (req, res, next) => {
//   var data = {
//     item: req.body.item,
//     amount: req.body.amount,
//     category: req.body.category,
//     location: req.body.location,
//     spendOn: req.body.spendOn,
//   };
//   db.run(
//     `UPDATE expense SET
//  item = ?, 
//  amount = ?,
//  category = ?, 
//  location = ?, 
//  spendOn = ? 
//  WHERE id = ?`,
//     [
//       data.item,
//       data.amount,
//       data.category,
//       data.location,
//       data.spendOn,
//       req.params.id,
//     ],
//     function (err, result) {
//       if (err) {
//         console.log(err);
//         res.status(400).json({ error: res.message });
//         return;
//       }
//       res.json(data);
//     }
//   );
// });

// app.delete("/api/expense/:id", (req, res, next) => {
//   db.run(
//     "DELETE FROM expense WHERE id = ?",
//     req.params.id,
//     function (err, result) {
//       if (err) {
//         res.status(400).json({ error: res.message });
//         return;
//       }
//       res.json({ message: "deleted", changes: this.changes });
//     }
//   );
// });
// app.use(function (req, res) {
//   res.status(404);
// });


app.post("/api/postEvaluationToCloud/", async (req, res, next) => {
  var errors = [];
  if (!req.body) {
    errors.push("No item specified");
  };
  // var data = {
  //   item: req.body.item,
  // };
  var data = req.body;
  try{
   await cloud.uploadFile(bucketName, data, 'Evaluations');
    res.json({ status: 'success', message: 'API call successful' });
  }catch(err){
    res.status(400).json({ error: err.message });
    return;
  }

});

app.post("/api/postRankingToCloud/", async (req, res, next) => {
  var errors = [];
  if (!req.body) {
    errors.push("No item specified");
  };

  var data = req.body;
  try{
    await cloud.uploadFile(bucketName, data, 'Ranking/');
    res.json({ status: 'success', message: 'API call successful' });
  }catch(err){
    res.status(400).json({ error: err.message });
    return;
  }

});

app.get('/success', (req, res) => {
  // Send a success response with a JSON object
  res.json({ status:"success" ,message: 'API call successful' });
});
// Route for failure
app.get('/api/success2', (req, res) => {
  // Send an error response with a JSON object
  res.status(500).json({ status: 'error', message: 'API call failed' });
});