import{db,auth}from"./firebase/firebase-config.js";
import{collection,getDocs,query,where,doc,deleteDoc,updateDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import{onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const COLLECTION_NAME="organizedTrips";
const ADMIN_EMAIL="agence.aquarev.travel@gmail.com";
const programsGrid=document.getElementById("programsGrid");
const programsStatus=document.getElementById("programsStatus");
const mobileMenuBtn=document.getElementById("mobileMenuBtn");
const mobileNav=document.getElementById("mobileNav");
const backTop=document.getElementById("backTop");
const currentYear=document.getElementById("currentYear");

let currentLanguage=localStorage.getItem("AQUAREV-language")||"fr";
let galleryImages=[];
let galleryIndex=0;
let currentUser=null;
let authReady=false;

const translations={
fr:{
loading:"Chargement des programmes Omra & Hajj...",emptyTitle:"Aucun programme disponible",emptyText:"Nos nouveaux programmes de Omra et Hajj seront bientôt disponibles.",error:"Impossible de charger les programmes. Veuillez réessayer plus tard.",programType:"Type de programme",omra:"Omra",hajj:"Hajj",package:"Type de forfait",departure:"Départ",returnDate:"Retour",additionalDates:"Dates de départ disponibles",mecca:"La Mecque",medina:"Médine",nights:"Nuits",airline:"Compagnie aérienne",flightType:"Type de vol",direct:"Vol direct",stopover:"Avec escale",meccaHotel:"Hôtel à La Mecque",medinaHotel:"Hôtel à Médine",address:"Adresse",roomType:"Type de chambre",meccaHotelDistance:"Distance de l'hôtel au Masjid al-Haram",medinaHotelDistance:"Distance de l'hôtel à la Mosquée du Prophète",km:"km",guide:"Guide religieux",withGuide:"Avec guide",withoutGuide:"Sans guide",ziyarat:"Ziyarat",baggage:"Bagages",bag:"bagage",bags:"bagages",kg:"kg",price:"Prix",priceFrom:"À partir de",viewPhotos:"Voir les photos",viewVideos:"Voir les vidéos",viewProgram:"Voir le programme",downloadPdf:"Télécharger le programme",reserve:"Réserver",noPhotos:"Aucune photo",photos:"photos",videos:"vidéos",deleteProgram:"Supprimer le programme",deleteConfirm:"Voulez-vous vraiment supprimer ce programme ?",deleteSuccess:"Programme supprimé avec succès.",deleteError:"Impossible de supprimer ce programme.",description:"Description",editProgram:"Modifier le programme",edit:"Modifier",delete:"Supprimer",saveChanges:"Enregistrer les modifications",cancel:"Annuler",saveSuccess:"Modifications enregistrées avec succès.",saveError:"Impossible d'enregistrer les modifications.",existingMedia:"Fichiers actuels",uploadImage:"Ajouter des images",uploadVideo:"Ajouter des vidéos",uploadPdf:"Remplacer le PDF",remove:"Supprimer",currency:"Devise"},
en:{
loading:"Loading Umrah & Hajj programs...",emptyTitle:"No programs available",emptyText:"Our new Umrah and Hajj programs will be available soon.",error:"Unable to load programs. Please try again later.",programType:"Program type",omra:"Umrah",hajj:"Hajj",package:"Package type",departure:"Departure",returnDate:"Return",additionalDates:"Available departure dates",mecca:"Makkah",medina:"Madinah",nights:"Nights",airline:"Airline",flightType:"Flight type",direct:"Direct flight",stopover:"With stopover",meccaHotel:"Makkah hotel",medinaHotel:"Madinah hotel",address:"Address",roomType:"Room type",meccaHotelDistance:"Hotel distance to Masjid al-Haram",medinaHotelDistance:"Hotel distance to the Prophet's Mosque",km:"km",guide:"Religious guide",withGuide:"With guide",withoutGuide:"Without guide",ziyarat:"Ziyarat",baggage:"Baggage",bag:"bag",bags:"bags",kg:"kg",price:"Price",priceFrom:"From",viewPhotos:"View photos",viewVideos:"View videos",viewProgram:"View program",downloadPdf:"Download program",reserve:"Reserve",noPhotos:"No photos",photos:"photos",videos:"videos",deleteProgram:"Delete program",deleteConfirm:"Do you really want to delete this program?",deleteSuccess:"Program deleted successfully.",deleteError:"Unable to delete program.",description:"Description",editProgram:"Edit program",edit:"Edit",delete:"Delete",saveChanges:"Save changes",cancel:"Cancel",saveSuccess:"Changes saved successfully.",saveError:"Unable to save changes.",existingMedia:"Current files",uploadImage:"Add images",uploadVideo:"Add videos",uploadPdf:"Replace PDF",remove:"Remove",currency:"Currency"},
ar:{
loading:"جاري تحميل برامج العمرة والحج...",emptyTitle:"لا توجد برامج متاحة",emptyText:"ستتوفر برامج العمرة والحج الجديدة قريبًا.",error:"تعذر تحميل البرامج. يرجى المحاولة مرة أخرى لاحقًا.",programType:"نوع البرنامج",omra:"عمرة",hajj:"حج",package:"نوع الباقة",departure:"تاريخ الذهاب",returnDate:"تاريخ العودة",additionalDates:"تواريخ الذهاب المتاحة",mecca:"مكة",medina:"المدينة المنورة",nights:"عدد الليالي",airline:"شركة الطيران",flightType:"نوع الرحلة",direct:"رحلة مباشرة",stopover:"رحلة مع توقف",meccaHotel:"فندق مكة",medinaHotel:"فندق المدينة",address:"العنوان",roomType:"نوع الغرفة",meccaHotelDistance:"مسافة الفندق عن المسجد الحرام",medinaHotelDistance:"مسافة الفندق عن المسجد النبوي",km:"كم",guide:"المرشد الديني",withGuide:"مع مرشد",withoutGuide:"بدون مرشد",ziyarat:"الزيارات",baggage:"الأمتعة",bag:"حقيبة",bags:"حقائب",kg:"كغ",price:"السعر",priceFrom:"ابتداءً من",viewPhotos:"عرض الصور",viewVideos:"عرض الفيديوهات",downloadPdf:"تحميل البرنامج",reserve:"حجز",noPhotos:"لا توجد صور",photos:"صور",videos:"فيديوهات",deleteProgram:"حذف البرنامج",deleteConfirm:"هل تريد حقًا حذف هذا البرنامج ؟",deleteSuccess:"تم حذف البرنامج بنجاح.",deleteError:"تعذر حذف البرنامج.",description:"الوصف",editProgram:"تعديل البرنامج",edit:"تعديل",delete:"حذف",saveChanges:"حفظ التغييرات",cancel:"إلغاء",saveSuccess:"تم حفظ التعديلات بنجاح.",saveError:"تعذر حفظ التعديلات.",existingMedia:"الملفات الحالية",uploadImage:"إضافة صور",uploadVideo:"إضافة فيديوهات",uploadPdf:"استبدال ملف PDF",remove:"حذف",currency:"العملة"}
};

function t(key){return translations[currentLanguage]?.[key]||translations.fr[key]||key}

function escapeHTML(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}

function isAdmin(){return!!currentUser&&String(currentUser.email||"").toLowerCase()===ADMIN_EMAIL.toLowerCase()}

function setLanguage(lang){
currentLanguage=["fr","en","ar"].includes(lang)?lang:"fr";
document.documentElement.lang=currentLanguage;
document.documentElement.dir=currentLanguage==="ar"?"rtl":"ltr";
document.querySelectorAll("[data-fr]").forEach(element=>{
const value=element.dataset[currentLanguage];
if(value!==undefined)element.textContent=value;
});
document.querySelectorAll(".language-btn").forEach(button=>button.classList.toggle("active",button.dataset.lang===currentLanguage));
localStorage.setItem("AQUAREV-language",currentLanguage);
if(authReady)loadPrograms();
}

function formatDate(value){
if(!value)return"—";
const date=new Date(`${value}T00:00:00`);
if(Number.isNaN(date.getTime()))return escapeHTML(value);
return new Intl.DateTimeFormat(currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-GB":"fr-FR",{day:"2-digit",month:"short",year:"numeric"}).format(date);
}

function formatPrice(value,currency){
if(value===null||value===undefined||value==="")return"—";
const number=Number(value);
if(Number.isNaN(number))return escapeHTML(value);
const formatted=new Intl.NumberFormat(currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-US":"fr-FR").format(number);
return`${formatted} ${escapeHTML(currency||"DZD")}`;
}

function normalizeMedia(media){
if(!Array.isArray(media))return[];
return media.map(item=>{
if(typeof item==="string")return{url:item,name:""};
if(item&&typeof item==="object")return{url:item.url||item.downloadURL||item.src||"",name:item.name||item.originalName||""};
return null;
}).filter(item=>item&&item.url);
}

function normalizePdf(pdf){
if(!pdf)return null;
if(typeof pdf==="string")return{url:pdf,name:"program.pdf"};
if(typeof pdf==="object"&&pdf.url)return{url:pdf.url,name:pdf.name||pdf.originalName||"program.pdf"};
return null;
}

function normalizeDepartureDates(program){
let dates=[];
if(Array.isArray(program.departureDates))dates=program.departureDates.filter(Boolean);
if(!dates.length&&program.departureDate)dates=[program.departureDate];
return[...new Set(dates)].sort();
}

function optimizeImageUrl(url){
if(!url)return"";
if(!String(url).includes("ik.imagekit.io"))return String(url);
if(String(url).includes("/tr:"))return String(url);
return String(url).replace("https://ik.imagekit.io/cqpxvyh61/","https://ik.imagekit.io/cqpxvyh61/tr:w-1200,q-80,fo-auto/");
}

function starsHTML(stars){
const count=Math.max(0,Math.min(5,Number(stars)||0));
return count?`<div class="stars" aria-label="${count} stars">${"★".repeat(count)}${"☆".repeat(5-count)}</div>`:"";
}

function createInfoItem(icon,label,value){
if(value===null||value===undefined||value==="")return"";
return`<div class="info-item"><i class="fa-solid ${icon}"></i>${escapeHTML(label)}<strong>${escapeHTML(value)}</strong></div>`;
}

function getProgramType(program){
if(program.programCategory==="hajj")return t("hajj");
if(program.programCategory==="omra")return t("omra");
if(program.programType==="hajj")return t("hajj");
return t("omra");
}

function getPackageType(program){return program.packageType||""}

function flightTypeHTML(value){
if(!value)return"";
const label=value==="direct"?t("direct"):value==="stopover"?t("stopover"):value;
return createInfoItem("fa-route",t("flightType"),label);
}

function guideHTML(value){
if(!value)return"";
const label=value==="with"?t("withGuide"):value==="without"?t("withoutGuide"):value;
return createInfoItem("fa-user-tie",t("guide"),label);
}

function baggageHTML(program){
const count=Number(program.baggageCount||0);
if(!count)return"";
const weights=[];
if(count>=1&&program.baggage1Weight!==null&&program.baggage1Weight!==undefined&&program.baggage1Weight!=="")weights.push(`${program.baggage1Weight} ${t("kg")}`);
if(count>=2&&program.baggage2Weight!==null&&program.baggage2Weight!==undefined&&program.baggage2Weight!=="")weights.push(`${program.baggage2Weight} ${t("kg")}`);
const label=count===1?t("bag"):t("bags");
let value=`${count} ${label}`;
if(weights.length)value+=` · ${weights.join(" + ")}`;
return createInfoItem("fa-suitcase-rolling",t("baggage"),value);
}

function additionalDatesHTML(program){
const dates=normalizeDepartureDates(program);
if(dates.length<=1)return"";
return`<div class="additional-dates-box"><div class="additional-dates-title"><i class="fa-solid fa-calendar-days"></i>${escapeHTML(t("additionalDates"))}</div><div class="additional-dates-list">${dates.map(date=>`<span>${escapeHTML(formatDate(date))}</span>`).join("")}</div></div>`;
}

function createMedia(program){
const images=normalizeMedia(program.images);
const videos=normalizeMedia(program.videos);
const firstImage=images[0]?.url||"";
const mediaContent=firstImage?`<img src="${escapeHTML(optimizeImageUrl(firstImage))}" data-original-src="${escapeHTML(firstImage)}" alt="${escapeHTML(program.city||"AQUAREV Travel")}" loading="lazy" decoding="async">`:`<div class="media-placeholder"><i class="fa-solid fa-kaaba"></i></div>`;
const parts=[];
if(images.length)parts.push(`<i class="fa-solid fa-images"></i> ${images.length} ${t("photos")}`);
if(videos.length)parts.push(`<i class="fa-solid fa-video"></i> ${videos.length} ${t("videos")}`);
return`<div class="program-media">${mediaContent}<div class="program-location"><i class="fa-solid fa-location-dot"></i>${escapeHTML(program.city||program.country||"")}</div>${parts.length?`<div class="media-count">${parts.join(" · ")}</div>`:""}</div>`;
}

function createHotelBox(icon,title,name,stars,address,roomType,distance,distanceLabel){
const room=roomType?createInfoItem("fa-bed",t("roomType"),roomType):"";
const hotelDistance=distance!==null&&distance!==undefined&&distance!==""?createInfoItem("fa-person-walking",distanceLabel,`${distance} ${t("km")}`):"";
return`<div class="hotel-box"><div class="hotel-name"><i class="fa-solid ${icon}"></i><span>${escapeHTML(title)}: ${escapeHTML(name||"—")}</span></div>${starsHTML(stars)}${address?`<div class="hotel-address"><i class="fa-solid fa-location-dot"></i>${escapeHTML(address)}</div>`:""}${room}${hotelDistance}</div>`;
}

function sanitizeFileName(name){return name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]/g,"_")}

async function getImageKitAuth(){
const response=await fetch("/api/imagekit-auth",{method:"GET",headers:{"Accept":"application/json"}});
if(!response.ok)throw new Error("Impossible d'obtenir l'authentification ImageKit.");
const authData=await response.json();
if(!authData?.token||!authData?.signature||!authData?.expire||!authData?.publicKey)throw new Error("Réponse d'authentification ImageKit invalide.");
return authData;
}

async function uploadFileToImageKit(file,programId,type,index){
const authData=await getImageKitAuth();
const safeName=sanitizeFileName(file.name);
const fileName=`${Date.now()}_${index}_${safeName}`;
const folder=`/organizedTrips/${programId}/${type}`;
const formData=new FormData();
formData.append("file",file);
formData.append("fileName",fileName);
formData.append("publicKey",authData.publicKey);
formData.append("signature",authData.signature);
formData.append("expire",String(authData.expire));
formData.append("token",authData.token);
formData.append("folder",folder);
formData.append("useUniqueFileName","false");
const response=await fetch("https://upload.imagekit.io/api/v1/files/upload",{method:"POST",body:formData});
const result=await response.json().catch(()=>null);
if(!response.ok||!result?.url)throw new Error(result?.message||`ImageKit upload failed with status ${response.status}.`);
return{name:file.name,url:result.url,path:result.filePath||result.name||`${folder}/${fileName}`,type:file.type,size:file.size};
}

async function uploadFiles(files,programId,type){
const uploaded=[];
for(let index=0;index<files.length;index++)uploaded.push(await uploadFileToImageKit(files[index],programId,type,index));
return uploaded;
}

function ensureEditorStyles(){
if(document.getElementById("aquarevOmraEditorStyles"))return;
const style=document.createElement("style");
style.id="aquarevOmraEditorStyles";
style.textContent=`
.aquarev-omra-edit-overlay{position:fixed;inset:0;background:rgba(3,18,32,.78);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}
.aquarev-omra-edit-modal{width:min(1050px,100%);max-height:94vh;overflow:auto;background:#fff;border-radius:20px;box-shadow:0 25px 80px rgba(0,0,0,.35);padding:28px;color:#063b5c}
.aquarev-omra-edit-head{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:20px}
.aquarev-omra-edit-head h2{margin:0;color:#063b5c}
.aquarev-omra-close{border:0;background:#eef7fa;width:42px;height:42px;border-radius:50%;font-size:20px;cursor:pointer}
.aquarev-omra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
.aquarev-omra-field{display:flex;flex-direction:column;gap:7px}
.aquarev-omra-field.full{grid-column:1/-1}
.aquarev-omra-field label{font-weight:700;font-size:14px}
.aquarev-omra-field input,.aquarev-omra-field select,.aquarev-omra-field textarea{width:100%;padding:12px;border:1px solid #cbdde4;border-radius:10px;font:inherit;background:#fff;color:#063b5c}
.aquarev-omra-field textarea{min-height:130px;resize:vertical}
.aquarev-omra-media{margin-top:20px;padding-top:20px;border-top:1px solid #dbeaf0}
.aquarev-omra-media h3{margin:0 0 12px}
.aquarev-omra-existing{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px}
.aquarev-omra-item{display:flex;align-items:center;gap:8px;background:#eef7fa;padding:8px 10px;border-radius:10px}
.aquarev-omra-item img{width:70px;height:55px;object-fit:cover;border-radius:7px}
.aquarev-omra-item span{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.aquarev-omra-item button{border:0;background:#d9534f;color:#fff;border-radius:7px;padding:5px 8px;cursor:pointer}
.aquarev-omra-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:25px}
.aquarev-omra-actions button{border:0;border-radius:10px;padding:13px 20px;font-weight:700;cursor:pointer}
.aquarev-omra-cancel{background:#e9f2f5;color:#063b5c}
.aquarev-omra-save{background:#063b5c;color:#fff}
.aquarev-omra-save:disabled{opacity:.6;cursor:not-allowed}
.aquarev-omra-dates{margin-top:10px}
.aquarev-omra-date-row{display:grid;grid-template-columns:1fr 1fr 42px;gap:10px;margin-bottom:8px}
@media(max-width:700px){.aquarev-omra-grid{grid-template-columns:1fr}.aquarev-omra-field.full{grid-column:auto}.aquarev-omra-modal{padding:18px}.aquarev-omra-actions{flex-direction:column}.aquarev-omra-actions button{width:100%}}
`;
document.head.appendChild(style);
}

function createAdminMenu(program,card){
if(!isAdmin())return null;
const wrapper=document.createElement("div");
wrapper.style.cssText="position:absolute;top:12px;right:12px;z-index:20";
const button=document.createElement("button");
button.type="button";
button.className="admin-delete-btn";
button.title="Menu";
button.innerHTML='<i class="fa-solid fa-ellipsis-vertical"></i>';
const menu=document.createElement("div");
menu.style.cssText="display:none;position:absolute;right:0;top:44px;background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:6px;min-width:150px";
const edit=document.createElement("button");
edit.type="button";
edit.innerHTML=`<i class="fa-solid fa-pen"></i> ${escapeHTML(t("edit"))}`;
edit.style.cssText="display:block;width:100%;border:0;background:#fff;padding:10px;text-align:left;cursor:pointer;border-radius:7px;color:#063b5c";
const remove=document.createElement("button");
remove.type="button";
remove.innerHTML=`<i class="fa-solid fa-trash"></i> ${escapeHTML(t("delete"))}`;
remove.style.cssText="display:block;width:100%;border:0;background:#fff;padding:10px;text-align:left;cursor:pointer;border-radius:7px;color:#b42318";
edit.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();menu.style.display="none";openEditModal(program)});
remove.addEventListener("click",async event=>{
event.preventDefault();event.stopPropagation();menu.style.display="none";
if(!window.confirm(t("deleteConfirm")))return;
button.disabled=true;
try{
await deleteDoc(doc(db,COLLECTION_NAME,program.id));
card.remove();
if(!programsGrid.querySelector(".program-card"))showEmptyState();
alert(t("deleteSuccess"));
}catch(error){console.error("OMRA PROGRAM DELETE ERROR:",error);button.disabled=false;alert(t("deleteError"))}
});
button.addEventListener("click",event=>{
event.preventDefault();event.stopPropagation();
document.querySelectorAll(".aquarev-omra-menu").forEach(item=>{if(item!==menu)item.style.display="none"});
menu.classList.add("aquarev-omra-menu");
menu.style.display=menu.style.display==="block"?"none":"block";
});
wrapper.appendChild(button);
menu.appendChild(edit);
menu.appendChild(remove);
wrapper.appendChild(menu);
return wrapper;
}

