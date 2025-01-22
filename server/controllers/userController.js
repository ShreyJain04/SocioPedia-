import Verification from "../models/EmailVerification.js";
import Users from "../models/User.js";
import PasswordReset from "../models/passwordReset.js";
import { comparePassword, createJWT, hashString } from "../utils/index.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const result = await Verification.findOne({ userId });

    if (!result) {
      return res.redirect(`/users/verified?status=error&message=Invalid verification link. Try again later.`);
    }

    const { expiresAt, token: hashedToken } = result;

    if (expiresAt < Date.now()) {
      await Verification.findOneAndDelete({ userId });
      await Users.findOneAndDelete({ _id: userId });
      return res.redirect(`/users/verified?status=error&message=Verification token has expired.`);
    }

    const isMatch = await comparePassword(token, hashedToken);

    if (!isMatch) {
      return res.redirect(`/users/verified?status=error&message=Verification failed or link is invalid`);
    }

    await Users.findOneAndUpdate({ _id: userId }, { verified: true });
    await Verification.findOneAndDelete({ userId });
    return res.redirect(`/users/verified?status=success&message=Email verified successfully`);

  } catch (error) {
    console.log(error);
    return res.redirect(`/users/verified?message=`);
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found!",
      });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "PENDING",
          message: "Reset password link has already been sent to your email.",
        });
      }
      await PasswordReset.findOneAndDelete({ email });
    }
    await resetPasswordLink(user, res); //send reset password link through email
    
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      const message = "Invalid password reset Link. Try again!";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    }

    const resetPassword = await PasswordReset.findOne({ userId });

    if (!resetPassword) {
      const message = "Invalid password reset Link. try again!";
      return res.redirect(
        `/users/resetpassword?status=error&message=${message}`
      );
    }

    const { expiresAt, token: resetToken } = resetPassword;

    if (expiresAt < Date.now()) {
      const message = "Reset password link has expired. Please try again!";
      res.redirect(`/users/resetPassword?status=error&message=${message}`);
    } else {
      const isMatch = await comparepassword(token, resetToken);

      if (!isMatch) {
        const message = "Invalid reset password link. Please try again!";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      } else {
        res.redirect(`/users/resetpassword?type=reset&id=${userId}`); //When correct, redirect to this
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const changePassword = async (req, res, next) => {
  
  try {
    const { userId, password } = req.body;
    const hashedPassword = await hashString(password);
    
    const user = await Users.findByIdAndUpdate(
      { _id: userId },
      { password: hashedPassword }
    );

    if (user) {
      await PasswordReset.findOneAndDelete({ userId });
      res.status(200).json({
        ok: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const user = await Users.findById(id ?? userId).populate({
      path: "friends",
      select: "-password",
    });

    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    }

    user.password = undefined;  //removing password

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, location, profileUrl, profession } = req.body; //input taken

    if (!(firstName || lastName || profession || location)) {
      next("Please provide all required fields");
      return;
    }

    const { userId } = req.body.user;
    const updatedUser = {
      firstName,
      lastName,
      location,
      profileUrl,
      profession,
      _id: userId,
    };
    const user = await Users.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });

    await user.populate({ path: "friends", select: "-password" });

    const token = createJWT(user?._id); //new token

    user.password = undefined;

    res.status(200).json({
      sucess: true,
      message: "User Profile updated successfully!",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const friendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { requestTo } = req.body;

    const requestExist = await FriendRequest.findOne({ //checking whether the request already exists or not
      requestFrom: userId,
      requestTo,
    });

    if (requestExist) {
      next("Friend request already sent.");
      return;
    }

    const accountExist = await FriendRequest.findOne({ //friend request sent from friend's side
      requestFrom: requestTo,
      requestTo: userId,
    });

    if (accountExist) {
      next("Friend Request already sent.");
      return;
    }

    const newRequest = await FriendRequest.create({
      requestFrom: userId,
      requestTo,
    });

    res.status(201).json({
      success: true,
      message: "Friend Request sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const request = await FriendRequest.find({  //fetchinng all the request with status "Pending"
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        path: "requestFrom",
        select: "firstName lastName profileUrl profession -password",
      })
      .limit(5)
      .sort({
        _id: -1,
      });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.body.user.userId;
    const { rid, status } = req.body;

    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      next("No friend Request Found.");
      return;
    }

    const newRequest = await FriendRequest.findByIdAndUpdate( //Status of request changes from frontend buttons
      { _id: rid },
      { requestStatus: status }
    );

    if (status === "Accepted") {

      const friend = await Users.findById(newRequest?.requestFrom);
      friend.friends.push(newRequest?.requestTo); //Friend list of "user" updated
      await friend.save();

      const user = await Users.findById(id);
      user.friends.push(newRequest?.requestFrom); //Friend list of "user friend" updated
      await user.save();

    }

    res.status(201).json({
      success: true,
      message: "Friend Request " + status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const profileViews = async (req, res, next) => {
  try {
    const { userId } = req.body.user;  //user
    const { id } = req.body;           //whose profile is viewed

    const user = await Users.findById(id);  //whose profile is viewed

    user.views.push(userId);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const friendSuggestion = async (req, res) => {
  try {
    const { userId } = req.body; 
    
    const queryFilter = {
      _id: { $ne: userId }, 
      friends: { $nin: [userId] }, 
    };

    const suggestedFriends = await Users.find(queryFilter)
      .limit(10)
      .select("firstName lastName profileUrl profession -password");

    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      message: error.message,
    });
  }
};
