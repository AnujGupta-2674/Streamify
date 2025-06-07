import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getMyFriends, getRecommendedUsers, sendFriendRequest, acceptFriendRequest, getFriendRequests, getOutgoingFriendReqs, rejectfriendRequest } from '../controller/user.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-request", getFriendRequests);
router.get("/outgoing-friend-request", getOutgoingFriendReqs);

router.post("/friend-request/:id/reject", rejectfriendRequest);

export default router;