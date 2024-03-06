const {Schema,model, default: mongoose} = require('mongoose')
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')


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

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model('Video',videoSchema)