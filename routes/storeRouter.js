
const express=require('express');
const storeRouter=express.Router();

const storeController=require('../controllers/storeController');


storeRouter.get("/",storeController.getIndex);
storeRouter.get("/home",storeController.getHome);
storeRouter.get("/list-land",storeController.getAddLand);
storeRouter.post("/list-land",storeController.postAddLand);
storeRouter.get("/browse",storeController.getBrowse);
storeRouter.get("/plot/:plotId",storeController.getPlotDetails);
storeRouter.post("/enquire",storeController.postEnquiry);
storeRouter.get("/messages",storeController.getMessages);
storeRouter.post("/reply",storeController.postReply);
storeRouter.get("/profile",storeController.getProfile);

module.exports= storeRouter;