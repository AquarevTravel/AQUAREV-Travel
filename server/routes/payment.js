const express=require("express");
const router=express.Router();
const axios=require("axios");

const SITE_URL=process.env.SITE_URL||"https://aquarev-travel-anfn.onrender.com";

router.post("/create",async(req,res)=>{
try{
const paymentData=req.body;

const response=await axios.post(
"https://pay.chargily.net/test/api/v2/checkouts",
{
amount:paymentData.amount,
currency:"dzd",
success_url:`${SITE_URL}/payment-success.html`,
failure_url:`${SITE_URL}/payment-failed.html`,
description:"AQUAREV Ferry Booking - "+(paymentData.ferry||"Ferry"),
metadata:{
bookingId:paymentData.bookingId||"",
route:paymentData.route||"",
paymentMethod:paymentData.paymentMethod||"gold-card"
}
},
{
headers:{
Authorization:"Bearer "+process.env.CHARGILY_SECRET_KEY,
"Content-Type":"application/json"
},
timeout:30000
}
);

const checkoutUrl=response.data?.checkout_url||response.data?.url;

console.log("CHARGILY CHECKOUT CREATED");
console.log("CHARGILY CHECKOUT URL:",checkoutUrl||"NOT PROVIDED");

if(!checkoutUrl){
throw new Error("Chargily did not return checkout URL");
}

res.json({
success:true,
checkout_url:checkoutUrl
});

}catch(error){
console.error("CHARGILY ERROR:",error.response?.data||error.message);

res.status(500).json({
success:false,
error:"Payment creation failed"
});
}
});

module.exports=router;