const menuItems=document.querySelectorAll(".menu-item");
const pages=document.querySelectorAll(".page-section");
const langButtons=document.querySelectorAll(".lang-btn");
const sidebar=document.getElementById("sidebar");
const mobileMenu=document.getElementById("mobileMenu");
const mobileOverlay=document.getElementById("mobileOverlay");
if(mobileMenu){

mobileMenu.addEventListener("click",()=>{

sidebar.classList.toggle("show");

mobileOverlay.classList.toggle("show");

});

}
let currentLanguage=localStorage.getItem("aquarevLanguage")||"fr";
let currentChatPartnerId = null;

function openPage(page){

console.log("OPEN PAGE START:",page);

pages.forEach(section=>{
section.classList.remove("active-page");
});

const target=document.getElementById(page+"Page");
console.log("PAGE TARGET:",target);
console.log("BEFORE CLASS:",target?.className);


console.log("TARGET FOUND:",target);

if(target){

target.classList.add("active-page");
console.log("AFTER CLASS:",target.className);

console.log("CLASS AFTER ADD:",target.className);

}

menuItems.forEach(item=>{

item.classList.remove("active");

if(item.dataset.page===page){
item.classList.add("active");
}

});

if(window.innerWidth<=900){
sidebar.classList.remove("show");
mobileOverlay.classList.remove("show");
}

}
if(mobileOverlay){
mobileOverlay.addEventListener("click",()=>{
sidebar.classList.remove("show");
mobileOverlay.classList.remove("show");
});
}
menuItems.forEach(item=>{

item.addEventListener("click",()=>{

const page=item.dataset.page;

console.log("CLICK PAGE:",page);

openPage(page);

});

});
function changeLanguage(lang){
currentLanguage=lang;
localStorage.setItem("aquarevLanguage",lang);
document.documentElement.lang=lang;
document.documentElement.dir=lang==="ar"?"rtl":"ltr";
document.querySelectorAll("[data-fr]").forEach(element=>{
const text=element.dataset[lang];
if(text){
element.textContent=text;
}
});
langButtons.forEach(button=>{
button.classList.remove("active");
if(button.dataset.lang===lang){
button.classList.add("active");
}
});
}
langButtons.forEach(button=>{
button.addEventListener("click",()=>{
changeLanguage(button.dataset.lang);
});
});
changeLanguage(currentLanguage);
const logoutBtn=document.getElementById("logoutBtn");
if(logoutBtn){
logoutBtn.addEventListener("click",async()=>{
try{
await signOut(auth);
localStorage.removeItem("aquarevUser");
window.location.href="../index.html";
}catch(error){
console.error("LOGOUT ERROR:",error);
}
});
}
import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getFirestore,collection,getDocs,doc,getDoc,updateDoc,onSnapshot,query,orderBy,addDoc,serverTimestamp,where}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import{getAuth,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const firebaseConfig={
apiKey:"AIzaSyAycKfhrRV8qcbhvwj0NV5iE_4zlgcDyWo",
authDomain:"aquarev-travel.firebaseapp.com",
projectId:"aquarev-travel",
storageBucket:"aquarev-travel.firebasestorage.app",
messagingSenderId:"396344577424",
appId:"1:396344577424:web:be477d67f13f7a99e27715"
};


const app=initializeApp(firebaseConfig);
const db=getFirestore(app);
const auth=getAuth(app);
let requestsData=[];
let archivedRequestsData=[];
let partnersData=[];
let selectedRequest=null;
let selectedPartner=null;
let selectedChatPartner=null;
let currentRequestFilter="all";




function updateRequestBadges(){
let counts={
all:0,
Visa:0,
Vols:0,
"Hôtels":0,
Hajj:0,
"Voyages organisés":0,
Autres:0,
archives:0
};
requestsData.forEach(request=>{
if(request.status!=="archived"){
counts.all++;
const type=request.type||request.service||"Autres";
if(counts[type]!==undefined){
counts[type]++;
}
}
});
archivedRequestsData.forEach(request=>{
counts.archives++;
});
const badges={
allBadge:counts.all,
visaBadge:counts.Visa,
volsBadge:counts.Vols,
hotelsBadge:counts["Hôtels"],
hajjBadge:counts.Hajj,
toursBadge:counts["Voyages organisés"],
otherBadge:counts.Autres,
archivesBadge:counts.archives
};
Object.keys(badges).forEach(id=>{
const badge=document.getElementById(id);
if(badge){
if(badges[id]>0){
badge.textContent=badges[id];
badge.style.display="flex";
}else{
badge.textContent="";
badge.style.display="none";
}
}
});
const mainBadge=document.getElementById("requestsBadge");
if(mainBadge){
if(counts.all>0){
mainBadge.textContent=counts.all;
mainBadge.style.display="flex";
}else{
mainBadge.textContent="";
mainBadge.style.display="none";
}
}
}



async function refreshDashboard(){
try{
const requestsSnapshot=await getDocs(collection(db,"requests"));
const usersSnapshot=await getDocs(collection(db,"users"));

let pendingPartnersCount=0;
usersSnapshot.forEach(item=>{
const data=item.data();
if(data.role==="pending_agency"&&data.status==="waiting"){
pendingPartnersCount++;
}
});
const partnerBadge=document.getElementById("partnerBadge");
if(partnerBadge){
if(pendingPartnersCount>0){
partnerBadge.textContent=pendingPartnersCount;
partnerBadge.style.display="flex";
}else{
partnerBadge.textContent="";
partnerBadge.style.display="none";
}
}





let requestsCount=0;
let agenciesCount=0;
let partnersCount=0;
let notificationsCount=0;
requestsSnapshot.forEach(item=>{
const data=item.data();
if(data.status!=="archived"){
requestsCount++;
}
});
usersSnapshot.forEach(item=>{
const data=item.data();
if(data.role==="agency"){
agenciesCount++;
}
if(data.role==="partner"){
partnersCount++;
}
});
const totalRequests=document.getElementById("totalRequests");
const totalAgencies=document.getElementById("totalAgencies");
const totalPartners=document.getElementById("totalPartners");
const totalNotifications=document.getElementById("totalNotifications");
if(totalRequests){
totalRequests.textContent=requestsCount;
}
if(totalAgencies){
totalAgencies.textContent=agenciesCount;
}
if(totalPartners){
totalPartners.textContent=partnersCount;
}
if(totalNotifications){
totalNotifications.textContent=notificationsCount;
}
}catch(error){
console.error("DASHBOARD REFRESH ERROR:",error);
}
}


async function loadRequests(){
try{
const requestQuery=query(collection(db,"requests"),orderBy("createdAt","desc"));
onSnapshot(requestQuery,(snapshot)=>{
requestsData=[];
archivedRequestsData=[];
snapshot.forEach(item=>{
const data={
id:item.id,
...item.data()
};




if(data.status==="archived"){

archivedRequestsData.push(data);

}else if(data.status!=="deleted"){

requestsData.push(data);

}





});
displayRequests();


updateRequestBadges();
});
}catch(error){
console.error("REQUEST LOAD ERROR:",error);
}
}
function getRequestValue(request,key,fallback="-"){
if(request[key]!==undefined&&request[key]!==null&&request[key]!==""){
return request[key];
}
if(request.data&&request.data[key]!==undefined&&request.data[key]!==null&&request.data[key]!==""){
return request.data[key];
}


return fallback;
}



function getClientName(request){
return getRequestValue(request,"Nom complet")||
getRequestValue(request,"Nom complet ")||
getRequestValue(request,"fullName")||
getRequestValue(request,"name")||
"-";
}

function getPhone(request){
const data=request.data||request;
return data["Téléphone"]||
data["TÃ©lÃ©phone"]||
data.phone||
data.telephone||
"-";
}

function getEmail(request){
const data=request.data||request;
return data["Adresse e-mail"]||
data.email||
"-";
}











function getAddress(request){
const data=request.data||request;
return data["Adresse complète"]||
data["Adresse complÃ¨te"]||
"-";
}

function getPassport(request){
const data=request.data||request;
return data["Numéro passeport"]||
data["NumÃ©ro passeport"]||
"-";
}

function getFatherName(request){
const data=request.data||request;
return data["Nom du père"]||
data["Nom du pÃ¨re"]||
"-";
}

function getMotherName(request){
const data=request.data||request;
return data["Nom complet de la mère"]||
data["Nom complet de la mÃ¨re"]||
"-";
}





function getDestination(request){
return getRequestValue(request,"selectedCountry")||
getRequestValue(request,"destination")||
getRequestValue(request,"country")||
"-";
}

function getDescription(request){
let txt="";
txt+="Adresse : "+(getRequestValue(request,"Adresse complÃ¨te")||"-")+"\n";
txt+="Activité : "+(getRequestValue(request,"activityType")||"-")+"\n";
txt+="Visa : "+(getRequestValue(request,"visaType")||"-")+"\n";
txt+="Résidence : "+(getRequestValue(request,"residenceType")||"-")+"\n";
txt+="Paiement : "+(getRequestValue(request,"paymentMethod")||"-")+"\n";
txt+="Père : "+(getRequestValue(request,"Nom du pÃ¨re")||"-")+"\n";
txt+="Mère : "+(getRequestValue(request,"Nom complet de la mÃ¨re")||"-");
return txt;
}























function getService(request){
return request.type||request.service||"Service";
}
function getStatus(request){
return request.status||"waiting";
}
function formatRequestDate(request)




















{
const date=request.createdAt||request.date;
if(!date){
return"-";
}
if(date.seconds){
return new Date(date.seconds*1000).toLocaleDateString();
}
return new Date(date).toLocaleDateString();
}
function clearRequestView(){
const fields=[
"requestTitle",
"requestClient",
"requestStatus",
"requestType",
"requestDestination",
"requestDate",
"requestDescription",
"requestEmail",
"requestPhone",
"requestDocuments"
];
fields.forEach(id=>{
const element=document.getElementById(id);
if(element){
element.textContent="-";
}
});
}

function displayRequests(){
const title=document.getElementById("requestTitle");
const client=document.getElementById("requestClient");
const status=document.getElementById("requestStatus");
const type=document.getElementById("requestType");
const destination=document.getElementById("requestDestination");
const date=document.getElementById("requestDate");
const description=document.getElementById("requestDescription");
const email=document.getElementById("requestEmail");
const files=document.getElementById("requestFiles");
const phone=document.getElementById("requestPhone");
const visaBirthDate=document.getElementById("visaBirthDate");
const visaAddress=document.getElementById("visaAddress");
const visaPassport=document.getElementById("visaPassport");
const visaFather=document.getElementById("visaFather");
const visaMother=document.getElementById("visaMother");
const fullName=document.getElementById("requestFullName");
const address=document.getElementById("requestAddress");
const passport=document.getElementById("requestPassportNumber");
const passportStart=document.getElementById("requestPassportStart");
const passportEnd=document.getElementById("requestPassportEnd");
const father=document.getElementById("requestFather");
const mother=document.getElementById("requestMother");
const visaType=document.getElementById("requestVisaType");
const activity=document.getElementById("requestActivity");
const residence=document.getElementById("requestResidence");
const payment=document.getElementById("requestPayment");
const birthDate=document.getElementById("requestBirthDate");
let data=[];

if(currentRequestFilter==="archives"){
data=archivedRequestsData;
}else{
data=requestsData;
if(currentRequestFilter!=="all"){
data=requestsData.filter(request=>{
return getService(request).toLowerCase()===currentRequestFilter.toLowerCase();
});
}
}




const allServicesDashboard=document.getElementById("allServicesDashboard");

if(allServicesDashboard){



    const requestsList=document.getElementById("requestsList");

if(currentRequestFilter==="all"){
requestsList.style.display="none";
}else{
requestsList.style.display="grid";
}




if(currentRequestFilter==="all"){

allServicesDashboard.style.display="grid";

}else{

allServicesDashboard.style.display="none";

}

}


const requestCard = document.querySelector(".request-card");

if(requestCard){

if(currentRequestFilter==="all"){

requestCard.style.display="none";

}else{

requestCard.style.display="block";

}

}





if(allServicesDashboard && currentRequestFilter==="all"){

allServicesDashboard.innerHTML=`

<div class="service-box" data-service="Visa">
<i class="fa-solid fa-passport"></i>
<h3>VISA</h3>
<p>${requestsData.filter(r=>getService(r)==="Visa").length} demandes</p>
</div>


<div class="service-box" data-service="Vols">
<i class="fa-solid fa-plane"></i>
<h3>VOLS</h3>
<p>${requestsData.filter(r=>getService(r)==="Vols").length} demandes</p>
</div>


<div class="service-box" data-service="Hôtels">
<i class="fa-solid fa-hotel"></i>
<h3>HÔTELS</h3>
<p>${requestsData.filter(r=>getService(r)==="Hôtels").length} demandes</p>
</div>


<div class="service-box" data-service="Hajj">
<i class="fa-solid fa-kaaba"></i>
<h3>HAJJ</h3>
<p>${requestsData.filter(r=>getService(r)==="Hajj").length} demandes</p>
</div>


<div class="service-box" data-service="Voyages organisés">
<i class="fa-solid fa-earth-europe"></i>
<h3>VOYAGES</h3>
<p>${requestsData.filter(r=>getService(r)==="Voyages organisés").length} demandes</p>
</div>


<div class="service-box" data-service="Autres">
<i class="fa-solid fa-layer-group"></i>
<h3>AUTRES</h3>
<p>${requestsData.filter(r=>getService(r)==="Autres").length} demandes</p>
</div>


<div class="service-box" data-service="archives">
<i class="fa-solid fa-box-archive"></i>
<h3>ARCHIVES</h3>
<p>${archivedRequestsData.length} demandes</p>
</div>

`;

document.querySelectorAll(".service-box").forEach(box=>{

box.addEventListener("click",()=>{

const service=box.dataset.service;

filterRequestsByType(service);

});

});





}




const serviceBoxes = document.querySelectorAll(".service-box");


serviceBoxes.forEach(box=>{

box.addEventListener("click",()=>{

const service = box.dataset.service;

currentRequestFilter = service;

openPage("requests");

displayRequests();

});

});










































function displaySelectedRequest(request){

selectedRequest=request;

const title=document.getElementById("requestTitle");
const client=document.getElementById("requestClient");
const status=document.getElementById("requestStatus");
const type=document.getElementById("requestType");
const destination=document.getElementById("requestDestination");
const date=document.getElementById("requestDate");


if(title){
title.textContent=getService(request);
}

if(client){
client.textContent=getClientName(request);
}

if(status){
status.textContent=getStatus(request);
status.className="status "+getStatus(request);
}

if(type){
type.textContent=getService(request);
}

if(destination){
destination.textContent=getDestination(request);
}

if(date){
date.textContent=formatRequestDate(request);
}

console.log("SELECTED REQUEST:",request);

}





































const requestsList=document.getElementById("requestsList");


const oldRequestsList = document.getElementById("requestsList");

if(oldRequestsList && currentRequestFilter==="all"){
    oldRequestsList.style.display="none";
}else if(oldRequestsList){
    oldRequestsList.style.display="grid";
}





if(requestsList){

requestsList.innerHTML="";

data.forEach((request,index)=>{

const card=document.createElement("div");

card.className="request-item-card";

card.innerHTML=`


<div class="request-card-menu">

<button class="request-menu-btn">
<i class="fa-solid fa-ellipsis-vertical"></i>
</button>

<div class="request-menu-options">

${
currentRequestFilter==="archives"

?

`
<button class="restore-request">
<i class="fa-solid fa-rotate-left"></i>
RESTAURER
</button>
`

:

`
<button class="archive-request">
<i class="fa-solid fa-box-archive"></i>
TRANSFERT VERS ARCHIVE
</button>
`

}

<button class="delete-request">
<i class="fa-solid fa-trash"></i>
SUPPRIMER
</button>

</div>

</div>




<h4>
${getService(request)}
</h4>

<p>
<i class="fa-solid fa-user"></i>
${getClientName(request)}
</p>

<p>
<i class="fa-solid fa-location-dot"></i>
${getDestination(request)}
</p>

<span class="status ${getStatus(request)}">
${getStatus(request)}
</span>

`;








card.addEventListener("click",(e)=>{

if(
e.target.closest(".request-card-menu") ||
e.target.closest(".request-menu-btn") ||
e.target.closest(".request-menu-options")
){
return;
}

selectedRequest=request;

displaySelectedRequest(request);


const infoCard=document.querySelector(".request-card");


if(currentRequestFilter==="all"){

if(infoCard){
infoCard.style.display="none";
}

}else{

if(infoCard){
infoCard.style.display="block";
}

}

if(infoCard){

setTimeout(()=>{

infoCard.scrollIntoView({
behavior:"smooth",
block:"start"
});

},100);

}

});



requestsList.appendChild(card);


const menuBtn = card.querySelector(".request-menu-btn");
const menuOptions = card.querySelector(".request-menu-options");













let menuTimer;

menuBtn.addEventListener("click",(e)=>{

e.stopPropagation();

document.querySelectorAll(".request-menu-options")
.forEach(menu=>{
menu.style.display="none";
});


menuOptions.style.display="block";


// إخفاء بعد 3 ثواني إذا لم يتم الاختيار
clearTimeout(menuTimer);

menuTimer=setTimeout(()=>{

menuOptions.style.display="none";

},3000);


});


// إذا خرجت الفأرة من منطقة القائمة والنقاط
card.querySelector(".request-card-menu").addEventListener("mouseleave",()=>{

clearTimeout(menuTimer);

menuOptions.style.display="none";

});




const archiveBtn = card.querySelector(".archive-request");
const deleteBtn = card.querySelector(".delete-request");
const restoreBtn = card.querySelector(".restore-request");

if(restoreBtn){

restoreBtn.addEventListener("click", async (e)=>{

e.stopPropagation();

menuOptions.style.display="none";

try{

await updateDoc(
doc(db,"requests",request.id),
{
status:"new"
}
);

console.log("REQUEST RESTORED");

}catch(error){

console.error("RESTORE ERROR:",error);

}

});

}








if(deleteBtn){

deleteBtn.addEventListener("click", async (e)=>{

e.stopPropagation();

menuOptions.style.display="none";

try{

await updateDoc(
doc(db,"requests",request.id),
{
status:"deleted"
}
);

console.log("REQUEST DELETED");

}catch(error){

console.error("DELETE ERROR:",error);

}

});

}
















if(archiveBtn){


archiveBtn.addEventListener("click", async (e)=>{

e.stopPropagation();

menuOptions.style.display="none";

try{

await updateDoc(
doc(db,"requests",request.id),
{
status:"archived"
}
);

console.log("REQUEST ARCHIVED");

}catch(error){

console.error("ARCHIVE ERROR:",error);

}

});

}

if(deleteBtn){

deleteBtn.addEventListener("click",(e)=>{

e.stopPropagation();

menuOptions.style.display="none";

// هنا نضع لاحقا كود الحذف

});

}



// منع اختفاء القائمة أثناء المرور فوقها
menuOptions.addEventListener("mouseenter",()=>{

clearTimeout(menuTimer);

});





});


}







const archiveBtn = card.querySelector(".archive-request");

if(archiveBtn){

archiveBtn.addEventListener("click",(e)=>{

e.stopPropagation();

selectedRequest=request;

updateRequestStatus("archived");


});

}




const deleteBtn = card.querySelector(".delete-request");


if(deleteBtn){

deleteBtn.addEventListener("click",(e)=>{

e.stopPropagation();


selectedRequest=request;


if(confirm("Supprimer cette demande ?")){

deleteDoc(doc(db,"requests",request.id));

}


});

}




if(data.length===0){
if(title){
title.textContent="Aucune demande";
}
if(client){
client.textContent="-";
}
if(status){
status.textContent="-";
status.className="status";
}
if(type){
type.textContent="-";
}
if(destination){
destination.textContent="-";
}
if(date){
date.textContent="-";
}
if(description){
description.textContent="-";
}
if(email){
email.textContent="-";
}
if(phone){
phone.textContent="-";
}
if(files){
files.textContent="-";
}
return;
}










const request=data[0];
console.log("FULL REQUEST DATA:",request);
console.log("INNER DATA:",request.data);
selectedRequest=request;



console.log("HTML ELEMENTS:",{
address:address,
passport:passport,
father:father,
mother:mother
});
if(title){
title.textContent=getService(request);
}
if(client){
client.textContent=getClientName(request);
}
if(status){
status.textContent=getStatus(request);
status.className="status "+getStatus(request);
}
if(type){
type.textContent=getService(request);
}
if(destination){
destination.textContent=getDestination(request);
}
const visaFields=document.getElementById("visaFields");
const flightFields=document.getElementById("flightFields");
const hotelFields=document.getElementById("hotelFields");

if(visaFields) visaFields.style.display="none";
if(flightFields) flightFields.style.display="none";
if(hotelFields) hotelFields.style.display="none";

switch(request.type){

case "Visa":
if(visaFields) visaFields.style.display="block";
break;

case "Vols":
if(flightFields) flightFields.style.display="block";
break;

case "Hôtels":
if(hotelFields) hotelFields.style.display="block";
break;

default:
// لا تعرض أي حقول خاصة
break;

}
const requestData=request.data||{};

console.log("ALL VISA FIELDS:",requestData);

if(fullName){
fullName.textContent=requestData["Nom complet"]||"-";
}

if(address){
address.textContent=requestData["Adresse complète"]||
requestData["Adresse complÃ¨te"]||
"-";
}
if(visaAddress){
visaAddress.textContent=requestData["Adresse complète"]||
requestData["Adresse complÃ¨te"]||
"-";
}
if(passport){
passport.textContent=
requestData["Numéro passeport"]||
requestData["NumÃ©ro passeport"]||
"-";
}

if(passportStart){
passportStart.textContent=
requestData["Date de délivrance"]||
requestData["Date de delivrance"]||
requestData["passportIssueDate"]||
"-";
}

if(passportEnd){
passportEnd.textContent=
requestData["Date expiration"]||
requestData["Date expiration passeport"]||
requestData["passportExpiryDate"]||
"-";
}




if(father){
father.textContent=requestData["Nom du père"]||
requestData["Nom du pÃ¨re"]||
"-";
}

console.log("HTML ELEMENTS:",{
address:address,
passport:passport,
father:father,
mother:mother
});




if(visaFather){
visaFather.textContent=requestData["Nom du père"]||
requestData["Nom du pÃ¨re"]||
"-";
}

if(mother){
mother.textContent=requestData["Nom complet de la mère"]||
requestData["Nom complet de la mÃ¨re"]||
"-";
}



console.log("DISPLAY TEST:",{
address:address.textContent,
passport:passport.textContent,
father:father.textContent,
mother:mother.textContent
});




if(visaMother){
visaMother.textContent=requestData["Nom complet de la mère"]||
requestData["Nom complet de la mÃ¨re"]||
"-";
}
if(phone){
phone.textContent=requestData["Téléphone"]||
requestData["TÃ©lÃ©phone"]||
"-";
}

if(email){
email.textContent=requestData["Adresse e-mail"]||
requestData.email||
"-";
}
if(visaType){
visaType.textContent=requestData["visaType"]||"-";
}

if(activity){
activity.textContent=requestData["activityType"]||"-";
}

if(residence){
residence.textContent=requestData["residenceType"]||"-";
}

if(payment){
payment.textContent=requestData["paymentMethod"]||"-";
}

if(birthDate){
birthDate.textContent=requestData["Date de naissance"]||"-";
}
if(date){
date.textContent=formatRequestDate(request);
}


if(description){
description.textContent=getDescription(request);
}
console.log("PHONE TEST:",getPhone(request));
console.log("ADDRESS TEST:",getAddress(request));
console.log("PASSPORT TEST:",getPassport(request));
console.log("FATHER TEST:",getFatherName(request));
console.log("MOTHER TEST:",getMotherName(request));
 
if(email){
email.textContent=
requestData["Adresse e-mail"]||
requestData["Adresse e-mail "]||
requestData["email"]||
"-";
}

if(phone){
phone.textContent=
requestData["Téléphone"]||
requestData["TÃ©lÃ©phone"]||
requestData["phone"]||
requestData["telephone"]||
"-";
}
if(files){
if(request.files&&request.files.length>0){
files.innerHTML=request.files.join("<br>");
}else{
files.textContent="-";
}
}







const requestPDF=document.getElementById("requestPDF");
const pdfLink=document.getElementById("pdfLink");

if(requestPDF&&pdfLink){
if(request.pdfPath){
requestPDF.style.display="flex";
pdfLink.href="http://localhost:3000/pdf/"+request.pdfPath.split("\\").pop();
}
else{
requestPDF.style.display="none";
}
}
}


function filterRequestsByType(type){

currentRequestFilter=type;


/* تغيير الزر النشط في الأعلى */

document.querySelectorAll(".request-tab").forEach(tab=>{

tab.classList.remove("active");

if(tab.dataset.request===type){

tab.classList.add("active");

}

});


displayRequests();

}


















document.querySelectorAll(".request-tab").forEach(tab=>{
tab.addEventListener("click",()=>{
document.querySelectorAll(".request-tab").forEach(item=>{
item.classList.remove("active");
});
tab.classList.add("active");
filterRequestsByType(tab.dataset.request);
});
});
const archiveTab=document.querySelector('[data-request="archives"]');
if(archiveTab){
archiveTab.addEventListener("click",()=>{
document.querySelectorAll(".request-tab").forEach(item=>{
item.classList.remove("active");
});
archiveTab.classList.add("active");
filterRequestsByType("archives");
});
}
async function createArchiveCopy(request,action){
try{
const archiveData={
...request,
originalRequestId:request.id,
archiveAction:action,
archivedAt:new Date(),
handledBy:"AQUAREV Admin"
};
delete archiveData.id;
await addDoc(collection(db,"archives"),archiveData);
console.log("REQUEST ARCHIVED:",action);
}catch(error){
console.error("CREATE ARCHIVE ERROR:",error);
}
}

async function updateRequestStatus(status){
if(!selectedRequest){
return;
}
try{
await createArchiveCopy(selectedRequest,status);
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:"archived",
originalStatus:status,
updatedAt:new Date(),
handledBy:"AQUAREV Admin"
});
console.log("REQUEST MOVED TO ARCHIVE:",status);
}catch(error){
console.error("UPDATE REQUEST STATUS ERROR:",error);
}
}const acceptButton=document.querySelector(".accept-btn");
const ignoreButton=document.querySelector(".ignore-btn");
if(acceptButton){
acceptButton.addEventListener("click",()=>{
updateRequestStatus("accepted");
});
}
if(ignoreButton){
ignoreButton.addEventListener("click",()=>{
updateRequestStatus("ignored");
});
}
const archiveButton=document.querySelector(".archive-btn");
if(archiveButton){
archiveButton.addEventListener("click",()=>{
archiveRequest();
});
}

