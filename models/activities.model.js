module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            title: { type: String, required: [true, 'Why no Title?'], unique:[true, 'Activity already exist!']},
            level: {type:String, required: [true,'Why no IMG Level?']},
            questions: { type: Array, require: [true,'Why no Questions?']},
            caseIMG:{type:String,require: [true,'Why no caseIMG?']},
            description:{type:String,require: [true,'Why no Description?']},
            category:{type:String,require: [true,'Why no Category?']},
            author:{type:String,require: [true,'Why no Author?']},

        },
        { timestamps: false,versionKey: false}
    );
    const Activity = mongoose.model("activities", schema);
    return Activity;
};