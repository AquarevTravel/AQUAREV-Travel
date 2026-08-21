
(function(){
"use strict";
const STORAGE_KEY="AQUAREV_HOTEL_BOOKING_CONFIRMATION";
const loadingState=document.getElementById("loadingState");
const errorState=document.getElementById("errorState");
const errorMessage=document.getElementById("errorMessage");
const confirmationContent=document.getElementById("confirmationContent");
const bookingReference=document.getElementById("bookingReference");
const copyReference=document.getElementById("copyReference");
const printButton=document.getElementById("printButton");
const pdfButton=document.getElementById("pdfButton");
const shareButton=document.getElementById("shareButton");
const actionStatus=document.getElementById("actionStatus");
const hotelImage=document.getElementById("hotelImage");
const hotelType=document.getElementById("hotelType");
const hotelName=document.getElementById("hotelName");
const hotelDestination=document.getElementById("hotelDestination");
const hotelStars=document.getElementById("hotelStars");
const hotelRating=document.getElementById("hotelRating");
const checkIn=document.getElementById("checkIn");
const checkOut=document.getElementById("checkOut");
const nights=document.getElementById("nights");
const guests=document.getElementById("guests");
const rooms=document.getElementById("rooms");
const guestName=document.getElementById("guestName");
const guestEmail=document.getElementById("guestEmail");
const guestPhone=document.getElementById("guestPhone");
const specialRequestBox=document.getElementById("specialRequestBox");
const specialRequest=document.getElementById("specialRequest");
const totalPrice=document.getElementById("totalPrice");
const currency=document.getElementById("currency");
const pricePerNight=document.getElementById("pricePerNight");
const priceCalculation=document.getElementById("priceCalculation");

let currentBooking=null;

function getStoredBooking(){
try{
const raw=sessionStorage.getItem(STORAGE_KEY);
if(!raw)return null;
const data=JSON.parse(raw);
return data&&typeof data==="object"?data:null;
}catch(error){
console.error("Erreur lecture confirmation:",error);
return null;
}
}

function getNumber(value,fallback=0){
const number=Number(value);
return Number.isFinite(number)?number:fallback;
}

function formatPrice(value,currencyValue="DZD"){
return new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(getNumber(value))+" "+currencyValue;
}

function parseDate(value){
if(!value)return null;
const date=new Date(String(value)+"T00:00:00");
return Number.isNaN(date.getTime())?null:date;
}

function formatDate(value){
const date=parseDate(value);
if(!date)return"—";
return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(date);
}

function starsHTML(stars){
let html="";
const total=Math.max(0,Math.min(5,Math.round(getNumber(stars))));
for(let i=0;i<5;i++){
html+=i<total?'<i class="fa-solid fa-star"></i>':'<i class="fa-regular fa-star"></i>';
}
return html;
}

function getTypeLabel(type){
const value=String(type||"hotel").toLowerCase();
if(value==="resort")return"RESORT";
if(value==="apartment")return"APPARTEMENT";
if(value==="villa")return"VILLA";
return"HÔTEL";
}

function showError(message){
if(loadingState)loadingState.classList.add("hidden");
if(confirmationContent)confirmationContent.classList.add("hidden");
if(errorState)errorState.classList.remove("hidden");
if(errorMessage)errorMessage.textContent=message;
}

function showContent(){
if(loadingState)loadingState.classList.add("hidden");
if(errorState)errorState.classList.add("hidden");
if(confirmationContent)confirmationContent.classList.remove("hidden");
}

function showActionStatus(message,type="success"){
if(!actionStatus)return;
actionStatus.textContent=message;
actionStatus.className=`action-status ${type}`;
actionStatus.classList.remove("hidden");
clearTimeout(showActionStatus.timer);
showActionStatus.timer=setTimeout(function(){
actionStatus.classList.add("hidden");
},3500);
}

function buildShareText(booking){
const bookingCurrency=booking.currency||"DZD";
return[
"AQUAREV Travel",
"Confirmation de réservation",
"",
`Référence : ${booking.reference||"—"}`,
`Hôtel : ${booking.hotelName||"—"}`,
`Destination : ${booking.destination||booking.city||booking.country||"—"}`,
`Arrivée : ${formatDate(booking.checkIn)}`,
`Départ : ${formatDate(booking.checkOut)}`,
`Nuits : ${getNumber(booking.nights,0)}`,
`Voyageurs : ${getNumber(booking.adults,1)} adulte(s)${getNumber(booking.children,0)>0?` · ${getNumber(booking.children,0)} enfant(s)`:""}`,
`Chambres : ${getNumber(booking.rooms,1)}`,
`Montant estimé : ${formatPrice(booking.total,bookingCurrency)}`,
"",
"AQUAREV Travel"
].join("\n");
}

async function copyText(text){
try{
await navigator.clipboard.writeText(text);
return true;
}catch(error){
const textarea=document.createElement("textarea");
textarea.value=text;
textarea.style.position="fixed";
textarea.style.opacity="0";
document.body.appendChild(textarea);
textarea.focus();
textarea.select();
let success=false;
try{
success=document.execCommand("copy");
}catch(copyError){
success=false;
}
textarea.remove();
return success;
}
}

async function copyBookingReference(){
if(!currentBooking||!currentBooking.reference)return;
const success=await copyText(currentBooking.reference);
showActionStatus(
success
?"Référence copiée dans le presse-papiers."
:"Impossible de copier la référence.",
success?"success":"error"
);
}

function printBooking(){
if(!currentBooking)return;
window.print();
}

function downloadPdf(){
if(!currentBooking)return;
showActionStatus("La fenêtre d'impression va s'ouvrir. Choisissez « Enregistrer au format PDF » pour télécharger votre réservation.","success");
setTimeout(function(){
window.print();
},250);
}

async function shareBooking(){
if(!currentBooking)return;
const shareText=buildShareText(currentBooking);
const shareData={
title:"Confirmation de réservation - AQUAREV Travel",
text:shareText,
url:window.location.href
};
if(navigator.share){
try{
await navigator.share(shareData);
return;
}catch(error){
if(error&&error.name==="AbortError")return;
}
}
const success=await copyText(shareText);
if(success){
showActionStatus("Les informations de réservation ont été copiées. Vous pouvez maintenant les coller dans Gmail, WhatsApp ou une autre application.","success");
}else{
showActionStatus("Le partage n'est pas disponible sur ce navigateur.","error");
}
}

function loadConfirmation(){
const booking=getStoredBooking();
if(!booking){
showError("Aucune réservation confirmée n'a été trouvée. Veuillez effectuer une nouvelle réservation.");
return;
}
currentBooking=booking;
document.title=`Confirmation ${booking.reference||""} - AQUAREV Travel`;
const bookingCurrency=booking.currency||"DZD";
const total=getNumber(booking.total,0);
const nightly=getNumber(booking.pricePerNight,0);
const bookingNights=getNumber(booking.nights,0);
const bookingAdults=Math.max(1,getNumber(booking.adults,1));
const bookingChildren=Math.max(0,getNumber(booking.children,0));
const bookingRooms=Math.max(1,getNumber(booking.rooms,1));
if(bookingReference)bookingReference.textContent=booking.reference||"—";
if(hotelImage){
hotelImage.src=booking.image||"./assets/images/hotels/(1).jpg";
hotelImage.alt=booking.hotelName||"Hôtel AQUAREV";
hotelImage.onerror=function(){
this.onerror=null;
this.src="./assets/images/hotels/(1).jpg";
};
}
if(hotelType)hotelType.textContent=getTypeLabel(booking.type);
if(hotelName)hotelName.textContent=booking.hotelName||"Hôtel AQUAREV";
if(hotelDestination)hotelDestination.textContent=booking.destination||booking.city||booking.country||"Destination";
if(hotelStars)hotelStars.innerHTML=starsHTML(booking.stars);
if(hotelRating)hotelRating.textContent=getNumber(booking.rating,0)>0?getNumber(booking.rating,0).toFixed(1):"—";
if(checkIn)checkIn.textContent=formatDate(booking.checkIn);
if(checkOut)checkOut.textContent=formatDate(booking.checkOut);
if(nights)nights.textContent=`${bookingNights} Nuit${bookingNights>1?"s":""}`;
if(guests){
let guestText=`${bookingAdults} Adulte${bookingAdults>1?"s":""}`;
if(bookingChildren>0)guestText+=` · ${bookingChildren} Enfant${bookingChildren>1?"s":""}`;
guests.textContent=guestText;
}
if(rooms)rooms.textContent=`${bookingRooms} Chambre${bookingRooms>1?"s":""}`;
const guest=booking.guest&&typeof booking.guest==="object"?booking.guest:{};
const fullName=[guest.firstName,guest.lastName].filter(Boolean).join(" ");
if(guestName)guestName.textContent=fullName||"—";
if(guestEmail)guestEmail.textContent=guest.email||"—";
if(guestPhone)guestPhone.textContent=guest.phone||"—";
if(booking.specialRequest&&String(booking.specialRequest).trim()){
if(specialRequest)specialRequest.textContent=booking.specialRequest;
if(specialRequestBox)specialRequestBox.classList.remove("hidden");
}else{
if(specialRequestBox)specialRequestBox.classList.add("hidden");
}
if(totalPrice)totalPrice.textContent=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(total);
if(currency)currency.textContent=bookingCurrency;
if(pricePerNight)pricePerNight.textContent=formatPrice(nightly,bookingCurrency);
if(priceCalculation)priceCalculation.textContent=`${bookingNights} nuit${bookingNights>1?"s":""} × ${bookingRooms} chambre${bookingRooms>1?"s":""}`;
showContent();
}

if(copyReference){
copyReference.addEventListener("click",copyBookingReference);
}

if(printButton){
printButton.addEventListener("click",printBooking);
}

if(pdfButton){
pdfButton.addEventListener("click",downloadPdf);
}

if(shareButton){
shareButton.addEventListener("click",shareBooking);
}

loadConfirmation();
})();
