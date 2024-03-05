require('dotenv').config()
const {connectDB} = require('./db/index')


<<<<<<< HEAD
connectDB()
.then(()=>{

})
.catch((err)=>{
    console.error("MongoDB connection failed!!",err);
});
=======
connectDB();
>>>>>>> fe0c9f17ce954d2687a9e9213c60f3d22e8cebc6
