module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            badgeName: { type: String, required: [true, 'Why no title?'], unique:true },
            badgeIMG: {type:String, required: [true,'Why no IMG URL?']},
            pointsNedded: { type: Number, require: [true,'Why no Points?']},
            badgeEmotion:{type:String,require: [true,'Why no Emotion?']}
        },
        { timestamps: false,versionKey: false}
    );
    const Badge = mongoose.model("badges", schema);
    return Badge;
};