async function loadPendingPartners(){
try{
const snapshot=await getDocs(collection(db,"users"));
let pendingPartners=[];
snapshot.forEach(item=>{
const data=item.data();
if(data.role==="pending_agency"&&data.status==="waiting"){
pendingPartners.push({
id:item.id,
...data
});
}
});
console.log("PENDING PARTNERS:",pendingPartners);
return pendingPartners;
}catch(error){
console.error("LOAD PENDING PARTNERS ERROR:",error);
return [];
}
}







async function loadPartners(){
try{
const snapshot=await getDocs(collection(db,"users"));
partnersData=[];
snapshot.forEach(item=>{
const data=item.data();
if(data.role==="partner"&&data.status==="active"){
partnersData.push({
id:item.id,
...data
});
}
});
displayPartners();
}catch(error){
console.error("PARTNERS LOAD ERROR:",error);
}
}

async function displayPendingPartners(){
const list=document.getElementById("pendingPartnersList");
if(!list){
return;
}
const pendingPartners=await loadPendingPartners();
list.innerHTML="";
pendingPartners.forEach(partner=>{
const card=document.createElement("div");
card.className="pending-partner-card";
card.innerHTML=`
<h4>${partner.name||"Partner"}</h4>
<p>${partner.email||""}</p>
<button class="accept-partner" data-id="${partner.id}">Accept</button>
<button class="reject-partner" data-id="${partner.id}">Reject</button>
`;
list.appendChild(card);
});






document.querySelectorAll(".accept-partner").forEach(button=>{
button.addEventListener("click",async()=>{
const id=button.dataset.id;
await updateDoc(doc(db,"users",id),{
role:"partner",
status:"active"
});
await displayPendingPartners();
await loadPartners();
});
});
document.querySelectorAll(".reject-partner").forEach(button=>{
button.addEventListener("click",async()=>{
const id=button.dataset.id;
await updateDoc(doc(db,"users",id),{
status:"rejected"
});
await displayPendingPartners();
});
});
}













