
import {db,auth} from "./firebase/firebase-config.js";
import {collection,getDocs,query,where,doc,deleteDoc} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const COLLECTION_NAME="organizedTrips";
const ADMIN_EMAIL="agence.aquarev.travel@gmail.com";
const programsGrid=document.getElementById("programsGrid");
const programsStatus=document.getElementById("programsStatus");
const mobileMenuBtn=document.getElementById("mobileMenuBtn");
const mobileNav=document.getElementById("mobileNav");
const backTop=document.getElementById("backTop");
const currentYear=document.getElementById("currentYear");

let currentLanguage=localStorage.getItem("AQUAREV-language")||"fr";
let galleryImages=[];
let galleryIndex=0;
let currentUser=null;
let authReady=false;

const translations={
fr:{
loading:"Chargement des programmes...",
emptyTitle:"Aucun programme disponible",
emptyText:"Nos nouveaux programmes touristiques seront bientôt disponibles.",
error:"Impossible de charger les programmes. Veuillez réessayer plus tard.",
country:"Pays",
city:"Ville",
departure:"Départ",
returnDate:"Retour",
hotel:"Hôtel",
address:"Adresse",
price:"Prix",
priceFrom:"À partir de",
airline:"Compagnie aérienne",
flightType:"Vol",
direct:"Vol direct",
stopover:"Avec escale",
guide:"Guide",
withGuide:"Avec guide touristique",
withoutGuide:"Sans guide touristique",
additionalDates:"Dates de départ disponibles",
baggage:"Bagages",
bag:"bagage",
bags:"bagages",
kg:"kg",
viewPhotos:"Voir les photos",
viewVideos:"Voir les vidéos",
viewProgram:"Voir le programme",
downloadPdf:"Télécharger le programme",
reserve:"Réserver",
noPhotos:"Aucune photo",
noVideos:"Aucune vidéo",
program:"Programme",
videos:"vidéos",
photos:"photos",
contact:"Contacter l'agence",
days:"Séjour",
published:"Disponible",
deleteProgram:"Supprimer le programme",
deleteConfirm:"Voulez-vous vraiment supprimer ce programme ?",
deleteSuccess:"Programme supprimé avec succès.",
deleteError:"Impossible de supprimer ce programme."
},
en:{
loading:"Loading programs...",
emptyTitle:"No programs available",
emptyText:"Our new travel programs will be available soon.",
error:"Unable to load programs. Please try again later.",
country:"Country",
city:"City",
departure:"Departure",
returnDate:"Return",
hotel:"Hotel",
address:"Address",
price:"Price",
priceFrom:"From",
airline:"Airline",
flightType:"Flight",
direct:"Direct flight",
stopover:"With stopover",
guide:"Guide",
withGuide:"With tourist guide",
withoutGuide:"Without tourist guide",
additionalDates:"Available departure dates",
baggage:"Baggage",
bag:"bag",
bags:"bags",
kg:"kg",
viewPhotos:"View photos",
viewVideos:"View videos",
viewProgram:"View program",
downloadPdf:"Download program",
reserve:"Reserve",
noPhotos:"No photos",
noVideos:"No video",
program:"Program",
videos:"videos",
photos:"photos",
contact:"Contact the agency",
days:"Stay",
published:"Available",
deleteProgram:"Delete program",
deleteConfirm:"Do you really want to delete this program?",
deleteSuccess:"Program deleted successfully.",
deleteError:"Unable to delete program."
},
ar:{
loading:"جاري تحميل البرامج...",
emptyTitle:"لا توجد برامج متاحة",
emptyText:"ستتوفر برامجنا السياحية الجديدة قريبًا.",
error:"تعذر تحميل البرامج. يرجى المحاولة مرة أخرى لاحقًا.",
country:"الدولة",
city:"المدينة",
departure:"تاريخ الذهاب",
returnDate:"تاريخ العودة",
hotel:"الفندق",
address:"العنوان",
price:"السعر",
priceFrom:"ابتداءً من",
airline:"شركة الطيران",
flightType:"الرحلة",
direct:"رحلة مباشرة",
stopover:"مع توقف",
guide:"المرشد",
withGuide:"مع مرشد سياحي",
withoutGuide:"بدون مرشد سياحي",
additionalDates:"تواريخ الذهاب المتاحة",
baggage:"الأمتعة",
bag:"حقيبة",
bags:"حقائب",
kg:"كغ",
viewPhotos:"عرض الصور",
viewVideos:"عرض الفيديوهات",
viewProgram:"الإطلاع على البرنامج",
downloadPdf:"تحميل البرنامج",
reserve:"حجز",
noPhotos:"لا توجد صور",
noVideos:"لا يوجد فيديو",
program:"البرنامج",
videos:"فيديوهات",
photos:"صور",
contact:"تواصل مع الوكالة",
days:"الإقامة",
published:"متاح",
deleteProgram:"حذف البرنامج",
deleteConfirm:"هل تريد حقًا حذف البرنامج ؟",
deleteSuccess:"تم حذف البرنامج بنجاح.",
deleteError:"تعذر حذف البرنامج."
}
};

