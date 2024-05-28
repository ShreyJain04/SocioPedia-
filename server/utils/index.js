import bcrypt from 'bcryptjs';
import JWT from "jsonwebtoken";


//hashing password
export const hashString = async(useValue)=>{
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(useValue,salt);
    return hashedPassword;
}

//comparing password
export const comparepassword = async(userPassword, password)=>{
    const isMatch = await bcrypt.compare(userPassword,password);
    return isMatch;
}

//JWT token
export function createJWT(id){
    return JWT.sign({userID:id}, process.env.JWT_SECRET,{
        expiresIn:"1d",
    });
}