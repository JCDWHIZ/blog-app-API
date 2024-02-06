const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config()
app.use(express.json());
const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const postRoute = require('./routes/posts')
const categoryRoute = require('./routes/categories')
const multer = require('multer')


mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    // app.listen(5000, () => {
    //   console.log('Backend is running on port 8000');
    // });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


  const storage = multer.diskStorage({
    destination:(req, file, cb) =>{
      cb(null, 'images')
    },
    filename: (req, file, cb) => {
      cb(null, 'test.jpeg')
    },
  })


  const upload = multer({storage: storage})

  app.post('/api/upload', upload.single('file'), (req, res) =>{
    res.status(200).json('file has been uploaded')
  } )

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/posts', postRoute)
app.use('/api/category', categoryRoute)
app.listen(8000, () => {
    console.log('Backend is running on port 8000');
});