const User = require("../models/user");
const Listing = require("../models/listing");

module.exports.showMyBookings = async (req, res) => {
  const user = await User.findById(req.user._id).populate([
    { path: "bookedBeds.listing" },
    { path: "bookedBeds.owner" }
  ]);

  const groupedBookings = {};

  user.bookedBeds.forEach((booking) => {
    // If listing or owner is missing, skip this booking
    if (!booking.listing || !booking.owner) return;

    const listingId = booking.listing._id.toString();

    if (!groupedBookings[listingId]) {
      groupedBookings[listingId] = {
        listing: booking.listing,
        owner: booking.owner,
        bedsBooked: [],
      };
    }

    groupedBookings[listingId].bedsBooked.push(booking.bedIndex + 1);
  });

  res.render("bookings/myBookings", { bookings: Object.values(groupedBookings),user });
};

module.exports.showMyListingBookings = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });

  const listingIds = listings.map(listing => listing._id);
  
  const users = await User.find({
    "bookedBeds.listing": { $in: listingIds }
  }).populate("bookedBeds.listing");

  const bookingsByListing = {};

  users.forEach(user => {
    user.bookedBeds.forEach(bed => {
      const listingId = bed.listing._id.toString();
      if (!bookingsByListing[listingId]) {
        bookingsByListing[listingId] = {
          listing: bed.listing,
          users: []
        };
      }
      bookingsByListing[listingId].users.push({
        id:user._id,
        name: user.name,
        email: user.email,
        bedIndex: bed.bedIndex + 1
      });
    });
  });

  res.render("bookings/myListingBookings", {
    bookings: Object.values(bookingsByListing)
  });
};

