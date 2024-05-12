var express = require('express');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Specify the destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Specify the filename
  }
});

const upload = multer({ storage: storage });
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'product_api_db'
});

connection.connect(function(err){
  if(!err){
    console.log("database is connected");
  } else {
    console.log("error connecting database");
  }
});

// product start

// router.get('/get-all-product-api',function(req, res, next ){
  
//   connection.query("select * from  tbl_product ORDER BY product_id DESC", function(err, rows) {
//     if(err) {
//       res.send(JSON.stringify({"status": 500,"flag": 0, "message": "Error", "data": err}));
//     } else {
//       if(rows && rows.length>0){
//         count = rows.length;
//         const page = parseInt(req.query.page) || 1;
//         const pageSize = parseInt(req.query.pageSize) || 10;
      
//         const startIndex = (page - 1) * pageSize;
//         const endIndex = startIndex + pageSize;
      
//         const paginatedData = rows.slice(startIndex, endIndex);
//         const totalRecords = rows.length;
      
//         res.send(JSON.stringify({"status": 200,"flag": 1, "message": "Data Fetch", "data": paginatedData, "totalRecords": totalRecords}));
//       } else {
//         res.send(JSON.stringify({"status": 200,"flag": 0, "message": "No Recoreds Found"}));
//       }
//     }
//   })
// });

router.get('/get-all-product-api', function(req, res, next) {
  const sortBy = req.query.sortBy || 'product_id'; // Default sorting by product_id
  const sortOrder = req.query.sortOrder || 'DESC'; // Default sorting order is descending
  
  // Construct the SQL query with sorting parameters
  const query = `SELECT * FROM tbl_product ORDER BY ${sortBy} ${sortOrder}`;
  
  connection.query(query, function(err, rows) {
    if (err) {
      res.status(500).json({ status: 500, flag: 0, message: "Error", data: err });
    } else {
      if (rows && rows.length > 0) {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
      
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
      
        const paginatedData = rows.slice(startIndex, endIndex);
        const totalRecords = rows.length;
      
        res.status(200).json({ status: 200, flag: 1, message: "Data Fetch", data: paginatedData, totalRecords: totalRecords });
      } else {
        res.status(200).json({ status: 200, flag: 0, message: "No Records Found" });
      }
    }
  });
});

router.get('/get-product-api/:id',function(req, res, next ){

  var id = req.params.id;
  // console.log("Parameter Value" + id );
  
  connection.query("select * from tbl_product where product_id = ?", [id], function(err, rows) {
    if(err) {
      res.send(JSON.stringify({"status": 500,"flag": 0, "message": "Error", "data": err}));
    } else {
      // console.log(rows);
      if(Object.keys(rows).length !== 0){
        res.send(JSON.stringify({"status": 200,"flag": 1, "message": "Data Fetch", "data": rows}));
      } else {
        res.send(JSON.stringify({"status": 200,"flag": 1, "message": "Data not found"}));
      }      
    }
  })
});

router.post('/add-product-api', upload.single('product_image'), function (req, res, next){
  console.log("Body Data" + req.body.product_name);
  console.log("Body product_price" + req.body.product_price);
  console.log("Body product_image" + req.file.filename); // Assuming only one file is uploaded

  const mybodydata = {
    product_name: req.body.product_name,
    product_price: req.body.product_price,
    product_image: req.file.filename // Adjust this based on how multer stores the file
  };
  connection.query("insert into tbl_product set ?", mybodydata, function(err, result) {
    if(err) {
      res.send(JSON.stringify({"status": 500,"flag": 0, "message": "Error", "data": err}));
    } else {
      res.send(JSON.stringify({"status": 200,"flag": 1, "message": "Data Added", "data": ''}));
    }
  })
});

router.put('/update-product-api/:id', upload.single('product_image'), function (req, res, next){
  // console.log("Parameter ID" + req.params.id);

  var product_id = req.params.id;
  var product_name = req.body.product_name;
  var product_price = req.body.product_price;
  var product_image = req.file.filename;

  connection.query("update tbl_product set product_name = ?,product_price = ?, product_image = ? where product_id = ? ", [product_name, product_price, product_image, product_id], function(err, result) {
    if(err) {
      res.send(JSON.stringify({"status": 500,"flag": 0, "message": "Error", "data": err}));
    } else {
      res.send(JSON.stringify({"status": 200,"flag": 1, "message": "Data update", "data": ''}));
    }
  })
});

router.delete('/delete-product-api/:id', function (req, res, next){
  var deleteid = req.params.id;
  // console.log(`Parameter value is ${deleteid}`);
  connection.query("delete from tbl_product where product_id = ? ", [deleteid], function (err, rows){
    if(err){
      res.status(500).send(JSON.stringify({"status": 500, "flag": 0, "message": "Error", "Data": err}));
    } else {
      if(rows && rows.affectedRows > 0){
        res.status(200).send(JSON.stringify({"status": 200, "flag": 1, "message": "Data deleted", "Data": rows.affectedRows}));
      } else {
        res.status(200).send(JSON.stringify({"status": 200, "flag": 1, "message": "Data not found"}));
      }
    }
  })
});

// product end

module.exports = router;
