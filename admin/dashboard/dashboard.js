import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import{getFirestore,collection,getDocs,query,orderBy,limit}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
const translations={
fr:{
total:"Total Requests",
new:"New Requests",
visa:"Visa",
flight:"Flights",
hotel:"Hotels",
partner:"Partners"
},
en:{
total:"Total Requests",
new:"New Requests",
visa:"Visa",
flight:"Flights",
hotel:"Hotels",
partner:"Partners"
},
ar:{
total:"إجمالي الطلبات",
new:"الطلبات الجديدة",
visa:"تأشيرات",
flight:"رحلات الطيران",
hotel:"فنادق",
partner:"شركاء"
},
es:{
total:"Solicitudes Totales",
new:"Nuevas Solicitudes",
visa:"Visados",
flight:"Vuelos",
hotel:"Hoteles",
partner:"Socios"
}
};
let currentLanguage="fr";
function applyLanguage(){
const t=translations[currentLanguage];
document.querySelector(".stat-card:nth-child(1) h3").textContent=t.total;
document.querySelector(".stat-card:nth-child(2) h3").textContent=t.new;
document.querySelector(".stat-card:nth-child(3) h3").textContent=t.visa;
document.querySelector(".stat-card:nth-child(4) h3").textContent=t.flight;
document.querySelector(".stat-card:nth-child(5) h3").textContent=t.hotel;
document.querySelector(".stat-card:nth-child(6) h3").textContent=t.partner;
}
async function loadRequests(){
try{
const requestsRef=collection(db,"requests");
const q=query(requestsRef,orderBy("createdAt","desc"),limit(50));
const snapshot=await getDocs(q);
let total=0;
let newRequests=0;
let visa=0;
let flights=0;
let hotels=0;
let partners=0;
const table=document.getElementById("requestsTable");
table.innerHTML="";
snapshot.forEach(doc=>{
const item=doc.data();
total++;
if(item.status==="new"){
newRequests++;
}
if(item.type==="Visa"){
visa++;
}
if(item.type==="Flight"){
flights++;
}
if(item.type==="Hotel"){
hotels++;
}
if(item.partner){
partners++;
}
const data=item.data||{};
const client=data["Nom complet"]||data.name||"Unknown";
const country=data.selectedCountry||data.destination||"-";
let date="-";
if(item.createdAt){
date=item.createdAt.toDate().toLocaleDateString();
}
const row=document.createElement("tr");
row.innerHTML=`
<td>${doc.id.substring(0,8)}</td>
<td>${item.type||"-"}</td>
<td>${client}</td>
<td>${country}</td>
<td>${item.status||"new"}</td>
<td>${date}</td>
`;
table.appendChild(row);
});
document.getElementById("totalRequests").textContent=total;
document.getElementById("newRequests").textContent=newRequests;
document.getElementById("visaRequests").textContent=visa;
document.getElementById("flightRequests").textContent=flights;
document.getElementById("hotelRequests").textContent=hotels;
document.getElementById("partnerRequests").textContent=partners;
}catch(error){
console.error("FIRESTORE DASHBOARD ERROR:",error);
document.getElementById("requestsTable").innerHTML=`
<tr>
<td colspan="6">Erreur de chargement des demandes</td>
</tr>
`;
}
}
document.getElementById("refreshBtn").addEventListener("click",()=>{
loadRequests();
});
window.setLanguage=function(lang){
if(translations[lang]){
currentLanguage=lang;
applyLanguage();
}
};
applyLanguage();
loadRequests();