import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const getRecommendedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, //exclude current user
                { _id: { $nin: currentUser.friends } }, //exclude current user's friends
                { isOnboarded: true } //only include users who are onboarded
            ]
        });

        res.status(200).json({
            recommendedUsers
        });

    } catch (error) {
        console.error("Error fetching recommended users:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMyFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("friends", "-password -__v -createdAt -updatedAt")
        
        res.status(200).json(user.friends);

    } catch (error) {
        console.error("Error fetching friends:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendFriendRequest = async (req, res) => {
    const currentUserId = req.user._id;
    const { id: recipientId } = req.params;

    try {
        //Check if user is not trying to send request to himself
        if (currentUserId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself." });
        }

        //Check if recipient user exists
        const recipientUser = await User.findById(recipientId);
        if (!recipientUser) {
            return res.status(404).json({ message: "Recipient user not found." });
        }

        //Check if a user is already friends
        if (recipientUser.friends.includes(currentUserId)) {
            return res.status(400).json({ message: "You are already friends with this user." });
        }

        //Check if a friend request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: currentUserId, recipient: recipientId },
                { sender: recipientId, recipient: currentUserId }
            ]
        });
        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already exists." });
        }

        //Create a new friend request
        const newFriendRequest = new FriendRequest({
            sender: currentUserId,
            recipient: recipientId
        });
        await newFriendRequest.save();

        res.status(201).json({
            newFriendRequest
        });

    } catch (error) {
        console.error("Error sending friend request:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found." });
        }

        //Verify the current user is the recipient
        if (friendRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request." });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        //Add each user to other's friends list
        //$addToSet:adds elements to array only if they do not already exist
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        });

    } catch (error) {
        console.error("Error accepting friend request:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        //Jinhone mujhe request khi he
        const incomingReqs = await FriendRequest.find({ recipient: req.user._id, status: 'pending' }).populate('sender', '-password -__v -createdAt -updatedAt');

        //Mera request jisne accept kiya he
        const acceptedReqs = await FriendRequest.find({ recipient: req.user._id, status: 'accepted' }).populate('recipient', "fullName profilePic");

        res.status(200).json({ incomingReqs, acceptedReqs });
    } catch (error) {
        console.error("Error fetching friend requests:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getOutgoingFriendReqs = async (req, res) => {
    try {
        const outgoingReqs = await FriendRequest.find({ sender: req.user._id, status: 'pending' }).populate('recipient', "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingReqs);
    } catch (error) {
        console.error("Error fetching outgoing friend requests:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}