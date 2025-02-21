import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const dbConnection = await mongoose.connect(`${process.env.MONGODB_URI}`, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(
      `\nMongoDB connected ! DB host : ${dbConnection.connection.host}`
    );
  } catch (error) {
    console.log("MongoDb connection error", error);
    process.exit(1);
  }
};

export default connectDb;