function getTranslation(key){
return translations[currentLanguage]?.[key]||translations.fr[key]||key;
}

function escapeHTML(value){
return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function isAdmin(){
return !!currentUser&&String(currentUser.email||"").toLowerCase()===ADMIN_EMAIL.toLowerCase();
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

if(authReady)loadPrograms();
}

function formatDate(value){
if(!value)return"—";
const date=new Date(`${value}T00:00:00`);
if(Number.isNaN(date.getTime()))return escapeHTML(value);
return new Intl.DateTimeFormat(currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-GB":"fr-FR",{day:"2-digit",month:"short",year:"numeric"}).format(date);
}

function calculateNights(start,end){
if(!start||!end)return"";
const first=new Date(`${start}T00:00:00`);
const last=new Date(`${end}T00:00:00`);
if(Number.isNaN(first.getTime())||Number.isNaN(last.getTime()))return"";
const difference=Math.round((last.getTime()-first.getTime())/(1000*60*60*24));
if(difference<0)return"";
return difference;
}

function formatPrice(value,currency){
if(value===null||value===undefined||value==="")return"—";
const number=Number(value);
if(Number.isNaN(number))return escapeHTML(value);
let formatted;
try{
formatted=new Intl.NumberFormat(currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-US":"fr-FR").format(number);
}catch{
formatted=number.toLocaleString();
}
return`${formatted} ${escapeHTML(currency||"DZD")}`;
}

function starsHTML(stars){
const count=Math.max(0,Math.min(5,Number(stars)||0));
if(!count)return"";
return`<div class="stars" aria-label="${count} stars">${"★".repeat(count)}${"☆".repeat(5-count)}</div>`;
}

function normalizeMedia(media){
if(!Array.isArray(media))return[];
return media.map(item=>{
if(typeof item==="string")return{url:item,name:""};
if(item&&typeof item==="object")return{url:item.url||item.downloadURL||item.src||"",name:item.name||item.originalName||""};
return null;
}).filter(item=>item&&item.url);
}

function normalizePdf(pdf){
if(!pdf)return null;
if(typeof pdf==="string")return{url:pdf,name:"program.pdf"};
if(typeof pdf==="object"&&pdf.url)return{url:pdf.url,name:pdf.name||pdf.originalName||"program.pdf"};
return null;
}

function normalizeDepartureDates(program){
let dates=[];

if(Array.isArray(program.departureDates)){
dates=program.departureDates.filter(Boolean);
}

if(!dates.length&&program.departureDate){
dates=[program.departureDate];
}

return[...new Set(dates)].sort();
}

function flightTypeHTML(value){
if(!value)return"";
const label=value==="direct"?getTranslation("direct"):value==="stopover"?getTranslation("stopover"):value;
return createInfoItem("fa-route",getTranslation("flightType"),label);
}

function guideHTML(value){
if(!value)return"";
const label=value==="with"?getTranslation("withGuide"):value==="without"?getTranslation("withoutGuide"):value;
return createInfoItem("fa-user-tie",getTranslation("guide"),label);
}

function baggageHTML(program){
const count=Number(program.baggageCount||0);
if(!count)return"";

const weights=[];

if(count>=1&&program.baggage1Weight!==null&&program.baggage1Weight!==undefined&&program.baggage1Weight!==""){
weights.push(`${escapeHTML(program.baggage1Weight)} ${escapeHTML(getTranslation("kg"))}`);
}

if(count>=2&&program.baggage2Weight!==null&&program.baggage2Weight!==undefined&&program.baggage2Weight!==""){
weights.push(`${escapeHTML(program.baggage2Weight)} ${escapeHTML(getTranslation("kg"))}`);
}

let label=count===1?getTranslation("bag"):getTranslation("bags");
let value=`${count} ${label}`;

if(weights.length)value+=` · ${weights.join(" + ")}`;

return createInfoItem("fa-suitcase-rolling",getTranslation("baggage"),value);
}

function additionalDatesHTML(program){
const dates=normalizeDepartureDates(program);

if(dates.length<=1)return"";

return`
<div class="additional-dates-box">
<div class="additional-dates-title"><i class="fa-solid fa-calendar-days"></i>${escapeHTML(getTranslation("additionalDates"))}</div>
<div class="additional-dates-list">
${dates.map(date=>`<span>${escapeHTML(formatDate(date))}</span>`).join("")}
</div>
</div>`;
}

function optimizeImageUrl(url){
if(!url)return"";

const imageUrl=String(url);

if(!imageUrl.includes("ik.imagekit.io"))return imageUrl;
if(imageUrl.includes("/tr:"))return imageUrl;

return imageUrl.replace("https://ik.imagekit.io/cqpxvyh61/","https://ik.imagekit.io/cqpxvyh61/tr:w-1200,q-80,fo-auto/");
}

function getFirstImage(program){
const images=normalizeMedia(program.images);
return images.length?images[0].url:"";
}

function createMedia(program){
const images=normalizeMedia(program.images);
const videos=normalizeMedia(program.videos);
const firstImage=getFirstImage(program);
const optimizedFirstImage=optimizeImageUrl(firstImage);

const mediaContent=firstImage
?`<img src="${escapeHTML(optimizedFirstImage)}" data-original-src="${escapeHTML(firstImage)}" alt="${escapeHTML(program.city||program.country||"AQUAREV Travel")}" loading="lazy" decoding="async">`
:`<div class="media-placeholder"><i class="fa-solid fa-plane-departure"></i></div>`;

let badges="";

if(images.length||videos.length){
const parts=[];

if(images.length)parts.push(`<i class="fa-solid fa-images"></i> ${images.length} ${getTranslation("photos")}`);
if(videos.length)parts.push(`<i class="fa-solid fa-video"></i> ${videos.length} ${getTranslation("videos")}`);

badges=`<div class="media-count">${parts.join(" · ")}</div>`;
}

return`<div class="program-media">${mediaContent}<div class="program-location"><i class="fa-solid fa-location-dot"></i>${escapeHTML(program.country||"")}${program.city?` · ${escapeHTML(program.city)}`:""}</div>${badges}</div>`;
}

function createInfoItem(icon,label,value){
return`<div class="info-item"><i class="fa-solid ${icon}"></i>${escapeHTML(label)}<strong>${escapeHTML(value||"—")}</strong></div>`;
}

function createAdminDeleteButton(program,card){
if(!isAdmin())return null;

const button=document.createElement("button");
button.type="button";
button.className="admin-delete-btn";
button.title=getTranslation("deleteProgram");
button.setAttribute("aria-label",getTranslation("deleteProgram"));
button.innerHTML='<i class="fa-solid fa-ellipsis-vertical"></i>';

button.addEventListener("click",async event=>{
event.preventDefault();
event.stopPropagation();

if(!isAdmin())return;

const confirmed=window.confirm(getTranslation("deleteConfirm"));
if(!confirmed)return;

button.disabled=true;

try{
await deleteDoc(doc(db,COLLECTION_NAME,program.id));
card.remove();

if(!programsGrid.querySelector(".program-card"))showEmptyState();

alert(getTranslation("deleteSuccess"));
}catch(error){
console.error("PROGRAM DELETE ERROR:",error);
button.disabled=false;
alert(getTranslation("deleteError"));
}
});

return button;
}

async function downloadPdfFile(url,fileName,button){
if(!url)return;

const originalText=button?.innerHTML||"";

if(button){
button.disabled=true;
button.innerHTML=`<i class="fa-solid fa-circle-notch fa-spin"></i>${escapeHTML(getTranslation("downloadPdf"))}`;
}

try{
const response=await fetch(url,{mode:"cors",credentials:"omit"});

if(!response.ok)throw new Error(`HTTP ${response.status}`);

const blob=await response.blob();
const blobUrl=URL.createObjectURL(blob);

const link=document.createElement("a");
link.href=blobUrl;
link.download=fileName||"programme.pdf";
link.style.display="none";

document.body.appendChild(link);
link.click();
link.remove();

setTimeout(()=>URL.revokeObjectURL(blobUrl),1000);
}catch(error){
console.warn("PDF DIRECT DOWNLOAD ERROR:",error);

const link=document.createElement("a");
link.href=url;
link.download=fileName||"programme.pdf";
link.target="_blank";
link.rel="noopener";
link.style.display="none";

document.body.appendChild(link);
link.click();
link.remove();
}finally{
if(button){
button.disabled=false;
button.innerHTML=originalText;
}
}
}

function createProgramCard(program){
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
const nights=calculateNights(program.departureDate,program.returnDate);
const departureDates=normalizeDepartureDates(program);
const airline=program.airline||"";

const card=document.createElement("article");
card.className="program-card";
card.dataset.programId=program.id;

card.innerHTML=`
${createMedia(program)}
<div class="program-body">
<h3 class="program-title">${escapeHTML(city||country||getTranslation("program"))}</h3>
<div class="program-subtitle"><i class="fa-solid fa-earth-europe"></i><span>${escapeHTML(country||"AQUAREV Travel")}</span>${nights!==""?`<span>• ${nights} ${getTranslation("days")}</span>`:""}</div>
<div class="info-grid">
${createInfoItem("fa-calendar-days",getTranslation("departure"),departure)}
${createInfoItem("fa-calendar-check",getTranslation("returnDate"),returnDate)}
${createInfoItem("fa-globe",getTranslation("country"),country)}
${createInfoItem("fa-city",getTranslation("city"),city)}
${airline?createInfoItem("fa-plane",getTranslation("airline"),airline):""}
${flightTypeHTML(program.flightType)}
${guideHTML(program.tourGuide)}
${baggageHTML(program)}
</div>
${departureDates.length>1?additionalDatesHTML(program):""}
${description?`<p class="program-description">${escapeHTML(description)}</p>`:""}
<div class="hotel-box">
<div class="hotel-name"><i class="fa-solid fa-hotel"></i><span>${escapeHTML(hotel||"—")}</span></div>
${starsHTML(stars)}
${address?`<div class="hotel-address"><i class="fa-solid fa-location-dot"></i>${escapeHTML(address)}</div>`:""}
<div class="price-box">
<div><div class="price-label">${escapeHTML(getTranslation("price"))}</div><div class="price"><span class="price-from">${escapeHTML(getTranslation("priceFrom"))}</span> ${price}</div></div>
<div class="currency">${escapeHTML(program.currency||"DZD")}</div>
</div>
<div class="program-primary-actions">
<a href="voyage-programme.html?id=${encodeURIComponent(program.id)}" class="card-btn program-view-btn" data-program-id="${escapeHTML(program.id)}"><i class="fa-solid fa-file-lines"></i>${escapeHTML(getTranslation("viewProgram"))}</a>
<a href="voyage-reservation.html?id=${encodeURIComponent(program.id)}" class="card-btn secondary program-reserve-btn" data-program-id="${escapeHTML(program.id)}"><i class="fa-solid fa-calendar-check"></i>${escapeHTML(getTranslation("reserve"))}</a>
</div>
${pdf?`<div class="program-pdf-action"><a href="${escapeHTML(pdf.url)}" class="card-btn pdf-btn" data-pdf-url="${escapeHTML(pdf.url)}" data-pdf-name="${escapeHTML(pdf.name||"programme.pdf")}"><i class="fa-solid fa-download"></i>${escapeHTML(getTranslation("downloadPdf"))}</a></div>`:""}
<div class="card-actions">
${images.length?`<button type="button" class="card-btn photo-btn"><i class="fa-solid fa-images"></i>${escapeHTML(getTranslation("viewPhotos"))}</button>`:`<button type="button" class="card-btn secondary" disabled><i class="fa-solid fa-image"></i>${escapeHTML(getTranslation("noPhotos"))}</button>`}
${videos.length?`<button type="button" class="card-btn secondary video-btn"><i class="fa-solid fa-video"></i>${escapeHTML(getTranslation("viewVideos"))}</button>`:""}
</div>
</div>
</div>`;

const deleteButton=createAdminDeleteButton(program,card);

if(deleteButton){
const media=card.querySelector(".program-media");
if(media)media.appendChild(deleteButton);
}

const photoButton=card.querySelector(".photo-btn");
const videoButton=card.querySelector(".video-btn");
const pdfButton=card.querySelector(".pdf-btn");

if(photoButton)photoButton.addEventListener("click",()=>openGallery(images));
if(videoButton)videoButton.addEventListener("click",()=>openVideo(videos));

if(pdfButton){
pdfButton.addEventListener("click",event=>{
event.preventDefault();
event.stopPropagation();

const url=pdfButton.dataset.pdfUrl;
const fileName=pdfButton.dataset.pdfName||"programme.pdf";

downloadPdfFile(url,fileName,pdfButton);
});
}

const cardImage=card.querySelector(".program-media img");

if(cardImage){
cardImage.addEventListener("error",()=>{
const originalUrl=cardImage.dataset.originalSrc;

if(originalUrl&&cardImage.src!==originalUrl){
cardImage.src=originalUrl;
return;
}

cardImage.replaceWith(Object.assign(document.createElement("div"),{
className:"media-placeholder",
innerHTML:'<i class="fa-solid fa-image"></i>'
}));
});
}

return card;
}

function sortPrograms(programs){
return programs.sort((a,b)=>{
const dateA=a.createdAt?.seconds?Number(a.createdAt.seconds):Date.parse(a.createdAt||"")||0;
const dateB=b.createdAt?.seconds?Number(b.createdAt.seconds):Date.parse(b.createdAt||"")||0;
return dateB-dateA;
});
}

async function loadPrograms(){
if(!programsGrid||!programsStatus)return;

programsStatus.style.display="flex";
programsStatus.innerHTML=`<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i></div><span>${escapeHTML(getTranslation("loading"))}</span>`;
programsGrid.innerHTML="";

try{
const programsQuery=query(collection(db,COLLECTION_NAME),where("published","==",true));
const snapshot=await getDocs(programsQuery);
const programs=[];

snapshot.forEach(documentSnapshot=>{
const data=documentSnapshot.data();
if(data.status==="deleted")return;
if(data.programType==="omra_hajj")return;
programs.push({id:documentSnapshot.id,...data});
});

sortPrograms(programs);
programsStatus.style.display="none";

if(!programs.length){
showEmptyState();
return;
}

const fragment=document.createDocumentFragment();

programs.forEach(program=>{
fragment.appendChild(createProgramCard(program));
});

programsGrid.appendChild(fragment);

}catch(error){
console.error("PUBLIC PROGRAMS LOAD ERROR:",error);
programsStatus.style.display="none";
programsGrid.innerHTML=`<div class="error-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${escapeHTML(getTranslation("error"))}</p></div>`;
}
}

function showEmptyState(){
programsGrid.innerHTML=`<div class="empty-state"><i class="fa-solid fa-suitcase-rolling"></i><h3>${escapeHTML(getTranslation("emptyTitle"))}</h3><p>${escapeHTML(getTranslation("emptyText"))}</p></div>`;
}

function createGalleryModal(){
if(document.getElementById("programGallery"))return;

const modal=document.createElement("div");
modal.id="programGallery";
modal.className="program-gallery";

modal.innerHTML=`
<div class="gallery-inner">
<button type="button" class="gallery-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
<button type="button" class="gallery-prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
<img class="gallery-image" src="" alt="AQUAREV Travel" loading="eager" decoding="async">
<button type="button" class="gallery-next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>
<div class="gallery-counter"></div>
</div>`;

document.body.appendChild(modal);

modal.querySelector(".gallery-close").addEventListener("click",closeGallery);
modal.querySelector(".gallery-prev").addEventListener("click",()=>changeGallery(-1));
modal.querySelector(".gallery-next").addEventListener("click",()=>changeGallery(1));

modal.addEventListener("click",event=>{
if(event.target===modal)closeGallery();
});
}

function openGallery(images){
if(!images.length)return;

createGalleryModal();
galleryImages=images;
galleryIndex=0;
updateGallery();

document.getElementById("programGallery").classList.add("open");
document.body.style.overflow="hidden";
}

function updateGallery(){
const modal=document.getElementById("programGallery");
if(!modal||!galleryImages.length)return;

const image=galleryImages[galleryIndex];
const imageElement=modal.querySelector(".gallery-image");
const counter=modal.querySelector(".gallery-counter");
const optimizedUrl=optimizeImageUrl(image.url);

imageElement.onerror=()=>{
if(imageElement.src!==image.url)imageElement.src=image.url;
else console.error("IMAGE LOAD ERROR:",image.url);
};

imageElement.src=optimizedUrl;
imageElement.alt=image.name||"AQUAREV Travel";
counter.textContent=`${galleryIndex+1} / ${galleryImages.length}`;
}

function changeGallery(direction){
if(!galleryImages.length)return;

galleryIndex+=direction;

if(galleryIndex<0)galleryIndex=galleryImages.length-1;
if(galleryIndex>=galleryImages.length)galleryIndex=0;

updateGallery();
}

function closeGallery(){
const modal=document.getElementById("programGallery");
if(modal)modal.classList.remove("open");
document.body.style.overflow="";
}

function createVideoModal(){
if(document.getElementById("programVideoModal"))return;

const modal=document.createElement("div");
modal.id="programVideoModal";
modal.className="video-modal";

modal.innerHTML=`
<button type="button" class="video-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
<video controls playsinline></video>`;

document.body.appendChild(modal);

modal.querySelector(".video-close").addEventListener("click",closeVideo);

modal.addEventListener("click",event=>{
if(event.target===modal)closeVideo();
});
}

function openVideo(videos){
if(!videos.length)return;

createVideoModal();

const modal=document.getElementById("programVideoModal");
const video=modal.querySelector("video");

video.src=videos[0].url;
modal.classList.add("open");
document.body.style.overflow="hidden";
video.play().catch(()=>{});
}

function closeVideo(){
const modal=document.getElementById("programVideoModal");
if(!modal)return;

const video=modal.querySelector("video");

video.pause();
video.removeAttribute("src");
video.load();

modal.classList.remove("open");
document.body.style.overflow="";
}

function setupLanguage(){
document.querySelectorAll(".language-btn").forEach(button=>{
button.addEventListener("click",()=>setLanguage(button.dataset.lang));
});
setLanguage(currentLanguage);
}

function setupMobileMenu(){
if(!mobileMenuBtn||!mobileNav)return;

mobileMenuBtn.addEventListener("click",()=>{
mobileNav.classList.toggle("open");

const icon=mobileMenuBtn.querySelector("i");

if(icon){
icon.className=mobileNav.classList.contains("open")?"fa-solid fa-xmark":"fa-solid fa-bars";
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
if(window.scrollY>450)backTop.classList.add("show");
else backTop.classList.remove("show");
});

backTop.addEventListener("click",()=>{
window.scrollTo({top:0,behavior:"smooth"});
});
}

onAuthStateChanged(auth,user=>{
currentUser=user||null;
authReady=true;
loadPrograms();
});

document.addEventListener("keydown",event=>{
if(event.key==="Escape"){
closeGallery();
closeVideo();
}

if(event.key==="ArrowRight"){
const gallery=document.getElementById("programGallery");

if(gallery?.classList.contains("open")){
changeGallery(document.documentElement.dir==="rtl"?-1:1);
}
}

if(event.key==="ArrowLeft"){
const gallery=document.getElementById("programGallery");

if(gallery?.classList.contains("open")){
changeGallery(document.documentElement.dir==="rtl"?1:-1);
}
}
});

window.addEventListener("storage",event=>{
if(event.key==="AQUAREV-language"&&event.newValue)setLanguage(event.newValue);
});

if(currentYear)currentYear.textContent=new Date().getFullYear();

setupLanguage();
setupMobileMenu();
setupBackTop();