function field(label,id,value,type="text",options=[]){
let control="";
if(type==="select")control=`<select id="${id}"><option value=""></option>${options.map(option=>`<option value="${escapeHTML(option.value)}" ${String(option.value)===String(value??"")?"selected":""}>${escapeHTML(option.label)}</option>`).join("")}</select>`;
else if(type==="textarea")control=`<textarea id="${id}">${escapeHTML(value||"")}</textarea>`;
else control=`<input id="${id}" type="${type}" value="${escapeHTML(value??"")}">`;
return`<div class="aquarev-omra-field"><label for="${id}">${escapeHTML(label)}</label>${control}</div>`;
}

function createMediaList(container,items,type){
const list=document.createElement("div");
list.className="aquarev-omra-existing";
items.forEach((item,index)=>{
const row=document.createElement("div");
row.className="aquarev-omra-item";
row.dataset.index=index;
if(type==="images")row.innerHTML=`<img src="${escapeHTML(optimizeImageUrl(item.url))}" alt=""><span>${escapeHTML(item.name||"image")}</span><button type="button">${escapeHTML(t("remove"))}</button>`;
else row.innerHTML=`<i class="fa-solid ${type==="videos"?"fa-video":"fa-file-pdf"}"></i><span>${escapeHTML(item.name||type)}</span><button type="button">${escapeHTML(t("remove"))}</button>`;
row.querySelector("button").addEventListener("click",()=>row.remove());
list.appendChild(row);
});
container.appendChild(list);
}

