import {db} from "./firebase/firebase-config.js";
import {collection,getDocs,query,where,addDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const COLLECTION_NAME="organizedTrips";
const RESERVATIONS_COLLECTION="voyageReservations";
const IMAGEKIT_AUTH_ENDPOINT="/api/imagekit-auth";
const IMAGEKIT_UPLOAD_ENDPOINT="https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PUBLIC_KEY="public_1NjVpA30j7zKViBEdGtCrkAtPm0=";
const params=new URLSearchParams(window.location.search);
const programId=params.get("id");

const elements={
programTitle:document.getElementById("program-title"),
programLocation:document.getElementById("program-location"),
programImage:document.getElementById("program-image"),
programCountry:document.getElementById("program-country"),
programCity:document.getElementById("program-city"),
programDeparture:document.getElementById("program-departure"),
programReturn:document.getElementById("program-return"),
programHotel:document.getElementById("program-hotel"),
programPrice:document.getElementById("program-price"),
programError:document.getElementById("program-error"),
programId:document.getElementById("program-id"),
programTitleField:document.getElementById("program-title-field"),
programCountryField:document.getElementById("program-country-field"),
programCityField:document.getElementById("program-city-field"),
programPriceField:document.getElementById("program-price-field"),
programCurrencyField:document.getElementById("program-currency-field"),
form:document.getElementById("reservation-form"),
firstName:document.getElementById("first-name"),
lastName:document.getElementById("last-name"),
dateOfBirth:document.getElementById("date-of-birth"),
placeOfBirth:document.getElementById("place-of-birth"),
phone:document.getElementById("phone"),
email:document.getElementById("email"),
passportNumber:document.getElementById("passport-number"),
passportIssueDate:document.getElementById("passport-issue-date"),
passportExpiryDate:document.getElementById("passport-expiry-date"),
passportImage:document.getElementById("passport-image"),
passportImageName:document.getElementById("passport-image-name"),
paymentReceipt:document.getElementById("payment-receipt"),
paymentReceiptName:document.getElementById("payment-receipt-name"),
submitButton:document.getElementById("confirm-reservation-btn"),
formMessage:document.getElementById("form-message"),
currentYear:document.getElementById("currentYear")||document.getElementById("current-year"),
mobileMenuBtn:document.getElementById("mobileMenuBtn"),
mobileNav:document.getElementById("mobileNav")
};

let currentLanguage=localStorage.getItem("AQUAREV-language")||"fr";
let currentProgram=null;

const translations={
fr:{
reservationTitle:"Réservation",
reservationSubtitle:"Réservez votre programme touristique",
selectedProgram:"PROGRAMME SÉLECTIONNÉ",
loadingProgram:"Chargement du programme...",
yourInformation:"VOS INFORMATIONS",
completeReservation:"Complétez votre réservation",
reservationNotice:"Veuillez renseigner vos informations exactement comme elles apparaissent sur votre passeport.",
country:"Pays",
city:"Ville",
departure:"Départ",
return:"Retour",
hotel:"Hôtel",
price:"Prix",
personalInformation:"Informations personnelles",
personalInformationDesc:"Vos coordonnées personnelles",
firstName:"Prénom",
lastName:"Nom",
dateOfBirth:"Date de naissance",
placeOfBirth:"Lieu de naissance",
phone:"Téléphone",
email:"Adresse Gmail",
passportInformation:"Informations du passeport",
passportInformationDesc:"Informations nécessaires au traitement du voyage",
passportNumber:"Numéro de passeport",
passportIssueDate:"Date de délivrance",
passportExpiryDate:"Date d'expiration",
documents:"Documents",
documentsDesc:"Téléversez les documents nécessaires",
passportCopy:"Photo du passeport",
passportCopyDesc:"Image claire de la page principale du passeport",
paymentReceipt:"Justificatif de paiement",
paymentReceiptDesc:"Reçu de virement bancaire, si vous avez choisi ce mode de paiement",
chooseFile:"Choisir un fichier",
noFileSelected:"Aucun fichier sélectionné",
paymentNote:"Le justificatif de paiement est facultatif si vous n'avez pas encore effectué le virement bancaire.",
secureReservation:"Réservation sécurisée",
secureReservationText:"Vos informations seront transmises à AQUAREV Travel pour traiter votre réservation.",
confirmReservation:"Confirmer la réservation",
backToPrograms:"Retour aux programmes",
footerText:"Votre partenaire pour des voyages d'exception.",
allRights:"Tous droits réservés.",
programNotFound:"Programme introuvable.",
missingProgramId:"Aucun programme n'a été sélectionné.",
loadError:"Impossible de charger le programme. Veuillez réessayer.",
requiredFields:"Veuillez remplir tous les champs obligatoires.",
invalidEmail:"Veuillez saisir une adresse Gmail valide.",
invalidDates:"Les dates du passeport sont invalides.",
expiryError:"La date d'expiration du passeport doit être postérieure à la date de délivrance.",
passportRequired:"Veuillez sélectionner une image ou un fichier PDF de votre passeport.",
uploadError:"Une erreur est survenue lors du téléchargement du document.",
saving:"Envoi de la réservation...",
successTitle:"Réservation envoyée",
successText:"Votre demande de réservation a bien été envoyée à AQUAREV Travel.",
successReference:"Référence de réservation",
reservationError:"Impossible d'envoyer votre réservation. Veuillez réessayer.",
fileTooLarge:"Le fichier est trop volumineux.",
invalidFileType:"Type de fichier non accepté."
},
en:{
reservationTitle:"Booking",
reservationSubtitle:"Book your tourist program",
selectedProgram:"SELECTED PROGRAM",
loadingProgram:"Loading program...",
yourInformation:"YOUR INFORMATION",
completeReservation:"Complete your booking",
reservationNotice:"Please enter your information exactly as it appears on your passport.",
country:"Country",
city:"City",
departure:"Departure",
return:"Return",
hotel:"Hotel",
price:"Price",
personalInformation:"Personal information",
personalInformationDesc:"Your personal details",
firstName:"First name",
lastName:"Last name",
dateOfBirth:"Date of birth",
placeOfBirth:"Place of birth",
phone:"Phone",
email:"Gmail address",
passportInformation:"Passport information",
passportInformationDesc:"Information required to process your trip",
passportNumber:"Passport number",
passportIssueDate:"Issue date",
passportExpiryDate:"Expiry date",
documents:"Documents",
documentsDesc:"Upload the required documents",
passportCopy:"Passport photo",
passportCopyDesc:"Clear image of the main passport page",
paymentReceipt:"Payment receipt",
paymentReceiptDesc:"Bank transfer receipt if you have chosen this payment method",
chooseFile:"Choose a file",
noFileSelected:"No file selected",
paymentNote:"The payment receipt is optional if you have not made the bank transfer yet.",
secureReservation:"Secure booking",
secureReservationText:"Your information will be sent to AQUAREV Travel to process your booking.",
confirmReservation:"Confirm booking",
backToPrograms:"Back to programs",
footerText:"Your partner for exceptional journeys.",
allRights:"All rights reserved.",
programNotFound:"Program not found.",
missingProgramId:"No program has been selected.",
loadError:"Unable to load the program. Please try again.",
requiredFields:"Please fill in all required fields.",
invalidEmail:"Please enter a valid Gmail address.",
invalidDates:"The passport dates are invalid.",
expiryError:"The passport expiry date must be after the issue date.",
passportRequired:"Please select a passport image or PDF file.",
uploadError:"An error occurred while uploading the document.",
saving:"Sending booking...",
successTitle:"Booking sent",
successText:"Your booking request has been successfully sent to AQUAREV Travel.",
successReference:"Booking reference",
reservationError:"Unable to send your booking. Please try again.",
fileTooLarge:"The file is too large.",
invalidFileType:"File type not accepted."
},
ar:{
reservationTitle:"الحجز",
reservationSubtitle:"احجز برنامجك السياحي",
selectedProgram:"البرنامج المختار",
loadingProgram:"جارٍ تحميل البرنامج...",
yourInformation:"معلوماتكم",
completeReservation:"إتمام الحجز",
reservationNotice:"يرجى إدخال معلوماتكم تمامًا كما هي موجودة في جواز السفر.",
country:"البلد",
city:"المدينة",
departure:"الذهاب",
return:"العودة",
hotel:"الفندق",
price:"السعر",
personalInformation:"المعلومات الشخصية",
personalInformationDesc:"معلوماتكم الشخصية",
firstName:"الاسم",
lastName:"اللقب",
dateOfBirth:"تاريخ الميلاد",
placeOfBirth:"مكان الميلاد",
phone:"الهاتف",
email:"عنوان Gmail",
passportInformation:"معلومات جواز السفر",
passportInformationDesc:"المعلومات اللازمة لمعالجة الرحلة",
passportNumber:"رقم جواز السفر",
passportIssueDate:"تاريخ الإصدار",
passportExpiryDate:"تاريخ انتهاء الصلاحية",
documents:"الوثائق",
documentsDesc:"قم برفع الوثائق المطلوبة",
passportCopy:"صورة جواز السفر",
passportCopyDesc:"صورة واضحة للصفحة الرئيسية لجواز السفر",
paymentReceipt:"وصل الدفع",
paymentReceiptDesc:"وصل التحويل البنكي في حالة اختيار هذه الطريقة للدفع",
chooseFile:"اختيار ملف",
noFileSelected:"لم يتم اختيار ملف",
paymentNote:"وصل الدفع اختياري إذا لم تقم بإجراء التحويل البنكي بعد.",
secureReservation:"حجز آمن",
secureReservationText:"سيتم إرسال معلوماتكم إلى AQUAREV Travel لمعالجة طلب الحجز.",
confirmReservation:"تأكيد الحجز",
backToPrograms:"العودة إلى البرامج",
footerText:"شريككم للسفر والرحلات الاستثنائية.",
allRights:"جميع الحقوق محفوظة.",
programNotFound:"البرنامج غير موجود.",
missingProgramId:"لم يتم اختيار أي برنامج.",
loadError:"تعذر تحميل البرنامج. يرجى المحاولة مرة أخرى.",
requiredFields:"يرجى ملء جميع الحقول المطلوبة.",
invalidEmail:"يرجى إدخال عنوان Gmail صالح.",
invalidDates:"تواريخ جواز السفر غير صحيحة.",
expiryError:"يجب أن يكون تاريخ انتهاء جواز السفر بعد تاريخ الإصدار.",
passportRequired:"يرجى اختيار صورة جواز السفر أو ملف PDF.",
uploadError:"حدث خطأ أثناء رفع الوثيقة.",
saving:"جارٍ إرسال الحجز...",
successTitle:"تم إرسال الحجز",
successText:"تم إرسال طلب الحجز بنجاح إلى AQUAREV Travel.",
successReference:"مرجع الحجز",
reservationError:"تعذر إرسال الحجز. يرجى المحاولة مرة أخرى.",
fileTooLarge:"الملف كبير جدًا.",
invalidFileType:"نوع الملف غير مقبول."
}
};

function t(key){
return translations[currentLanguage]?.[key]||translations.fr[key]||key;
}

function applyTranslations(){
document.documentElement.lang=currentLanguage;
document.documentElement.dir=currentLanguage==="ar"?"rtl":"ltr";
document.title=`AQUAREV Travel | ${t("reservationTitle")}`;

document.querySelectorAll("[data-i18n]").forEach(element=>{
const key=element.getAttribute("data-i18n");
if(translations[currentLanguage]?.[key])element.textContent=translations[currentLanguage][key];
});

document.querySelectorAll("[data-fr][data-en][data-ar]").forEach(element=>{
const value=element.getAttribute(`data-${currentLanguage}`);
if(value!==null)element.textContent=value;
});

document.querySelectorAll(".language-btn[data-lang]").forEach(button=>{
button.classList.toggle("active",button.getAttribute("data-lang")===currentLanguage);
});

if(elements.currentYear)elements.currentYear.textContent=new Date().getFullYear();
}

function setupLanguage(){
applyTranslations();

document.querySelectorAll(".language-btn[data-lang]").forEach(button=>{
button.addEventListener("click",()=>{
const language=button.getAttribute("data-lang");
if(!translations[language])return;
currentLanguage=language;
localStorage.setItem("AQUAREV-language",language);
applyTranslations();
if(currentProgram)renderProgram(currentProgram);
});
});
}

function setupMobileMenu(){
if(!elements.mobileMenuBtn||!elements.mobileNav)return;

elements.mobileMenuBtn.addEventListener("click",event=>{
event.stopPropagation();
elements.mobileNav.classList.toggle("open");
document.body.classList.toggle("mobile-menu-open",elements.mobileNav.classList.contains("open"));
});

elements.mobileNav.querySelectorAll("a").forEach(link=>{
link.addEventListener("click",()=>{
elements.mobileNav.classList.remove("open");
document.body.classList.remove("mobile-menu-open");
});
});

document.addEventListener("click",event=>{
if(!elements.mobileNav.contains(event.target)&&!elements.mobileMenuBtn.contains(event.target)){
elements.mobileNav.classList.remove("open");
document.body.classList.remove("mobile-menu-open");
}
});
}

function clean(value){
return String(value??"").trim();
}

function formatDate(value){
if(!value)return"—";

let date;

if(typeof value==="object"&&typeof value.toDate==="function"){
date=value.toDate();
}else if(value instanceof Date){
date=value;
}else{
const raw=String(value).trim();
if(!raw)return"—";
date=new Date(raw);
}

if(Number.isNaN(date.getTime()))return String(value);

return new Intl.DateTimeFormat(
currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-GB":"fr-FR",
{day:"2-digit",month:"2-digit",year:"numeric"}
).format(date);
}

function getDateValue(value){
if(!value)return"";
if(typeof value==="object"&&typeof value.toDate==="function")return value.toDate();
if(value instanceof Date)return value;
const date=new Date(value);
return Number.isNaN(date.getTime())?null:date;
}

function getNestedValue(object,paths){
for(const path of paths){
const parts=path.split(".");
let value=object;
for(const part of parts){
if(value===undefined||value===null)break;
value=value[part];
}
if(value!==undefined&&value!==null&&value!=="")return value;
}
return"";
}

function getProgramTitle(program){
return clean(getNestedValue(program,[
"title",
"programTitle",
"name",
"program.title",
"details.title"
]))||"Programme touristique";
}

function getCountry(program){
return clean(getNestedValue(program,[
"country",
"programCountry",
"destination.country",
"location.country"
]));
}

function getCity(program){
return clean(getNestedValue(program,[
"city",
"programCity",
"destination.city",
"location.city"
]));
}

function getDeparture(program){
return getNestedValue(program,[
"departureDate",
"departure",
"startDate",
"dates.departure",
"dates.start"
]);
}

function getReturn(program){
return getNestedValue(program,[
"returnDate",
"return",
"endDate",
"dates.return",
"dates.end"
]);
}

function getHotel(program){
return clean(getNestedValue(program,[
"hotelName",
"hotel.name",
"hotel",
"accommodation.name"
]));
}

function getPriceData(program){
const priceValue=getNestedValue(program,[
"pricing.finalPriceDZD",
"pricing.finalPrice",
"finalPriceDZD",
"finalPrice",
"price",
"pricing.price"
]);

const currencyValue=clean(getNestedValue(program,[
"pricing.currency",
"currency"
]))||"DZD";

return{value:priceValue,currency:currencyValue};
}

function formatPrice(value,currency="DZD"){
if(value===undefined||value===null||value==="")return"—";

const numeric=Number(String(value).replace(/[^\d.,-]/g,"").replace(/,/g,""));

if(!Number.isFinite(numeric))return`${value} ${currency}`;

return new Intl.NumberFormat(
currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-US":"fr-FR",
{maximumFractionDigits:0}
).format(numeric)+` ${currency}`;
}

function getMediaImages(program){
const media=[];
const sources=[
program.images,
program.imageUrls,
program.photos,
program.media?.images,
program.media?.photos
];

for(const source of sources){
if(!Array.isArray(source))continue;

source.forEach(item=>{
if(typeof item==="string"&&item.trim()){
media.push(item.trim());
}else if(item&&typeof item==="object"){
const url=item.url||item.src||item.fileUrl||item.imageUrl;
if(url)media.push(String(url));
}
});
}

if(program.imageUrl)media.unshift(program.imageUrl);
if(program.image)media.unshift(program.image);

return[...new Set(media.filter(Boolean))];
}

function optimizeImageUrl(url){
if(!url)return"";

const imageUrl=String(url);

if(!imageUrl.includes("ik.imagekit.io"))return imageUrl;
if(imageUrl.includes("/tr:"))return imageUrl;

return imageUrl.replace(
"https://ik.imagekit.io/cqpxvyh61/",
"https://ik.imagekit.io/cqpxvyh61/tr:w-1200,q-80,fo-auto/"
);
}

function renderProgram(program){
currentProgram=program;

const title=getProgramTitle(program);
const country=getCountry(program);
const city=getCity(program);
const departure=getDeparture(program);
const returnDate=getReturn(program);
const hotel=getHotel(program);
const priceData=getPriceData(program);
const images=getMediaImages(program);

if(elements.programTitle)elements.programTitle.textContent=title;
if(elements.programLocation)elements.programLocation.textContent=[city,country].filter(Boolean).join(" • ");
if(elements.programCountry)elements.programCountry.textContent=country||"—";
if(elements.programCity)elements.programCity.textContent=city||"—";
if(elements.programDeparture)elements.programDeparture.textContent=formatDate(departure);
if(elements.programReturn)elements.programReturn.textContent=formatDate(returnDate);
if(elements.programHotel)elements.programHotel.textContent=hotel||"—";
if(elements.programPrice)elements.programPrice.textContent=formatPrice(priceData.value,priceData.currency);

if(elements.programImage){
if(images.length){
elements.programImage.src=optimizeImageUrl(images[0]);
elements.programImage.alt=title;
}else{
elements.programImage.removeAttribute("src");
elements.programImage.alt=title;
}
}

if(elements.programId)elements.programId.value=program.id||programId||"";
if(elements.programTitleField)elements.programTitleField.value=title;
if(elements.programCountryField)elements.programCountryField.value=country;
if(elements.programCityField)elements.programCityField.value=city;
if(elements.programPriceField)elements.programPriceField.value=priceData.value??"";
if(elements.programCurrencyField)elements.programCurrencyField.value=priceData.currency||"DZD";

if(elements.programError){
elements.programError.hidden=true;
elements.programError.textContent="";
}
}

function showProgramError(message){
if(elements.programError){
elements.programError.hidden=false;
elements.programError.textContent=message;
}

if(elements.programTitle)elements.programTitle.textContent=t("programNotFound");
if(elements.programLocation)elements.programLocation.textContent="";
}

async function loadProgram(){
if(!programId){
showProgramError(t("missingProgramId"));
return;
}

try{
const programQuery=query(
collection(db,COLLECTION_NAME),
where("__name__","==",programId)
);

const snapshot=await getDocs(programQuery);

if(snapshot.empty){
showProgramError(t("programNotFound"));
return;
}

const documentSnapshot=snapshot.docs[0];

const program={
id:documentSnapshot.id,
...documentSnapshot.data()
};

if(program.status==="deleted"||program.published===false){
showProgramError(t("programNotFound"));
return;
}

renderProgram(program);
}catch(error){
console.error("AQUAREV program loading error:",error);
showProgramError(t("loadError"));
}
}

function setupFileInput(input,nameElement){
if(!input||!nameElement)return;

input.addEventListener("change",()=>{
const file=input.files?.[0];

if(!file){
nameElement.textContent=t("noFileSelected");
return;
}

nameElement.textContent=file.name;
});
}

function showMessage(message,type="error"){
if(!elements.formMessage)return;

elements.formMessage.hidden=false;
elements.formMessage.className=`form-message ${type}`;
elements.formMessage.textContent=message;

elements.formMessage.scrollIntoView({
behavior:"smooth",
block:"center"
});
}

function clearMessage(){
if(!elements.formMessage)return;

elements.formMessage.hidden=true;
elements.formMessage.textContent="";
elements.formMessage.className="form-message";
}

function isValidGmail(email){
return/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(clean(email));
}

function validateFile(file,required=false){
if(!file){
if(required)return{valid:false,message:t("passportRequired")};
return{valid:true};
}

const maxSize=10*1024*1024;

if(file.size>maxSize){
return{valid:false,message:t("fileTooLarge")};
}

const allowedTypes=[
"image/jpeg",
"image/png",
"image/webp",
"application/pdf"
];

if(!allowedTypes.includes(file.type)){
return{valid:false,message:t("invalidFileType")};
}

return{valid:true};
}

function validateForm(){
if(
!clean(elements.firstName.value)||
!clean(elements.lastName.value)||
!clean(elements.dateOfBirth.value)||
!clean(elements.placeOfBirth.value)||
!clean(elements.phone.value)||
!clean(elements.email.value)||
!clean(elements.passportNumber.value)||
!clean(elements.passportIssueDate.value)||
!clean(elements.passportExpiryDate.value)
){
return{valid:false,message:t("requiredFields")};
}

if(!isValidGmail(elements.email.value)){
return{valid:false,message:t("invalidEmail")};
}

const issueDate=getDateValue(elements.passportIssueDate.value);
const expiryDate=getDateValue(elements.passportExpiryDate.value);

if(!issueDate||!expiryDate){
return{valid:false,message:t("invalidDates")};
}

if(expiryDate<=issueDate){
return{valid:false,message:t("expiryError")};
}

const passportValidation=validateFile(elements.passportImage.files?.[0],true);

if(!passportValidation.valid)return passportValidation;

const receiptValidation=validateFile(elements.paymentReceipt.files?.[0],false);

if(!receiptValidation.valid)return receiptValidation;

return{valid:true};
}

async function getImageKitAuth(){
const response=await fetch(IMAGEKIT_AUTH_ENDPOINT,{
method:"GET",
headers:{
"Accept":"application/json"
}
});

if(!response.ok){
throw new Error(`ImageKit authentication failed: ${response.status}`);
}

const data=await response.json();

if(!data.token||!data.signature||!data.expire){
throw new Error("Invalid ImageKit authentication response");
}

return data;
}

function sanitizeFileName(fileName){
return clean(fileName)
.replace(/[^\w.-]+/g,"_")
.replace(/_+/g,"_")
.substring(0,120);
}

async function uploadToImageKit(file,folder,fileName){
if(!file)return null;

const auth=await getImageKitAuth();
const formData=new FormData();

formData.append("file",file);
formData.append(
"fileName",
`${Date.now()}_${sanitizeFileName(fileName||file.name)}`
);
formData.append("publicKey",IMAGEKIT_PUBLIC_KEY);
formData.append("signature",auth.signature);
formData.append("expire",auth.expire);
formData.append("token",auth.token);
formData.append("folder",folder);
formData.append("useUniqueFileName","true");

const response=await fetch(IMAGEKIT_UPLOAD_ENDPOINT,{
method:"POST",
body:formData
});

if(!response.ok){
let message="";

try{
message=await response.text();
}catch(error){
message="";
}

throw new Error(`ImageKit upload failed: ${response.status} ${message}`);
}

const data=await response.json();

return{
url:data.url||"",
fileId:data.fileId||"",
name:data.name||file.name,
filePath:data.filePath||"",
thumbnailUrl:data.thumbnailUrl||"",
size:file.size,
type:file.type
};
}

function generateReservationReference(){
const date=new Date();

const stamp=[
date.getFullYear(),
String(date.getMonth()+1).padStart(2,"0"),
String(date.getDate()).padStart(2,"0")
].join("");

const random=Math.random().toString(36).substring(2,8).toUpperCase();

return`ARV-${stamp}-${random}`;
}

function setSubmitState(loading){
if(!elements.submitButton)return;

elements.submitButton.disabled=loading;

const icon=elements.submitButton.querySelector("i");
const text=elements.submitButton.querySelector("span");

if(loading){
if(icon)icon.className="fa-solid fa-spinner fa-spin";
if(text)text.textContent=t("saving");
}else{
if(icon)icon.className="fa-solid fa-circle-check";
if(text)text.textContent=t("confirmReservation");
}
}

async function sendReservationEmail(reservationData,programData){
try{
const response=await fetch("/voyage-reservation-email",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Accept":"application/json"
},
body:JSON.stringify({
...reservationData,
departureDate:programData.departureDate||"",
returnDate:programData.returnDate||"",
hotel:programData.hotel||""
})
});

if(!response.ok){
let errorMessage="";

try{
errorMessage=await response.text();
}catch(error){
errorMessage="";
}

throw new Error(`Reservation email failed: ${response.status} ${errorMessage}`);
}

const result=await response.json();

if(!result.success){
throw new Error(result.message||"Reservation email failed");
}

console.log("AQUAREV reservation email sent:",result);

return result;
}catch(error){
console.error("AQUAREV reservation email error:",error);
throw error;
}
}

