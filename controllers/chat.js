const Message = require("../models/message");
const User = require("../models/user");
// const Listing = require("../models/listing");

module.exports.showChat = async (req, res) => {
  const { receiverId } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: receiverId },
      { sender: receiverId, receiver: req.user._id }
    ]
  }).sort("timestamp");

  const receiver = await User.findById(receiverId);


  res.render("chat/chat", { messages, receiver, currentUser: req.user });
};

module.exports.sendMessage = async (req, res) => {
  const { receiverId } = req.params;
  const newMessage = new Message({
    sender: req.user._id,
    receiver: receiverId,
    // listing: listingId,
    content: req.body.message,
  });

  await newMessage.save();
  res.redirect(`/chat/${receiverId}`);
};

module.exports.showChatsOverview = async (req, res) => {
  const userId = req.user._id;

  // Find distinct user IDs you’ve chatted with
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  });

  const userIdsSet = new Set();

  messages.forEach((msg) => {
    if (msg.sender.toString() !== userId.toString()) {
      userIdsSet.add(msg.sender.toString());
    }
    if (msg.receiver.toString() !== userId.toString()) {
      userIdsSet.add(msg.receiver.toString());
    }
  });

  const chatUsers = await User.find({ _id: { $in: Array.from(userIdsSet) } });

  res.render("chat/chatOverview", { chatUsers });
};
