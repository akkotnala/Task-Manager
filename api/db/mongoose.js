// This file will handle connection logic to the MongoDB database

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager',{ useNewUrlParser: true, useUnifiedTopology: true }).then(() =>{
    console.log("connected to MongoDb Successfully");
}).catch((e) => {
    console.log("error while connecting to MongoDB");
    console.log(e);
});

//To prevent deprication warning 
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

module.exports={
    mongoose
};