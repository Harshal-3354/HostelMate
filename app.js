if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const bookingRouter=require("./routes/booking.js");
const chatRouter=require("./routes/chat.js");

const dbUrl=process.env.ATLASTDB_URL;
const http = require('http');
const { Server } = require("socket.io");

// const app = require('./app'); // your express app
const server = http.createServer(app);
const io = new Server(server);

// Make io accessible throughout your app
app.set("io", io);

// Socket.IO Logic
io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("joinRoom", ({ room }) => {
    socket.join(room);
  });

  socket.on("chatMessage", ({ room, message, sender }) => {
    io.to(room).emit("newMessage", { message, sender });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Replace app.listen(...) with:


main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });
    
async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions={
    secret:process.env.SECRET,
    store,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student",
//     });

//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })
app.use("/",bookingRouter);
app.use("/listings",listingRouter);
app.use("/chat",chatRouter);
app.use("/listings/:id/reviews",reviewRouter);

app.use("/",userRouter);
app.get('/', (req, res) => {
    const reviews = [
        { user: "Rahul S.", comment: "Amazing service! Found a hostel in minutes." },
        { user: "Priya K.", comment: "Loved the location-based search feature!" },
        { user: "Amit J.", comment: "Super easy to book. Great platform!" }
    ];
    
    res.render('listings/description', { siteName: "Hostel Finder", reviews });
});


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});


app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
});


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});