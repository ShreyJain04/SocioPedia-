import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { hashString } from "./index.js";
import Verification from "../models/EmailVerification.js";
import PasswordReset from "../models/passwordReset.js";


dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

export const sendVerificationEmail = async (user, res) => {
  const { _id, email, firstName } = user;

  const token = _id + uuidv4();

  const link = APP_URL + "/users/verify/" + _id + "/" + token;

  //mail options
  const mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">

      <h2>Hello ${firstName},</h2>
      
      <p>Welcome to our platform! Please click the button below to verify your email address:</p>
    
      <a href="${link}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Verify Email</a>
    
      <p>If you didn't create an account with us, you can safely ignore this email.</p>
    
      <p>Thanks,<br>
      SocioPedia</p>
      </div>`,
  };

  try {
    const hashedToken = await hashString(token);
    const newVerifiedEmail = await Verification.create({
      userId: _id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    if (newVerifiedEmail) {
      transporter.sendMail(mailOptions).then(() => {
        res.status(201).send({
          success: "PENDING",
          message:
            "Verification email has been sent to your account. Please Check your email for further instructions!",
        });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong!" });
  }
};


export const resetPasswordLink= async( user,res)=>{
  const {_id,email}= user;

  const token =_id + uuidv4(); 
  const link = APP_URL +"/users/reset-password/"+ _id +"/" +token ;

  const mailOptions ={
    from:AUTH_EMAIL,
    to:email,
    subject:"Password Reset",
    html:`<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;">
    Password reset link. Please click the link below to reset password.
   <br>
   <p style="font-size: 18px;"><b>This link expires in 10 minutes</b></p>
    <br>
   <a href=${link} style="color: #fff; padding: 10px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px; ">Reset Password</a>.
</p>`,
  }

  try{
    const hashedToken= await hashString(token);

    const resetEmail= await PasswordReset.create({
      userId: _id,
      email:email,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,     
    });

    if (resetEmail) {
      transporter
        .sendMail(mailOptions)
        .then(() => {
          res.status(201).send({
            success: "PENDING",
            message: "Password Reset Link has been sent to your account.",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: "Something went wrong" });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Something went wrong" });
  }
};