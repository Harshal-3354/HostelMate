const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    },
    bookedBeds: [
        {
          bedIndex: Number,
          listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing"
          },
          owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          bookedAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);