function openEditModal(program){
ensureEditorStyles();
const overlay=document.createElement("div");
overlay.className="aquarev-omra-edit-overlay";
const departureDates=normalizeDepartureDates(program);
const returnDates=Array.isArray(program.returnDates)?program.returnDates:[];
overlay.innerHTML=`
<div class="aquarev-omra-edit-modal">
<div class="aquarev-omra-edit-head"><h2>${escapeHTML(t("editProgram"))}</h2><button type="button" class="aquarev-omra-close">×</button></div>
<div class="aquarev-omra-grid">
${field(t("programType"),"omraType",program.programCategory||"omra","select",[{value:"omra",label:t("omra")},{value:"hajj",label:t("hajj")}])}
${field(t("package"),"omraPackage",program.packageType)}
${field(t("departure"),"omraDeparture",program.departureDate,"date")}
${field(t("returnDate"),"omraReturn",program.returnDate,"date")}
${field(t("mecca"),"omraCity",program.city)}
${field(t("medina"),"omraSecondCity",program.secondCity)}
${field(t("airline"),"omraAirline",program.airline)}
${field(t("flightType"),"omraFlight",program.flightType,"select",[{value:"direct",label:t("direct")},{value:"stopover",label:t("stopover")}])}
${field(t("guide"),"omraGuide",program.religiousGuide,"select",[{value:"with",label:t("withGuide")},{value:"without",label:t("withoutGuide")}])}
${field(t("ziyarat"),"omraZiyarat",program.ziyarat)}
${field(t("nights"),"omraNights",program.nights,"number")}
${field(t("baggage"),"omraBaggage",program.baggageCount||"","select",[{value:"1",label:"1"},{value:"2",label:"2"}])}
${field("Bagage 1 - kg","omraBag1",program.baggage1Weight,"number")}
${field("Bagage 2 - kg","omraBag2",program.baggage2Weight,"number")}
${field(t("price"),"omraPrice",program.price,"number")}
${field(t("currency"),"omraCurrency",program.currency,"select",[{value:"DZD",label:"DZD"},{value:"EUR",label:"EUR"},{value:"USD",label:"USD"}])}
${field(t("meccaHotel"),"omraMeccaHotel",program.meccaHotel)}
${field("★ "+t("meccaHotel"),"omraMeccaStars",program.meccaHotelStars,"select",[1,2,3,4,5].map(value=>({value,label:String(value)})))}
${field(t("address"),"omraMeccaAddress",program.meccaHotelAddress)}
${field(t("roomType"),"omraMeccaRoom",program.meccaRoomType)}
${field(t("meccaHotelDistance"),"omraMeccaDistance",program.meccaHotelDistance,"number")}
${field(t("medinaHotel"),"omraMedinaHotel",program.medinaHotel)}
${field("★ "+t("medinaHotel"),"omraMedinaStars",program.medinaHotelStars,"select",[1,2,3,4,5].map(value=>({value,label:String(value)})))}
${field(t("address"),"omraMedinaAddress",program.medinaHotelAddress)}
${field(t("roomType"),"omraMedinaRoom",program.medinaRoomType)}
${field(t("medinaHotelDistance"),"omraMedinaDistance",program.medinaHotelDistance,"number")}
${field(t("description"),"omraDescription",program.description,"textarea")}
<div class="aquarev-omra-field full"><label>${escapeHTML(t("additionalDates"))}</label><div class="aquarev-omra-dates" id="omraDates"></div><button type="button" id="omraAddDate" style="margin-top:8px;padding:9px;border:0;border-radius:8px;background:#eef7fa;color:#063b5c;cursor:pointer">+ ${escapeHTML(t("additionalDates"))}</button></div>
</div>
<div class="aquarev-omra-media"><h3>${escapeHTML(t("existingMedia"))}</h3><div id="omraExistingImages"></div><div id="omraExistingVideos"></div><div id="omraExistingPdf"></div></div>
<div class="aquarev-omra-media"><h3>${escapeHTML(t("uploadImage"))}</h3><input id="omraImages" type="file" accept="image/*" multiple></div>
<div class="aquarev-omra-media"><h3>${escapeHTML(t("uploadVideo"))}</h3><input id="omraVideos" type="file" accept="video/*" multiple></div>
<div class="aquarev-omra-media"><h3>${escapeHTML(t("uploadPdf"))}</h3><input id="omraPdf" type="file" accept="application/pdf,.pdf"></div>
<div class="aquarev-omra-actions"><button type="button" class="aquarev-omra-cancel">${escapeHTML(t("cancel"))}</button><button type="button" class="aquarev-omra-save">${escapeHTML(t("saveChanges"))}</button></div>
</div>`;
document.body.appendChild(overlay);

const close=()=>overlay.remove();
overlay.querySelector(".aquarev-omra-close").addEventListener("click",close);
overlay.querySelector(".aquarev-omra-cancel").addEventListener("click",close);
overlay.addEventListener("click",event=>{if(event.target===overlay)close()});

const datesBox=overlay.querySelector("#omraDates");
function addDateRow(dep="",ret=""){
const row=document.createElement("div");
row.className="aquarev-omra-date-row";
row.innerHTML=`<input type="date" value="${escapeHTML(dep)}"><input type="date" value="${escapeHTML(ret)}"><button type="button">×</button>`;
row.querySelector("button").addEventListener("click",()=>row.remove());
datesBox.appendChild(row);
}
departureDates.slice(1).forEach((date,index)=>addDateRow(date,returnDates[index+1]||program.returnDate||""));
overlay.querySelector("#omraAddDate").addEventListener("click",()=>addDateRow());

createMediaList(overlay.querySelector("#omraExistingImages"),normalizeMedia(program.images),"images");
createMediaList(overlay.querySelector("#omraExistingVideos"),normalizeMedia(program.videos),"videos");
const pdf=normalizePdf(program.pdf);
if(pdf)createMediaList(overlay.querySelector("#omraExistingPdf"),[pdf],"pdf");

overlay.querySelector(".aquarev-omra-save").addEventListener("click",async()=>{
const saveButton=overlay.querySelector(".aquarev-omra-save");
if(!isAdmin())return;
const departure=overlay.querySelector("#omraDeparture").value;
const returnDate=overlay.querySelector("#omraReturn").value;
if(!departure||!returnDate||returnDate<departure){alert(t("saveError"));return}
saveButton.disabled=true;
saveButton.textContent=currentLanguage==="ar"?"جاري الحفظ...":currentLanguage==="en"?"Saving...":"Enregistrement...";
try{
const rows=[...datesBox.querySelectorAll(".aquarev-omra-date-row")];
const additionalPairs=rows.map(row=>({departureDate:row.children[0].value,returnDate:row.children[1].value})).filter(item=>item.departureDate);
for(const pair of additionalPairs)if(!pair.returnDate||pair.returnDate<pair.departureDate||pair.departureDate<departure)throw new Error("DATES");

const originalImages=normalizeMedia(program.images);
const originalVideos=normalizeMedia(program.videos);
const keptImages=originalImages.filter((item,index)=>overlay.querySelector(`#omraExistingImages .aquarev-omra-item[data-index="${index}"]`));
const keptVideos=originalVideos.filter((item,index)=>overlay.querySelector(`#omraExistingVideos .aquarev-omra-item[data-index="${index}"]`));
let keptPdf=pdf&&overlay.querySelector("#omraExistingPdf .aquarev-omra-item")?[pdf]:[];
const newImages=[...overlay.querySelector("#omraImages").files];
const newVideos=[...overlay.querySelector("#omraVideos").files];
const newPdf=[...overlay.querySelector("#omraPdf").files];

if(newImages.length)keptImages.push(...await uploadFiles(newImages,program.id,"images"));
if(newVideos.length)keptVideos.push(...await uploadFiles(newVideos,program.id,"videos"));
if(newPdf.length)keptPdf=await uploadFiles(newPdf,program.id,"pdf");

const baggage=Number(overlay.querySelector("#omraBaggage").value||0);
const programCategory=overlay.querySelector("#omraType").value||"omra";

const data={
programType:"omra_hajj",
programCategory,
packageType:overlay.querySelector("#omraPackage").value.trim(),
departureDate:departure,
returnDate:returnDate,
departureDates:[departure,...additionalPairs.map(item=>item.departureDate)],
returnDates:[returnDate,...additionalPairs.map(item=>item.returnDate)],
departureReturnDates:additionalPairs,
country:program.country||"Saudi Arabia",
city:overlay.querySelector("#omraCity").value.trim(),
secondCity:overlay.querySelector("#omraSecondCity").value.trim(),
nights:Number(overlay.querySelector("#omraNights").value||0),
airline:overlay.querySelector("#omraAirline").value.trim(),
flightType:overlay.querySelector("#omraFlight").value||"",
religiousGuide:overlay.querySelector("#omraGuide").value||"",
ziyarat:overlay.querySelector("#omraZiyarat").value.trim(),
baggageCount:baggage||null,
baggage1Weight:baggage>=1&&overlay.querySelector("#omraBag1").value!==""?Number(overlay.querySelector("#omraBag1").value):null,
baggage2Weight:baggage>=2&&overlay.querySelector("#omraBag2").value!==""?Number(overlay.querySelector("#omraBag2").value):null,
price:Number(overlay.querySelector("#omraPrice").value||0),
currency:overlay.querySelector("#omraCurrency").value,
meccaHotel:overlay.querySelector("#omraMeccaHotel").value.trim(),
meccaHotelStars:Number(overlay.querySelector("#omraMeccaStars").value||0),
meccaHotelAddress:overlay.querySelector("#omraMeccaAddress").value.trim(),
meccaRoomType:overlay.querySelector("#omraMeccaRoom").value.trim(),
meccaHotelDistance:overlay.querySelector("#omraMeccaDistance").value!==""?Number(overlay.querySelector("#omraMeccaDistance").value):null,
medinaHotel:overlay.querySelector("#omraMedinaHotel").value.trim(),
medinaHotelStars:Number(overlay.querySelector("#omraMedinaStars").value||0),
medinaHotelAddress:overlay.querySelector("#omraMedinaAddress").value.trim(),
medinaRoomType:overlay.querySelector("#omraMedinaRoom").value.trim(),
medinaHotelDistance:overlay.querySelector("#omraMedinaDistance").value!==""?Number(overlay.querySelector("#omraMedinaDistance").value):null,
description:overlay.querySelector("#omraDescription").value.trim(),
images:keptImages,
videos:keptVideos,
pdf:keptPdf[0]||null,
mediaCount:keptImages.length+keptVideos.length+(keptPdf.length?1:0),
published:true,
status:"published",
updatedAt:serverTimestamp()
};

await updateDoc(doc(db,COLLECTION_NAME,program.id),data);
alert(t("saveSuccess"));
close();
loadPrograms();
}catch(error){
console.error("OMRA PROGRAM EDIT ERROR:",error);
alert(t("saveError"));
}finally{
saveButton.disabled=false;
saveButton.textContent=t("saveChanges");
}
});
}

