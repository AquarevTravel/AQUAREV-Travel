import{auth,db}from"./firebase/firebase-config.js";
import{collection,addDoc,updateDoc,doc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import{onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const AGENCY_EMAIL="agence.aquarev.travel@gmail.com";
const COLLECTION_NAME="organizedTrips";

const form=document.getElementById("travelProgramForm");
const programPanel=document.getElementById("programPanel");
const authMessage=document.getElementById("authMessage");
const statusBox=document.getElementById("formStatus");
const submitBtn=document.getElementById("submitBtn");
const imagesInput=document.getElementById("images");
const videosInput=document.getElementById("videos");
const tripPdfInput=document.getElementById("tripPdf");
const imagePreview=document.getElementById("imagePreview");
const videoPreview=document.getElementById("videoPreview");
const pdfPreview=document.getElementById("pdfPreview");
const successModal=document.getElementById("successModal");
const closeSuccess=document.getElementById("closeSuccess");
const departureDate=document.getElementById("departureDate");
const returnDate=document.getElementById("returnDate");
const departureDatesList=document.getElementById("departureDatesList");
const addDepartureDateBtn=document.getElementById("addDepartureDateBtn");
const baggageCount=document.getElementById("baggageCount");
const baggageFields=document.getElementById("baggageFields");
const baggage2Field=document.getElementById("baggage2Field");
const baggage1Weight=document.getElementById("baggage1Weight");
const baggage2Weight=document.getElementById("baggage2Weight");

let currentUser=null;

function setLanguage(lang){
const safeLang=["fr","en","ar"].includes(lang)?lang:"fr";
document.documentElement.lang=safeLang;
document.documentElement.dir=safeLang==="ar"?"rtl":"ltr";
document.body.classList.toggle("rtl",safeLang==="ar");

document.querySelectorAll("[data-fr]").forEach(el=>{
const value=el.dataset[safeLang];
if(value!==undefined){
if(el.tagName==="INPUT"||el.tagName==="TEXTAREA")return;
el.textContent=value;
}
});

document.querySelectorAll("[data-placeholder-fr]").forEach(el=>{
const value=el.dataset[`placeholder${safeLang.toUpperCase()}`]||el.dataset.placeholderFr;
if(value!==undefined)el.placeholder=value;
});

document.querySelectorAll(".language-btn").forEach(btn=>{
btn.classList.toggle("active",btn.dataset.lang===safeLang);
});

localStorage.setItem("AQUAREV-language",safeLang);
}

document.querySelectorAll(".language-btn").forEach(btn=>{
btn.addEventListener("click",()=>setLanguage(btn.dataset.lang));
});

setLanguage(localStorage.getItem("AQUAREV-language")||"fr");

function showStatus(message,type=""){
if(!statusBox)return;
statusBox.textContent=message;
statusBox.className=`form-status ${type}`;
}

function formatFileSize(bytes){
if(bytes<1024)return`${bytes} B`;
if(bytes<1024*1024)return`${(bytes/1024).toFixed(1)} KB`;
return`${(bytes/(1024*1024)).toFixed(1)} MB`;
}

function renderImagePreview(){
imagePreview.innerHTML="";
[...imagesInput.files].forEach(file=>{
const reader=new FileReader();
reader.onload=e=>{
const img=document.createElement("img");
img.src=e.target.result;
img.alt=file.name;
img.title=`${file.name} - ${formatFileSize(file.size)}`;
imagePreview.appendChild(img);
};
reader.readAsDataURL(file);
});
}

function renderVideoPreview(){
videoPreview.innerHTML="";
[...videosInput.files].forEach(file=>{
const row=document.createElement("div");
row.className="video-file";
row.innerHTML=`<i class="fa-solid fa-video"></i><span>${file.name} (${formatFileSize(file.size)})</span>`;
videoPreview.appendChild(row);
});
}

function renderPdfPreview(){
pdfPreview.innerHTML="";
if(!tripPdfInput.files.length)return;

const file=tripPdfInput.files[0];
const row=document.createElement("div");
row.className="video-file";
row.innerHTML=`<i class="fa-solid fa-file-pdf"></i><span>${file.name} (${formatFileSize(file.size)})</span>`;
pdfPreview.appendChild(row);
}

function createDepartureDateRow(departureValue="",returnValue=""){
const row=document.createElement("div");
row.className="dynamic-date-row";
row.innerHTML=`
<div class="additional-date-field">
<label>Départ</label>
<input type="date" class="additional-departure-date" value="${departureValue}">
</div>
<div class="additional-date-field">
<label>Retour</label>
<input type="date" class="additional-return-date" value="${returnValue}">
</div>
<button type="button" class="remove-date-btn" aria-label="Remove date"><i class="fa-solid fa-xmark"></i></button>
`;

const departureInput=row.querySelector(".additional-departure-date");
const returnInput=row.querySelector(".additional-return-date");

departureInput.min=departureDate.value||"";
returnInput.min=departureValue||departureDate.value||"";

departureInput.addEventListener("change",()=>{
returnInput.min=departureInput.value||departureDate.value||"";

if(returnInput.value&&departureInput.value&&returnInput.value<departureInput.value){
returnInput.value="";
}
});

returnInput.addEventListener("change",()=>{
if(returnInput.value&&departureInput.value&&returnInput.value<departureInput.value){
returnInput.value="";
}
});

row.querySelector(".remove-date-btn").addEventListener("click",()=>{
row.remove();
});

departureDatesList.appendChild(row);
}

if(addDepartureDateBtn){
addDepartureDateBtn.addEventListener("click",()=>{
createDepartureDateRow();
});
}

function getAdditionalDepartureDates(){
return[...document.querySelectorAll(".additional-departure-date")]
.map(input=>input.value)
.filter(Boolean);
}

function getAdditionalReturnDates(){
return[...document.querySelectorAll(".additional-return-date")]
.map(input=>input.value);
}

function getAdditionalDatePairs(){
return[...document.querySelectorAll(".dynamic-date-row")].map(row=>{
const departure=row.querySelector(".additional-departure-date")?.value||"";
const returnValue=row.querySelector(".additional-return-date")?.value||"";
return{
departureDate:departure,
returnDate:returnValue
};
}).filter(item=>item.departureDate);
}

function updateBaggageFields(){
const count=Number(baggageCount.value||0);

if(count>=1){
baggageFields.classList.remove("hidden");
}else{
baggageFields.classList.add("hidden");
baggage2Field.classList.add("hidden");
baggage1Weight.value="";
baggage2Weight.value="";
return;
}

if(count>=2){
baggage2Field.classList.remove("hidden");
}else{
baggage2Field.classList.add("hidden");
baggage2Weight.value="";
}
}

if(baggageCount){
baggageCount.addEventListener("change",updateBaggageFields);
updateBaggageFields();
}

if(imagesInput){
imagesInput.addEventListener("change",()=>{
if(imagesInput.files.length>12){
showStatus("Maximum 12 images.","error");
imagesInput.value="";
imagePreview.innerHTML="";
return;
}
renderImagePreview();
});
}

if(videosInput){
videosInput.addEventListener("change",()=>{
if(videosInput.files.length>5){
showStatus("Maximum 5 videos.","error");
videosInput.value="";
videoPreview.innerHTML="";
return;
}
renderVideoPreview();
});
}

if(tripPdfInput){
tripPdfInput.addEventListener("change",()=>{
if(tripPdfInput.files.length>1){
showStatus("Un seul fichier PDF est autorisé.","error");
tripPdfInput.value="";
pdfPreview.innerHTML="";
return;
}

if(tripPdfInput.files.length){
const file=tripPdfInput.files[0];
const isPdf=file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf");

if(!isPdf){
showStatus("Veuillez sélectionner un fichier PDF.","error");
tripPdfInput.value="";
pdfPreview.innerHTML="";
return;
}

renderPdfPreview();
}
});
}

if(departureDate){
departureDate.addEventListener("change",()=>{
returnDate.min=departureDate.value;

document.querySelectorAll(".dynamic-date-row").forEach(row=>{
const additionalDeparture=row.querySelector(".additional-departure-date");
const additionalReturn=row.querySelector(".additional-return-date");

if(additionalDeparture){
additionalDeparture.min=departureDate.value||"";
}

if(additionalReturn){
additionalReturn.min=additionalDeparture?.value||departureDate.value||"";
}

if(additionalDeparture&&additionalDeparture.value&&additionalDeparture.value<departureDate.value){
additionalDeparture.value="";
if(additionalReturn){
additionalReturn.value="";
}
}

if(additionalReturn&&additionalReturn.value&&additionalDeparture?.value&&additionalReturn.value<additionalDeparture.value){
additionalReturn.value="";
}
});

if(returnDate.value&&returnDate.value<departureDate.value){
returnDate.value="";
}
});
}

function sanitizeFileName(name){
return name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]/g,"_");
}

