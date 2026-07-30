import{auth,db}from"../firebase/firebase-config.js";
import{onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import{doc,getDoc,setDoc,collection,addDoc,serverTimestamp,onSnapshot,query,orderBy}from"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const translations={
fr:{},
en:{},
ar:{}
};
let currentUser=null;
let currentLanguage="fr";
let userRole="client";
document.addEventListener("DOMContentLoaded",()=>{
initializePortal();
});
async function initializePortal(){
setupNavigation();
setupLanguage();
setupDarkMode();
setupMessaging();
setupLogout();
checkAuthentication();
}
function checkAuthentication(){
onAuthStateChanged(auth,async(user)=>{
if(!user){
window.location.href="../signin.html";
return;
}
currentUser=user;
console.log("PORTAL USER:",user.email);
await loadUserProfile(user.uid);
});
}
async function loadUserProfile(uid){
try{
const userRef=doc(db,"users",uid);
const userSnap=await getDoc(userRef);
if(userSnap.exists()){
const data=userSnap.data();
userRole=data.role||"client";
if(data.role==="admin"){
window.location.href="../admin/index.html";
return;
}
if(data.role==="partner"){
window.location.href="../partner/index.html";
return;
}
document.getElementById("userName").textContent=data.name||"Client";
document.getElementById("userEmail").textContent=data.email||currentUser.email;
document.getElementById("profileName").value=data.name||"";
document.getElementById("profileEmail").value=data.email||currentUser.email;
document.getElementById("profileRole").value=userRole;
applyRolePermissions();
}else{
await createDefaultUser(uid);
}
}catch(error){
console.error("PROFILE ERROR:",error);
}
}
async function createDefaultUser(uid){
const defaultData={
uid:uid,
email:currentUser.email,
name:currentUser.displayName||"Client",
role:"client",
createdAt:serverTimestamp()
};
await setDoc(doc(db,"users",uid),defaultData);
userRole="client";
document.getElementById("userName").textContent=defaultData.name;
document.getElementById("userEmail").textContent=defaultData.email;
document.getElementById("profileName").value=defaultData.name;
document.getElementById("profileEmail").value=defaultData.email;
document.getElementById("profileRole").value="client";
applyRolePermissions();
}


function applyRolePermissions(){
const menu=document.querySelector(".menu");
if(!menu)return;
if(userRole==="admin"){
console.log("ADMIN MODE");
window.location.href="../admin/index.html";
return;
}
else if(userRole==="agency"){
console.log("AGENCY MODE");
showAgencyMenu();
}

else if(userRole==="pending_agency"){
console.log("PENDING AGENCY MODE");
showPendingAgencyMenu();
}
else{
console.log("CLIENT MODE");
showClientMenu();
}
}
function hideAllMenus(){
const menus=[
"dashboardMenu",
"reservationsMenu",
"requestsMenu",
"messagerieMenu",
"notificationsMenu",
"accountMenu"
];
menus.forEach(id=>{
const element=document.getElementById(id);
if(element){
element.style.display="none";
}
});
}
function showClientMenu(){
hideAllMenus();
const clientMenus=[
"dashboardMenu",
"reservationsMenu",
"requestsMenu",
"messagerieMenu",
"notificationsMenu",
"accountMenu"
];
clientMenus.forEach(id=>{
const element=document.getElementById(id);
if(element){
element.style.display="flex";
}
});
const badge=document.querySelector(".account-badge span");
if(badge){
badge.textContent="Client Premium";
}
}
function showAgencyMenu(){
hideAllMenus();
const agencyMenus=[
"dashboardMenu",
"requestsMenu",
"messagerieMenu",
"notificationsMenu",
"accountMenu"
];
agencyMenus.forEach(id=>{
const element=document.getElementById(id);
if(element){
element.style.display="flex";
}
});
const badge=document.querySelector(".account-badge span");
if(badge){
badge.textContent="Agency Partner";
}
}
function showPendingAgencyMenu(){
const badge=document.querySelector(".account-badge span");
if(badge){
badge.textContent="Agency Pending";
}
}




function showAdminMenu(){
window.location.href="../admin/index.html";
return;
}