function displayPartners(){

const partnersGrid=document.getElementById("partnersGrid");
const modalPartnerList=document.getElementById("modalPartnerList");
const agenciesGrid=document.getElementById("agenciesGrid");
const agencyCounter=document.getElementById("agencyCounter");
const messagingPartnersList=document.getElementById("messagingPartnersList");

if(partnersGrid){
partnersGrid.innerHTML="";
}


if(modalPartnerList){
modalPartnerList.innerHTML="";
}

if(agenciesGrid){
agenciesGrid.innerHTML="";
}

if(messagingPartnersList){
messagingPartnersList.innerHTML="";
}

if(agencyCounter){
agencyCounter.textContent=partnersData.length;
}

partnersData.sort((a,b)=>{
if(a.online===true&&b.online!==true){
return -1;
}
if(a.online!==true&&b.online===true){
return 1;
}
if(a.lastSeen&&b.lastSeen){
return b.lastSeen.seconds-a.lastSeen.seconds;
}
return 0;
});


partnersData.forEach(partner=>{


/* ===========================
PARTNERS PAGE
=========================== */

const partnerCard=document.createElement("div");

partnerCard.className="partner-item";

partnerCard.innerHTML=`
<h4>${partner.agencyName||partner.name||"AQUAREV Partner"}</h4>
<p>${partner.country||""} ${partner.city||""}</p>
`;

if(partnersGrid){
partnersGrid.appendChild(partnerCard);
}


/* ===========================
MESSAGING PARTNERS LIST
=========================== */

if(messagingPartnersList){

const messagePartner=document.createElement("div");

messagePartner.className="messaging-partner-item";

const online=partner.online===true;

messagePartner.innerHTML=`

<div class="messaging-partner-status ${online?"status-online":"status-offline"}"></div>

<div class="partner-info">

<h4>
${partner.agencyName||partner.name||"AQUAREV Partner"}
</h4>

<p>
${partner.email||"-"}
</p>

</div>

<span class="message-badge" id="badge-${partner.id}" style="display:none">
0
</span>

`;

messagePartner.addEventListener("click",()=>{

currentChatPartnerId = partner.id;
const badge = document.getElementById("badge-"+partner.id);

if(badge){
    badge.textContent="";
    badge.style.display="none";
}
console.log("SELECTED PARTNER ID:", currentChatPartnerId);


openPartnerChat(partner);

const name=document.getElementById("messagingChatPartnerName");
const email=document.getElementById("messagingChatPartnerEmail");

if(name){
name.textContent=partner.agencyName||partner.name||"AQUAREV Partner";
}

if(email){
email.textContent=partner.email||"-";
}

});

messagingPartnersList.appendChild(messagePartner);

}






/* ===========================
TRANSFER MODAL
=========================== */

const modalCard=document.createElement("div");

modalCard.className="modal-partner";

modalCard.innerHTML=`

<div>

<strong>
${partner.agencyName||partner.name||"AQUAREV Partner"}
</strong>

<p>
${partner.email||""}
</p>

</div>

<i class="fa-solid fa-circle-check"></i>

`;

modalCard.addEventListener("click",()=>{

document.querySelectorAll(".modal-partner").forEach(item=>{
item.classList.remove("selected");
});

modalCard.classList.add("selected");

selectedPartner=partner;

openPartnerChat(partner);

});


if(modalPartnerList){
modalPartnerList.appendChild(modalCard);
}





/* ===========================
AGENCIES PAGE
=========================== */

if(agenciesGrid){

const card=document.createElement("div");

card.className="agency-card";

const online=partner.online===true;

const lastSeen=partner.lastSeen?.toDate
? partner.lastSeen.toDate().toLocaleString()
:"Jamais connecté";


card.innerHTML=`

<div class="agency-logo">
<i class="fa-solid fa-building"></i>
</div>


<div class="agency-name">
${partner.agencyName||partner.name||"AQUAREV"}
</div>


<div class="agency-country">
${partner.country||""} ${partner.city||""}
</div>


<div class="agency-email">
${partner.email||"-"}
</div>


<div class="agency-status">

<div class="status-dot ${online?"status-online":"status-offline"}"></div>

<span>
${online?"ONLINE":"OFFLINE"}
</span>

</div>


<div class="agency-lastseen">

<i class="fa-solid fa-clock"></i>

${lastSeen}

</div>

`;


card.addEventListener("click",()=>{

openPartnerChat(partner);

});


agenciesGrid.appendChild(card);

}


});

}
const transferButton=document.querySelector(".transfer-btn");
const transferModal=document.getElementById("transferModal");
const closeTransferModal=document.getElementById("closeTransferModal");
if(transferButton){
transferButton.addEventListener("click",()=>{
if(selectedRequest){
transferModal.classList.add("show");
}
});
}
if(closeTransferModal){
closeTransferModal.addEventListener("click",()=>{
transferModal.classList.remove("show");
});
}

