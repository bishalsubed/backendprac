import mongoose from "mongoose";


const connectDb = async() => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected")
    } catch (error) {
        console.error(`MongoDb connection failed : ${error}`)
        process.exit(1)
    }
}

export default connectDb;