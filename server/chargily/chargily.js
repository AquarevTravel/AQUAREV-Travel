const axios=require("axios");
const CHARGILY_URL=process.env.CHARGILY_MODE==="test"?"https://pay.chargily.net/test/api/v2":"https://pay.chargily.net/api/v2";
const SITE_URL=process.env.SITE_URL||"https://aquarev-travel-anfn.onrender.com";

async function getLiveEurToDzdRate(){
try{
const response=await axios.get("https://open.er-api.com/v6/latest/EUR",{timeout:10000});
const rate=Number(response.data?.rates?.DZD);
if(!Number.isFinite(rate)||rate<=0)throw new Error("EUR/DZD exchange rate unavailable");
console.log("LIVE EUR/DZD RATE:",rate);
return rate;
}catch(error){
console.error("EXCHANGE RATE ERROR:",error.response?.data||error.message);
throw new Error("Unable to retrieve live EUR/DZD exchange rate");
}
}

async function createCheckout(paymentData){
try{
const originalAmount=Number(paymentData.amount);
const originalCurrency=String(paymentData.currency||"").toUpperCase();

if(!Number.isFinite(originalAmount)||originalAmount<=0){
throw new Error("Invalid payment amount");
}

let amountDZD;
let exchangeRate=null;

if(originalCurrency==="EUR"){
exchangeRate=await getLiveEurToDzdRate();
amountDZD=Math.round(originalAmount*exchangeRate);
}else if(originalCurrency==="DZD"){
amountDZD=Math.round(originalAmount);
}else{
throw new Error("Unsupported payment currency: "+originalCurrency);
}

const bookingId=paymentData.bookingId||"";
const bookingType=String(paymentData.bookingType||"ferry").toLowerCase();
const ferry=paymentData.ferry||"Ferry";
const hotelName=paymentData.hotelName||"Hôtel";
const route=paymentData.route||"";
const bookingReference=paymentData.bookingReference||paymentData.reference||"";

let description="";

if(bookingType==="hotel"){
description="AQUAREV Hotel Booking - "+hotelName;
}else{
description="AQUAREV Ferry Booking - "+ferry;
}

const checkoutData={
amount:amountDZD,
currency:"dzd",


success_url:paymentData.success_url||`${SITE_URL}/payment-success.html`,
failure_url:paymentData.failure_url||`${SITE_URL}/payment-failed.html`,


description:description,
metadata:{
bookingId:bookingId,
bookingType:bookingType,
bookingReference:bookingReference,
ferry:ferry,
hotelName:hotelName,
route:route,
originalAmount:originalAmount,
originalCurrency:originalCurrency,
paymentAmountDZD:amountDZD,
exchangeRate:exchangeRate
}
};

console.log("CHARGILY REQUEST:",checkoutData);

const response=await axios.post(
`${CHARGILY_URL}/checkouts`,
checkoutData,
{
headers:{
Authorization:`Bearer ${process.env.CHARGILY_SECRET_KEY}`,
"Content-Type":"application/json"
},
timeout:30000
}
);

const checkoutUrl=response.data?.checkout_url||response.data?.url;

console.log("CHARGILY CHECKOUT CREATED");
console.log("BOOKING TYPE:",bookingType);
console.log("BOOKING ID:",bookingId||"N/A");
console.log("BOOKING REFERENCE:",bookingReference||"N/A");
console.log("ORIGINAL AMOUNT:",originalAmount,originalCurrency);
console.log("EXCHANGE RATE:",exchangeRate||"N/A");
console.log("CHARGILY AMOUNT:",amountDZD,"DZD");
console.log("CHARGILY CHECKOUT URL:",checkoutUrl||"NOT PROVIDED");

if(!checkoutUrl){
throw new Error("Chargily did not return a checkout URL");
}

return{
...response.data,
checkout_url:checkoutUrl,
bookingType:bookingType,
bookingId:bookingId,
bookingReference:bookingReference,
amountDZD:amountDZD,
originalAmount:originalAmount,
originalCurrency:originalCurrency,
exchangeRate:exchangeRate
};

}catch(error){
console.error("CHARGILY ERROR:",error.response?.data||error.message);
throw error;
}
}

module.exports={
createCheckout
};