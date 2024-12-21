const express = require('express');
const cors = require('cors');
const multer = require("multer");
const path = require("path");
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USR}:${process.env.DB_PASS}@cluster0.p0d5x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// multer----------------------------


const UPLOADS_FOLDER = "./uploads/"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER)
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExt, "").toLowerCase().split(" ").join("-") + "-" + Date.now();
        cb(null, fileName + fileExt);
    }
})

const upload = multer({
    //dest: UPLOADS_FOLDER,
    storage: storage,
    limits: {
        fileSize: 5000000 // 1mb
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true)
        }
        else {
            cb(new Error("Invalid file type. Only jpg and png are allowed"))
            //cd(null, false) // to handle silently 
        }
    },
})


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function run() {
    try {
        await client.connect();

        app.get("/", (req, res) => {
            res.send("Setup is ok")
        })


        app.post("/", upload.single("avatar"), (req, res) => {
            res.send(req.file);
        })



        //error handling---------------
        app.use((err, req, res, next) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    res.status(500).send(err.message)
                }
                else {
                    res.status(500).send(err.message)
                }
            }
            else {
                res.send("success")
            }
        })
        //-----------------------------------
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`the app is running on port ${port}`);
})