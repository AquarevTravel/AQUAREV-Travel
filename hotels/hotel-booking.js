
(function(){
"use strict";
const HOTEL_DATA_URL="./data/hotels.json";
const BOOKING_STORAGE_KEY="AQUAREV_HOTEL_BOOKING";
const CONFIRMATION_STORAGE_KEY="AQUAREV_HOTEL_BOOKING_CONFIRMATION";
const loadingState=document.getElementById("loadingState");
const errorState=document.getElementById("errorState");
const errorMessage=document.getElementById("errorMessage");
const bookingContent=document.getElementById("bookingContent");
const hotelImage=document.getElementById("hotelImage");
const hotelType=document.getElementById("hotelType");
const hotelName=document.getElementById("hotelName");
const hotelDestination=document.getElementById("hotelDestination");
const hotelStars=document.getElementById("hotelStars");
const hotelRating=document.getElementById("hotelRating");
const checkInInput=document.getElementById("checkIn");
const checkOutInput=document.getElementById("checkOut");
const adultsInput=document.getElementById("adults");
const childrenInput=document.getElementById("children");
const roomsInput=document.getElementById("rooms");
const firstNameInput=document.getElementById("firstName");
const lastNameInput=document.getElementById("lastName");
const emailInput=document.getElementById("email");
const phoneInput=document.getElementById("phone");
const specialRequestInput=document.getElementById("specialRequest");
const termsInput=document.getElementById("terms");
const formMessage=document.getElementById("formMessage");
const summaryCheckIn=document.getElementById("summaryCheckIn");
const summaryCheckOut=document.getElementById("summaryCheckOut");
const summaryNights=document.getElementById("summaryNights");
const summaryGuests=document.getElementById("summaryGuests");
const summaryRooms=document.getElementById("summaryRooms");
const pricePerNight=document.getElementById("pricePerNight");
const priceCurrency=document.getElementById("priceCurrency");
const priceCalculation=document.getElementById("priceCalculation");
const estimatedTotal=document.getElementById("estimatedTotal");
const confirmButton=document.getElementById("confirmButton");
function getNumber(value,fallback=0){
const number=Number(value);
return Number.isFinite(number)?number:fallback;
}
function getUrlParameters(){
const params=new URLSearchParams(window.location.search);
return{
hotelId:params.get("hotelId")||params.get("id")||"",
checkIn:params.get("checkIn")||"",
checkOut:params.get("checkOut")||"",
adults:params.get("adults")||"",
children:params.get("children")||"",
rooms:params.get("rooms")||""
};
}
function getStoredBooking(){
try{
const raw=sessionStorage.getItem(BOOKING_STORAGE_KEY);
if(!raw)return{};
const data=JSON.parse(raw);
return data&&typeof data==="object"?data:{};
}catch(error){
console.error("Erreur lecture réservation:",error);
return{};
}
}
function getBookingData(){
const stored=getStoredBooking();
const url=getUrlParameters();
return{
hotelId:url.hotelId||stored.hotelId||"",
checkIn:url.checkIn||stored.checkIn||"",
checkOut:url.checkOut||stored.checkOut||"",
adults:getNumber(url.adults||stored.adults,2),
children:getNumber(url.children||stored.children,0),
rooms:getNumber(url.rooms||stored.rooms,1)
};
}
function getHotelPrice(hotel){
if(hotel.price!==undefined)return getNumber(hotel.price);
if(hotel.pricePerNight!==undefined)return getNumber(hotel.pricePerNight);
if(hotel.pricing?.pricePerNight!==undefined)return getNumber(hotel.pricing.pricePerNight);
if(hotel.pricing?.amount!==undefined)return getNumber(hotel.pricing.amount);
return 0;
}
function getHotelCurrency(hotel){
return hotel.currency||hotel.pricing?.currency||"DZD";
}
function getHotelImage(hotel){
return hotel.image||hotel.mainImage||hotel.images?.[0]||"./assets/images/hotels/(1).jpg";
}
function getHotelName(hotel){
return hotel.name||hotel.hotelName||"Hôtel AQUAREV";
}
function getHotelDestination(hotel){
return hotel.destination||hotel.city||hotel.location?.city||hotel.location?.country||"Destination";
}
function getHotelType(hotel){
return hotel.type||hotel.hotelType||"hotel";
}
function getHotelStars(hotel){
return getNumber(hotel.stars??hotel.starRating??hotel.category,0);
}
function getHotelRating(hotel){
return getNumber(hotel.rating??hotel.reviewScore??hotel.reviews?.rating,0);
}
function formatPrice(value,currency="DZD"){
return new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(getNumber(value))+" "+currency;
}
function starsHTML(stars){
let html="";
const total=Math.max(0,Math.min(5,Math.round(getNumber(stars))));
for(let i=0;i<5;i++){
html+=i<total?'<i class="fa-solid fa-star"></i>':'<i class="fa-regular fa-star"></i>';
}
return html;
}
function parseDate(value){
if(!value)return null;
const date=new Date(String(value)+"T00:00:00");
if(Number.isNaN(date.getTime()))return null;
return date;
}
function formatDate(value){
const date=parseDate(value);
if(!date)return"—";
return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(date);
}
function calculateNights(checkIn,checkOut){
const start=parseDate(checkIn);
const end=parseDate(checkOut);
if(!start||!end)return 0;
const difference=end.getTime()-start.getTime();
const nights=Math.round(difference/86400000);
return nights>0?nights:0;
}
function setMinimumDates(){
if(!checkInInput||!checkOutInput)return;
const today=new Date();
const year=today.getFullYear();
const month=String(today.getMonth()+1).padStart(2,"0");
const day=String(today.getDate()).padStart(2,"0");
const todayValue=`${year}-${month}-${day}`;
checkInInput.min=todayValue;
checkOutInput.min=todayValue;
}
function updateCheckoutMinimum(){
if(!checkInInput||!checkOutInput)return;
if(checkInInput.value){
checkOutInput.min=checkInInput.value;
if(checkOutInput.value&&checkOutInput.value<=checkInInput.value){
checkOutInput.value="";
}
}
}
function getCurrentBookingData(hotel){
const checkIn=checkInInput?.value||"";
const checkOut=checkOutInput?.value||"";
const adults=Math.max(1,getNumber(adultsInput?.value,2));
const children=Math.max(0,getNumber(childrenInput?.value,0));
const rooms=Math.max(1,getNumber(roomsInput?.value,1));
const nights=calculateNights(checkIn,checkOut);
const price=getHotelPrice(hotel);
const currency=getHotelCurrency(hotel);
const total=price*nights*rooms;
return{
checkIn,
checkOut,
adults,
children,
rooms,
nights,
pricePerNight:price,
currency,
total
};
}
function updateSummary(hotel){
const booking=getCurrentBookingData(hotel);
if(summaryCheckIn){
summaryCheckIn.textContent=booking.checkIn?formatDate(booking.checkIn):"À sélectionner";
}
if(summaryCheckOut){
summaryCheckOut.textContent=booking.checkOut?formatDate(booking.checkOut):"À sélectionner";
}
if(summaryNights){
summaryNights.textContent=booking.nights>0?`${booking.nights} Nuit${booking.nights>1?"s":""}`:"—";
}
if(summaryGuests){
let guests=`${booking.adults} Adulte${booking.adults>1?"s":""}`;
if(booking.children>0){
guests+=` · ${booking.children} Enfant${booking.children>1?"s":""}`;
}
summaryGuests.textContent=guests;
}
if(summaryRooms){
summaryRooms.textContent=`${booking.rooms} Chambre${booking.rooms>1?"s":""}`;
}
if(pricePerNight){
pricePerNight.textContent=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(booking.pricePerNight);
}
if(priceCurrency){
priceCurrency.textContent=booking.currency;
}
if(priceCalculation){
if(booking.nights>0){
priceCalculation.textContent=`${formatPrice(booking.pricePerNight,booking.currency)} × ${booking.nights} nuit${booking.nights>1?"s":""} × ${booking.rooms} chambre${booking.rooms>1?"s":""}`;
}else{
priceCalculation.textContent="Sélectionnez vos dates";
}
}
if(estimatedTotal){
estimatedTotal.textContent=booking.nights>0?formatPrice(booking.total,booking.currency):"—";
}
return booking;
}
function fillBookingForm(booking){
if(checkInInput&&booking.checkIn){
checkInInput.value=booking.checkIn;
}
if(checkOutInput&&booking.checkOut){
checkOutInput.value=booking.checkOut;
}
if(adultsInput){
adultsInput.value=Math.max(1,booking.adults);
}
if(childrenInput){
childrenInput.value=Math.max(0,booking.children);
}
if(roomsInput){
roomsInput.value=Math.max(1,booking.rooms);
}
updateCheckoutMinimum();
}
function findHotel(hotels,id){
const target=String(id||"").trim();
if(!target)return null;
return hotels.find(hotel=>{
const hotelId=String(hotel.id||hotel.hotelId||"").trim();
return hotelId===target;
})||null;
}
function showPage(){
if(loadingState){
loadingState.classList.add("hidden");
}
if(errorState){
errorState.classList.add("hidden");
}
if(bookingContent){
bookingContent.classList.remove("hidden");
}
}
function showError(message){
if(loadingState){
loadingState.classList.add("hidden");
}
if(bookingContent){
bookingContent.classList.add("hidden");
}
if(errorState){
errorState.classList.remove("hidden");
}
if(errorMessage){
errorMessage.textContent=message;
}
}
function showFormMessage(message,type="error"){
if(!formMessage)return;
formMessage.textContent=message;
formMessage.className=`form-message ${type}`;
formMessage.classList.remove("hidden");
}
function hideFormMessage(){
if(!formMessage)return;
formMessage.textContent="";
formMessage.className="form-message hidden";
}
function validateBooking(booking){
if(!booking.checkIn){
return"Veuillez sélectionner une date d'arrivée.";
}
if(!booking.checkOut){
return"Veuillez sélectionner une date de départ.";
}
if(booking.nights<=0){
return"La date de départ doit être après la date d'arrivée.";
}
if(booking.adults<1){
return"Le nombre d'adultes doit être au minimum de 1.";
}
if(booking.rooms<1){
return"Le nombre de chambres doit être au minimum de 1.";
}
if(!firstNameInput?.value.trim()){
return"Veuillez saisir votre prénom.";
}
if(!lastNameInput?.value.trim()){
return"Veuillez saisir votre nom.";
}
if(!emailInput?.value.trim()){
return"Veuillez saisir votre adresse e-mail.";
}
if(!emailInput.checkValidity()){
return"Veuillez saisir une adresse e-mail valide.";
}
if(!phoneInput?.value.trim()){
return"Veuillez saisir votre numéro de téléphone.";
}
if(!termsInput?.checked){
return"Veuillez accepter les conditions de réservation.";
}
return"";
}
function createReference(){
const now=new Date();
const year=String(now.getFullYear()).slice(-2);
const month=String(now.getMonth()+1).padStart(2,"0");
const day=String(now.getDate()).padStart(2,"0");
const random=Math.floor(100000+Math.random()*900000);
return`AQV-${year}${month}${day}-${random}`;
}
function saveBooking(hotel,booking){
const payload={
reference:createReference(),
hotelId:String(hotel.id||hotel.hotelId||""),
hotelName:getHotelName(hotel),
destination:getHotelDestination(hotel),
city:hotel.city||"",
country:hotel.country||"",
type:getHotelType(hotel),
stars:getHotelStars(hotel),
rating:getHotelRating(hotel),
image:getHotelImage(hotel),
pricePerNight:booking.pricePerNight,
currency:booking.currency,
checkIn:booking.checkIn,
checkOut:booking.checkOut,
nights:booking.nights,
adults:booking.adults,
children:booking.children,
rooms:booking.rooms,
total:booking.total,
guest:{
firstName:firstNameInput?.value.trim()||"",
lastName:lastNameInput?.value.trim()||"",
email:emailInput?.value.trim()||"",
phone:phoneInput?.value.trim()||""
},
specialRequest:specialRequestInput?.value.trim()||"",
createdAt:new Date().toISOString()
};
try{
sessionStorage.setItem(CONFIRMATION_STORAGE_KEY,JSON.stringify(payload));
}catch(error){
console.error("Impossible d'enregistrer la confirmation:",error);
}
return payload;
}
function setButtonLoading(isLoading){
if(!confirmButton)return;
if(isLoading){
confirmButton.disabled=true;
confirmButton.dataset.originalHTML=confirmButton.innerHTML;
confirmButton.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i><span>Traitement...</span>';
}else{
confirmButton.disabled=false;
if(confirmButton.dataset.originalHTML){
confirmButton.innerHTML=confirmButton.dataset.originalHTML;
}
}
}
function submitBooking(hotel){
hideFormMessage();
const booking=updateSummary(hotel);
const validationError=validateBooking(booking);
if(validationError){
showFormMessage(validationError,"error");
return;
}
setButtonLoading(true);
setTimeout(()=>{
const savedBooking=saveBooking(hotel,booking);
try{
sessionStorage.setItem(BOOKING_STORAGE_KEY,JSON.stringify({
...savedBooking,
paymentPending:false
}));
}catch(error){
console.warn("Impossible de mettre à jour la réservation:",error);
}
window.location.href="./hotel-payment.html";
},500);
}
async function loadHotel(){
const booking=getBookingData();
if(!booking.hotelId){
showError("Aucun hôtel n'a été sélectionné. Veuillez revenir aux détails de l'hôtel.");
return;
}
try{
const response=await fetch(HOTEL_DATA_URL,{cache:"no-store"});
if(!response.ok){
throw new Error(`Erreur HTTP ${response.status}`);
}
const hotels=await response.json();
if(!Array.isArray(hotels)){
throw new Error("Le fichier hotels.json ne contient pas une liste valide.");
}
const hotel=findHotel(hotels,booking.hotelId);
if(!hotel){
showError("L'hôtel demandé n'existe pas dans la base des hôtels.");
return;
}
const name=getHotelName(hotel);
const destination=getHotelDestination(hotel);
const image=getHotelImage(hotel);
const stars=getHotelStars(hotel);
const rating=getHotelRating(hotel);
const type=getHotelType(hotel);
document.title=`Réserver ${name} - AQUAREV Travel`;
if(hotelImage){
hotelImage.src=image;
hotelImage.alt=name;
hotelImage.onerror=function(){
this.onerror=null;
this.src="./assets/images/hotels/(1).jpg";
};
}
if(hotelType){
hotelType.textContent=type==="resort"?"RESORT":type==="apartment"?"APPARTEMENT":type==="villa"?"VILLA":"HÔTEL";
}
if(hotelName){
hotelName.textContent=name;
}
if(hotelDestination){
hotelDestination.textContent=destination;
}
if(hotelStars){
hotelStars.innerHTML=starsHTML(stars);
}
if(hotelRating){
hotelRating.textContent=rating>0?rating.toFixed(1):"—";
}
fillBookingForm(booking);
updateSummary(hotel);
if(checkInInput){
checkInInput.addEventListener("change",function(){
updateCheckoutMinimum();
updateSummary(hotel);
hideFormMessage();
});
}
if(checkOutInput){
checkOutInput.addEventListener("change",function(){
updateSummary(hotel);
hideFormMessage();
});
}
if(adultsInput){
adultsInput.addEventListener("change",function(){
updateSummary(hotel);
});
}
if(childrenInput){
childrenInput.addEventListener("change",function(){
updateSummary(hotel);
});
}
if(roomsInput){
roomsInput.addEventListener("change",function(){
updateSummary(hotel);
});
}
if(confirmButton){
confirmButton.addEventListener("click",function(){
submitBooking(hotel);
});
}
setMinimumDates();
updateCheckoutMinimum();
updateSummary(hotel);
showPage();
}catch(error){
console.error("Erreur hotel-booking:",error);
showError("Impossible de charger les informations de l'hôtel. Vérifiez que le fichier data/hotels.json est accessible.");
}
}
loadHotel();
})();