async function downloadPdfFile(url,fileName,button){
if(!url)return;
const originalHTML=button.innerHTML;
button.disabled=true;
button.classList.add("downloading");
button.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i>'+escapeHTML(t("downloadPdf"));
try{
const response=await fetch(url,{mode:"cors",credentials:"omit"});
if(!response.ok)throw new Error(`HTTP ${response.status}`);
const blob=await response.blob();
if(!blob.size)throw new Error("Empty PDF file");
const blobUrl=URL.createObjectURL(blob);
const link=document.createElement("a");
link.href=blobUrl;
link.download=fileName||"programme.pdf";
link.style.display="none";
document.body.appendChild(link);
link.click();
link.remove();
setTimeout(()=>URL.revokeObjectURL(blobUrl),1000);
}catch(error){
console.warn("DIRECT PDF DOWNLOAD FAILED:",error);
const fallback=document.createElement("a");
fallback.href=url;
fallback.download=fileName||"programme.pdf";
fallback.rel="noopener";
fallback.style.display="none";
document.body.appendChild(fallback);
fallback.click();
fallback.remove();
}finally{
button.disabled=false;
button.classList.remove("downloading");
button.innerHTML=originalHTML;
}
}

function createProgramCard(program){
const images=normalizeMedia(program.images);
const videos=normalizeMedia(program.videos);
const pdf=normalizePdf(program.pdf);
const departure=formatDate(program.departureDate);
const returnDate=formatDate(program.returnDate);
const nights=Number(program.nights||0);
const card=document.createElement("article");
card.className="program-card";
card.dataset.programId=program.id;
card.innerHTML=`
${createMedia(program)}
<div class="program-body">
<div class="program-type-badges">
<span class="type-badge"><i class="fa-solid fa-kaaba"></i>${escapeHTML(getProgramType(program))}</span>
${getPackageType(program)?`<span class="package-badge">${escapeHTML(getPackageType(program))}</span>`:""}
</div>
<h3 class="program-title">${escapeHTML(program.city||program.secondCity||"Omra & Hajj")}</h3>
<div class="program-subtitle"><i class="fa-solid fa-mosque"></i><span>${escapeHTML(program.country||"Saudi Arabia")}</span>${nights?`<span>• ${nights} ${escapeHTML(t("nights"))}</span>`:""}</div>
<div class="info-grid">
${createInfoItem("fa-calendar-days",t("departure"),departure)}
${createInfoItem("fa-calendar-check",t("returnDate"),returnDate)}
${createInfoItem("fa-mosque",t("mecca"),"Makkah")}
${createInfoItem("fa-city",t("medina"),program.secondCity||"")}
${createInfoItem("fa-moon",t("nights"),nights)}
${createInfoItem("fa-plane",t("airline"),program.airline)}
${flightTypeHTML(program.flightType)}
${guideHTML(program.religiousGuide)}
${baggageHTML(program)}
${program.ziyarat?createInfoItem("fa-landmark",t("ziyarat"),program.ziyarat):""}
</div>
${additionalDatesHTML(program)}
${program.description?`<div class="description-box"><div class="description-title"><i class="fa-solid fa-align-left"></i>${escapeHTML(t("description"))}</div><p class="program-description">${escapeHTML(program.description)}</p></div>`:""}
${createHotelBox("fa-hotel",t("meccaHotel"),program.meccaHotel,program.meccaHotelStars,program.meccaHotelAddress,program.meccaRoomType,program.meccaHotelDistance,t("meccaHotelDistance"))}
${createHotelBox("fa-hotel",t("medinaHotel"),program.medinaHotel,program.medinaHotelStars,program.medinaHotelAddress,program.medinaRoomType,program.medinaHotelDistance,t("medinaHotelDistance"))}
<div class="price-box"><div><div class="price-label">${escapeHTML(t("priceFrom"))}</div><div class="price">${formatPrice(program.price,program.currency)}</div></div><div class="currency">${escapeHTML(program.currency||"DZD")}</div></div>
<div class="program-primary-actions">
<a href="voyage-programme.html?id=${encodeURIComponent(program.id)}" class="card-btn program-view-btn" data-program-id="${escapeHTML(program.id)}"><i class="fa-solid fa-file-lines"></i>${escapeHTML(t("viewProgram"))}</a>
<a href="voyage-reservation.html?id=${encodeURIComponent(program.id)}" class="card-btn program-reserve-btn"><i class="fa-solid fa-calendar-check"></i>${escapeHTML(t("reserve"))}</a>
</div>
${pdf?`<div class="program-pdf-action"><a href="${escapeHTML(pdf.url)}" class="card-btn pdf-btn download-program-btn" data-pdf-url="${escapeHTML(pdf.url)}" data-pdf-name="${escapeHTML(pdf.name||"programme.pdf")}"><i class="fa-solid fa-download"></i>${escapeHTML(t("downloadPdf"))}</a></div>`:""}
<div class="card-actions">
${images.length?`<button type="button" class="card-btn photo-btn"><i class="fa-solid fa-images"></i>${escapeHTML(t("viewPhotos"))}</button>`:`<button type="button" class="card-btn secondary" disabled><i class="fa-solid fa-image"></i>${escapeHTML(t("noPhotos"))}</button>`}
${videos.length?`<button type="button" class="card-btn secondary video-btn"><i class="fa-solid fa-video"></i>${escapeHTML(t("viewVideos"))}</button>`:""}
</div>
</div>`;
const adminMenu=createAdminMenu(program,card);
if(adminMenu){
const media=card.querySelector(".program-media");
if(media){media.style.position="relative";media.appendChild(adminMenu)}
}
const photoButton=card.querySelector(".photo-btn");
const videoButton=card.querySelector(".video-btn");
const downloadButton=card.querySelector(".download-program-btn");
if(photoButton)photoButton.addEventListener("click",()=>openGallery(images));
if(videoButton)videoButton.addEventListener("click",()=>openVideo(videos));
if(downloadButton)downloadButton.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();downloadPdfFile(downloadButton.dataset.pdfUrl,downloadButton.dataset.pdfName||"programme.pdf",downloadButton)});
const cardImage=card.querySelector(".program-media img");
if(cardImage)cardImage.addEventListener("error",()=>{const originalUrl=cardImage.dataset.originalSrc;if(originalUrl&&cardImage.src!==originalUrl){cardImage.src=originalUrl;return}cardImage.replaceWith(Object.assign(document.createElement("div"),{className:"media-placeholder",innerHTML:'<i class="fa-solid fa-kaaba"></i>'}))});
return card;
}