const confirmTransfer=document.querySelector(".confirm-transfer");

async function sendDirectPartnerEmail(email){
try{
const response=await fetch("http://localhost:3000/send-partner-email",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:email,
requestId:selectedRequest.id
})
});
const result=await response.json();
if(!result.success){
console.error("DIRECT PARTNER EMAIL ERROR:",result.message);
return false;
}
console.log("DIRECT PARTNER EMAIL SENT");
return true;
}catch(error){
console.error("DIRECT EMAIL ERROR:",error);
return false;
}
}

async function transferRequest(){
if(!selectedRequest){
return;
}

const emailInput=document.getElementById("partnerEmail");
const partnerEmail=emailInput?emailInput.value.trim():"";

if(!selectedPartner&&!partnerEmail){
console.error("NO PARTNER OR EMAIL SELECTED");
return;
}

if(emailInput&&emailInput===document.activeElement){
console.log("USER STILL WRITING EMAIL");
return;
}

try{

if(partnerEmail){
await sendDirectPartnerEmail(partnerEmail);
}

console.log("TRANSFER DEBUG:",{
selectedPartner:selectedPartner,
selectedRequest:selectedRequest
});

if(selectedPartner){

await createArchiveCopy(selectedRequest,"assigned_partner");

await updateDoc(doc(db,"requests",selectedRequest.id),{
status:"archived",
originalStatus:"assigned_partner",
assignedPartner:selectedPartner.id,
assignedPartnerName:selectedPartner.agencyName||selectedPartner.name||"",
assignedAt:new Date(),
handledBy:"AQUAREV Admin"
});

await createPartnerNotification(selectedPartner.id,selectedRequest);
console.log("BEFORE ADMIN NOTIFICATION");

await addDoc(collection(db,"notifications"),{
title:"Nouvelle activité AQUAREV",
message:`Le partenaire ${selectedPartner.agencyName || selectedPartner.name || "PARTENAIRE"} a reçu une nouvelle demande.`,
userName:selectedPartner.agencyName || selectedPartner.name || "PARTENAIRE",
email:selectedPartner.email || "",
type:"partner",
read:false,
createdAt:serverTimestamp()
});

}

transferModal.classList.remove("show");

selectedPartner=null;

const emailInput=document.getElementById("partnerEmail");
if(emailInput){
emailInput.value="";
}

console.log("REQUEST TRANSFERRED SUCCESSFULLY");

}catch(error){
console.error("TRANSFER REQUEST ERROR:",error);
}
}

