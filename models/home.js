const mongoose = require('mongoose');

const landSchema= mongoose.Schema({
  LandName :{
    type: String,
    required: true
  },
  price :{
    type: Number,
    required: false,
  },
  priceUnit:{
    type: String,
    required: true
  },
  category :{
    type: String,
    required: true
  },
  location: String, // Keep the text address
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  
  description :{
    type: String,
    required: true
  },
  LandSize:{
    type: String,
    required: true
  },
  sizeUnit:{
    type: String,
    required: true
  },
  
 
  photo: String,
  host: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
  
  
    
  
});

// homeSchema.pre('findOneAndDelete', async function(){
//   const homeId= this.getQuery()["_id"];
//   await favourite.deleteMany({houseId: homeId});
  
// });
module.exports= mongoose.model('land',landSchema);
