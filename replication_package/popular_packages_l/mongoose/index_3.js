// Import Mongoose
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/my_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Create a schema
const BlogPostSchema = new mongoose.Schema({
    author: mongoose.Schema.Types.ObjectId,
    title: String,
    body: String,
    date: { type: Date, default: Date.now }
});

// Middleware to ensure author is set
BlogPostSchema.pre('save', function(next) {
    if (!this.author) {
        this.author = mongoose.Types.ObjectId();
    }
    next();
});

// Create a model
const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

// Create and save a new blog post
const createAndSavePost = async () => {
    try {
        const newPost = new BlogPost({
            title: 'Introduction to Mongoose',
            body: 'Mongoose provides a straightforward, schema-based solution to model your application data.'
        });
        await newPost.save();
        console.log('New post saved');
    } catch (err) {
        console.error('Error saving post:', err);
    }
};

// Find and log all blog posts
const findAllPosts = async () => {
    try {
        const posts = await BlogPost.find({});
        console.log('All posts:', posts);
    } catch (err) {
        console.error('Error finding posts:', err);
    }
};

// Execute functions
createAndSavePost();
findAllPosts();
