import {auth,db} from "../firebase/firebase-config.js";
import {onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {doc,getDoc,collection,getDocs,addDoc,serverTimestamp,query,where,orderBy,onSnapshot,updateDoc} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUser=null;
let currentLanguage="fr";

const translations={
fr:{
partner:"Espace Partenaire Premium",
logout:"Déconnexion"
},
en:{
partner:"Premium Partner Space",
logout:"Logout"
},
ar:{
partner:"فضاء الشريك المميز",
logout:"تسجيل الخروج"
}
};





onAuthStateChanged(auth,async(user)=>{
if(!user){
window.location.href="../signin.html";
return;
}
currentUser=user;
await loadPartnerProfile(user.uid);
await updatePartnerOnlineStatus(user.uid);
});

async function updatePartnerOnlineStatus(uid){
try{
const userRef=doc(db,"users",uid);
await updateDoc(userRef,{
online:true,
lastSeen:serverTimestamp()
});
window.addEventListener("beforeunload",async()=>{
await updateDoc(userRef,{
online:false,
lastSeen:serverTimestamp()
});
});
}catch(error){
console.error("ONLINE STATUS ERROR:",error);
}
}

async function loadPartnerProfile(uid){
try{
const userRef=doc(db,"users",uid);
const snap=await getDoc(userRef);
if(!snap.exists()){
alert("Profil introuvable");
return;
}
const data=snap.data();
if(data.role!=="partner"){
alert("Access denied");
window.location.href="../index.html";
return;
}
document.getElementById("agencyName").textContent=data.name||"Partner Agency";
document.getElementById("profileAgencyName").textContent=data.name||"Partner Agency";
document.getElementById("profileEmail").textContent=data.email||"---";
if(data.country){
document.getElementById("countryPartner").textContent=data.country;
document.getElementById("profileCountry").textContent=data.country;
}
loadRequests(uid);
}catch(error){
console.error("PROFILE ERROR:",error);
}
}

async function loadRequests(uid){
try{
const requestsRef=collection(db,"partner_requests");
const snapshot=await getDocs(requestsRef);
let count=0;
let container=document.getElementById("partnerRequests");
container.innerHTML="";
snapshot.forEach((item)=>{
const data=item.data();
if(data.partnerId===uid){
count++;
const card=document.createElement("div");
card.className="request-card";
card.innerHTML=`
<h3>${data.service||"Service AQUAREV"}</h3>
<p>${data.clientName||"Client"}</p>
<p>${data.status||"Nouvelle demande"}</p>
`;
container.appendChild(card);
}
});
document.getElementById("requestCount").textContent=count;
if(count===0){
container.innerHTML=`
<div class="empty-state">
<i class="fa-solid fa-inbox"></i>
<p>Aucune demande actuellement.</p>
</div>`;
}
}catch(error){
console.error("REQUEST ERROR:",error);
}
}




document.querySelectorAll(".menu-item").forEach(button=>{
button.addEventListener("click",()=>{
document.querySelectorAll(".menu-item").forEach(b=>b.classList.remove("active"));
button.classList.add("active");
const section=button.dataset.section;
if(section==="profile"){
window.location.href="profile.html";
return;
}
document.querySelectorAll(".partner-section").forEach(s=>s.classList.remove("active-section"));
const target=document.getElementById(section+"Section");
if(target){
target.classList.add("active-section");
}
});
});










window.changeLanguage=function(lang){
currentLanguage=lang;
document.documentElement.lang=lang;
document.querySelectorAll("[data-"+lang+"]").forEach(el=>{
el.textContent=el.getAttribute("data-"+lang);
});
};

const sendButton=document.getElementById("sendPartnerMessage");

async function loadPartnerMessages(){
try{
const messagesContainer=document.getElementById("partnerMessages");
if(!messagesContainer||!currentUser){
return;
}
const messagesQuery=query(
collection(db,"partner_messages"),
where("partnerId","==",currentUser.uid),
orderBy("createdAt","asc")
);
onSnapshot(messagesQuery,(snapshot)=>{
messagesContainer.innerHTML="";
if(snapshot.empty){
messagesContainer.innerHTML=`
<div class="empty-state">
<i class="fa-solid fa-message"></i>
<p>Aucun message pour le moment.</p>
</div>`;
return;
}
snapshot.forEach(item=>{
const data=item.data();
const message=document.createElement("div");
message.className=data.sender==="partner"
?"chat-message partner"
:"chat-message admin";
message.innerHTML=`
<p>${data.message}</p>
<small>
${data.createdAt?.toDate
?data.createdAt.toDate().toLocaleString()
:""}
</small>
`;
messagesContainer.appendChild(message);
});
messagesContainer.scrollTop=messagesContainer.scrollHeight;
});
}catch(error){
console.error("LOAD MESSAGES ERROR:",error);
}
}


if(sendButton){
sendButton.addEventListener("click",async()=>{
const input=document.getElementById("partnerMessageInput");
const message=input.value.trim();
if(!message||!currentUser){
return;
}
try{
await addDoc(collection(db,"partner_messages"),{
partnerId:currentUser.uid,
message:message,
createdAt:serverTimestamp(),
sender:"partner"
});
input.value="";
}catch(error){
console.error("SEND MESSAGE ERROR:",error);
}
});
}

loadPartnerMessages();
const logoutButton=document.createElement("button");
logoutButton.className="logout-partner";
logoutButton.innerHTML='<i class="fa-solid fa-right-from-bracket"></i> Déconnexion';
logoutButton.onclick=async()=>{
await signOut(auth);
window.location.href="../signin.html";
};

document.querySelector(".partner-header").appendChild(logoutButton);




const cloudTrigger=document.querySelector(".agency-cloud-trigger");
const agencyCloud=document.querySelector(".agency-cloud");
let cloudTimer;
if(cloudTrigger&&agencyCloud){
cloudTrigger.addEventListener("click",(e)=>{
e.stopPropagation();
agencyCloud.classList.toggle("show-mobile-cloud");
clearTimeout(cloudTimer);
cloudTimer=setTimeout(()=>{
agencyCloud.classList.remove("show-mobile-cloud");
},2000);
});
document.addEventListener("click",()=>{
agencyCloud.classList.remove("show-mobile-cloud");
});
agencyCloud.addEventListener("click",(e)=>{
e.stopPropagation();
});
}
async function loadAgencyContact(){
try{
if(!currentUser)return;
const ref=doc(db,"users",currentUser.uid);
const snap=await getDoc(ref);
if(!snap.exists())return;
const data=snap.data();
const name=data.agencyName||data.name||"AQUAREV Travel";
const email=data.agencyEmail||"aquarev.travel@gmail.com";
document.querySelector(".cloud-header h3").textContent=name;
const phoneLink=document.querySelector(".cloud-info a[href^='tel']");
if(phoneLink){
phoneLink.textContent=data.phone||"00213541116245";
phoneLink.href="tel:"+((data.phone||"00213541116245").replace(/\s/g,""));
}
const whatsappLink=document.querySelector(".cloud-info a[href*='wa.me']");
if(whatsappLink){
whatsappLink.textContent=data.whatsapp||"00213554958578";
whatsappLink.href="https://wa.me/"+((data.whatsapp||"00213554958578").replace(/^00/,"").replace(/\s/g,""));
}
const emailLink=document.querySelector(".cloud-info a[href^='mailto']");
if(emailLink){
emailLink.textContent=email;
emailLink.href="mailto:"+email;
}
}catch(error){
console.error("AGENCY CLOUD ERROR:",error);
}
}
setTimeout(()=>{
loadAgencyContact();
},1000);