async function getImageKitAuth(){
const response=await fetch("/api/imagekit-auth",{
method:"GET",
headers:{
"Accept":"application/json"
}
});

if(!response.ok){
let message="Impossible d'obtenir l'authentification ImageKit.";

try{
const errorData=await response.json();
if(errorData&&errorData.message)message=errorData.message;
}catch(error){
console.error("IMAGEKIT AUTH RESPONSE ERROR:",error);
}

throw new Error(message);
}

const authData=await response.json();

if(!authData||!authData.token||!authData.signature||!authData.expire||!authData.publicKey){
throw new Error("Réponse d'authentification ImageKit invalide.");
}

return authData;
}

async function uploadFileToImageKit(file,programId,type,index,total){
try{
let uploadLabel="";

if(type==="images"){
uploadLabel=`Téléversement de l'image ${index+1}/${total}...`;
}else if(type==="videos"){
uploadLabel=`Téléversement de la vidéo ${index+1}/${total}...`;
}else if(type==="pdf"){
uploadLabel="Téléversement du PDF...";
}

showStatus(uploadLabel);

const authData=await getImageKitAuth();
const safeName=sanitizeFileName(file.name);
const fileName=`${Date.now()}_${index}_${safeName}`;
const folder=`/organizedTrips/${programId}/${type}`;
const formData=new FormData();

formData.append("file",file);
formData.append("fileName",fileName);
formData.append("publicKey",authData.publicKey);
formData.append("signature",authData.signature);
formData.append("expire",String(authData.expire));
formData.append("token",authData.token);
formData.append("folder",folder);
formData.append("useUniqueFileName","false");

const response=await fetch("https://upload.imagekit.io/api/v1/files/upload",{
method:"POST",
body:formData
});

let result=null;

try{
result=await response.json();
}catch(error){
console.error("IMAGEKIT JSON RESPONSE ERROR:",error);
}

if(!response.ok){
const errorMessage=result?.message||result?.help||`ImageKit upload failed with status ${response.status}.`;
throw new Error(errorMessage);
}

if(!result||!result.url){
throw new Error("ImageKit n'a pas retourné l'URL du fichier.");
}

return{
name:file.name,
url:result.url,
path:result.filePath||result.name||`${folder}/${fileName}`,
type:file.type,
size:file.size
};

}catch(error){
console.error(`IMAGEKIT UPLOAD ERROR (${type}):`,error);
throw new Error(`Erreur lors du téléversement de "${file.name}": ${error.message}`);
}
}

