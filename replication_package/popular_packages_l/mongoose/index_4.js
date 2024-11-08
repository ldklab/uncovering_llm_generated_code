// Import Mongoose
const mongoose = require('mongoose');

// Establish a connection to a MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/my_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define a schema for a BlogPost
const BlogPostSchema = new mongoose.Schema({
    author: mongoose.Schema.Types.ObjectId,  // Reference to an ObjectId for the author
    title: String,                          // Title of the blog post
    body: String,                           // Content of the blog post
    date: { type: Date, default: Date.now } // Date of creation, defaults to now
});

// Middleware function to automatically assign an ObjectId to the 'author' field if it's not set before saving the document
BlogPostSchema.pre('save', function (next) {
    if(!this.author) { // Check if the 'author' field is missing
        this.author = mongoose.Types.ObjectId(); // Auto-generate a new ObjectId for 'author'
    }
    next(); // Proceed with the next middleware/tool
});

// Create a Mongoose model using the schema defined
const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

// Create a new instance of BlogPost with a given title and body
const newPost = new BlogPost({
    title: 'Introduction to Mongoose',
    body: 'Mongoose provides a straightforward, schema-based solution to model your application data.',
});

// Save the new blog post document to the MongoDB collection
newPost.save().then(() => {
    console.log('New post saved'); // Log success message if save is successful
}).catch(err => {
    console.error('Error saving post:', err); // Log error message if there's an error
});

// Fetch all blog posts from the collection
BlogPost.find({}).then(posts => {
    console.log('All posts:', posts); // Log the fetched posts
}).catch(err => {
    console.error('Error finding posts:', err); // Log error if the find operation fails
});