if(confirmTransfer){
confirmTransfer.addEventListener("click",()=>{

    console.log("CONFIRM TRANSFER CLICKED");

transferRequest();
});

}async function createPartnerNotification(partnerId,request){
try{
const notificationRef=collection(db,"users",partnerId,"notifications");
await addDoc(notificationRef,{
title:"Nouvelle demande AQUAREV",
titleEn:"New AQUAREV Request",
titleAr:"طلب جديد من AQUAREV",
message:"Une nouvelle demande vous a été transférée par AQUAREV Travel.",
messageEn:"A new request has been transferred by AQUAREV Travel.",
messageAr:"تم تحويل طلب جديد إليك من طرف AQUAREV Travel.",
requestId:request.id,
service:getService(request),
destination:getDestination(request),
status:"unread",
createdAt:new Date()
});
console.log("PARTNER NOTIFICATION CREATED");
}catch(error){
console.error("CREATE NOTIFICATION ERROR:",error);
}
}




















function openPartnerChat(partner){

selectedChatPartner=partner;

const box=document.getElementById("adminChatBox");
const name=document.getElementById("messagingChatPartnerName");
const email=document.getElementById("messagingChatPartnerEmail");

if(box){
box.style.display="block";
}

if(name){
name.textContent=partner.agencyName||partner.name||"Partner";
}

if(email){
email.textContent=partner.email||"-";
}

loadAdminPartnerMessages(partner.id, partner.agencyName || partner.name || "PARTENAIRE");


}