function sortPrograms(programs){
return programs.sort((a,b)=>{
const dateA=a.createdAt?.seconds?Number(a.createdAt.seconds):Date.parse(a.createdAt||"")||0;
const dateB=b.createdAt?.seconds?Number(b.createdAt.seconds):Date.parse(b.createdAt||"")||0;
return dateB-dateA;
});
}

async function loadPrograms(){
if(!programsGrid||!programsStatus)return;
programsStatus.style.display="flex";
programsStatus.innerHTML=`<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i></div><span>${escapeHTML(t("loading"))}</span>`;
programsGrid.innerHTML="";
try{
const programsQuery=query(collection(db,COLLECTION_NAME),where("published","==",true));
const snapshot=await getDocs(programsQuery);
const programs=[];
snapshot.forEach(snapshotItem=>{
const data=snapshotItem.data();
if(data.status==="deleted")return;
if(data.programType!=="omra_hajj")return;
programs.push({id:snapshotItem.id,...data});
});
sortPrograms(programs);
programsStatus.style.display="none";
if(!programs.length){showEmptyState();return}
const fragment=document.createDocumentFragment();
programs.forEach(program=>fragment.appendChild(createProgramCard(program)));
programsGrid.appendChild(fragment);
}catch(error){
console.error("OMRA PROGRAMS LOAD ERROR:",error);
programsStatus.style.display="none";
programsGrid.innerHTML=`<div class="error-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${escapeHTML(t("error"))}</p></div>`;
}
}

