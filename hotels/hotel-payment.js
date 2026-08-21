
(function(){
"use strict";
const PAYMENT_API_URL="/api/payment/hotel";
const BOOKING_STORAGE_KEY="AQUAREV_HOTEL_BOOKING";
const CONFIRMATION_STORAGE_KEY="AQUAREV_HOTEL_BOOKING_CONFIRMATION";
const loadingState=document.getElementById("loadingState");
const paymentContent=document.getElementById("paymentContent");
const errorState=document.getElementById("errorState");
const errorMessage=document.getElementById("errorMessage");
const payButton=document.getElementById("payButton");
const paymentMessage=document.getElementById("paymentMessage");
const hotelImageElement=document.getElementById("hotelImage");
const hotelTypeElement=document.getElementById("hotelType");
const hotelNameElement=document.getElementById("hotelName");
const hotelNameSideElement=document.getElementById("hotelNameSide");
const destinationElement=document.getElementById("hotelDestination");
const checkInElement=document.getElementById("checkIn");
const checkOutElement=document.getElementById("checkOut");
const nightsElement=document.getElementById("nights");
const roomsElement=document.getElementById("rooms");
const guestsElement=document.getElementById("guests");
const referenceElement=document.getElementById("reference");
const totalAmountElement=document.getElementById("totalAmount");
const currencyElement=document.getElementById("currency");
const calculationElement=document.getElementById("calculation");
const guestNameElement=document.getElementById("guestName");
const guestEmailElement=document.getElementById("guestEmail");
const guestPhoneElement=document.getElementById("guestPhone");
const paymentMethods=document.querySelectorAll(".method");
function getNumber(value,fallback=0){
const number=Number(value);
return Number.isFinite(number)?number:fallback;
}
function getBooking(){
try{
const raw=sessionStorage.getItem(CONFIRMATION_STORAGE_KEY);
if(raw){
const confirmation=JSON.parse(raw);
if(confirmation&&typeof confirmation==="object"){
return confirmation;
}
}
}catch(error){
console.error("Erreur lecture confirmation:",error);
}
try{
const raw=sessionStorage.getItem(BOOKING_STORAGE_KEY);
if(raw){
const booking=JSON.parse(raw);
if(booking&&typeof booking==="object"){
return booking;
}
}
}catch(error){
console.error("Erreur lecture réservation:",error);
}
return null;
}
function formatPrice(value,currency){
return new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(getNumber(value))+" "+String(currency||"DZD").toUpperCase();
}
function formatAmount(value){
return new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(getNumber(value));
}
function formatDate(value){
if(!value)return"—";
const stringValue=String(value);
const date=new Date(stringValue.includes("T")?stringValue:stringValue+"T00:00:00");
if(Number.isNaN(date.getTime()))return stringValue;
return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(date);
}
function createBookingId(booking){
return String(booking.bookingId||booking.reference||booking.id||"").trim();
}
function getBookingAmount(booking){
return getNumber(booking.total??booking.amount??booking.finalPrice??booking.finalAmount??booking.pricing?.finalPriceDZD??booking.pricing?.totalDZD,0);
}
function getGuest(booking){
return booking.guest&&typeof booking.guest==="object"?booking.guest:{};
}
function getGuestName(booking){
const guest=getGuest(booking);
return String(guest.firstName&&guest.lastName?`${guest.firstName} ${guest.lastName}`:guest.firstName||guest.lastName||booking.guestName||booking.name||"Client AQUAREV").trim();
}
function getGuestEmail(booking){
const guest=getGuest(booking);
return String(guest.email||booking.email||"").trim();
}
function getGuestPhone(booking){
const guest=getGuest(booking);
return String(guest.phone||guest.phoneNumber||booking.phone||booking.phoneNumber||"").trim();
}
function showError(message){
if(loadingState)loadingState.classList.add("hidden");
if(paymentContent)paymentContent.classList.add("hidden");
if(errorState)errorState.classList.remove("hidden");
if(errorMessage)errorMessage.textContent=message;
}
function showPaymentPage(){
if(loadingState)loadingState.classList.add("hidden");
if(errorState)errorState.classList.add("hidden");
if(paymentContent)paymentContent.classList.remove("hidden");
}
function showMessage(message,type="error"){
if(!paymentMessage)return;
paymentMessage.textContent=message;
paymentMessage.className=`payment-message ${type}`;
paymentMessage.classList.remove("hidden");
}
function hideMessage(){
if(!paymentMessage)return;
paymentMessage.textContent="";
paymentMessage.className="payment-message hidden";
}
function setButtonLoading(isLoading){
if(!payButton)return;
if(isLoading){
payButton.disabled=true;
if(!payButton.dataset.originalHTML){
payButton.dataset.originalHTML=payButton.innerHTML;
}
payButton.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i><span>Préparation du paiement...</span>';
}else{
payButton.disabled=false;
if(payButton.dataset.originalHTML){
payButton.innerHTML=payButton.dataset.originalHTML;
}
}
}
function getSelectedPaymentMethod(){
const selected=document.querySelector(".method.active");
return selected?String(selected.dataset.method||"chargily"):"chargily";
}
function validateBooking(booking){
if(!booking)return"Impossible de récupérer les informations de votre réservation.";
const amount=getBookingAmount(booking);
if(amount<=0)return"Le montant de la réservation est invalide.";
const bookingId=createBookingId(booking);
if(!bookingId)return"Référence de réservation introuvable.";
const email=getGuestEmail(booking);
if(!email)return"Adresse e-mail du client introuvable.";
return"";
}
async function createPayment(booking){
const method=getSelectedPaymentMethod();
if(method!=="chargily"){
throw new Error("Cette méthode de paiement n'est pas encore disponible pour les réservations d'hôtel.");
}
const amount=getBookingAmount(booking);
const currency=String(booking.currency||"DZD").toUpperCase();
const name=getGuestName(booking);
const email=getGuestEmail(booking);
const bookingId=createBookingId(booking);
const response=await fetch(PAYMENT_API_URL,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
amount,
currency,
name,
email,
bookingId,
hotelName:booking.hotelName||booking.hotel?.name||booking.name||"Hôtel AQUAREV",
checkIn:booking.checkIn||"",
checkOut:booking.checkOut||"",
nights:getNumber(booking.nights,0),
rooms:getNumber(booking.rooms,1),
success_url:`${window.location.origin}/payment-success.html`,
failure_url:`${window.location.origin}/payment-failed.html`
})
});
const responseText=await response.text();

