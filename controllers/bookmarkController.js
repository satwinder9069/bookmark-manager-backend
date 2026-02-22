const Bookmark = require('../models/Bookmark');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require("../utils/ApiError");
const { normalizeUrl } = require('../utils/urlHelper');

//GET BOOKMARKS
const getBookmarks = asyncHandler(async (req, res) => {
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bookmarks = await Bookmark.find(
        { user: req.user.id },
        { name: 1, url: 1, tags: 1, isFavourite: 1 , createdAt: 1} // projection for faster response
    )
    .skip(skip)
    .limit(limit)
    .lean(); // FAST result

    const total = await Bookmark.countDocuments({user: req.user.id});

    res.status(200).json({
        success: true,
        count: bookmarks.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: bookmarks
    });
        
});

//POST/CREATE BOOKMARKS
const createBookmark = asyncHandler(async (req , res) => {
    let {name, url, description, notes, tags } = req.body;

    if (!name || !url) {
        res.status(400);
        throw new Error("Please add a name and URL");
    }

    url = normalizeUrl(url);

    const newBookmark = await Bookmark.create({
            user: req.user.id,
            name,
            url,
            description,
            notes,
            tags,
    });
    res.status(201).json({
        success: true,
        message: 'Bookmark created successfully',
        data: newBookmark
    });
});

//DELETE BOOKMARK
const deleteBookmark = asyncHandler(async (req, res) => {
    const bookmark = await Bookmark.findById(req.params.id);

    if(!bookmark) {
        res.status(404);
        throw new ApiError("Bookmark not found");
    }

    // checking ownership
    if(bookmark.user.toString() !== req.user.id){
        res.status(401);
        throw new Error("Not authorized to delete this bookmark")
    }

    await Bookmark.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Bookmark deleted',
        data: {}
    });

    
});

//UPDATE/PUT REQ BOOKMARK
const updateBookmark = asyncHandler(async (req, res) => {
    let { name, url, description, notes, tags, isFavourite } = req.body;
    
    const bookmark = await Bookmark.findById(req.params.id);

    if(!bookmark) {
        res.status(404);
        throw new Error("Bookmark not found");
    }

    if (bookmark.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("Not authorized to update this bookmark")
    }
    
    // normalize url if provided
    if (url) {
        url = normalizeUrl(url);
    }
    const updatedBookmark = await Bookmark.findByIdAndUpdate(
        req.params.id,
        { name , url, description, notes, tags, isFavourite },
        {new: true , runValidators: true}
    );
    res.status(200).json({
        success: true,
        message: 'Bookmark updated successfully',
        data: updatedBookmark
    });
});

module.exports = {
    getBookmarks,
    createBookmark,
    deleteBookmark,
    updateBookmark,
};