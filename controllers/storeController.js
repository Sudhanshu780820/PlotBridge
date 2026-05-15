const Land=require('../models/home');
const User=require('../models/user');
const pathUtil = require('../Utils/pathUtil');
const fs = require('fs');
const Lead = require('../models/Lead');


exports.getAddLand=(req, res, next)=>{
    res.render('store/list-land', { pageTitle: 'List Your Land', currentPage: 'List Land', isLoggedIn: req.isLoggedIn, user: req.session.user });
};

exports.postAddLand = async (req, res, next) => {
  try {
     const { LandName, price, priceUnit, category, location, lat, lng, description, LandSize, sizeUnit } = req.body;


    if ( !req.files.photo ) {
      return res.status(400).send("File upload failed");
    }


    const photo = req.files.photo[0].path;
   

    const land = new Land({
            LandName,
            price,
            priceUnit,
            category,
            location,
            createdAt: new Date(), // Add this line to set the creation date
            lat: parseFloat(lat), // Ensure these are numbers
            lng: parseFloat(lng),
            description,
            LandSize,
            sizeUnit,
            host: req.session.user._id, // THIS IS THE MISSING LINK
            photo
        });

    await land.save();
    console.log("Home saved successfully");

    res.redirect("/browse");
  } catch (err) {
    console.log("Error while saving home:", err);
    res.status(500).send("Server error");
  }
};

exports.getIndex = (req, res, next) => {
    console.log("=== DEBUG ===");
    console.log("req.isLoggedIn:", req.isLoggedIn);
    console.log("req.session.isLoggedIn:", req.session.isLoggedIn);
    console.log("req.session.user:", req.session.user);
   
    
    Land.find().then(registeredLand => {
        res.render('store/mainpage', {
            registeredLand: registeredLand,
            pageTitle: 'Welcome to PlotBridge',
            currentPage: 'Index',
            isLoggedIn: req.isLoggedIn, // Use the middleware value
            user: req.session.user, // Direct from session
        });
    });
};



exports.getBrowse=exports.getHome=(req, res, next)=>{
Land.find().then(registeredLand=>{
    res.render('store/browsePlot', { 
      registeredLand:registeredLand, pageTitle:'browseland', currentPage: 'Browse' ,isLoggedIn: req.isLoggedIn,
    user: req.session.user,});
});
};

exports.getPlotDetails=(req, res, next)=>{
 const plotId= req.params.plotId;
  Land.findById(plotId).then(land =>{
  if (!land){
    console.log("Plot not found");
    res.redirect("/browse");
  }else{
  console.log("Plot Details found", land);
   res.render("store/landDetails",{
    land: land, pageTitle:'Plot details', currentPage: 'Browse' ,isLoggedIn: req.isLoggedIn,
    user: req.session.user,
 })
  }});
};

exports.postEnquiry = async (req, res) => {
    console.log("--- Enquiry Debug Start ---");
    console.log("Body:", req.body); // Checkpoint 1: Is data arriving?
    
    try {
        // 1. Check Login
        if (!req.session || !req.session.user) {
            console.log("Error: User not logged in");
            return res.status(401).json({ message: 'You must be logged in to enquire.' });
        }

        const { name, email, phone, message, landId } = req.body;

        // 2. Find the Land & Seller
        const targetLand = await Land.findById(landId);
        if (!targetLand) {
            console.log("Error: Land not found for ID:", landId);
            return res.status(404).json({ message: 'Property not found.' });
        }

        // 3. Identify Seller (Check if your model uses hostId or userId)
      const sellerId = targetLand.host; 

if (!sellerId) {
    console.log("Error: This land listing does not have a host assigned.");
    return res.status(500).json({ 
        message: 'Seller information missing. Please contact support.' 
    });
}

// 4. Create the Lead (Proceeds as normal)
const newLead = new Lead({
    landId: landId,
    buyerId: req.session.user._id,
    sellerId: sellerId,
    name: name,
    email: email,
    phone: phone,
    message: message
});

        await newLead.save();
        console.log("✅ Lead saved successfully!");
        res.status(200).json({ message: 'Enquiry sent! Check your messages for replies.' });

    } catch (err) {
        console.error("❌ DATABASE ERROR:", err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};
exports.getMessages = async (req, res) => {
    try {
        // CHECKPOINT 1: Is the user even logged in?
        if (!req.session.user) {
            console.log("Redirecting: No user session found.");
            return res.redirect('/login'); // Better to send them to login than home
        }

        const userId = req.session.user._id;

        // CHECKPOINT 2: Fetch the data
        const inboundEnquiries = await Lead.find({ sellerId: userId })
            .populate('landId') // Make sure this matches your 'land' model name
            .sort({ createdAt: -1 });

        const outboundEnquiries = await Lead.find({ buyerId: userId })
            .populate('landId')
            .sort({ createdAt: -1 });

        // CHECKPOINT 3: Render the page
        res.render('store/messages', { 
            inbound: inboundEnquiries, 
            outbound: outboundEnquiries,
            pageTitle: 'Notifications',
            isLoggedIn: req.session.isLoggedIn
        });

    } catch (err) {
        // THIS WILL PRINT THE ACTUAL ERROR IN YOUR TERMINAL
        console.error("❌ MESSAGES PAGE ERROR:", err);
        res.redirect('/'); 
    }
};

// Handle Seller's Reply
exports.postReply = async (req, res) => {
    try {
        const { leadId, replyMessage } = req.body;
        await Lead.findByIdAndUpdate(leadId, { 
            sellerReply: replyMessage,
            status: 'Replied'
        });
        res.redirect('/messages');
    } catch (err) {
        res.status(500).send("Error sending reply");
    }
};


exports.getProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.session.user._id;

        // 1. Count lands listed by this user
        const listCount = await Land.countDocuments({ host: userId });

        // 2. Count enquiries sent by this user
        const enquiryCount = await Lead.countDocuments({ buyerId: userId });

        res.render('store/profile', {
            user: req.session.user,
            listCount: listCount,
            enquiryCount: enquiryCount,
            pageTitle: 'My Profile',
            isLoggedIn: req.session.isLoggedIn
        });
    } catch (err) {
        console.error("Profile Error:", err);
        res.redirect('/');
    }
};