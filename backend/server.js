
const ExcelJS = require("exceljs");




require("dotenv").config();
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");
const fs = require("fs");
const app = express();








app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      "https://auced.com",
      "https://www.auced.com",
      "http://localhost:4321"
    ];

    if (!origin || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("CORS blocked: " + origin));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));



app.use("/uploads", express.static("uploads"));



app.use(express.json());


app.use(express.urlencoded({ extended: true }));



const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });




// ---------- MongoDB ----------

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("MongoDB Error", err));








// ---------- Counter Schema ----------
const CounterSchema = new mongoose.Schema({
  name: String,
  value: { type: Number, default: 0 }
});

const Counter = mongoose.model("counter", CounterSchema);


// ---------- Schema ----------
const PreSchema = new mongoose.Schema({
  application_id: String,
  name:String,
  mobile:String,
  email:String,
  role:String,            // ⭐ ADD THIS LINE
  status: {
  type: String,
  default: "Pending"
},

  institute:String,
  graduation_year:String,
  startup_name:String,
  startup_address:String,
  project_title:String,
  project_description:String,
  pitch:String,
  mentor_name:String,
  mentor_contact:String,
  product_type:String,
  sector:String,
  stage:String,
  dpiit_no:String,
  udyam_no:String,
  services:[String],
  ppt:String,
  photo:String,
  
  createdAt:{ type:Date, default:Date.now }
});


const PreModel = mongoose.model("preincubation",PreSchema);





app.post(
  "/api/preincubation",
  upload.single("photo"),
  async (req, res) => {

  try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const lastApp = await PreModel.findOne().sort({ application_id: -1 });
    const next = lastApp
      ? parseInt(lastApp.application_id.replace("CEDPI", "")) + 1
      : 1;

    const appId = "CEDPI" + String(next).padStart(4, "0");

  let services = [];

if (Array.isArray(req.body["services[]"])) {
  services = req.body["services[]"];
} else if (req.body["services[]"]) {
  services = [req.body["services[]"]];
} else if (Array.isArray(req.body.services)) {
  services = req.body.services;
} else if (req.body.services) {
  services = [req.body.services];
}

console.log("SERVICES RECEIVED:", services);


    const data = new PreModel({
  application_id: appId,

  name: req.body.name,
  mobile: req.body.mobile,
  email: req.body.email,
  role: req.body.role,

  institute: req.body.institute,
  graduation_year: req.body.graduation_year,
  startup_name: req.body.startup_name,
  startup_address: req.body.startup_address,

  project_title: req.body.project_title,
  project_description: req.body.project_description,
  pitch: req.body.pitch,

  mentor_name: req.body.mentor_name,
  mentor_contact: req.body.mentor_contact,

  product_type: req.body.product_type,
  sector: req.body.sector,
  stage: req.body.stage,

  dpiit_no: req.body.dpiit_no,
  udyam_no: req.body.udyam_no,

  services: services,

  ppt: req.body.ppt || "",

  // ✅ PHOTO PATH
  photo: req.file ? `/uploads/${req.file.filename}` : "",

  status: "Pending"
});

    await data.save();
    res.json({ status: true });

  } catch (err) {
    console.log("SAVE ERROR:", err);
    res.status(500).json({ status: false });
  }
});











app.get("/api/preincubation", async (req,res)=>{
  try{
    const data = await PreModel.find().sort({ application_id: 1 });
    res.json(data);
  }catch(err){
    res.status(500).json({error:true});
  }
});




app.get("/api/reset-counter", async (req,res)=>{
  try{
    const total = await PreModel.countDocuments();

    await Counter.findOneAndUpdate(
      { name:"preincubation" },
      { value: total },
      { upsert:true }
    );

    res.json({status:true, message:"Counter reset to " + total});
  }catch(err){
    res.status(500).json({error:err.message});
  }
});







app.post("/api/update-status", async (req,res)=>{
  try{
    const { application_id, status } = req.body;

    await PreModel.updateOne(
      { application_id },
      { $set:{ status } }
    );

    res.json({success:true});
  }catch(err){
    res.status(500).json({error:true});
  }
});


app.get("/api/download-excel", async (req, res) => {
  try {

    const status = req.query.status;   // Pending / Selected / Rejected

    let query = {};
    if (status) {
      query.status = status;
    }

    const data = await PreModel.find(query).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PreIncubation");


    sheet.columns = [
      { header: "Application ID", key: "application_id", width: 15 },
      { header: "Name", key: "name", width: 18 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Role", key: "role", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Institute", key: "institute", width: 20 },
      { header: "Graduation Year", key: "graduation_year", width: 15 },
      { header: "Startup Name", key: "startup_name", width: 20 },
      { header: "Startup Address", key: "startup_address", width: 25 },
      { header: "Project Title", key: "project_title", width: 20 },
      { header: "Project Description", key: "project_description", width: 30 },
      { header: "Pitch", key: "pitch", width: 20 },
      { header: "Mentor Name", key: "mentor_name", width: 18 },
      { header: "Mentor Contact", key: "mentor_contact", width: 18 },
      { header: "Product Type", key: "product_type", width: 15 },
      { header: "Sector", key: "sector", width: 15 },
      { header: "Stage", key: "stage", width: 15 },
      { header: "DPIIT No", key: "dpiit_no", width: 20 },
      { header: "UDYAM No", key: "udyam_no", width: 20 },
      { header: "Services", key: "services", width: 25 },
      { header: "Submitted At", key: "createdAt", width: 20 },
    ];

    data.forEach(d => {
      sheet.addRow({
        ...d._doc,
        services: d.services.join(", "),
        createdAt: new Date(d.createdAt).toLocaleString()
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=PreIncubation_FullData.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});






















const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=> console.log("Backend running on", PORT));

