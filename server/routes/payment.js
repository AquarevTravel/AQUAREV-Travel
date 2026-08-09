const express=require("express");
const router=express.Router();
const axios=require("axios");
router.post("/create",async(req,res)=>{
try{
const paymentData=req.body;
const response=await axios.post(
"https://pay.chargily.net/test/api/v2/checkouts",
{
amount:paymentData.amount,
currency:"dzd",
success_url:"http://localhost:3000/payment-success.html",
failure_url:"http://localhost:3000/payment-failed.html",
description:"AQUAREV Ferry Booking - "+paymentData.ferry,
metadata:{
bookingId:paymentData.bookingId,
route:paymentData.route,
paymentMethod:paymentData.paymentMethod
}
},
{
headers:{
Authorization:"Bearer "+process.env.CHARGILY_SECRET_KEY,
"Content-Type":"application/json"
}
}
);
res.json({
checkout_url:response.data.checkout_url
});
}catch(error){
console.error("CHARGILY ERROR:",error.response?.data||error.message);
res.status(500).json({
error:"Payment creation failed"
});
}
});
module.exports=router;