function loadAdminPartnerMessages(partnerId, partnerName="PARTENAIRE"){

const container=document.getElementById("messagingChatMessages");

if(!container){
return;
}


const messagesQuery=query(
collection(db,"partner_messages"),
where("partnerId","==",partnerId),
orderBy("createdAt","asc")
);


onSnapshot(messagesQuery,(snapshot)=>{
    console.log("MESSAGES COUNT:", snapshot.size);

container.innerHTML="";


if(snapshot.empty){

container.innerHTML=`
<div class="empty-state">
<i class="fa-solid fa-message"></i>
<p>Aucune conversation</p>
</div>
`;

return;

}


snapshot.forEach(item=>{

const data=item.data();

const div=document.createElement("div");


div.className=data.sender==="admin"
?"chat-message admin"
:"chat-message partner";

div.innerHTML=`

<strong class="sender-name">
${data.sender==="admin" ? "AQUAREV ADMIN" : partnerName}
</strong>

<p>${data.message}</p>

<small>
${data.createdAt?.toDate
?data.createdAt.toDate().toLocaleString()
:""}
</small>

`;


container.appendChild(div);


});


// تمرير تلقائي لآخر رسالة
setTimeout(()=>{
    container.scrollTop = container.scrollHeight;
},100);


});

}



const adminSendButton=document.getElementById("sendAdminMessage");


