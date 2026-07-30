import {auth,db} from "../firebase/firebase-config.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {doc,getDoc,updateDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let currentUID=null;

onAuthStateChanged(auth,async(user)=>{
if(!user){
window.location.href="../signin.html";
return;
}
currentUID=user.uid;
await loadAgencyProfile(user.uid);
});

async function loadAgencyProfile(uid){
try{
const ref=doc(db,"users",uid);
const snap=await getDoc(ref);
if(!snap.exists()){
alert("Profil agence introuvable");
return;
}
const data=snap.data();
if(data.role!=="partner"){
alert("Accès réservé aux partenaires");
window.location.href="index.html";
return;
}
document.getElementById("agencyName").value=data.agencyName||data.name||"";
document.getElementById("country").value=data.country||"";
document.getElementById("city").value=data.city||"";
document.getElementById("address").value=data.address||"";
document.getElementById("phone").value=data.phone||"";
document.getElementById("whatsapp").value=data.whatsapp||"";
document.getElementById("agencyEmail").value=data.agencyEmail||data.email||"";
document.getElementById("website").value=data.website||"";
document.getElementById("facebook").value=data.facebook||"";
document.getElementById("instagram").value=data.instagram||"";
document.getElementById("description").value=data.description||"";
if(data.logo){
document.getElementById("agencyLogoPreview").src=data.logo;
document.getElementById("publicLogo").src=data.logo;
}
updatePreview(data);
}catch(error){
console.error("LOAD PROFILE ERROR:",error);
}
}

function updatePreview(data){
const name=document.getElementById("agencyName").value||data.agencyName||"AQUAREV Partner";
const country=document.getElementById("country").value||data.country||"International";
document.getElementById("publicName").textContent=name;
document.getElementById("publicCountry").textContent=country;
const facebook=document.getElementById("facebook").value;
const instagram=document.getElementById("instagram").value;
const website=document.getElementById("website").value;
document.getElementById("publicFacebook").href=facebook||"#";
document.getElementById("publicInstagram").href=instagram||"#";
document.getElementById("publicWebsite").href=website||"#";
}

document.querySelectorAll("input,textarea").forEach(field=>{
field.addEventListener("input",()=>{
updatePreview({});
});
});

const logoInput=document.getElementById("agencyLogo");

if(logoInput){
logoInput.addEventListener("change",(e)=>{
const file=e.target.files[0];
if(!file)return;
const reader=new FileReader();
reader.onload=function(event){
document.getElementById("agencyLogoPreview").src=event.target.result;
document.getElementById("publicLogo").src=event.target.result;
};
reader.readAsDataURL(file);
});
}

document.getElementById("agencyProfileForm").addEventListener("submit",async(e)=>{
e.preventDefault();
try{
const ref=doc(db,"users",currentUID);
await updateDoc(ref,{
agencyName:document.getElementById("agencyName").value,
country:document.getElementById("country").value,
city:document.getElementById("city").value,
address:document.getElementById("address").value,
phone:document.getElementById("phone").value,
whatsapp:document.getElementById("whatsapp").value,
agencyEmail:document.getElementById("agencyEmail").value,
website:document.getElementById("website").value,
facebook:document.getElementById("facebook").value,
instagram:document.getElementById("instagram").value,
description:document.getElementById("description").value,
updatedAt:serverTimestamp()
});
alert("Informations agence enregistrées avec succès");
}catch(error){
console.error("SAVE PROFILE ERROR:",error);
alert("Erreur lors de l'enregistrement");
}
});