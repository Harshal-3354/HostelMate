const Listing=require("../models/listing");
const User=require("../models/user");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});


module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    }).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();

    let url = req.file.path;
    let filename = req.user._id;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    // 🔥 Add this part to set beds array from numBeds
    const numBeds = req.body.listing.numBeds; // make sure you pass this from form
    newListing.beds = Array.from({ length: numBeds }, () => ({
    isBooked: false,
    bookedBy: { id: null, name: "" }
    }));


    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};


module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!="undefined"){
        let url=req.file.path;
        let filename=req.user._id;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};


module.exports.bookBed = async (req, res) => {
    const { id, bedIndex } = req.params;
    const listing = await Listing.findById(id);
  
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    const index = parseInt(bedIndex);
    if (isNaN(index) || index < 0 || index >= listing.beds.length) {
        req.flash("error", "Invalid bed index");
        return res.redirect(`/listings/${id}`);
    }
    if (listing.beds[index].isBooked === true) {
        req.flash("info", "Bed already booked");
    } else {
        listing.beds[index].isBooked = true;
        listing.beds[index].bookedBy.id = req.user._id;
        listing.beds[index].bookedBy.name = req.user.username; // or fullname if stored
        await listing.save();
        const user = await User.findById(req.user._id);
        user.bookedBeds.push({
          bedIndex: Number(bedIndex),
          listing: listing._id,
          owner: listing.owner
        });
        await user.save();
        req.flash("success", `Bed ${parseInt(index) + 1} has been booked.`);
    }
    res.redirect(`/listings/${id}`);
  };
  


// Unbook a specific bed in the listings
module.exports.unbookBed = async (req, res) => {
    const { id, index } = req.params;
    const listing = await Listing.findById(id);
  
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
  
    listing.beds[index].isBooked = false;
    listing.beds[index].bookedBy.id = null;
    listing.beds[index].bookedBy.name = "";
  
    await listing.save();
    req.flash("success", `Bed ${parseInt(index) + 1} has been unbooked.`);
    res.redirect(`/listings/${id}`);
  };

  
  module.exports.filterListings = async (req, res) => {
    const { minPrice, maxPrice, gender, location, amenities } = req.query;
  
    let filter = {};
  
    if (minPrice && maxPrice) {
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }
  
    if (gender && gender !== "Any") {
      filter.gender= gender;
    }
  
    if (location) {
      filter.location = { $regex: location, $options: "i" }; // case-insensitive
    }
  
    if (amenities && amenities.length > 0) {
        let amenityList = [];
      
        if (typeof amenities === "string") {
          // it's a single string like "WiFi,Laundry"
          amenityList = amenities.split(",");
        } else if (Array.isArray(amenities)) {
          // it's already an array from checkboxes
          amenityList = amenities;
        }
      
        filter.amenities = { $all: amenityList }; // match listings that have all selected amenities
      }
      
  
    const filteredListings = await Listing.find(filter);
    res.render("listings/index", { allListings: filteredListings });
  };