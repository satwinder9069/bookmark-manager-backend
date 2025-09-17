const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema (
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true,'Please add a name'],
        },
        url: {
            type: String,
            required: [true, 'Please add a url'],
        },
        description: {
            type: String,
        },
        notes: {
            type: String,
        },
        tags: {
            type: [String],
        },
        isFavourite: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }

);

module.exports = mongoose.model('Bookmark', BookmarkSchema);