import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getFirestore,collection,query,orderBy,onSnapshot,doc,updateDoc}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const firebaseConfig={
apiKey:"AIzaSyAycKfhrRV8qcbhvwj0NV5iE_4zlgcDyWo",
authDomain:"aquarev-travel.firebaseapp.com",
projectId:"aquarev-travel",
storageBucket:"aquarev-travel.firebasestorage.app",
messagingSenderId:"396344577424",
appId:"1:396344577424:web:be477d67f13f7a99e27715",
measurementId:"G-0V2DGYWQS3"
};
const app=initializeApp(firebaseConfig);
const db=getFirestore(app);
let allRequests=[];
let filteredRequests=[];
let selectedRequest=null;
let currentLanguage=localStorage.getItem("aquarevLanguage")||"fr";
const requestsContainer=document.getElementById("requestsList");
const requestDetails=document.getElementById("requestDetailsModal");
const detailsContent=document.getElementById("requestDetails");
const closeDetails=document.getElementById("closeDetails");
const requestsCount=document.getElementById("requestsCount");
const typeFilter=document.getElementById("typeFilter");
const statusFilter=document.getElementById("statusFilter");
const searchInput=document.getElementById("searchInput");
function applyLanguage(){
document.documentElement.lang=currentLanguage;
document.documentElement.dir=currentLanguage==="ar"?"rtl":"ltr";
document.querySelectorAll("[data-fr]").forEach(element=>{
const text=element.dataset[currentLanguage];
if(text){
element.textContent=text;
}
});
}
function changeLanguage(lang){
currentLanguage=lang;
localStorage.setItem("aquarevLanguage",lang);
applyLanguage();
displayRequests(filteredRequests.length?filteredRequests:allRequests);
}
document.querySelectorAll(".lang-btn").forEach(button=>{
button.addEventListener("click",()=>{
changeLanguage(button.dataset.lang));
});
});
applyLanguage();
function loadRequests(){
try{
const requestsQuery=query(
collection(db,"requests"),
orderBy("createdAt","desc")
);
onSnapshot(requestsQuery,(snapshot)=>{
allRequests=[];
snapshot.forEach(item=>{
allRequests.push({
id:item.id,
...item.data()
});
});
filteredRequests=[...allRequests];
updateCounter();
displayRequests(allRequests);
});
}catch(error){
console.error("REQUESTS FIRESTORE ERROR:",error);
}
}
function updateCounter(){
if(requestsCount){
requestsCount.textContent=allRequests.length;
}
}
function getClientName(request){
const data=request.data||{};
return data["Nom complet"]||data.name||data.fullName||"Client AQUAREV";
}
function getPhone(request){
const data=request.data||{};
return data["Téléphone"]||data.phone||"-";
}
function getDestination(request){
const data=request.data||{};
return data.destination||data.selectedCountry||"-";
}
function getService(request){
return request.type||"Service";
}
function getStatus(request){
return request.status||"new";
}
function formatDate(date){
if(!date){
return"-";
}
if(date.seconds){
return new Date(date.seconds*1000).toLocaleDateString();
}
return new Date(date).toLocaleDateString();
}
function displayRequests(data){
if(!requestsContainer){
return;
}
requestsContainer.innerHTML="";
if(data.length===0){
requestsContainer.innerHTML=`
<div class="empty-state">
<i class="fa-solid fa-inbox"></i>
<h3 data-fr="Aucune demande reçue" data-en="No requests received" data-ar="لا توجد طلبات">Aucune demande reçue</h3>
</div>
`;
return;
}
data.forEach(request=>{
const card=document.createElement("div");
card.className="request-card";
card.innerHTML=`
<div class="request-card-header">
<div class="request-brand">
<img src="../assets/logo/logo.png" alt="AQUAREV">
</div>
<div class="request-main-info">
<h3>${getService(request)}</h3>
<p>${getClientName(request)}</p>
</div>
<span class="request-status status-${getStatus(request)}">${getStatus(request)}</span>
</div>
<div class="request-card-body">
<div class="request-info-row">
<strong data-fr="Destination :" data-en="Destination:" data-ar="الوجهة:">Destination :</strong>
<span>${getDestination(request)}</span>
</div>
<div class="request-info-row">
<strong data-fr="Téléphone :" data-en="Phone:" data-ar="الهاتف:">Téléphone :</strong>
<span>${getPhone(request)}</span>
</div>
<div class="request-info-row">
<strong data-fr="Date :" data-en="Date:" data-ar="التاريخ:">Date :</strong>
<span>${formatDate(request.createdAt)}</span>
</div>
</div>
<div class="request-card-footer">
<button class="open-request">
<i class="fa-solid fa-eye"></i>
<span data-fr="Voir" data-en="View" data-ar="عرض">Voir</span>
</button>
</div>
`;
const openButton=card.querySelector(".open-request");
openButton.addEventListener("click",()=>{
openRequestDetails(request);
});
requestsContainer.appendChild(card);
});
}
function openRequestDetails(request){
selectedRequest=request;
if(!requestDetails||!detailsContent){
return;
}
const data=request.data||{};
detailsContent.innerHTML=`
<div class="details-premium-header">
<img src="../assets/logo/logo.png" alt="AQUAREV">
<div>
<h2>${getService(request)}</h2>
<p>${getClientName(request)}</p>
</div>
</div>
<div class="details-grid">
<div class="detail-box">
<strong data-fr="Nom complet" data-en="Full name" data-ar="الاسم الكامل">Nom complet</strong>
<span>${getClientName(request)}</span>
</div>
<div class="detail-box">
<strong data-fr="Téléphone" data-en="Phone" data-ar="الهاتف">Téléphone</strong>
<span>${getPhone(request)}</span>
</div>
<div class="detail-box">
<strong data-fr="Destination" data-en="Destination" data-ar="الوجهة">Destination</strong>
<span>${getDestination(request)}</span>
</div>
<div class="detail-box">
<strong data-fr="Type de service" data-en="Service type" data-ar="نوع الخدمة">Type de service</strong>
<span>${getService(request)}</span>
</div>
<div class="detail-box">
<strong data-fr="Date réception" data-en="Received date" data-ar="تاريخ الاستلام">Date réception</strong>
<span>${formatDate(request.createdAt)}</span>
</div>
<div class="detail-box">
<strong data-fr="Statut" data-en="Status" data-ar="الحالة">Statut</strong>
<span class="request-status status-${getStatus(request)}">${getStatus(request)}</span>
</div>
</div>
<div class="documents-section">
<h3>
<i class="fa-solid fa-file-pdf"></i>
<span data-fr="Documents envoyés" data-en="Uploaded documents" data-ar="الوثائق المرسلة">Documents envoyés</span>
</h3>
<div class="documents-list">
${renderDocuments(request)}
</div>
</div>
<div class="details-actions">
<button class="action-status accepted" data-status="accepted">
<i class="fa-solid fa-check"></i>
<span data-fr="Accepter" data-en="Accept" data-ar="قبول">Accepter</span>
</button>
<button class="action-status processing" data-status="processing">
<i class="fa-solid fa-clock"></i>
<span data-fr="En traitement" data-en="Processing" data-ar="قيد المعالجة">En traitement</span>
</button>
<button class="action-status rejected" data-status="rejected">
<i class="fa-solid fa-xmark"></i>
<span data-fr="Refuser" data-en="Reject" data-ar="رفض">Refuser</span>
</button>
</div>
`;
requestDetails.classList.add("show");
document.querySelectorAll(".action-status").forEach(button=>{
button.addEventListener("click",()=>{
updateRequestStatus(request.id,button.dataset.status);
});
});
}
function renderDocuments(request){
let files=[];
if(request.files&&Array.isArray(request.files)){
files=request.files;
}
if(files.length===0){
return`
<p data-fr="Aucun document joint" data-en="No attached documents" data-ar="لا توجد وثائق مرفقة">Aucun document joint</p>
`;
}
let html="";
files.forEach(file=>{
let fileName=typeof file==="string"?file:file.name||file.url||"Document";
let fileUrl=typeof file==="object"?file.url||file.path:"#";
let extension=fileName.split(".").pop().toLowerCase();
let icon="fa-file";
if(extension==="pdf"){
icon="fa-file-pdf";
}
if(extension==="jpg"||extension==="jpeg"||extension==="png"){
icon="fa-image";
}
html+=`
<a class="document-item" href="${fileUrl}" target="_blank">
<i class="fa-solid ${icon}"></i>
<span>${fileName}</span>
</a>
`;
});
return html;
}
async function updateRequestStatus(requestId,status){
try{
await updateDoc(doc(db,"requests",requestId),{
status:status,
updatedAt:new Date(),
handledBy:"AQUAREV Travel"
});
}catch(error){
console.error("UPDATE STATUS ERROR:",error);
}
}
function closeRequestDetails(){
if(requestDetails){
requestDetails.classList.remove("show");
}
}
if(closeDetails){
closeDetails.addEventListener("click",()=>{
closeRequestDetails();
});
}
if(requestDetails){
requestDetails.addEventListener("click",event=>{
if(event.target===requestDetails){
closeRequestDetails();
}
});
}
function filterByType(){
if(!typeFilter){
return;
}
const type=typeFilter.value;
if(type==="all"){
filteredRequests=[...allRequests];
}else{
filteredRequests=allRequests.filter(request=>{
return request.type&&request.type.toLowerCase()===type.toLowerCase();
});
}
displayRequests(filteredRequests);
}
function filterByStatus(){
if(!statusFilter){
return;
}
const status=statusFilter.value;
if(status==="all"){
filteredRequests=[...allRequests];
}else{
filteredRequests=allRequests.filter(request=>{
return getStatus(request)===status;
});
}
displayRequests(filteredRequests);
}
function searchRequest(value){
const search=value.toLowerCase();
filteredRequests=allRequests.filter(request=>{
const data=request.data||{};
const client=getClientName(request).toLowerCase();
const destination=getDestination(request).toLowerCase();
const service=getService(request).toLowerCase();
const phone=getPhone(request).toLowerCase();
return client.includes(search)||destination.includes(search)||service.includes(search)||phone.includes(search);
});
displayRequests(filteredRequests);
}
if(typeFilter){
typeFilter.addEventListener("change",()=>{
filterByType();
});
}
if(statusFilter){
statusFilter.addEventListener("change",()=>{
filterByStatus();
});
}
if(searchInput){
searchInput.addEventListener("input",()=>{
searchRequest(searchInput.value);
});
}
document.querySelectorAll(".lang-btn").forEach(button=>{
button.addEventListener("click",()=>{
changeLanguage(button.dataset.lang);
});
});









