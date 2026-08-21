"use strict";

const {createCheckout}=require("../chargily/chargily");

async function createHotelPayment(paymentData={}){
const amount=Number(paymentData.amount);
const currency=String(paymentData.currency||"DZD").toUpperCase();

if(!Number.isFinite(amount)||amount<=0){
throw new Error("Invalid hotel payment amount");
}

if(!["DZD","EUR"].includes(currency)){
throw new Error("Unsupported hotel payment currency: "+currency);
}

const bookingId=String(paymentData.bookingId||"").trim();

if(!bookingId){
throw new Error("Hotel booking reference is required");
}

const hotelName=String(
paymentData.hotelName||"Hôtel AQUAREV"
).trim();

const guestName=String(
paymentData.name||""
).trim();

const email=String(
paymentData.email||""
).trim();

const checkIn=String(
paymentData.checkIn||""
).trim();

const checkOut=String(
paymentData.checkOut||""
).trim();

const nights=Number(paymentData.nights||0);
const rooms=Number(paymentData.rooms||1);

const checkout=await createCheckout({
amount:amount,
currency:currency,
name:guestName,
email:email,
bookingType:"hotel",
bookingId:bookingId,
bookingReference:bookingId,
hotelName:hotelName,
route:checkIn&&checkOut
?`${checkIn} → ${checkOut}`
:"",
paymentType:"hotel",
description:`AQUAREV Hotel Booking - ${hotelName}`,
success_url:paymentData.success_url,
failure_url:paymentData.failure_url,
metadata:{
bookingType:"hotel",
bookingId:bookingId,
hotelName:hotelName,
guestName:guestName,
email:email,
checkIn:checkIn,
checkOut:checkOut,
nights:nights,
rooms:rooms,
originalAmount:amount,
originalCurrency:currency
}
});

return{
...checkout,
bookingId:bookingId,
bookingType:"hotel",
hotelName:hotelName
};
}

module.exports={
createHotelPayment
};