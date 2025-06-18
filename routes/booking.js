const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking");
const { isLoggedIn } = require("../middleware");

router.get("/my-bookings", isLoggedIn, bookingController.showMyBookings);
router.get("/my-listing-bookings", isLoggedIn, bookingController.showMyListingBookings);
module.exports = router;