async function submitReservation(event){
event.preventDefault();

clearMessage();

if(!currentProgram){
showMessage(t("programNotFound"));
return;
}

const validation=validateForm();

if(!validation.valid){
showMessage(validation.message);
return;
}

const passportFile=elements.passportImage.files?.[0]||null;
const receiptFile=elements.paymentReceipt.files?.[0]||null;
const reservationReference=generateReservationReference();

setSubmitState(true);

try{
const programTitle=getProgramTitle(currentProgram);
const country=getCountry(currentProgram);
const city=getCity(currentProgram);
const departure=getDeparture(currentProgram);
const returnDate=getReturn(currentProgram);
const hotel=getHotel(currentProgram);
const priceData=getPriceData(currentProgram);

const reservationBasePath=`organizedTrips/${currentProgram.id}/reservations/${reservationReference}`;

const passportUpload=await uploadToImageKit(
passportFile,
`${reservationBasePath}/passport`,
passportFile.name
);

let paymentReceiptUpload=null;

if(receiptFile){
paymentReceiptUpload=await uploadToImageKit(
receiptFile,
`${reservationBasePath}/payment`,
receiptFile.name
);
}

const reservationData={
reservationReference,
programId:currentProgram.id,
programTitle,
country,
city,
price:priceData.value??"",
currency:priceData.currency||"DZD",
customer:{
firstName:clean(elements.firstName.value),
lastName:clean(elements.lastName.value),
dateOfBirth:clean(elements.dateOfBirth.value),
placeOfBirth:clean(elements.placeOfBirth.value),
phone:clean(elements.phone.value),
email:clean(elements.email.value).toLowerCase()
},
passport:{
number:clean(elements.passportNumber.value).toUpperCase(),
issueDate:clean(elements.passportIssueDate.value),
expiryDate:clean(elements.passportExpiryDate.value)
},
passportImage:passportUpload,
paymentReceipt:paymentReceiptUpload,
status:"pending",
paymentStatus:receiptFile?"receipt_uploaded":"pending",
createdAt:serverTimestamp(),
updatedAt:serverTimestamp()
};

const reservationRef=await addDoc(
collection(db,RESERVATIONS_COLLECTION),
reservationData
);

await sendReservationEmail(
reservationData,
{
departureDate:formatDate(departure),
returnDate:formatDate(returnDate),
hotel
}
);

showMessage(
`${t("successText")} ${t("successReference")}: ${reservationReference}`,
"success"
);

elements.form.reset();

if(elements.programId)elements.programId.value=currentProgram.id;
if(elements.programTitleField)elements.programTitleField.value=programTitle;
if(elements.programCountryField)elements.programCountryField.value=country;
if(elements.programCityField)elements.programCityField.value=city;
if(elements.programPriceField)elements.programPriceField.value=priceData.value??"";
if(elements.programCurrencyField)elements.programCurrencyField.value=priceData.currency||"DZD";

if(elements.passportImageName)elements.passportImageName.textContent=t("noFileSelected");
if(elements.paymentReceiptName)elements.paymentReceiptName.textContent=t("noFileSelected");

console.log("AQUAREV reservation created:",{
reservationId:reservationRef.id,
reservationReference,
emailSent:true
});
}catch(error){
console.error("AQUAREV reservation error:",error);
showMessage(t("reservationError"));
}finally{
setSubmitState(false);
}
}

function setupForm(){
setupFileInput(
elements.passportImage,
elements.passportImageName
);

setupFileInput(
elements.paymentReceipt,
elements.paymentReceiptName
);

if(elements.form){
elements.form.addEventListener("submit",submitReservation);
}
}

function setupDates(){
const today=new Date().toISOString().split("T")[0];

if(elements.dateOfBirth){
elements.dateOfBirth.max=today;
}

if(elements.passportIssueDate){
elements.passportIssueDate.max=today;
}

if(elements.passportExpiryDate){
elements.passportExpiryDate.min=today;
}
}

function setupYear(){
if(elements.currentYear){
elements.currentYear.textContent=new Date().getFullYear();
}
}

function setupImageFallback(){
if(!elements.programImage)return;

elements.programImage.addEventListener("error",()=>{
elements.programImage.removeAttribute("src");
});
}

setupLanguage();
setupMobileMenu();
setupForm();
setupDates();
setupYear();
setupImageFallback();
loadProgram();