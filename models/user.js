const mongoose = require('mongoose');


const userSchema= mongoose.Schema({
  firstName :{
    type: String,
    required: [true, 'First name is required'],
  },
  lastName:String,
      
  email:{
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password:{
    type: String,
    required: [true, 'Password is required']
  },
  
  favourites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'land'
  }]

});
module.exports= mongoose.model('User', userSchema);
