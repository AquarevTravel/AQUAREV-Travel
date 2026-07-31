const menuItems=document.querySelectorAll(".menu-item");
const pages=document.querySelectorAll(".page-section");
const langButtons=document.querySelectorAll(".lang-btn");
const sidebar=document.getElementById("sidebar");
const mobileMenu=document.getElementById("mobileMenu");
const mobileOverlay=document.getElementById("mobileOverlay");
let currentLanguage=localStorage.getItem("aquarevLanguage")||"fr";
function openPage(page){
pages.forEach(section=>{
section.classList.remove("active-page");
});
const target=document.getElementById(page+"Page");
if(target){
target.classList.add("active-page");
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
menuItems.forEach(item=>{
item.addEventListener("click",()=>{
openPage(item.dataset.page);
});
});
if(mobileMenu){
mobileMenu.addEventListener("click",()=>{
sidebar.classList.toggle("show");
mobileOverlay.classList.toggle("show");
});
}
if(mobileOverlay){
mobileOverlay.addEventListener("click",()=>{
sidebar.classList.remove("show");
mobileOverlay.classList.remove("show");
});
}
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
import{getFirestore,collection,getDocs,doc,getDoc,updateDoc,onSnapshot,query,orderBy,addDoc}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
let currentRequestFilter="all";



async function refreshDashboard(){
try{
const requestsSnapshot=await getDocs(collection(db,"requests"));
const usersSnapshot=await getDocs(collection(db,"users"));
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
}else{
requestsData.push(data);
}
});
displayRequests();
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
}function filterRequestsByType(type){
currentRequestFilter=type;
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
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:status,
updatedAt:new Date(),
handledBy:"AQUAREV Admin"
});
await createArchiveCopy(selectedRequest,status);
console.log("REQUEST STATUS UPDATED:",status);
}catch(error){
console.error("UPDATE REQUEST STATUS ERROR:",error);
}
}
async function archiveRequest(){
if(!selectedRequest){
return;
}
try{
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:"archived",
archivedAt:new Date(),
handledBy:"AQUAREV Admin"
});
console.log("REQUEST ARCHIVED");
}catch(error){
console.error("ARCHIVE REQUEST ERROR:",error);
}
}
const acceptButton=document.querySelector(".accept-btn");
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
function displayPartners(){
const partnerList=document.getElementById("partnerList");
const modalPartnerList=document.getElementById("modalPartnerList");
if(partnerList){
partnerList.innerHTML="";
}
if(modalPartnerList){
modalPartnerList.innerHTML="";
}
partnersData.forEach(partner=>{
const partnerCard=document.createElement("div");
partnerCard.className="partner-item";
partnerCard.innerHTML=`
<h4>${partner.agencyName||partner.name||"AQUAREV Partner"}</h4>
<p>${partner.country||""} ${partner.city||""}</p>
`;
if(partnerList){
partnerList.appendChild(partnerCard);
}
const modalCard=document.createElement("div");
modalCard.className="modal-partner";
modalCard.innerHTML=`
<div>
<strong>${partner.agencyName||partner.name||"AQUAREV Partner"}</strong>
<p>${partner.email||""}</p>
</div>
<i class="fa-solid fa-circle-check"></i>
`;
modalCard.addEventListener("click",()=>{
document.querySelectorAll(".modal-partner").forEach(item=>{
item.classList.remove("selected");
});
modalCard.classList.add("selected");
selectedPartner=partner;
});
if(modalPartnerList){
modalPartnerList.appendChild(modalCard);
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
async function transferRequest(){
if(!selectedRequest){
return;
}
if(!selectedPartner){
console.error("NO PARTNER SELECTED");
return;
}
try{
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:"assigned_partner",
assignedPartner:selectedPartner.id,
assignedPartnerName:selectedPartner.agencyName||selectedPartner.name||"",
assignedAt:new Date(),
handledBy:"AQUAREV Admin"
});
await createPartnerNotification(selectedPartner.id,selectedRequest);
transferModal.classList.remove("show");
selectedPartner=null;
console.log("REQUEST TRANSFERRED SUCCESSFULLY");
}catch(error){
console.error("TRANSFER REQUEST ERROR:",error);
}
}
if(confirmTransfer){
confirmTransfer.addEventListener("click",()=>{
transferRequest();
});
}
async function createPartnerNotification(partnerId,request){
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
}
});
window.addEventListener("load",()=>{
console.log("AQUAREV ADMIN DASHBOARD READY");
const loadingScreen=document.getElementById("loadingScreen");
if(loadingScreen){
setTimeout(()=>{
loadingScreen.classList.add("hide");
},800);
}
});