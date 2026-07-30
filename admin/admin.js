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
const page=item.dataset.page;
openPage(page);
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
logoutBtn.addEventListener("click",()=>{
localStorage.removeItem("aquarevUser");
window.location.href="../index.html";
});
}
window.addEventListener("load",()=>{
const adminName=document.getElementById("adminName");
const adminEmail=document.getElementById("adminEmail");
const savedUser=JSON.parse(localStorage.getItem("aquarevUser"));
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
import{getAuth,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
const firebaseConfig={
apiKey:"YOUR_API_KEY",
authDomain:"YOUR_PROJECT.firebaseapp.com",
projectId:"YOUR_PROJECT_ID",
storageBucket:"YOUR_PROJECT.appspot.com",
messagingSenderId:"YOUR_SENDER_ID",
appId:"YOUR_APP_ID"
};
const app=initializeApp(firebaseConfig);
const db=getFirestore(app);
const auth=getAuth(app);
let requestsData=[];
let partnersData=[];
let selectedRequest=null;
async function loadDashboardData(){
try{
const requestsSnapshot=await getDocs(collection(db,"requests"));
const agenciesSnapshot=await getDocs(collection(db,"users"));
let requestsCount=0;
let agenciesCount=0;
let partnersCount=0;
let notificationsCount=0;
requestsSnapshot.forEach(item=>{
requestsCount++;
});
agenciesSnapshot.forEach(item=>{
const data=item.data();
if(data.role==="pending_agency"||data.role==="agency"){
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
console.error("DASHBOARD ERROR:",error);
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
displayRequests();
});
}catch(error){
console.error("REQUEST ERROR:",error);
}
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
return;
}
const request=requestsData[0];
selectedRequest=request;
if(title){
title.textContent=request.type||"Nouvelle demande";
}
if(client){
client.textContent=request.clientName||request.email||"-";
}
if(status){
status.textContent=request.status||"pending";
}
if(type){
type.textContent=request.type||"-";
}
if(destination){
destination.textContent=request.destination||"-";
}
if(date){
date.textContent=request.date||"-";
}
if(description){
description.textContent=request.details||"-";
}
}
async function acceptRequest(){
if(!selectedRequest){
return;
}
try{
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:"accepted",
handledBy:"AQUAREV",
updatedAt:new Date()
});
alert("Request accepted");
}catch(error){
console.error("ACCEPT ERROR:",error);
}
}
async function ignoreRequest(){
if(!selectedRequest){
return;
}
try{
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:"ignored",
updatedAt:new Date()
});
alert("Request ignored");
}catch(error){
console.error("IGNORE ERROR:",error);
}
}
const acceptButton=document.querySelector(".accept-btn");
const ignoreButton=document.querySelector(".ignore-btn");
if(acceptButton){
acceptButton.addEventListener("click",acceptRequest);
}
if(ignoreButton){
ignoreButton.addEventListener("click",ignoreRequest);
}
loadDashboardData();
loadRequests();
const transferButton=document.querySelector(".transfer-btn");
const transferModal=document.getElementById("transferModal");
const closeTransferModal=document.getElementById("closeTransferModal");
const partnerList=document.getElementById("partnerList");
const modalPartnerList=document.getElementById("modalPartnerList");
const confirmTransfer=document.querySelector(".confirm-transfer");
let selectedPartner=null;
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
console.error("PARTNERS ERROR:",error);
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
const item=document.createElement("div");
item.className="partner-item";
item.innerHTML=`
<h4>${partner.agencyName||partner.name||"Partner Agency"}</h4>
<p>${partner.country||""} ${partner.city||""}</p>
`;
if(partnerList){
partnerList.appendChild(item);
}
const modalItem=document.createElement("div");
modalItem.className="modal-partner";
modalItem.innerHTML=`
<div>
<strong>${partner.agencyName||partner.name||"Partner Agency"}</strong>
<p>${partner.agencyEmail||partner.email||""}</p>
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
transferModal.classList.add("show");
});
}
if(closeTransferModal){
closeTransferModal.addEventListener("click",()=>{
transferModal.classList.remove("show");
});
}
async function transferRequest(){
if(!selectedRequest||!selectedPartner){
alert("Choose a partner");
return;
}
try{
await updateDoc(doc(db,"requests",selectedRequest.id),{
status:"assigned_partner",
assignedPartner:selectedPartner.id,
assignedPartnerName:selectedPartner.agencyName||selectedPartner.name,
brand:"AQUAREV Travel",
updatedAt:new Date()
});
await createPartnerNotification(selectedPartner.id,selectedRequest);
transferModal.classList.remove("show");
selectedPartner=null;
alert("Request transferred successfully");
}catch(error){
console.error("TRANSFER ERROR:",error);
}
}
if(confirmTransfer){
confirmTransfer.addEventListener("click",transferRequest);
}
async function createPartnerNotification(partnerId,request){
try{
const notificationRef=collection(db,"users",partnerId,"notifications");
await addDoc(notificationRef,{
title:"Nouvelle demande AQUAREV",
titleEn:"New AQUAREV Request",
titleAr:"طلب جديد من AQUAREV",
message:"Une nouvelle demande a été transférée par AQUAREV Travel.",
messageEn:"A new request has been transferred by AQUAREV Travel.",
messageAr:"تم تحويل طلب جديد من طرف AQUAREV Travel.",
requestId:request.id,
type:request.type||"service",
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
return;
}
try{
const userRef=doc(db,"users",user.uid);
const userSnap=await getDoc(userRef);
if(!userSnap.exists()){
console.error("USER PROFILE NOT FOUND");
return;
}
const data=userSnap.data();
if(data.role!=="admin"||data.status!=="active"){
console.error("NOT ADMIN");
return;
}
console.log("ADMIN ACCESS GRANTED");
}catch(error){
console.error("ADMIN CHECK ERROR:",error);
}
}


onAuthStateChanged(auth,async(user)=>{
if(!user){
console.log("WAITING FOR AUTH");
return;
}
await checkAdminAccess(user);
loadPartners();
});