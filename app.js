//core module
const path = require('path');

//External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer=require('multer');
const { default: mongoose } = require('mongoose');
const DB_PATH = "mongodb+srv://Sudhanshudbuser:Sudhanshu123@sudhanshukumar.titaceg.mongodb.net/PlotBridge?appName=SudhanshuKumar";

//Local Modules
const storeRouter = require("./routes/storeRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./Utils/pathUtil");
const errorController = require("./controllers/errors");


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());

const store = new MongoDBStore({
    uri: DB_PATH,
    collection: 'sessions'
});

const randomString= (length)=>{
   const chars= 'abcdefghijklmnopqrstuvwxyz0123456789';
   let result= '';
   for(let i=0; i<length; i++){
       const randomIndex= Math.floor(Math.random()*chars.length);
         result+= chars[randomIndex];
   }
   return result;
};

const storage= multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,'uploads/');
    },
    filename:function(req, file, cb){
        cb(null, randomString(10) + '-' + file.originalname);
    }
});

const fileFilter= (req, file, cb)=>{
   if(file.mimetype==='image/jpeg' || file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='application/pdf'){
       cb(null, true);
   }else{
       cb(null, false);
   }
};

const multerOptions={
   storage, fileFilter
};



// 1. Body parser
app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOptions).fields([
    { name: 'photo', maxCount: 1 }
  ]));

app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/host/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/homes/uploads', express.static(path.join(rootDir, 'uploads')));

// 2. Session middleware
app.use(session({
    secret: "Plot Bridge Secret Key",
    resave: false,
    saveUninitialized: true, // Changed to false
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// 3. Authentication middleware - SIMPLE VERSION
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.user = req.session.user || null;
    req.isLoggedIn = req.session.isLoggedIn || false;
    req.user = req.session.user || null;
    next();
});

// 4. Static files - MOVED BEFORE ROUTES

// 5. Routes
app.use(authRouter);
app.use(storeRouter);

// 6. Host routes with authentication check - FIXED
app.use("/host", (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.redirect("/login");
    }
});
app.use(storeRouter);

// 7. Error handling
app.use(errorController.unknown);

const PORT = 3002;

mongoose.connect(DB_PATH).then(() => {
    console.log('Connected to Mongo');
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.log("Error while connecting to Mongo:", err);
});