if(adminSendButton){

adminSendButton.addEventListener("click",async()=>{


const input=document.getElementById("adminMessageInput");

const message=input.value.trim();


if(!message || !currentChatPartnerId){

alert("Choisir un partenaire");

return;

}

try{




    console.log("ADMIN TRY SEND:", {
partner: currentChatPartnerId,
message: text
});




await addDoc(collection(db,"partner_messages"),{

partnerId:currentChatPartnerId,

sender:"admin",

message:text,

read:true,

createdAt:serverTimestamp()

});

input.value="";


}catch(error){

console.error("ADMIN MESSAGE ERROR:",error);

}


});


}




async function checkAdminAccess(user){
if(!user){
console.error("NO ADMIN USER");
return false;
}
try{
const userRef=doc(db,"users",user.uid);
const userSnap=await getDoc(userRef);
if(!userSnap.exists()){
console.error("ADMIN PROFILE NOT FOUND");
return false;
}
const data=userSnap.data();
console.log("FIRESTORE DATA:",data);
console.log("ROLE =",data.role);
console.log("STATUS =",data.status);
if(data.role!=="admin"||data.status!=="active"){
console.error("ACCESS DENIED");
return false;
}
console.log("ADMIN ACCESS GRANTED");
return true;
}catch(error){
console.error("ADMIN CHECK ERROR:",error);
return false;
}
}
onAuthStateChanged(auth,async(user)=>{
if(!user){
console.log("WAITING FOR ADMIN AUTH");
return;
}
console.log("AUTH EMAIL:",user.email);
console.log("AUTH UID:",user.uid);
const access=await checkAdminAccess(user);
console.log("ADMIN ACCESS RESULT:",access);
if(access){
await refreshDashboard();
await loadRequests();
await loadPartners();
listenNotifications();
loadNotifications();

// listenPartnerMessages();











function listenNotifications(){

console.log("LISTEN NOTIFICATIONS STARTED");


const q=query(
collection(db,"notifications"),
where("read","==",false)
);


onSnapshot(q,(snapshot)=>{


const badge=document.getElementById("notificationsBadge");


if(badge){


if(snapshot.size>0){

badge.textContent=snapshot.size;
badge.style.display="inline-flex";

}else{

badge.textContent="";
badge.style.display="none";

}


}



});

}

await loadPendingPartners();
listenNotifications();
await displayPendingPartners();
}
});




























