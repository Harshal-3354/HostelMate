// chatRoutes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

router.get("/", isLoggedIn, chatController.showChatsOverview);
router.get("/:receiverId", isLoggedIn, chatController.showChat);
router.post("/:receiverId", isLoggedIn, chatController.sendMessage);



module.exports = router;
