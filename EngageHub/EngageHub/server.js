const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static("public")); 
app.use("/uploads", express.static("uploads"));

// --- MongoDB Connection  ---
const mongoURI = "mongodb://localhost:27017/civicAI";

mongoose.connect(mongoURI)
    .then(() => console.log(" MongoDB Connected Successfully"))
    .catch(err => {
        console.log(" MongoDB Connection Error. Please ensure MongoDB Service is RUNNING.");
        console.error(err.message);
    });

// --- Database Models ---
const User = mongoose.model("User", {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 } 
});

const Complaint = mongoose.model("Complaint", {
    text: String,
    location: String,
    email: String,
    image: String,
    video: String,
    department: String,
    priority: String,
    lat: Number, 
    lng: Number, 
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now } 
});

// --- File Upload Setup ---
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// --- Nodemailer Setup ---

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bhartiashu2005@gmail.com', 
        pass: 'sonb gazy tprx tzry'      
    }
});

// --- AI Analysis Logic ---
function analyzeIssue(text) {
    const t = text.toLowerCase();
    let dept = "General", prio = "Medium";
    
    if (t.includes("light") || t.includes("electricity")) dept = "Electricity";
    if (t.includes("garbage") || t.includes("waste") || t.includes("clean")) dept = "Sanitation";
    if (t.includes("water") || t.includes("leak")) dept = "Water Supply";
    if (t.includes("road") || t.includes("pothole")) dept = "Public Works";

    if (t.includes("urgent") || t.includes("danger") || t.includes("emergency")) prio = "High";
    
    return { dept, prio };
}

// --- ROUTES ---

// Fix for "Cannot GET /"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Auth Routes
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await new User({ username, password: hash }).save();
        res.json({ msg: "Signup successful" });
    } catch (e) { res.status(400).json({ msg: "User already exists" }); }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.json({ msg: "Invalid Credentials" });
        }
        const token = jwt.sign({ username: user.username }, "secret123");
        res.json({ token });
    } catch (e) { res.status(500).json({ msg: "Server Error" }); }
});

// Complaint Submission
app.post("/complaint", upload.fields([{ name: "image" }, { name: "video" }]), async (req, res) => {
    try {
        const { text, location, email, lat, lng, username } = req.body;
        const analysis = analyzeIssue(text);

        const newComplaint = await new Complaint({
            text, location, email,
            lat: parseFloat(lat) || 0,
            lng: parseFloat(lng) || 0,
            image: req.files.image ? req.files.image[0].filename : "",
            video: req.files.video ? req.files.video[0].filename : "",
            department: analysis.dept,
            priority: analysis.prio
        }).save();

        // Reward Points Update
        if (username) {
            await User.findOneAndUpdate({ username }, { $inc: { points: 10 } });
        }

        // Email Notification
        const mailOptions = {
            from: 'Civic.AI Support <aapki-email@gmail.com>',
            to: email,
            subject: `Complaint Registered: #${newComplaint._id.toString().slice(-6)}`,
            html: `<h3>Civic.AI Receipt</h3><p>Your issue regarding <b>${analysis.dept}</b> has been noted.</p><p>Status: Pending</p>`
        };
        transporter.sendMail(mailOptions).catch(err => console.log("Mail Error:", err));

        io.emit("newComplaint", newComplaint);
        res.json({ id: newComplaint._id, department: analysis.dept, points: 10 });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});

app.get("/complaints", async (req, res) => {
    try {
        const data = await Complaint.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (e) { res.status(500).json({ msg: "DB Error" }); }
});

app.delete("/complaint/:id", async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ msg: "Deleted" });
    } catch (e) { res.status(500).json({ msg: "Delete Error" }); }
});

// --- Start Server ---
const PORT = 5000;
server.listen(PORT, () => console.log(` Civic.AI System Live at http://localhost:${PORT}`));