async function uploadFiles(files,programId,type){
const uploaded=[];

for(let index=0;index<files.length;index++){
const uploadedFile=await uploadFileToImageKit(
files[index],
programId,
type,
index,
files.length
);

uploaded.push(uploadedFile);
}

return uploaded;
}

function validateForm(){
const departure=departureDate.value;
const returnValue=returnDate.value;
const price=document.getElementById("price").value;
const additionalPairs=getAdditionalDatePairs();
const allDepartureDates=[
departure,
...additionalPairs.map(item=>item.departureDate)
];

if(!departure||!returnValue){
showStatus("Veuillez sélectionner les deux dates.","error");
return false;
}

if(returnValue<departure){
showStatus("La date de retour doit être après la date de départ.","error");
return false;
}

for(const pair of additionalPairs){
if(!pair.departureDate)continue;

if(!pair.returnDate){
showStatus("Veuillez sélectionner une date de retour pour chaque date de départ supplémentaire.","error");
return false;
}

if(pair.returnDate<pair.departureDate){
showStatus("Chaque date de retour doit être après sa date de départ.","error");
return false;
}

if(pair.departureDate<departure){
showStatus("Les autres dates de départ ne peuvent pas être avant la date principale.","error");
return false;
}
}

const duplicateDates=new Set(allDepartureDates);

if(duplicateDates.size!==allDepartureDates.length){
showStatus("Chaque date de départ doit être unique.","error");
return false;
}

const country=document.getElementById("country").value.trim();
const city=document.getElementById("city").value.trim();
const nights=document.getElementById("nights").value;
const meccaHotel=document.getElementById("meccaHotel").value.trim();
const meccaHotelStars=document.getElementById("meccaHotelStars").value;
const meccaHotelAddress=document.getElementById("meccaHotelAddress").value.trim();
const medinaHotel=document.getElementById("medinaHotel").value.trim();
const medinaHotelStars=document.getElementById("medinaHotelStars").value;
const medinaHotelAddress=document.getElementById("medinaHotelAddress").value.trim();
const description=document.getElementById("description").value.trim();

if(!country){
showStatus("Veuillez saisir le pays de destination.","error");
return false;
}

if(!city){
showStatus("Veuillez saisir la ville.","error");
return false;
}

if(!nights||Number(nights)<1){
showStatus("Veuillez saisir un nombre de nuits valide.","error");
return false;
}

if(!meccaHotel){
showStatus("Veuillez saisir le nom de l'hôtel à La Mecque.","error");
return false;
}

if(!meccaHotelStars){
showStatus("Veuillez sélectionner le nombre d'étoiles de l'hôtel à La Mecque.","error");
return false;
}

if(!meccaHotelAddress){
showStatus("Veuillez saisir l'adresse de l'hôtel à La Mecque.","error");
return false;
}

if(!medinaHotel){
showStatus("Veuillez saisir le nom de l'hôtel à Médine.","error");
return false;
}

if(!medinaHotelStars){
showStatus("Veuillez sélectionner le nombre d'étoiles de l'hôtel à Médine.","error");
return false;
}

if(!medinaHotelAddress){
showStatus("Veuillez saisir l'adresse de l'hôtel à Médine.","error");
return false;
}

if(price===""||Number(price)<0){
showStatus("Veuillez saisir un prix valide.","error");
return false;
}

const count=Number(baggageCount.value||0);

if(count>=1&&baggage1Weight.value!==""&&Number(baggage1Weight.value)<0){
showStatus("Veuillez saisir un poids valide pour le premier bagage.","error");
return false;
}

if(count>=2&&baggage2Weight.value!==""&&Number(baggage2Weight.value)<0){
showStatus("Veuillez saisir un poids valide pour le deuxième bagage.","error");
return false;
}

if(!description){
showStatus("Veuillez écrire la description du programme.","error");
return false;
}

if(imagesInput.files.length>12){
showStatus("Maximum 12 images.","error");
return false;
}

if(videosInput.files.length>5){
showStatus("Maximum 5 vidéos.","error");
return false;
}

if(tripPdfInput.files.length>1){
showStatus("Un seul fichier PDF est autorisé.","error");
return false;
}

if(tripPdfInput.files.length){
const pdfFile=tripPdfInput.files[0];
const isPdf=pdfFile.type==="application/pdf"||pdfFile.name.toLowerCase().endsWith(".pdf");

if(!isPdf){
showStatus("Veuillez sélectionner un fichier PDF valide.","error");
return false;
}
}

return true;
}

