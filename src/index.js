require('dotenv').config()
const {connectDB} = require('./db/index')


connectDB()
.then(()=>{

})
.catch((err)=>{
    console.error("MongoDB connection failed!!",err);
});