function showEmptyState(){
programsGrid.innerHTML=`<div class="empty-state"><i class="fa-solid fa-kaaba"></i><h3>${escapeHTML(t("emptyTitle"))}</h3><p>${escapeHTML(t("emptyText"))}</p></div>`;
}

function createGalleryModal(){
if(document.getElementById("programGallery"))return;
const modal=document.createElement("div");
modal.id="programGallery";
modal.className="program-gallery";
modal.innerHTML=`<div class="gallery-inner"><button type="button" class="gallery-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button><button type="button" class="gallery-prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button><img class="gallery-image" src="" alt="AQUAREV Travel"><button type="button" class="gallery-next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button><div class="gallery-counter"></div></div>`;
document.body.appendChild(modal);
modal.querySelector(".gallery-close").addEventListener("click",closeGallery);
modal.querySelector(".gallery-prev").addEventListener("click",()=>changeGallery(-1));
modal.querySelector(".gallery-next").addEventListener("click",()=>changeGallery(1));
modal.addEventListener("click",event=>{if(event.target===modal)closeGallery()});
}

function openGallery(images){
if(!images.length)return;
createGalleryModal();
galleryImages=images;
galleryIndex=0;
updateGallery();
document.getElementById("programGallery").classList.add("open");
document.body.style.overflow="hidden";
}