function setupMobileSupport(){
const menu=document.getElementById("mobileMenu");
const sidebar=document.getElementById("sidebar");
const overlay=document.getElementById("mobileOverlay");
if(menu&&sidebar&&overlay){
menu.addEventListener("click",()=>{
sidebar.classList.toggle("show");
overlay.classList.toggle("show");
});
overlay.addEventListener("click",()=>{
sidebar.classList.remove("show");
overlay.classList.remove("show");
});
}
}
function setupRequestTabs(){
const tabs=document.querySelectorAll(".request-tab");
tabs.forEach(tab=>{
tab.addEventListener("click",()=>{
tabs.forEach(item=>{
item.classList.remove("active");
});
tab.classList.add("active");
const type=tab.dataset.request;
if(type==="all"){
filteredRequests=[...allRequests];
displayRequests(filteredRequests);
return;
}
filteredRequests=allRequests.filter(request=>{
return request.type&&request.type.toLowerCase()===type.toLowerCase();
});
displayRequests(filteredRequests);
});
});
}
function markRequestViewed(requestId){
try{
updateDoc(doc(db,"requests",requestId),{
viewed:true,
viewedAt:new Date()
});
}catch(error){
console.error("VIEW UPDATE ERROR:",error);
}
}
function openRequest(request){
selectedRequest=request;
markRequestViewed(request.id);
openRequestDetails(request);
}
function refreshRequests(){
displayRequests(allRequests);
}
function startRequestsCenter(){
loadRequests();
setupMobileSupport();
setupRequestTabs();
}
window.addEventListener("load",()=>{
startRequestsCenter();
});
window.addEventListener("languageChanged",()=>{
applyLanguage();
refreshRequests();
});
console.log("AQUAREV REQUEST CENTER READY");