document.addEventListener("DOMContentLoaded", function () {


const form = document.getElementById("visaForm");

const selectedCountry = document.getElementById("selectedCountry");

const countryButton = document.getElementById("countryButton");

const countryPopup = document.getElementById("countryPopup");

const countrySearch = document.getElementById("countrySearch");

const manualCountry = document.getElementById("manualCountry");

const countryItems = document.querySelectorAll(".country-item");




// =================================================
// LANGUAGE SYSTEM
// =================================================


window.changeLanguage = function(lang){


    document.documentElement.lang = lang;

    document.body.dir = lang === "ar" ? "rtl" : "ltr";



    document.querySelectorAll("[data-"+lang+"]")
    .forEach(element=>{


        element.innerHTML =
        element.getAttribute("data-"+lang);


    });
    document.querySelectorAll("[data-"+lang+"-placeholder]")
    .forEach(element=>{
        element.placeholder =
        element.getAttribute(
            "data-"+lang+"-placeholder"
        );
    });
    document.querySelectorAll(".section-title")
    .forEach(section=>{
        section.style.flexDirection =
        lang === "ar"
        ? "row-reverse"
        : "row";
    });
};
// =================================================
// COUNTRY SELECTOR
// =================================================
if(countryButton && countryPopup){
countryButton.addEventListener(
"click",
function(){
countryPopup.classList.toggle("show");


});


}





countryItems.forEach(country=>{


country.addEventListener(
"click",
function(){



countryItems.forEach(item=>{

item.classList.remove("active");

});



this.classList.add("active");




if(selectedCountry){


selectedCountry.value =
this.dataset.country;


}

if(countryButton){

countryButton.innerHTML =
this.innerHTML;
}

if(countryPopup){
countryPopup.classList.remove("show");
}
});

});

if(countrySearch){
countrySearch.addEventListener(
"input",
function(){

const search =
this.value.toLowerCase().trim();

countryItems.forEach(country=>{
const name =
country.innerText.toLowerCase();
country.style.display =
name.includes(search)
? "block"
: "none";
});
});
}
if(manualCountry){
manualCountry.addEventListener(
"input",
function(){

const value =
this.value.trim();
if(value !== ""){
selectedCountry.value =
value;
countryButton.innerHTML =
"🌍 " + value;
}
});
}

// =================================================
// DYNAMIC SECTIONS CONTROL
// =================================================

function showSection(id){

const section =
document.getElementById(id);
if(section){
section.style.display =
"block";
section.classList.add("show");
}
}
function hideSections(list){
list.forEach(id=>{
const section =
document.getElementById(id);
if(section){
section.style.display =
"none";
section.classList.remove("show");
}
});
}
// =================================================
// VISA TYPE
// =================================================

window.showVisaDocuments=function(){
const type =
document.getElementById("visaType").value;
hideSections([
"tourismSection",
"businessSection",
"studySection",
"workSection",
"familySection"
]);
if(type){
showSection(
type+"Section"
);
}
};
const visaType =
document.getElementById("visaType");
if(visaType){
visaType.addEventListener(
"change",
showVisaDocuments
);
}
// =================================================
// ACTIVITY
// =================================================
window.showActivity=function(){
const type =
document.getElementById("activityType").value;
hideSections([
"commerceSection",
"employeeSection",
"freeSection",
"otherSection"
]);
if(type){
showSection(
type+"Section"
);
}
};
// =================================================
// RESIDENCE
// =================================================
window.showResidence=function(){
const type =
document.getElementById("residenceType").value;
hideSections([
"algeriaResidence",
"abroadResidence",
"bothResidence"
]);
if(type==="algeria"){
showSection(
"algeriaResidence"
);
}
if(type==="abroad"){
showSection(
"abroadResidence"
);
}
if(type==="both"){
showSection(
"bothResidence"
);
}
};

// =================================================
// PAYMENT SYSTEM
// =================================================
window.showPayment=function(){
const type =
document.getElementById("paymentMethod").value;
hideSections([
"cashPayment",
"baridiPayment",
"goldPayment",
"visaPayment"
]);
if(type){
showSection(
type+"Payment"
);
}
};
// =================================================
// FILE INPUT EFFECT
// =================================================

const fileInputs =
document.querySelectorAll(
"input[type='file']"
);
fileInputs.forEach(input=>{
input.addEventListener(
"change",
function(){
const box =
this.closest(".file-box");
if(box){
box.classList.add("loaded");
}
});
});
// =================================================
// PHONE VALIDATION
// =================================================
document
.querySelectorAll(
"input[type='tel']"
)
.forEach(phone=>{
phone.addEventListener(
"input",
function(){
this.value =
this.value.replace(
/[^0-9+]/g,
""
);
});
});
// =================================================
// SEND FORM TO NODE SERVER
// =================================================
if(form){
form.addEventListener(
"submit",
async function(e){
e.preventDefault();

// CHECK COUNTRY
if(
selectedCountry &&
selectedCountry.value.trim()===""
){
alert(
"Veuillez choisir le pays de destination"
);
return;
}
const submitButton =
document.querySelector(".submit-btn");
if(submitButton){
submitButton.disabled = true;
submitButton.innerHTML =
"⏳ ENVOI EN COURS...";
}
// CREATE FORM DATA
const formData =
new FormData();
// COLLECT ALL INPUTS

// ======================================
// COLLECT FORM DATA
// ======================================

const fields = form.querySelectorAll("input, select, textarea");

fields.forEach(field => {

    if (field.type === "file") {

        Array.from(field.files).forEach(file => {
            formData.append("documents", file);
        });

        return;
    }

    if (!field.value || field.value.trim() === "") {
        return;
    }

    const key =
        field.name ||
        field.id;

    if (key) {
        formData.append(key, field.value.trim());
    }

});

formData.set(
"destination",
selectedCountry.value.trim()
);

formData.set(
"visaType",
document.getElementById("visaType").value
);

formData.set(
"activityType",
document.getElementById("activityType").value
);

formData.set(
"residenceType",
document.getElementById("residenceType").value
);

formData.set(
"paymentMethod",
document.getElementById("paymentMethod").value
);
try{
const response =
await fetch(
"https://aquarev-travel.onrender.com/visa-request",
{
method:"POST",
body:formData
}
);
const result =
await response.json();
if(result.success){
alert(
"✅ Votre demande de visa a été envoyée avec succès à AQUAREV Travel"
);
// RESET FORM
form.reset();
if(selectedCountry){
selectedCountry.value="";
}
if(countryButton){
countryButton.innerHTML =
"🌍 Choisir le pays de destination";
}
}
else{
alert(
"❌ Erreur lors de l'envoi de votre demande"
);
}
}
catch(error){
console.error(
"SERVER ERROR:",
error
);
alert(
"❌ Impossible de contacter le serveur AQUAREV"
);
}
if(submitButton){
submitButton.disabled = false;
submitButton.innerHTML =
"✈️ ENVOYER LA DEMANDE";
}
});
}
// =================================================
// CLOSE POPUP OUTSIDE CLICK
// =================================================
if(countryPopup){
countryPopup.addEventListener(
"click",
function(e){
if(e.target === countryPopup){
countryPopup.classList.remove("show");
}
});
}
// =================================================
// SCROLL FUNCTION
// =================================================
window.scrollToSection=function(id){
const section =
document.getElementById(id);
if(section){
section.scrollIntoView({
behavior:"smooth",
block:"start"
});
}
};
// =================================================
// INPUT FOCUS EFFECT
// =================================================
document
.querySelectorAll(
"input, select, textarea"
)
.forEach(field=>{
field.addEventListener(
"focus",
function(){
this.style.borderColor =
"#d4af37";
});
field.addEventListener(
"blur",
function(){
this.style.borderColor =
"#ddd";
});
});
// =================================================
// INITIAL HIDE DYNAMIC SECTIONS
// =================================================
const hiddenSections = [
"tourismSection",
"businessSection",
"studySection",
"workSection",
"familySection",
"commerceSection",
"employeeSection",
"freeSection",
"otherSection",
"algeriaResidence",
"abroadResidence",
"bothResidence",
"cashPayment",
"baridiPayment",
"goldPayment",
"visaPayment"
];
hiddenSections.forEach(id=>{
const element =
document.getElementById(id);
if(element){
element.style.display =
"none";
}
});
// =================================================
// SUBMIT BUTTON ANIMATION
// =================================================

const submitButton =
document.querySelector(".submit-btn");
if(submitButton){
submitButton.addEventListener(
"mouseenter",
function(){
if(!this.disabled){
this.style.transform =
"scale(1.03)";
}
});
submitButton.addEventListener(
"mouseleave",
function(){
this.style.transform =
"scale(1)";
});
}
// =================================================
// AUTO SAVE LAST INPUT (LOCAL STORAGE)
// =================================================
document
.querySelectorAll(
"input:not([type=file]), textarea"
)
.forEach(input=>{
const saved =
localStorage.getItem(
input.id
);
if(saved){
input.value = saved;
}
input.addEventListener(
"input",
function(){
if(this.id){
localStorage.setItem(
this.id,
this.value
);
}
});
});
// =================================================
// REMOVE SAVED DATA AFTER SUCCESS
// =================================================
window.clearVisaStorage=function(){
Object.keys(localStorage)
.forEach(key=>{
localStorage.removeItem(key);
});
};
});