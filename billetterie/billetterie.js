document.addEventListener("DOMContentLoaded",function(){
loadAirlines();
loadSavedLanguage();
const form=document.getElementById("flightForm");
if(form){
form.addEventListener("submit",submitFlightRequest);
}
});
function loadAirlines(){
const select=document.getElementById("airline");
if(!select)return;
if(typeof airlines!=="undefined"&&Array.isArray(airlines)){
airlines.forEach(item=>{
const option=document.createElement("option");
option.value=item.code||item.name;
option.textContent=item.name;
select.appendChild(option);
});
}
}
function changeLanguage(lang){
localStorage.setItem("aquarev_language",lang);
applyLanguage(lang);
}
function loadSavedLanguage(){
const lang=localStorage.getItem("aquarev_language")||"fr";
applyLanguage(lang);
}
function applyLanguage(lang){
document.documentElement.lang=lang;
if(lang==="ar"){
document.body.setAttribute("dir","rtl");
}else{
document.body.setAttribute("dir","ltr");
}
const elements=document.querySelectorAll("[data-fr]");
elements.forEach(element=>{
if(element.dataset[lang]){
element.textContent=element.dataset[lang];
}
});
}
function collectFlightData(){
const form=document.getElementById("flightForm");
const formData=new FormData(form);
return formData;
}
async function submitFlightRequest(event){
event.preventDefault();
const button=document.querySelector(".submit-btn");
if(button){
button.disabled=true;
button.innerText=getText("sending");
}
try{
const formData=collectFlightData();
const response=await fetch("/flight-request",{
method:"POST",
body:formData
});
const result=await response.json();
if(result.success){
alert(getText("success"));
document.getElementById("flightForm").reset();
}else{
alert(getText("error"));
}
}catch(error){
console.error("FLIGHT REQUEST ERROR:",error);
alert(getText("server"));
}
finally{
if(button){
button.disabled=false;
button.innerText=getText("send");
}
}
}
function getText(type){
const lang=localStorage.getItem("aquarev_language")||"fr";
const texts={
sending:{
fr:"Envoi en cours...",
en:"Sending...",
ar:"جاري الإرسال..."
},
send:{
fr:"Envoyer la demande",
en:"Send request",
ar:"إرسال الطلب"
},
success:{
fr:"Votre demande a été envoyée avec succès",
en:"Your request has been sent successfully",
ar:"تم إرسال طلبك بنجاح"
},
error:{
fr:"Une erreur est survenue",
en:"An error occurred",
ar:"حدث خطأ"
},
server:{
fr:"Impossible de contacter le serveur AQUAREV",
en:"Unable to contact AQUAREV server",
ar:"تعذر الاتصال بخادم AQUAREV"
}
};
return texts[type][lang];
}
window.addEventListener("resize",function(){
const width=window.innerWidth;
if(width<600){
document.body.classList.add("mobile");
}else{
document.body.classList.remove("mobile");
}
});
function previewFiles(input){
const files=input.files;
const preview=document.getElementById("filePreview");
if(!preview)return;
preview.innerHTML="";
Array.from(files).forEach(file=>{
const item=document.createElement("div");
item.textContent=file.name;
preview.appendChild(item);
});
}