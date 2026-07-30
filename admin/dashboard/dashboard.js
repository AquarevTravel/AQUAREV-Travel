const menuItems=document.querySelectorAll(".menu-item");
const pages=document.querySelectorAll(".page-section");
const langButtons=document.querySelectorAll(".lang-btn");
const sidebar=document.getElementById("sidebar");
const mobileMenu=document.getElementById("mobileMenu");
const mobileOverlay=document.getElementById("mobileOverlay");
let currentLanguage=localStorage.getItem("aquarevLanguage")||"fr";
let requestsData=[];
let partnersData=[];
let selectedRequest=null;
let selectedPartner=null;
let currentRequestIndex=0;
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
const value=element.dataset[lang];
if(value){
element.textContent=value;
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
logoutBtn.addEventListener("click",()=>{
localStorage.removeItem("aquarevUser");
window.location.href="../index.html";
});
}
window.addEventListener("load",()=>{
const savedUser=JSON.parse(localStorage.getItem("aquarevUser"));
const adminName=document.getElementById("adminName");
const adminEmail=document.getElementById("adminEmail");
if(savedUser){
if(adminName){
adminName.textContent=savedUser.name||"Admin";
}
if(adminEmail){
adminEmail.textContent=savedUser.email||"";
}
}
});
import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getFirestore,collection,getDocs,doc,getDoc,updateDoc,onSnapshot,query,orderBy,addDoc}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const firebaseConfig={
apiKey:"AIzaSyAycKfhrRV8qcbhvwj0NV5iE_4zlgcDyWo",
authDomain:"aquarev-travel.firebaseapp.com",
projectId:"aquarev-travel",
storageBucket:"aquarev-travel.firebasestorage.app",
messagingSenderId:"396344577424",
appId:"1:396344577424:web:be477d67f13f7a99e27715",
measurementId:"G-0V2DGYWQS3"
};
const firebaseApp=initializeApp(firebaseConfig);
const db=getFirestore(firebaseApp);
const auth=getAuth(firebaseApp);
async function loadDashboardData(){
try{
const requestsSnapshot=await getDocs(collection(db,"requests"));
const usersSnapshot=await getDocs(collection(db,"users"));
let requestsCount=0;
let agenciesCount=0;
let partnersCount=0;
let notificationsCount=0;
requestsSnapshot.forEach(item=>{
requestsCount++;
const data=item.data();
if(data.status==="new"){
notificationsCount++;
}
});
usersSnapshot.forEach(item=>{
const data=item.data();
if(data.role==="agency"||data.role==="pending_agency"){
agenciesCount++;
}
if(data.role==="partner"&&data.status==="active"){
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
console.error("DASHBOARD DATA ERROR:",error);
}
}
async function loadRequests(){
try{
const requestQuery=query(collection(db,"requests"),orderBy("createdAt","desc"));
onSnapshot(requestQuery,(snapshot)=>{
requestsData=[];
snapshot.forEach(item=>{
requestsData.push({
id:item.id,
...item.data()
});
});
currentRequestIndex=0;
displayRequests();
});
}catch(error){
console.error("REQUEST LOAD ERROR:",error);
}
}
function getRequestValue(request,key){
if(request.data&&request.data[key]){
return request.data[key];
}
if(request[key]){
return request[key];
}
return "-";
}
function formatDate(value){
if(!value){
return "-";
}
if(value.seconds){
return new Date(value.seconds*1000).toLocaleDateString(currentLanguage);
}
if(value instanceof Date){
return value.toLocaleDateString(currentLanguage);
}
return "-";
}
function displayRequests(){
const title=document.getElementById("requestTitle");
const client=document.getElementById("requestClient");
const status=document.getElementById("requestStatus");
const type=document.getElementById("requestType");
const destination=document.getElementById("requestDestination");
const date=document.getElementById("requestDate");
const description=document.getElementById("requestDescription");
if(requestsData.length===0){
if(title){
title.textContent=currentLanguage==="ar"?"لا توجد طلبات":"Aucune demande";
}
return;
}
const request=requestsData[currentRequestIndex];
selectedRequest=request;
if(title){
title.textContent=request.type||"Request";
}
if(client){
client.textContent=getRequestValue(request,"Nom complet");
}
if(status){
status.textContent=request.status||"new";
status.className="status "+(request.status||"new");
}
if(type){
type.textContent=request.type||"-";
}
if(destination){
destination.textContent=getRequestValue(request,"destination");
}
if(date){
date.textContent=formatDate(request.createdAt);
}
if(description){
description.textContent=getRequestValue(request,"description");
}
displayRequestFiles(request);
}
function displayRequestFiles(request){
const old=document.getElementById("requestFiles");
if(old){
old.remove();
}
if(!request.files||request.files.length===0){
return;
}
const container=document.querySelector(".request-body");
if(!container){
return;
}
const filesBox=document.createElement("div");
filesBox.id="requestFiles";
filesBox.className="request-files";
filesBox.innerHTML=`
<h4>
<i class="fa-solid fa-file"></i>
Documents
</h4>
`;
request.files.forEach(file=>{
const link=document.createElement("a");
link.href=file.url||"#";
link.target="_blank";
link.innerHTML=`
<i class="fa-solid fa-file-pdf"></i>
${file.name||"Document"}
`;
filesBox.appendChild(link);
});
container.appendChild(filesBox);
}
function nextRequest(){
if(requestsData.length===0){
return;
}
if(currentRequestIndex<requestsData.length-1){
currentRequestIndex++;
displayRequests();
}
}
function previousRequest(){
if(requestsData.length===0){
return;
}
if(currentRequestIndex>0){
currentRequestIndex--;
displayRequests();
}
}
async function updateRequestStatus(status){
if(!selectedRequest){
return;
}
try{
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:status,
handledBy:"AQUAREV Travel",
updatedAt:new Date()
});
}catch(error){
console.error("STATUS UPDATE ERROR:",error);
}
}
async function acceptRequest(){
await updateRequestStatus("accepted");
}
async function ignoreRequest(){
await updateRequestStatus("ignored");
}
const acceptButton=document.querySelector(".accept-btn");
const ignoreButton=document.querySelector(".ignore-btn");
if(acceptButton){
acceptButton.addEventListener("click",acceptRequest);
}
if(ignoreButton){
ignoreButton.addEventListener("click",ignoreRequest);
}
const transferButton=document.querySelector(".transfer-btn");
const transferModal=document.getElementById("transferModal");
const closeTransferModal=document.getElementById("closeTransferModal");
const partnerList=document.getElementById("partnerList");
const modalPartnerList=document.getElementById("modalPartnerList");
const confirmTransfer=document.querySelector(".confirm-transfer");
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
console.error("LOAD PARTNERS ERROR:",error);
}
}
function displayPartners(){
if(partnerList){
partnerList.innerHTML="";
}
if(modalPartnerList){
modalPartnerList.innerHTML="";
}
partnersData.forEach(partner=>{
const partnerName=partner.agencyName||partner.name||"AQUAREV Partner";
const partnerEmail=partner.agencyEmail||partner.email||"";
const item=document.createElement("div");
item.className="partner-item";
item.innerHTML=`
<h4>${partnerName}</h4>
<p>${partner.country||""} ${partner.city||""}</p>
`;
if(partnerList){
partnerList.appendChild(item);
}
const modalItem=document.createElement("div");
modalItem.className="modal-partner";
modalItem.innerHTML=`
<div>
<strong>${partnerName}</strong>
<p>${partnerEmail}</p>
</div>
<i class="fa-solid fa-circle-check"></i>
`;
modalItem.addEventListener("click",()=>{
document.querySelectorAll(".modal-partner").forEach(element=>{
element.classList.remove("selected");
});
modalItem.classList.add("selected");
selectedPartner=partner;
});
if(modalPartnerList){
modalPartnerList.appendChild(modalItem);
}
});
}
if(transferButton){
transferButton.addEventListener("click",()=>{
if(!selectedRequest){
return;
}
if(transferModal){
transferModal.classList.add("show");
}
});
}
if(closeTransferModal){
closeTransferModal.addEventListener("click",()=>{
if(transferModal){
transferModal.classList.remove("show");
}
});
}
async function transferRequest(){
if(!selectedRequest||!selectedPartner){
alert("Veuillez choisir un partenaire");
return;
}
try{
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:"assigned_partner",
assignedPartner:selectedPartner.id,
assignedPartnerName:selectedPartner.agencyName||selectedPartner.name,
brand:"AQUAREV Travel",
transferredBy:"AQUAREV Travel",
updatedAt:new Date()
});
await createPartnerNotification(selectedPartner.id,selectedRequest);
if(transferModal){
transferModal.classList.remove("show");
}
selectedPartner=null;
alert("Demande transférée avec succès");
}catch(error){
console.error("TRANSFER ERROR:",error);
}
}
if(confirmTransfer){
confirmTransfer.addEventListener("click",transferRequest);
}
async function createPartnerNotification(partnerId,request){
try{
await addDoc(collection(db,"users",partnerId,"notifications"),{
title:"Nouvelle demande AQUAREV",
titleEn:"New AQUAREV Request",
titleAr:"طلب جديد من AQUAREV",
message:"Une nouvelle demande a été envoyée par AQUAREV Travel.",
messageEn:"A new request was sent by AQUAREV Travel.",
messageAr:"تم إرسال طلب جديد من طرف AQUAREV Travel.",
requestId:request.id,
requestType:request.type||"service",
brand:"AQUAREV Travel",
status:"unread",
createdAt:new Date()
});
}catch(error){
console.error("NOTIFICATION ERROR:",error);
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
async function refreshDashboard(){
await loadDashboardData();
await loadPartners();
}
onAuthStateChanged(auth,async(user)=>{
if(!user){
console.log("WAITING FOR ADMIN AUTH");
return;
}
const access=await checkAdminAccess(user);
if(access){
await refreshDashboard();
loadRequests();
}
});
const savedLanguage=localStorage.getItem("aquarevLanguage");
if(savedLanguage){
changeLanguage(savedLanguage);
}
window.addEventListener("load",()=>{
const loading=document.getElementById("loadingScreen");
if(loading){
setTimeout(()=>{
loading.classList.add("hide");
},1000);
}
});
window.addEventListener("resize",()=>{
if(window.innerWidth>900){
sidebar.classList.remove("show");
if(mobileOverlay){
mobileOverlay.classList.remove("show");
}
}
});
setInterval(()=>{
loadDashboardData();
},60000);
const nextRequestButton=document.getElementById("nextRequest");
const previousRequestButton=document.getElementById("previousRequest");
if(nextRequestButton){
nextRequestButton.addEventListener("click",nextRequest);
}
if(previousRequestButton){
previousRequestButton.addEventListener("click",previousRequest);
}