const sendBtn = document.getElementById("sendMessagingMessage");
const messageInput = document.getElementById("messagingMessageInput");


if(sendBtn){

sendBtn.addEventListener("click", async()=>{


const text = messageInput.value.trim();


if(!text){
return;
}


if(!currentChatPartnerId){
alert("Choisir un partenaire");
return;
}



try{

await addDoc(collection(db,"partner_messages"),{

partnerId: currentChatPartnerId,

sender:"admin",

message:text,

createdAt:serverTimestamp()

});



messageInput.value="";



await loadAdminPartnerMessages(currentChatPartnerId);



console.log("MESSAGE SENT");


}catch(error){

console.error("SEND MESSAGE ERROR:",error);

}


});


}















function loadNotifications(){


const container=document.getElementById("notificationsList");


if(!container)return;



const q=query(
collection(db,"notifications"),
orderBy("createdAt","desc")
);



onSnapshot(q,(snapshot)=>{


container.innerHTML="";


snapshot.forEach(item=>{


const data=item.data();


const div=document.createElement("div");


div.className=
"notification-item "+data.type;



div.innerHTML=`

<strong>
${data.title}
</strong>


<p>
${data.message}
</p>


<small>
${data.userName||""}
${data.email? " - "+data.email:""}
</small>


`;



container.appendChild(div);



});


});

}











window.addEventListener("load",()=>{

console.log("AQUAREV ADMIN DASHBOARD READY");


const loadingScreen=document.getElementById("loadingScreen");

if(loadingScreen){

setTimeout(()=>{

loadingScreen.classList.add("hide");

},800);

}


// تشغيل مراقبة رسائل الشركاء
// listenPartnerMessages();

});






setTimeout(()=>{

const page=document.getElementById("partnersPage");

console.log("PARTNERS PAGE STATUS:",page?.className);

},3000);



setTimeout(()=>{
const page=document.getElementById("partnersPage");
console.log("PARTNERS PAGE STATUS:",page?.className);
},3000);

const floatBtn=document.getElementById("floatingNotification");

if(floatBtn){

floatBtn.onclick=()=>{

openPage("notifications");

};

}