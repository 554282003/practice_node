const {Schema,model, default: mongoose} = require('mongoose')

const videoSchema = new Schema({
    videoFile : {
        type : String,
        required : true,
    },
    title : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    duration : {
        type : Number,
        required : true,
    },
    views : {
        type : Number,
        default : 0,
    },
    isPublished : {
        type : Number,
        default : 0,
    },
    owner :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
})

export const Video = model('Video',videoSchema)