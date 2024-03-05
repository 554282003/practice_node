const mongoose = require('mongoose');
const {DB_NAME} = require('../constant')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${conn.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error ",error);
        process.exit(1);
    }
}

module.exports = {connectDB};