function updateGallery(){
const modal=document.getElementById("programGallery");
if(!modal||!galleryImages.length)return;
const image=galleryImages[galleryIndex];
const imageElement=modal.querySelector(".gallery-image");
imageElement.onerror=()=>{if(imageElement.src!==image.url)imageElement.src=image.url};
imageElement.src=optimizeImageUrl(image.url);
imageElement.alt=image.name||"AQUAREV Travel";
modal.querySelector(".gallery-counter").textContent=`${galleryIndex+1} / ${galleryImages.length}`;
}

function changeGallery(direction){
if(!galleryImages.length)return;
galleryIndex+=direction;
if(galleryIndex<0)galleryIndex=galleryImages.length-1;
if(galleryIndex>=galleryImages.length)galleryIndex=0;
updateGallery();
}

function closeGallery(){
const modal=document.getElementById("programGallery");
if(modal)modal.classList.remove("open");
document.body.style.overflow="";
}

function createVideoModal(){
if(document.getElementById("programVideoModal"))return;
const modal=document.createElement("div");
modal.id="programVideoModal";
modal.className="video-modal";
modal.innerHTML=`<button type="button" class="video-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button><video controls playsinline></video>`;
document.body.appendChild(modal);
modal.querySelector(".video-close").addEventListener("click",closeVideo);
modal.addEventListener("click",event=>{if(event.target===modal)closeVideo()});
}

