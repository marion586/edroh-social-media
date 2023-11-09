import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import multer from "multer"
import helmet from "helmet"
import morgan from "morgan"
import path from "path"

import { fileURLToPath } from "url"
import { register } from "./controllers/auth.js"
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import { verifyToken } from "./middleware/auth.js"
import {createPost} from "./controllers/posts.js"
import User from "./models/User.js"
import Post from "./models/Posts.js"
import {users ,posts} from './data/index.js'
// Confugurations

const  __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)
console.log( __filename , import.meta.url)
dotenv.config()
const app = express()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}))
app.use(morgan("common"))
app.use(bodyParser.json({limit: "30mb" , extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb" , extended : true}))
app.use(cors())
app.use("/assets" , express.static(path.join(__dirname ,'public/assets' )))


// FileSTORAGE

const storage = multer.diskStorage({
    destination: function (req , file , cb) {
        cb(null , "public/assets")
    },
    filename: function (req, file, cb) {
        cb(null , file.originalname)
    }
})

const upload = multer({
    storage
})

// Routes WITH FILES
app.post("/auth/register",  upload.single("picture") , register)
app.post("/posts" , verifyToken , upload.single("picture"), createPost)
// ROUTES
app.use('/auth' , authRoutes)
app.use("/users" , usersRoutes)
app.use("/posts" , postRoutes)
//Mongoose set Up

const PORT =process.env.PORT || 6001
console.log("uri", process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL , {
    useNewURLParser:true,
    useUnifiedTopology: true
}).then (
    ()=> {
        app.listen(PORT , ()=>console.log(`Server Port: ${PORT}`))
        //Add Data One time
        // User.insertMany(users);
        // Post.insertMany(posts)
    }
).catch(
    (error)=> console.log(`${error}  did not connect`)
)