const mongoose = require("mongoose");

exports.connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}`,{
            dbName : "oAuth"
        }
        );
        console.log(`Database connected successfully on ${conn.connection.host}`)
    } catch (error) {
        console.log("Database not connected", error);
    }
}