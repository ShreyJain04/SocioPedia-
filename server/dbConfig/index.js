import mongoose from "mongoose";

const dbConnection = async()=>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log("DB connection successfull!!");
    }catch(error){
        console.log("DB error : "+ error);
    }
}

export default dbConnection;