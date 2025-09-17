const Bookmark = require('../models/Bookmark');

//GET BOOKMARKS
const getBookmarks = async (req, res) => {
    try{
        const bookmarks = await Bookmark.find({user: req.user.id});
        res.status(200).json(bookmarks);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

//POST/CREATE BOOKMARKS
const createBookmark = async (req , res) => {
    let {name, url, description, notes, tags } = req.body;

    if (!name || !url) {
        return res.status(400).json({ message: 'Please add a name and URL.' });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }

    try {
        const newBookmark = await Bookmark.create({
            user: req.user.id,
            name,
            url,
            description,
            notes,
            tags,
        });
        console.log('New bookmark created:', newBookmark);
        res.status(201).json(newBookmark);
    } catch(error) {
         console.error('Server error during bookmark creation:', error);
        res.status(400).json({message: error.message})
    }
};
//DELETE BOOKMARK
const deleteBookmark = async (req, res) => {
    try {
        const bookmark = await Bookmark.findById(req.params.id);
        if(!bookmark) {
            return res.status(404).json({message: 'Bookmark not found'});
        }

        if(bookmark.user.toString() !== req.user.id){
            return res.status(401).json({message: 'Not authorized to delete this bookmark'});
        }

        await Bookmark.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Bookmark deleted'});
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

//UPDATE/PUT REQ BOOKMARK
const updateBookmark = async (req, res) => {
    console.log("Update bookmark request received");
    console.log("Request body:", req.body);
    let { name, url, description, notes, tags, isFavourite } = req.body;

    // Add https:// if it's not present
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }
    try {
        const bookmark = await Bookmark.findById(req.params.id);

        if(!bookmark) {
            return res.status(404).json({message: 'Bookmark not found'});
        }

        if (bookmark.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized to update this bookmark' });
        }
        
        const updatedBookmark = await Bookmark.findByIdAndUpdate(
            req.params.id,
            {user: req.user.id, name , url, description, notes, tags, isFavourite },
            {new: true , runValidators: true}
        );
        res.status(200).json(updatedBookmark);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

module.exports = {
    getBookmarks,
    createBookmark,
    deleteBookmark,
    updateBookmark,
};