if(form){
form.addEventListener("submit",async event=>{
event.preventDefault();

if(!currentUser||!currentUser.email||currentUser.email.toLowerCase()!==AGENCY_EMAIL){
showStatus("Accès non autorisé.","error");
return;
}

if(!validateForm())return;

submitBtn.disabled=true;

try{
showStatus("Enregistrement du programme...");

const additionalPairs=getAdditionalDatePairs();

const departureDates=[
departureDate.value,
...additionalPairs.map(item=>item.departureDate)
];

const returnDates=[
returnDate.value,
...additionalPairs.map(item=>item.returnDate)
];

const baggageNumber=Number(baggageCount.value||0);

const programData={
programType:"omra_hajj",
programCategory:document.getElementById("programCategory").value||"",
packageType:document.getElementById("packageType").value||"",
departureDate:departureDate.value,
returnDate:returnDate.value,
departureDates:departureDates,
returnDates:returnDates,
departureReturnDates:additionalPairs,
country:document.getElementById("country").value.trim(),
city:document.getElementById("city").value.trim(),
secondCity:document.getElementById("secondCity").value.trim(),
nights:Number(document.getElementById("nights").value||0),
airline:document.getElementById("airline").value||"",
flightType:document.getElementById("flightType").value||"",
meccaHotel:document.getElementById("meccaHotel").value.trim(),
meccaHotelStars:document.getElementById("meccaHotelStars").value||"",
meccaHotelAddress:document.getElementById("meccaHotelAddress").value.trim(),
meccaHotelRoomType:document.getElementById("meccaHotelRoomType").value||"",
meccaHotelDistance:document.getElementById("meccaHotelDistance").value!==""?Number(document.getElementById("meccaHotelDistance").value):null,
medinaHotel:document.getElementById("medinaHotel").value.trim(),
medinaHotelStars:document.getElementById("medinaHotelStars").value||"",
medinaHotelAddress:document.getElementById("medinaHotelAddress").value.trim(),
medinaHotelRoomType:document.getElementById("medinaHotelRoomType").value||"",
medinaHotelDistance:document.getElementById("medinaHotelDistance").value!==""?Number(document.getElementById("medinaHotelDistance").value):null,
religiousGuide:document.getElementById("religiousGuide").value||"",
ziyarat:document.getElementById("ziyarat").value||"",
baggageCount:baggageNumber||null,
baggage1Weight:baggageNumber>=1&&baggage1Weight.value!==""?Number(baggage1Weight.value):null,
baggage2Weight:baggageNumber>=2&&baggage2Weight.value!==""?Number(baggage2Weight.value):null,
price:Number(document.getElementById("price").value),
currency:document.getElementById("currency").value||"DZD",
description:document.getElementById("description").value.trim(),
status:"published",
published:true,
createdBy:currentUser.uid,
createdByEmail:currentUser.email.toLowerCase(),
images:[],
videos:[],
pdf:null,
mediaCount:0,
createdAt:serverTimestamp()
};

const programRef=await addDoc(
collection(db,COLLECTION_NAME),
programData
);

console.log("OMRA/HAJJ PROGRAM CREATED:",programRef.id);

const imageFiles=[...imagesInput.files];
const videoFiles=[...videosInput.files];
const pdfFiles=[...tripPdfInput.files];

let images=[];
let videos=[];
let pdf=null;

if(imageFiles.length){
images=await uploadFiles(
imageFiles,
programRef.id,
"images"
);
}

if(videoFiles.length){
videos=await uploadFiles(
videoFiles,
programRef.id,
"videos"
);
}

if(pdfFiles.length){
const uploadedPdf=await uploadFiles(
pdfFiles,
programRef.id,
"pdf"
);

pdf=uploadedPdf[0]||null;
}

showStatus("Finalisation du programme...");

await updateDoc(
doc(db,COLLECTION_NAME,programRef.id),
{
images:images,
videos:videos,
pdf:pdf,
mediaCount:images.length+videos.length+(pdf?1:0),
published:true,
status:"published",
updatedAt:serverTimestamp()
}
);

console.log("OMRA/HAJJ PROGRAM PUBLISHED:",programRef.id);

form.reset();

if(imagePreview)imagePreview.innerHTML="";
if(videoPreview)videoPreview.innerHTML="";
if(pdfPreview)pdfPreview.innerHTML="";

if(departureDatesList){
departureDatesList.innerHTML="";
}

returnDate.min="";

baggageFields.classList.add("hidden");
baggage2Field.classList.add("hidden");

showStatus("Programme envoyé avec succès.","success");

if(successModal){
successModal.classList.remove("hidden");
}

setTimeout(()=>{
window.location.href="index.html#voyages";
},1800);

}catch(error){
console.error("OMRA/HAJJ PROGRAM SUBMISSION ERROR:",error);

let message="Une erreur est survenue. Vérifiez Firebase et réessayez.";

if(error&&error.message){
console.error("DETAIL:",error.message);

if(error.message.includes("permission-denied")){
message="Permission Firestore refusée. Vérifiez les règles Firestore.";
}else if(error.message.includes("Impossible d'obtenir l'authentification ImageKit")){
message=error.message;
}else if(error.message.includes("ImageKit")){
message=error.message;
}else if(error.message.includes("Erreur lors du téléversement")){
message=error.message;
}
}

showStatus(message,"error");

}finally{
submitBtn.disabled=false;
}
});
}

if(closeSuccess){
closeSuccess.addEventListener("click",()=>{
successModal.classList.add("hidden");
});
}

if(successModal){
successModal.addEventListener("click",event=>{
if(event.target===successModal){
successModal.classList.add("hidden");
}
});
}

onAuthStateChanged(auth,user=>{
currentUser=user;

const authorized=!!(
user&&
user.email&&
user.email.toLowerCase()===AGENCY_EMAIL
);

if(authorized){
authMessage.classList.add("hidden");
programPanel.classList.remove("hidden");
showStatus("Prêt à envoyer.");
}else{
programPanel.classList.add("hidden");
authMessage.classList.remove("hidden");
showStatus("Accès non autorisé.","error");
}
});