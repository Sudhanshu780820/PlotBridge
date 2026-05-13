const Home=require('../models/home');
const fs= require('fs');


  exports.getEditHome=(req, res, next)=>{
    const homeId =req.params.homeId;
    const editing= req.query.editing=== 'true';

    Home.findById(homeId).then(home =>{
      if(!home){
        console.log("Home not found for editing");
        return res.redirect("/host/host-home-list");
      }
      console.log(homeId, editing, home);
    res.render('host/edit-home',{
      home: home,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    
      pageTitle:'Edit your home', currentPage: 'host-homes',
      editing: editing
    }) ;
    });
    
  };

  exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;

  Home.findById(id)
    .then(home => {
      if (!home) return res.redirect("/host/host-home-list");

      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;

      // Replace image
      if (req.files && req.files.photo) {
        fs.unlink(home.photo, err => {
          if (err) console.log("Image delete error", err);
        });
        home.photo = req.files.photo[0].path;
      }

      // Replace PDF
      if (req.files && req.files.rules) {
        fs.unlink(home.rules, err => {
          if (err) console.log("PDF delete error", err);
        });
        home.rules = req.files.rules[0].path;
      }

      return home.save();
    })
    .then(() => res.redirect("/host/host-home-list"))
    .catch(err => console.log("Edit error", err));
 };


exports.postDeleteHome=(req,res, next)=>{
const homeId =req.params.homeId;
console.log("came to delete ", homeId);
Home.findByIdAndDelete(homeId).then(() => {
  res.redirect("/host/host-home-list");
}).catch((error) =>{
  console.log('Error while deleting', error);
});
};




