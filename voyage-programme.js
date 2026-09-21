import {db} from "./firebase/firebase-config.js";
import {doc,getDoc} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const COLLECTION_NAME="organizedTrips";
const loading=document.getElementById("programLoading");
const errorBox=document.getElementById("programError");
const detail=document.getElementById("programDetail");
const mainImage=document.getElementById("programMainImage");
const programCountry=document.getElementById("programCountry");
const programTitle=document.getElementById("programTitle");
const programLocation=document.getElementById("programLocation");
const programStars=document.getElementById("programStars");
const programPrice=document.getElementById("programPrice");
const detailCountry=document.getElementById("detailCountry");
const detailCity=document.getElementById("detailCity");
const detailDeparture=document.getElementById("detailDeparture");
const detailReturn=document.getElementById("detailReturn");
const detailHotel=document.getElementById("detailHotel");
const detailStars=document.getElementById("detailStars");
const detailAddress=document.getElementById("detailAddress");
const hotelAddressBox=document.getElementById("hotelAddressBox");
const descriptionCard=document.getElementById("descriptionCard");
const programDescription=document.getElementById("programDescription");
const pdfProgramBox=document.getElementById("pdfProgramBox");
const pdfProgramButton=document.getElementById("pdfProgramButton");
const photosSection=document.getElementById("photosSection");
const photosGrid=document.getElementById("photosGrid");
const photoCount=document.getElementById("photoCount");
const videosSection=document.getElementById("videosSection");
const videosGrid=document.getElementById("videosGrid");
const videoCount=document.getElementById("videoCount");
const reserveButton=document.getElementById("reserveButton");
const bottomReserveButton=document.getElementById("bottomReserveButton");
const mobileMenuBtn=document.getElementById("mobileMenuBtn");
const mobileNav=document.getElementById("mobileNav");
const backTop=document.getElementById("backTop");
const currentYear=document.getElementById("currentYear");
const imageModal=document.getElementById("imageModal");
const imageModalClose=document.getElementById("imageModalClose");
const imageModalPrev=document.getElementById("imageModalPrev");
const imageModalNext=document.getElementById("imageModalNext");
const modalImage=document.getElementById("modalImage");
const modalCounter=document.getElementById("modalCounter");

let currentLanguage=localStorage.getItem("AQUAREV-language")||"fr";
let currentProgram=null;
let galleryImages=[];
let galleryIndex=0;

const translations={
fr:{
loading:"Chargement du programme...",
error:"Impossible de charger ce programme.",
notFound:"Programme introuvable.",
country:"Pays",
city:"Ville",
departure:"Départ",
returnDate:"Retour",
hotel:"Hôtel",
category:"Catégorie",
address:"Adresse de l'hôtel",
price:"Prix",
photos:"photos",
videos:"vidéos",
imageAlt:"Photo du programme"
},
en:{
loading:"Loading program...",
error:"Unable to load this program.",
notFound:"Program not found.",
country:"Country",
city:"City",
departure:"Departure",
returnDate:"Return",
hotel:"Hotel",
category:"Category",
address:"Hotel address",
price:"Price",
photos:"photos",
videos:"videos",
imageAlt:"Program photo"
},
ar:{
loading:"جاري تحميل البرنامج...",
error:"تعذر تحميل هذا البرنامج.",
notFound:"البرنامج غير موجود.",
country:"الدولة",
city:"المدينة",
departure:"تاريخ الذهاب",
returnDate:"تاريخ العودة",
hotel:"الفندق",
category:"التصنيف",
address:"عنوان الفندق",
price:"السعر",
photos:"صور",
videos:"فيديوهات",
imageAlt:"صورة البرنامج"
}
};

function t(key){
return translations[currentLanguage]?.[key]||translations.fr[key]||key;
}

