// Import Mongoose
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/my_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define a blog post schema
const blogPostSchema = new mongoose.Schema({
  author: mongoose.Schema.Types.ObjectId,
  title: String,
  body: String,
  date: { type: Date, default: Date.now }
});

// Pre-save middleware to ensure an author ObjectId
blogPostSchema.pre('save', function(next) {
  if (!this.author) {
    this.author = mongoose.Types.ObjectId();
  }
  next();
});

// Create the BlogPost model
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Instantiate a new blog post document
const newBlogPost = new BlogPost({
  title: 'Introduction to Mongoose',
  body: 'Mongoose provides a straightforward, schema-based solution to handle your application data.'
});

// Save the new blog post to the database
newBlogPost.save()
  .then(() => console.log('New post saved'))
  .catch(err => console.error('Error saving post:', err));

// Retrieve and log all blog posts from the database
BlogPost.find({})
  .then(posts => console.log('All posts:', posts))
  .catch(err => console.error('Error finding posts:', err));