function openVideo(videos){
if(!videos.length)return;
createVideoModal();
const modal=document.getElementById("programVideoModal");
const video=modal.querySelector("video");
video.src=videos[0].url;
modal.classList.add("open");
document.body.style.overflow="hidden";
video.play().catch(()=>{});
}

function closeVideo(){
const modal=document.getElementById("programVideoModal");
if(!modal)return;
const video=modal.querySelector("video");
video.pause();
video.removeAttribute("src");
video.load();
modal.classList.remove("open");
document.body.style.overflow="";
}

document.querySelectorAll(".language-btn").forEach(button=>button.addEventListener("click",()=>setLanguage(button.dataset.lang)));
setLanguage(currentLanguage);

if(mobileMenuBtn&&mobileNav){
mobileMenuBtn.addEventListener("click",()=>{
mobileNav.classList.toggle("open");
const icon=mobileMenuBtn.querySelector("i");
if(icon)icon.className=mobileNav.classList.contains("open")?"fa-solid fa-xmark":"fa-solid fa-bars";
});
mobileNav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
mobileNav.classList.remove("open");
const icon=mobileMenuBtn.querySelector("i");
if(icon)icon.className="fa-solid fa-bars";
}));
}

if(backTop){
window.addEventListener("scroll",()=>backTop.classList.toggle("show",window.scrollY>450));
backTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
}

onAuthStateChanged(auth,user=>{
currentUser=user||null;
authReady=true;
loadPrograms();
});

document.addEventListener("keydown",event=>{
if(event.key==="Escape"){closeGallery();closeVideo()}
if(event.key==="ArrowRight"&&document.getElementById("programGallery")?.classList.contains("open"))changeGallery(document.documentElement.dir==="rtl"?-1:1);
if(event.key==="ArrowLeft"&&document.getElementById("programGallery")?.classList.contains("open"))changeGallery(document.documentElement.dir==="rtl"?1:-1);
});

window.addEventListener("storage",event=>{
if(event.key==="AQUAREV-language"&&event.newValue)setLanguage(event.newValue);
});

if(currentYear)currentYear.textContent=new Date().getFullYear();