function setupNavigation(){
const buttons=document.querySelectorAll("[data-section]");
const sections=document.querySelectorAll(".portal-section");
buttons.forEach(button=>{
button.addEventListener("click",()=>{
const target=button.dataset.section;
console.log("TARGET:",target,"ROLE:",userRole);
if(target==="messagerie"&&userRole==="admin"){
window.location.href="../admin/index.html";
return;
}





buttons.forEach(btn=>btn.classList.remove("active"));
button.classList.add("active");
sections.forEach(section=>{
section.classList.remove("active-section");
});
const selected=document.getElementById(target+"Section");
if(selected){
selected.classList.add("active-section");
}
});
});
const quickButtons=document.querySelectorAll("[data-section-target]");
quickButtons.forEach(button=>{
button.addEventListener("click",()=>{
const target=button.dataset.sectionTarget;
sections.forEach(section=>{
section.classList.remove("active-section");
});
const selected=document.getElementById(target+"Section");
if(selected){
selected.classList.add("active-section");
}
});
});
}
function setupLanguage(){
const buttons=document.querySelectorAll(".language-switcher button");
buttons.forEach(button=>{
button.addEventListener("click",()=>{
changeLanguage(button.textContent.toLowerCase());
});
});
}
window.changeLanguage=function(lang){
currentLanguage=lang;
document.documentElement.lang=lang;
if(lang==="ar"){
document.body.dir="rtl";
}else{
document.body.dir="ltr";
}
const elements=document.querySelectorAll("[data-fr],[data-en],[data-ar]");
elements.forEach(element=>{
const value=element.getAttribute("data-"+lang);
if(value){
element.textContent=value;
}
});
const placeholders=document.querySelectorAll("[data-"+lang+"-placeholder]");
placeholders.forEach(input=>{
const value=input.getAttribute("data-"+lang+"-placeholder");
if(value){
input.placeholder=value;
}
});
};
function setupDarkMode(){
const button=document.getElementById("darkModeBtn");
if(!button)return;
button.addEventListener("click",()=>{
document.body.classList.toggle("light-mode");
const icon=button.querySelector("i");
if(document.body.classList.contains("light-mode")){
icon.className="fa-solid fa-sun";
}else{
icon.className="fa-solid fa-moon";
}
});
}
function setupLogout(){
const button=document.getElementById("logoutBtn");
if(!button)return;
button.addEventListener("click",async()=>{
try{
await signOut(auth);
window.location.href="../index.html";
}catch(error){
console.error("LOGOUT ERROR:",error);
}
});
}





function setupMessaging(){
const sendButton=document.getElementById("sendMessage");
const input=document.getElementById("messageInput");
if(!sendButton||!input)return;
sendButton.addEventListener("click",async()=>{
const text=input.value.trim();
if(!text)return;
await sendMessage(text);
input.value="";
});
input.addEventListener("keypress",async(event)=>{
if(event.key==="Enter"&&!event.shiftKey){
event.preventDefault();
const text=input.value.trim();
if(text){
await sendMessage(text);
input.value="";
}
}
});
}

async function sendMessage(text){
if(!currentUser)return;
try{
await addDoc(collection(db,"messages"),{
senderId:currentUser.uid,
senderEmail:currentUser.email,
receiver:"AQUAREV",
message:text,
type:"client",
createdAt:serverTimestamp(),
status:"new"
});
addMessageToScreen(text,"sent");
}catch(error){
console.error("SEND MESSAGE ERROR:",error);
}
}
function addMessageToScreen(text,type){
const box=document.getElementById("chatMessages");
if(!box)return;
const div=document.createElement("div");
div.className="message "+type;
div.innerHTML=`
<div class="message-bubble">
<p>${text}</p>
<span class="message-time">Now</span>
</div>
`;
box.appendChild(div);
box.scrollTop=box.scrollHeight;
}

function listenMessages(){
if(!currentUser)return;
const messagesRef=query(collection(db,"messages"),orderBy("createdAt","asc"));
onSnapshot(messagesRef,(snapshot)=>{
const box=document.getElementById("chatMessages");
if(!box)return;
box.innerHTML="";
snapshot.forEach(item=>{
const data=item.data();
if(data.senderId===currentUser.uid||data.receiver==="AQUAREV"){
renderMessage(data);
}
});
});
}
function renderMessage(data){
const box=document.getElementById("chatMessages");
if(!box)return;
const type=data.senderId===currentUser.uid?"sent":"received";
const div=document.createElement("div");
div.className="message "+type;
const sender=data.senderEmail||"AQUAREV";
div.innerHTML=`
<div class="message-bubble">
<h4>${type==="received"?sender:"Moi"}</h4>
<p>${data.message||""}</p>
<span class="message-time">${formatTime(data.createdAt)}</span>
</div>
`;
box.appendChild(div);
box.scrollTop=box.scrollHeight;
}
function formatTime(timestamp){
if(!timestamp)return"";
if(timestamp.toDate){
return timestamp.toDate().toLocaleTimeString("fr-FR",{
hour:"2-digit",
minute:"2-digit"
});
}
return"";
}
function setupFileUpload(){
const button=document.getElementById("attachFile");
const input=document.getElementById("chatFile");
if(!button||!input)return;
button.addEventListener("click",()=>{
input.click();
});
input.addEventListener("change",()=>{
if(input.files.length){
openUploadModal();
}
});
}
function openUploadModal(){
const modal=document.getElementById("fileModal");
if(modal){
modal.classList.add("active");
}
}
function closeUploadModal(){
const modal=document.getElementById("fileModal");
if(modal){
modal.classList.remove("active");
}
}
function setupModal(){
const close=document.querySelector(".close-modal");
if(close){
close.addEventListener("click",closeUploadModal);
}
const upload=document.getElementById("uploadDocument");
if(upload){
upload.addEventListener("click",async()=>{
const files=document.getElementById("documentUpload").files;
if(!files.length)return;
await saveDocumentRequest(files);
closeUploadModal();
});
}
}
async function saveDocumentRequest(files){
if(!currentUser)return;
const documents=[];
for(const file of files){
documents.push({
name:file.name,
type:file.type,
size:file.size
});
}
await addDoc(collection(db,"messages"),{
senderId:currentUser.uid,
senderEmail:currentUser.email,
receiver:"AQUAREV",
message:"Documents envoyés",
documents:documents,
type:"document",
createdAt:serverTimestamp(),
status:"new"
});
}
function initializeRealtime(){
listenMessages();
setupFileUpload();
setupModal();
}
setTimeout(()=>{
initializeRealtime();
},1000);