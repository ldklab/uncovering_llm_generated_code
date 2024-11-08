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

// Use middleware to set an author to the blog post
BlogPostSchema.pre('save', function (next) {
    if(!this.author) {
        this.author = mongoose.Types.ObjectId();
    }
    next();
});

// Create a model from the schema
const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

// Create a new blog post
const newPost = new BlogPost({
    title: 'Introduction to Mongoose',
    body: 'Mongoose provides a straightforward, schema-based solution to model your application data.',
});

// Save the new blog post
newPost.save().then(() => {
    console.log('New post saved');
}).catch(err => {
    console.error('Error saving post:', err);
});

// Find all blog posts
BlogPost.find({}).then(posts => {
    console.log('All posts:', posts);
}).catch(err => {
    console.error('Error finding posts:', err);
});

