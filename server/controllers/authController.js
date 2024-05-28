import { comparepassword, createJWT, hashString } from "../utils/index.js";
import Users from "../models/User.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

// Register User
export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  //validate fields
  if (!(firstName || lastName || email || password)) {
    next("provide Required Fields!");
    return;
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      next("Email already exists");
      return;
    }

    const hashedPassword = await hashString(password);

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    //send email verification to user
    sendVerificationEmail(user, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: err.message });
  }
};

// Login User
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      next("Please provide user Credentials!");
      return;
    }

    const user = await Users.findOne({ email })
      .select("+password")
      .populate({
        path: "friends",
        select: "firstName lastName location profileUrl -password",
      });

    if (!user) {
      next("Invalid email or password");
      return;
    }

    if (!user?.verified) {
      next(
        "User email is not verified. Check your account and verify your email."
      );
      return;
    }

    //compare password
    const isMatch = await comparepassword(password, user?.password);

    if (!isMatch) {
      next("Invalid email or Password!");
      return;
    }

    user.password = undefined;
    const token = createJWT(user?._id);

    res.status(201).json({
      success: true,
      message: "Login Successfull",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