function escapeHTML(value){
return String(value??"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}

function normalizeMedia(media){
if(!Array.isArray(media))return[];
return media.map(item=>{
if(typeof item==="string")return{url:item,name:""};
if(item&&typeof item==="object"){
return{
url:item.url||item.downloadURL||item.src||item.fileUrl||"",
name:item.name||item.originalName||item.fileName||""
};
}
return null;
}).filter(item=>item&&item.url);
}

function normalizePdf(pdf){
if(!pdf)return null;
if(typeof pdf==="string"){
return{url:pdf,name:"programme.pdf"};
}
if(typeof pdf==="object"&&pdf.url){
return{
url:pdf.url,
name:pdf.name||pdf.originalName||pdf.fileName||"programme.pdf"
};
}
return null;
}

function optimizeImageUrl(url){
if(!url)return"";
const imageUrl=String(url);
if(!imageUrl.includes("ik.imagekit.io"))return imageUrl;
if(imageUrl.includes("/tr:"))return imageUrl;
return imageUrl.replace(
"https://ik.imagekit.io/cqpxvyh61/",
"https://ik.imagekit.io/cqpxvyh61/tr:w-1200,q-80,fo-auto/"
);
}

function formatDate(value){
if(!value)return"—";
let raw=value;
if(typeof value==="object"&&value.seconds){
raw=new Date(Number(value.seconds)*1000);
}else if(typeof value==="object"&&value.toDate){
raw=value.toDate();
}
const date=raw instanceof Date?raw:new Date(`${raw}T00:00:00`);
if(Number.isNaN(date.getTime()))return escapeHTML(value);
return new Intl.DateTimeFormat(
currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-GB":"fr-FR",
{day:"2-digit",month:"long",year:"numeric"}
).format(date);
}

function formatPrice(value,currency){
if(value===null||value===undefined||value==="")return"—";
const number=Number(value);
if(Number.isNaN(number))return escapeHTML(value);
const formatted=new Intl.NumberFormat(
currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-US":"fr-FR"
).format(number);
return`${formatted} ${escapeHTML(currency||"DZD")}`;
}

function starsHTML(stars){
const count=Math.max(0,Math.min(5,Number(stars)||0));
if(!count)return"";
return`${"★".repeat(count)}${"☆".repeat(5-count)}`;
}

function getProgramId(){
const params=new URLSearchParams(window.location.search);
return params.get("id")||"";
}

function setLanguage(lang){
currentLanguage=["fr","en","ar"].includes(lang)?lang:"fr";
document.documentElement.lang=currentLanguage;
document.documentElement.dir=currentLanguage==="ar"?"rtl":"ltr";
document.querySelectorAll("[data-fr]").forEach(element=>{
const value=element.dataset[currentLanguage];
if(value!==undefined)element.textContent=value;
});
document.querySelectorAll(".language-btn").forEach(button=>{
button.classList.toggle("active",button.dataset.lang===currentLanguage);
});
localStorage.setItem("AQUAREV-language",currentLanguage);
if(currentProgram)renderProgram(currentProgram);
}

function setupLanguage(){
document.querySelectorAll(".language-btn").forEach(button=>{
button.addEventListener("click",()=>setLanguage(button.dataset.lang));
});
setLanguage(currentLanguage);
}

function showError(message){
if(loading){
loading.hidden=true;
loading.style.display="none";
}
if(detail){
detail.hidden=true;
detail.style.display="none";
}
if(errorBox){
errorBox.hidden=false;
errorBox.style.display="block";
errorBox.innerHTML=`<i class="fa-solid fa-triangle-exclamation"></i><p>${escapeHTML(message)}</p>`;
}
}

function showLoading(){
if(loading){
loading.hidden=false;
loading.style.display="flex";
}
if(detail){
detail.hidden=true;
detail.style.display="none";
}
if(errorBox){
errorBox.hidden=true;
errorBox.style.display="none";
}
}

function showDetail(){
if(loading){
loading.hidden=true;
loading.style.display="none";
}
if(errorBox){
errorBox.hidden=true;
errorBox.style.display="none";
}
if(detail){
detail.hidden=false;
detail.style.display="block";
}
}

function renderPhotos(images){
if(!photosSection||!photosGrid)return;

photosGrid.innerHTML="";

if(!images.length){
photosSection.hidden=true;
photosSection.style.display="none";
return;
}

images.forEach((image,index)=>{
const item=document.createElement("button");
item.type="button";
item.className="photo-item";
item.innerHTML=`
<img src="${escapeHTML(optimizeImageUrl(image.url))}" data-original="${escapeHTML(image.url)}" alt="${escapeHTML(image.name||`${t("imageAlt")} ${index+1}`)}" loading="lazy" decoding="async">
`;

const imageElement=item.querySelector("img");

imageElement.addEventListener("error",()=>{
const original=imageElement.dataset.original;
if(original&&imageElement.src!==original){
imageElement.src=original;
}
});

item.addEventListener("click",()=>{
openGallery(index);
});

photosGrid.appendChild(item);
});

photoCount.textContent=`${images.length} ${t("photos")}`;
photosSection.hidden=false;
photosSection.style.display="block";
}

function renderVideos(videos){
if(!videosSection||!videosGrid)return;

videosGrid.innerHTML="";

if(!videos.length){
videosSection.hidden=true;
videosSection.style.display="none";
return;
}

videos.forEach((video,index)=>{
const item=document.createElement("div");
item.className="video-item";

const title=video.name||`${t("videos")} ${index+1}`;

item.innerHTML=`
<video controls playsinline preload="metadata">
<source src="${escapeHTML(video.url)}">
</video>
<div class="video-caption">${escapeHTML(title)}</div>
`;

videosGrid.appendChild(item);
});

videoCount.textContent=`${videos.length} ${t("videos")}`;
videosSection.hidden=false;
videosSection.style.display="block";
}

function renderPdf(pdf){
if(!pdfProgramBox||!pdfProgramButton)return;

if(!pdf||!pdf.url){
pdfProgramBox.hidden=true;
pdfProgramBox.style.display="none";
pdfProgramButton.removeAttribute("href");
return;
}

pdfProgramButton.href=pdf.url;
pdfProgramButton.target="_blank";
pdfProgramButton.rel="noopener";
pdfProgramButton.setAttribute("aria-label",pdf.name||"Programme PDF");

pdfProgramBox.hidden=false;
pdfProgramBox.style.display="flex";
}

function renderProgram(program){
currentProgram=program;

const images=normalizeMedia(program.images);
const videos=normalizeMedia(program.videos);
const pdf=normalizePdf(program.pdf);

const country=program.country||"";
const city=program.city||"";
const hotel=program.hotel||"";
const address=program.hotelAddress||"";
const description=program.description||"";
const stars=program.hotelStars||0;
const price=formatPrice(program.price,program.currency);
const departure=formatDate(program.departureDate);
const returnDate=formatDate(program.returnDate);
const firstImage=images[0]?.url||"";

document.title=`AQUAREV Travel | ${city||country||"Programme touristique"}`;

programCountry.textContent=country||"AQUAREV Travel";
programTitle.textContent=program.title||city||country||"Programme touristique";
programLocation.textContent=city?city:country;
programStars.textContent=starsHTML(stars);
programPrice.textContent=price;

detailCountry.textContent=country||"—";
detailCity.textContent=city||"—";
detailDeparture.textContent=departure;
detailReturn.textContent=returnDate;
detailHotel.textContent=hotel||"—";
detailStars.textContent=stars?`${stars}/5`:"—";

if(address){
detailAddress.textContent=address;
hotelAddressBox.hidden=false;
}else{
hotelAddressBox.hidden=true;
}

if(description){
programDescription.textContent=description;
descriptionCard.hidden=false;
}else{
descriptionCard.hidden=true;
}

renderPdf(pdf);

const reservationUrl=`voyage-reservation.html?id=${encodeURIComponent(program.id)}`;

reserveButton.href=reservationUrl;
bottomReserveButton.href=reservationUrl;

if(firstImage){
mainImage.src=optimizeImageUrl(firstImage);
mainImage.dataset.original=firstImage;
mainImage.alt=images[0].name||program.title||"AQUAREV Travel";
mainImage.style.display="block";
mainImage.onerror=()=>{
const original=mainImage.dataset.original;
if(original&&mainImage.src!==original){
mainImage.src=original;
}
};
}else{
mainImage.removeAttribute("src");
mainImage.alt="AQUAREV Travel";
mainImage.style.display="none";
document.querySelector(".hero-media").innerHTML='<div style="height:100%;min-height:470px;display:flex;align-items:center;justify-content:center;color:#00b4d8;font-size:55px"><i class="fa-solid fa-plane-departure"></i></div>';
}

renderPhotos(images);
renderVideos(videos);
showDetail();
}

async function loadProgram(){
const programId=getProgramId();

if(!programId){
showError(t("notFound"));
return;
}

showLoading();

try{
const programRef=doc(db,COLLECTION_NAME,programId);
const snapshot=await getDoc(programRef);

if(!snapshot.exists()){
showError(t("notFound"));
return;
}

const data=snapshot.data();

if(data.published!==true||data.status==="deleted"){
showError(t("notFound"));
return;
}

renderProgram({
id:snapshot.id,
...data
});

}catch(error){
console.error("PROGRAM DETAIL LOAD ERROR:",error);
showError(t("error"));
}
}

function openGallery(index){
if(!currentProgram)return;

galleryImages=normalizeMedia(currentProgram.images);

if(!galleryImages.length)return;

galleryIndex=index;
updateGallery();
imageModal.classList.add("open");
document.body.style.overflow="hidden";
}

function updateGallery(){
if(!galleryImages.length)return;

const image=galleryImages[galleryIndex];

modalImage.src=optimizeImageUrl(image.url);
modalImage.alt=image.name||t("imageAlt");
modalImage.onerror=()=>{
if(modalImage.src!==image.url){
modalImage.src=image.url;
}
};

modalCounter.textContent=`${galleryIndex+1} / ${galleryImages.length}`;
}

function changeGallery(direction){
if(!galleryImages.length)return;

galleryIndex+=direction;

if(galleryIndex<0)galleryIndex=galleryImages.length-1;
if(galleryIndex>=galleryImages.length)galleryIndex=0;

updateGallery();
}

function closeGallery(){
if(!imageModal)return;
imageModal.classList.remove("open");
document.body.style.overflow="";
}

function setupGallery(){
imageModalClose?.addEventListener("click",closeGallery);
imageModalPrev?.addEventListener("click",()=>changeGallery(document.documentElement.dir==="rtl"?1:-1));
imageModalNext?.addEventListener("click",()=>changeGallery(document.documentElement.dir==="rtl"?-1:1));

imageModal?.addEventListener("click",event=>{
if(event.target===imageModal)closeGallery();
});
}

function setupMobileMenu(){
if(!mobileMenuBtn||!mobileNav)return;

mobileMenuBtn.addEventListener("click",()=>{
mobileNav.classList.toggle("open");
const icon=mobileMenuBtn.querySelector("i");
if(icon){
icon.className=mobileNav.classList.contains("open")
?"fa-solid fa-xmark"
:"fa-solid fa-bars";
}
});

mobileNav.querySelectorAll("a").forEach(link=>{
link.addEventListener("click",()=>{
mobileNav.classList.remove("open");
const icon=mobileMenuBtn.querySelector("i");
if(icon)icon.className="fa-solid fa-bars";
});
});
}

function setupBackTop(){
if(!backTop)return;

window.addEventListener("scroll",()=>{
backTop.classList.toggle("show",window.scrollY>450);
});

backTop.addEventListener("click",()=>{
window.scrollTo({
top:0,
behavior:"smooth"
});
});
}

document.addEventListener("keydown",event=>{
if(event.key==="Escape")closeGallery();

if(event.key==="ArrowRight"){
if(imageModal?.classList.contains("open")){
changeGallery(document.documentElement.dir==="rtl"?-1:1);
}
}

if(event.key==="ArrowLeft"){
if(imageModal?.classList.contains("open")){
changeGallery(document.documentElement.dir==="rtl"?1:-1);
}
}
});

window.addEventListener("storage",event=>{
if(event.key==="AQUAREV-language"&&event.newValue){
setLanguage(event.newValue);
}
});

if(currentYear){
currentYear.textContent=new Date().getFullYear();
}

setupLanguage();
setupMobileMenu();
setupGallery();
setupBackTop();
loadProgram();