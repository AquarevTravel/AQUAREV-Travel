
(function(){
"use strict";

const DATA_URL="./data/hotels.json";

const loadingState=document.getElementById("loadingState");
const errorState=document.getElementById("errorState");
const errorMessage=document.getElementById("errorMessage");
const detailsPage=document.getElementById("detailsPage");

const hotelMainImage=document.getElementById("hotelMainImage");
const hotelName=document.getElementById("hotelName");
const hotelType=document.getElementById("hotelType");
const hotelStars=document.getElementById("hotelStars");
const hotelRating=document.getElementById("hotelRating");
const hotelDestination=document.getElementById("hotelDestination");
const hotelDescription=document.getElementById("hotelDescription");
const hotelServices=document.getElementById("hotelServices");
const hotelPrice=document.getElementById("hotelPrice");
const breadcrumbHotel=document.getElementById("breadcrumbHotel");
const stayHotelName=document.getElementById("stayHotelName");
const summaryCheckIn=document.getElementById("summaryCheckIn");
const summaryCheckOut=document.getElementById("summaryCheckOut");
const summaryGuests=document.getElementById("summaryGuests");
const bookingButton=document.getElementById("bookingButton");
const featuredBadge=document.getElementById("featuredBadge");

function escapeHTML(value){
return String(value??"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}

function getNumber(value,fallback=0){
const number=Number(value);
return Number.isFinite(number)?number:fallback;
}

function formatPrice(value,currency="DZD"){
return new Intl.NumberFormat("fr-FR",{
maximumFractionDigits:0
}).format(getNumber(value))+" "+currency;
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

function getHotelServices(hotel){
if(Array.isArray(hotel.services))return hotel.services;
if(Array.isArray(hotel.amenities))return hotel.amenities;
return [];
}

function starsHTML(stars){
let html="";
const total=Math.max(0,Math.min(5,Math.round(getNumber(stars))));
for(let i=0;i<5;i++){
html+=i<total?'<i class="fa-solid fa-star"></i>':'<i class="fa-regular fa-star"></i>';
}
return html;
}

function serviceLabel(service){
const labels={
wifi:"Wi-Fi",
breakfast:"Petit-déjeuner",
parking:"Parking",
pool:"Piscine",
spa:"Spa",
gym:"Salle de sport",
restaurant:"Restaurant",
bar:"Bar",
airConditioning:"Climatisation",
airportTransfer:"Transfert aéroport",
roomService:"Service en chambre",
};
return labels[String(service)]||String(service).replace(/[-_]/g," ");
}

function serviceIcon(service){
const icons={
wifi:"fa-wifi",
breakfast:"fa-mug-saucer",
parking:"fa-square-parking",
pool:"fa-person-swimming",
spa:"fa-spa",
gym:"fa-dumbbell",
restaurant:"fa-utensils",
bar:"fa-martini-glass-citrus",
airConditioning:"fa-snowflake",
airportTransfer:"fa-car",
roomService:"fa-bell-concierge"
};
return icons[String(service)]||"fa-check";
}

function renderServices(services){
if(!services.length){
hotelServices.innerHTML='<div class="service-item"><i class="fa-solid fa-check"></i><span>Services disponibles</span></div>';
return;
}
hotelServices.innerHTML=services.map(service=>`
<div class="service-item">
<i class="fa-solid ${escapeHTML(serviceIcon(service))}"></i>
<span>${escapeHTML(serviceLabel(service))}</span>
</div>
`).join("");
}

function getSearchData(){
try{
const raw=sessionStorage.getItem("AQUAREV_HOTEL_SEARCH");
if(!raw)return{};
const data=JSON.parse(raw);
return data&&typeof data==="object"?data:{};
}catch(error){
console.warn("AQUAREV_HOTEL_SEARCH invalide:",error);
return{};
}
}

function getUrlParameters(){
const params=new URLSearchParams(window.location.search);
return{
id:params.get("id")||params.get("hotelId")||"",
checkIn:params.get("checkIn")||"",
checkOut:params.get("checkOut")||"",
adults:params.get("adults")||"",
children:params.get("children")||"",
rooms:params.get("rooms")||"",
destination:params.get("destination")||""
};
}

function getBookingData(){
const search=getSearchData();
const url=getUrlParameters();

return{
checkIn:url.checkIn||search.checkIn||"",
checkOut:url.checkOut||search.checkOut||"",
adults:getNumber(url.adults||search.adults,2),
children:getNumber(url.children||search.children,0),
rooms:getNumber(url.rooms||search.rooms,1),
destination:url.destination||search.destination||""
};
}

function formatDate(dateValue){
if(!dateValue)return"À sélectionner";

const date=new Date(dateValue+"T00:00:00");

if(Number.isNaN(date.getTime()))return dateValue;

return new Intl.DateTimeFormat("fr-FR",{
day:"2-digit",
month:"2-digit",
year:"numeric"
}).format(date);
}

function updateSummary(booking){
summaryCheckIn.textContent=booking.checkIn?formatDate(booking.checkIn):"À sélectionner";
summaryCheckOut.textContent=booking.checkOut?formatDate(booking.checkOut):"À sélectionner";

let guests=`${booking.adults} Adulte${booking.adults>1?"s":""}`;

if(booking.children>0){
guests+=` · ${booking.children} Enfant${booking.children>1?"s":""}`;
}

guests+=` · ${booking.rooms} Chambre${booking.rooms>1?"s":""}`;

summaryGuests.textContent=guests;
}

function showError(message){
loadingState.classList.add("hidden");
detailsPage.classList.add("hidden");
errorState.classList.remove("hidden");

if(errorMessage)errorMessage.textContent=message;
}

function showPage(){
loadingState.classList.add("hidden");
errorState.classList.add("hidden");
detailsPage.classList.remove("hidden");
}

function findHotel(hotels,id){
const target=String(id||"").trim();

if(!target)return null;

return hotels.find(hotel=>String(hotel.id||hotel.hotelId||"").trim()===target)||null;
}

function createBookingPayload(hotel,booking){
return{
hotelId:String(hotel.id||hotel.hotelId||""),
hotelName:getHotelName(hotel),
destination:getHotelDestination(hotel),
city:hotel.city||"",
country:hotel.country||"",
type:getHotelType(hotel),
stars:getHotelStars(hotel),
rating:getHotelRating(hotel),
pricePerNight:getHotelPrice(hotel),
currency:getHotelCurrency(hotel),
image:getHotelImage(hotel),
services:getHotelServices(hotel),
checkIn:booking.checkIn||"",
checkOut:booking.checkOut||"",
adults:booking.adults,
children:booking.children,
rooms:booking.rooms,
destinationSearch:booking.destination||""
};
}

function saveBookingData(payload){
try{
sessionStorage.setItem("AQUAREV_HOTEL_BOOKING",JSON.stringify(payload));
return true;
}catch(error){
console.error("Impossible d'enregistrer la réservation:",error);
return false;
}
}

function goToBooking(hotel,booking){
const payload=createBookingPayload(hotel,booking);

saveBookingData(payload);

const params=new URLSearchParams();
params.set("hotelId",payload.hotelId);

if(payload.checkIn)params.set("checkIn",payload.checkIn);
if(payload.checkOut)params.set("checkOut",payload.checkOut);
params.set("adults",String(payload.adults));
params.set("children",String(payload.children));
params.set("rooms",String(payload.rooms));

window.location.href="./hotel-booking.html?"+params.toString();
}

async function loadHotel(){
const url=getUrlParameters();
const booking=getBookingData();

if(!url.id){
showError("Aucun hôtel n'a été sélectionné. Veuillez revenir à la liste des hôtels.");
return;
}

try{
const response=await fetch(DATA_URL,{cache:"no-store"});

if(!response.ok){
throw new Error("Impossible de charger la base des hôtels.");
}

const hotels=await response.json();

if(!Array.isArray(hotels)){
throw new Error("Le fichier hotels.json ne contient pas une liste valide.");
}

const hotel=findHotel(hotels,url.id);

if(!hotel){
showError("L'hôtel demandé n'existe pas dans la base des hôtels.");
return;
}

const name=getHotelName(hotel);
const destination=getHotelDestination(hotel);
const price=getHotelPrice(hotel);
const currency=getHotelCurrency(hotel);
const image=getHotelImage(hotel);
const stars=getHotelStars(hotel);
const rating=getHotelRating(hotel);
const type=getHotelType(hotel);

document.title=name+" - AQUAREV Travel";

hotelMainImage.src=image;
hotelMainImage.alt=name;
hotelMainImage.onerror=function(){
this.onerror=null;
this.src="./assets/images/hotels/(1).jpg";
};

hotelName.textContent=name;
hotelType.textContent=type==="resort"?"RESORT":type==="apartment"?"APPARTEMENT":type==="villa"?"VILLA":"HÔTEL";
hotelStars.innerHTML=starsHTML(stars);
hotelRating.textContent=rating>0?rating.toFixed(1):"—";
hotelDestination.textContent=destination;
hotelPrice.textContent=formatPrice(price,currency);
breadcrumbHotel.textContent=name;
stayHotelName.textContent=name;

hotelDescription.textContent=hotel.description||`Découvrez ${name}, situé à ${destination}. Cet établissement fait partie de la sélection AQUAREV Travel et vous permet de profiter d'un séjour confortable et adapté à vos besoins.`;

renderServices(getHotelServices(hotel));
updateSummary(booking);

if(hotel.featured){
featuredBadge.classList.remove("hidden");
}else{
featuredBadge.classList.add("hidden");
}

bookingButton.addEventListener("click",function(){
goToBooking(hotel,booking);
});

showPage();

}catch(error){
console.error("Erreur hotel-details:",error);
showError("Impossible de charger les informations de l'hôtel. Vérifiez que le fichier data/hotels.json est accessible.");
}
}

loadHotel();
})();
