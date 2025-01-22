import express from "express";
import path from "path";
import {
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  getUser,
  updateUser,
  friendRequest,
  acceptRequest,
  profileViews,
  friendSuggestion,
  getFriendRequest,
} from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

router.get("/verify/:userId/:token", verifyEmail);  //Email Verification

// Rseset password Routes
router.post("/request-passwordreset", requestPasswordReset);  //Sent password change request through email
router.get("/reset-password/:userId/:token", resetPassword);  //recieve id and token from link in email
router.post("/reset-password", changePassword);  //Performs the main task of changing password

// User Routes
router.post("/get-user/:id?", userAuth, getUser);
router.put("/update-user", userAuth, updateUser);

// Friend Requests
router.post("/friend-request", userAuth, friendRequest);
router.post("/get-friend-request",userAuth, getFriendRequest);
router.post("/accept-request", userAuth, acceptRequest);  // accept / deny request

// View Profile
router.post("/profile-view", userAuth, profileViews);

// Friends Suggestion
router.post("/suggested-friends", userAuth, friendSuggestion);




router.get("/verified", (req, res) => {
  // res.redirect("http://localhost:3000/email-verification-result");
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});
router.get("/resetpassword", (req, res) => {
  // res.redirect("http://localhost:3000/confirm-password-reset");
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

export default router;
