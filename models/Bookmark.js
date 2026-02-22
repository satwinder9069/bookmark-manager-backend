const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema (
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
        },
        name: {
            type: String,
            required: [true,'Please add a name'],
            trim: true
        },
        url: {
            type: String,
            required: [true, 'Please add a url'],
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        notes: {
            type: String,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
            validate: { 
                validator: function(tags) {
                    return tags.every(tag => tag.trim().length > 0);
                },
                message: 'Tags cannot be empty strings'
            }
        },
        isFavourite: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }

);

BookmarkSchema.index({user: 1, isFavourite: 1});

BookmarkSchema.index({ user: 1, tags: 1});

module.exports = mongoose.model('Bookmark', BookmarkSchema);