let data={};

try{
data=responseText?JSON.parse(responseText):{};
}catch(error){
console.error("PAYMENT SERVER RAW RESPONSE:",responseText);
console.error("PAYMENT SERVER STATUS:",response.status);
throw new Error(
`Réponse invalide du serveur de paiement (${response.status}).`
);
}
if(!response.ok||data.success===false){
throw new Error(data.error||data.message||"Impossible de créer le paiement.");
}
const checkoutUrl=data.checkout_url||data.checkoutUrl||data.url||data.payment_url;
if(!checkoutUrl){
throw new Error("L'URL de paiement n'a pas été fournie par le serveur.");
}
return{...data,checkoutUrl};
}
async function startPayment(){
hideMessage();
const booking=getBooking();
const validationError=validateBooking(booking);
if(validationError){
showMessage(validationError,"error");
return;
}
setButtonLoading(true);
try{
const payment=await createPayment(booking);
try{
sessionStorage.setItem(BOOKING_STORAGE_KEY,JSON.stringify({
...booking,
paymentPending:true,
paymentCreatedAt:new Date().toISOString(),
paymentCheckoutUrl:payment.checkoutUrl
}));
}catch(error){
console.warn("Impossible de sauvegarder l'état du paiement:",error);
}
window.location.href=payment.checkoutUrl;
}catch(error){
console.error("HOTEL PAYMENT ERROR:",error);
showMessage(error.message||"Une erreur est survenue lors de la préparation du paiement.","error");
setButtonLoading(false);
}
}
function displayBooking(booking){
const currency=String(booking.currency||"DZD").toUpperCase();
const amount=getBookingAmount(booking);
const hotelName=booking.hotelName||booking.hotel?.name||booking.name||"Hôtel AQUAREV";
const destination=booking.destination||booking.city||booking.hotel?.city||booking.hotel?.destination||booking.country||"Destination";
const hotelType=booking.hotelType||booking.type||booking.category||"HÔTEL";
const image=booking.hotelImage||booking.image||booking.imageUrl||booking.hotel?.image||"";
const nights=getNumber(booking.nights,0);
const rooms=getNumber(booking.rooms,1);
const adults=getNumber(booking.adults??booking.guests,1);
const children=getNumber(booking.children,0);
const reference=booking.reference||booking.bookingId||booking.id||"—";
if(hotelImageElement){
if(image){
hotelImageElement.src=image;
hotelImageElement.alt=hotelName;
hotelImageElement.style.display="";
}else{
hotelImageElement.removeAttribute("src");
hotelImageElement.alt=hotelName;
hotelImageElement.style.display="none";
}
}
if(hotelTypeElement)hotelTypeElement.textContent=String(hotelType).toUpperCase();
if(hotelNameElement)hotelNameElement.textContent=hotelName;
if(hotelNameSideElement)hotelNameSideElement.textContent=hotelName;
if(destinationElement)destinationElement.textContent=destination;
if(checkInElement)checkInElement.textContent=formatDate(booking.checkIn);
if(checkOutElement)checkOutElement.textContent=formatDate(booking.checkOut);
if(nightsElement)nightsElement.textContent=`${nights} nuit${nights>1?"s":""}`;
if(roomsElement)roomsElement.textContent=`${rooms} chambre${rooms>1?"s":""}`;
if(guestsElement){
let guests=`${adults} adulte${adults>1?"s":""}`;
if(children>0)guests+=` · ${children} enfant${children>1?"s":""}`;
guestsElement.textContent=guests;
}
if(referenceElement)referenceElement.textContent=reference;
if(totalAmountElement)totalAmountElement.textContent=formatAmount(amount);
if(currencyElement)currencyElement.textContent=currency;
if(calculationElement){
const parts=[];
if(nights>0)parts.push(`${nights} nuit${nights>1?"s":""}`);
if(rooms>0)parts.push(`${rooms} chambre${rooms>1?"s":""}`);
calculationElement.textContent=parts.length?parts.join(" · "):formatPrice(amount,currency);
}
if(guestNameElement)guestNameElement.textContent=getGuestName(booking);
if(guestEmailElement)guestEmailElement.textContent=getGuestEmail(booking)||"—";
if(guestPhoneElement)guestPhoneElement.textContent=getGuestPhone(booking)||"—";
}
function setupPaymentMethods(){
paymentMethods.forEach(method=>{
method.addEventListener("click",()=>{
paymentMethods.forEach(item=>item.classList.remove("active"));
method.classList.add("active");
hideMessage();
});
});
}
function init(){
const booking=getBooking();
if(!booking){
showError("Aucune réservation en attente de paiement n'a été trouvée.");
return;
}
const validationError=validateBooking(booking);
if(validationError){
showError(validationError);
return;
}
displayBooking(booking);
setupPaymentMethods();
showPaymentPage();
if(payButton)payButton.addEventListener("click",startPayment);
}
init();
})();
