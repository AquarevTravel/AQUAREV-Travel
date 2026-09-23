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
loading:"Chargement des programmes...",
emptyTitle:"Aucun programme disponible",
emptyText:"Nos nouveaux programmes touristiques seront bientôt disponibles.",
error:"Impossible de charger les programmes. Veuillez réessayer plus tard.",
country:"Pays",city:"Ville",departure:"Départ",returnDate:"Retour",hotel:"Hôtel",address:"Adresse",price:"Prix",priceFrom:"À partir de",airline:"Compagnie aérienne",flightType:"Vol",direct:"Vol direct",stopover:"Avec escale",guide:"Guide",withGuide:"Avec guide touristique",withoutGuide:"Sans guide touristique",additionalDates:"Dates de départ disponibles",baggage:"Bagages",bag:"bagage",bags:"bagages",kg:"kg",viewPhotos:"Voir les photos",viewVideos:"Voir les vidéos",viewProgram:"Voir le programme",downloadPdf:"Télécharger le programme",reserve:"Réserver",noPhotos:"Aucune photo",noVideos:"Aucune vidéo",program:"Programme",videos:"vidéos",photos:"photos",contact:"Contacter l'agence",days:"Séjour",published:"Disponible",deleteProgram:"Supprimer le programme",deleteConfirm:"Voulez-vous vraiment supprimer ce programme ?",deleteSuccess:"Programme supprimé avec succès.",deleteError:"Impossible de supprimer ce programme.",editProgram:"Modifier le programme",edit:"Modifier",delete:"Supprimer",saveChanges:"Enregistrer les modifications",cancel:"Annuler",saveSuccess:"Modifications enregistrées avec succès.",saveError:"Impossible d'enregistrer les modifications.",uploadImage:"Ajouter des images",uploadVideo:"Ajouter des vidéos",uploadPdf:"Remplacer le PDF",existingMedia:"Fichiers actuels",remove:"Supprimer",noMedia:"Aucun fichier",description:"Description",currency:"Devise",stars:"Étoiles",flight:"Transport aérien"},
en:{
loading:"Loading programs...",emptyTitle:"No programs available",emptyText:"Our new travel programs will be available soon.",error:"Unable to load programs. Please try again later.",country:"Country",city:"City",departure:"Departure",returnDate:"Return",hotel:"Hotel",address:"Address",price:"Price",priceFrom:"From",airline:"Airline",flightType:"Flight",direct:"Direct flight",stopover:"With stopover",guide:"Guide",withGuide:"With tourist guide",withoutGuide:"Without tourist guide",additionalDates:"Available departure dates",baggage:"Baggage",bag:"bag",bags:"bags",kg:"kg",viewPhotos:"View photos",viewVideos:"View videos",viewProgram:"View program",downloadPdf:"Download program",reserve:"Reserve",noPhotos:"No photos",noVideos:"No video",program:"Program",videos:"videos",photos:"photos",contact:"Contact the agency",days:"Stay",published:"Available",deleteProgram:"Delete program",deleteConfirm:"Do you really want to delete this program?",deleteSuccess:"Program deleted successfully.",deleteError:"Unable to delete program.",editProgram:"Edit program",edit:"Edit",delete:"Delete",saveChanges:"Save changes",cancel:"Cancel",saveSuccess:"Changes saved successfully.",saveError:"Unable to save changes.",uploadImage:"Add images",uploadVideo:"Add videos",uploadPdf:"Replace PDF",existingMedia:"Current files",remove:"Remove",noMedia:"No files",description:"Description",currency:"Currency",stars:"Stars",flight:"Air transport"},
ar:{
loading:"جاري تحميل البرامج...",emptyTitle:"لا توجد برامج متاحة",emptyText:"ستتوفر برامجنا السياحية الجديدة قريبًا.",error:"تعذر تحميل البرامج. يرجى المحاولة مرة أخرى لاحقًا.",country:"الدولة",city:"المدينة",departure:"تاريخ الذهاب",returnDate:"تاريخ العودة",hotel:"الفندق",address:"العنوان",price:"السعر",priceFrom:"ابتداءً من",airline:"شركة الطيران",flightType:"الرحلة",direct:"رحلة مباشرة",stopover:"مع توقف",guide:"المرشد",withGuide:"مع مرشد سياحي",withoutGuide:"بدون مرشد سياحي",additionalDates:"تواريخ الذهاب المتاحة",baggage:"الأمتعة",bag:"حقيبة",bags:"حقائب",kg:"كغ",viewPhotos:"عرض الصور",viewVideos:"عرض الفيديوهات",viewProgram:"الإطلاع على البرنامج",downloadPdf:"تحميل البرنامج",reserve:"حجز",noPhotos:"لا توجد صور",noVideos:"لا يوجد فيديو",program:"البرنامج",videos:"فيديوهات",photos:"صور",contact:"تواصل مع الوكالة",days:"الإقامة",published:"متاح",deleteProgram:"حذف البرنامج",deleteConfirm:"هل تريد حقًا حذف البرنامج ؟",deleteSuccess:"تم حذف البرنامج بنجاح.",deleteError:"تعذر حذف البرنامج.",editProgram:"تعديل البرنامج",edit:"تعديل",delete:"حذف",saveChanges:"حفظ التغييرات",cancel:"إلغاء",saveSuccess:"تم حفظ التعديلات بنجاح.",saveError:"تعذر حفظ التعديلات.",uploadImage:"إضافة صور",uploadVideo:"إضافة فيديوهات",uploadPdf:"استبدال ملف PDF",existingMedia:"الملفات الحالية",remove:"حذف",noMedia:"لا توجد ملفات",description:"الوصف",currency:"العملة",stars:"النجوم",flight:"النقل الجوي"}
};

function getTranslation(key){return translations[currentLanguage]?.[key]||translations.fr[key]||key}

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

function calculateNights(start,end){
if(!start||!end)return"";
const first=new Date(`${start}T00:00:00`);
const last=new Date(`${end}T00:00:00`);
if(Number.isNaN(first.getTime())||Number.isNaN(last.getTime()))return"";
const difference=Math.round((last.getTime()-first.getTime())/(1000*60*60*24));
return difference<0?"":difference;
}

function formatPrice(value,currency){
if(value===null||value===undefined||value==="")return"—";
const number=Number(value);
if(Number.isNaN(number))return escapeHTML(value);
let formatted;
try{formatted=new Intl.NumberFormat(currentLanguage==="ar"?"ar-DZ":currentLanguage==="en"?"en-US":"fr-FR").format(number)}catch{formatted=number.toLocaleString()}
return`${formatted} ${escapeHTML(currency||"DZD")}`;
}

function starsHTML(stars){
const count=Math.max(0,Math.min(5,Number(stars)||0));
return count?`<div class="stars" aria-label="${count} stars">${"★".repeat(count)}${"☆".repeat(5-count)}</div>`:"";
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

function flightTypeHTML(value){
if(!value)return"";
const label=value==="direct"?getTranslation("direct"):value==="stopover"?getTranslation("stopover"):value;
return createInfoItem("fa-route",getTranslation("flightType"),label);
}

function guideHTML(value){
if(!value)return"";
const label=value==="with"?getTranslation("withGuide"):value==="without"?getTranslation("withoutGuide"):value;
return createInfoItem("fa-user-tie",getTranslation("guide"),label);
}

function baggageHTML(program){
const count=Number(program.baggageCount||0);
if(!count)return"";
const weights=[];
if(count>=1&&program.baggage1Weight!==null&&program.baggage1Weight!==undefined&&program.baggage1Weight!=="")weights.push(`${escapeHTML(program.baggage1Weight)} ${escapeHTML(getTranslation("kg"))}`);
if(count>=2&&program.baggage2Weight!==null&&program.baggage2Weight!==undefined&&program.baggage2Weight!=="")weights.push(`${escapeHTML(program.baggage2Weight)} ${escapeHTML(getTranslation("kg"))}`);
let label=count===1?getTranslation("bag"):getTranslation("bags");
let value=`${count} ${label}`;
if(weights.length)value+=` · ${weights.join(" + ")}`;
return createInfoItem("fa-suitcase-rolling",getTranslation("baggage"),value);
}

function additionalDatesHTML(program){
const dates=normalizeDepartureDates(program);
if(dates.length<=1)return"";
return`<div class="additional-dates-box"><div class="additional-dates-title"><i class="fa-solid fa-calendar-days"></i>${escapeHTML(getTranslation("additionalDates"))}</div><div class="additional-dates-list">${dates.map(date=>`<span>${escapeHTML(formatDate(date))}</span>`).join("")}</div></div>`;
}

function optimizeImageUrl(url){
if(!url)return"";
const imageUrl=String(url);
if(!imageUrl.includes("ik.imagekit.io"))return imageUrl;
if(imageUrl.includes("/tr:"))return imageUrl;
return imageUrl.replace("https://ik.imagekit.io/cqpxvyh61/","https://ik.imagekit.io/cqpxvyh61/tr:w-1200,q-80,fo-auto/");
}

function getFirstImage(program){
const images=normalizeMedia(program.images);
return images.length?images[0].url:"";
}

function createMedia(program){
const images=normalizeMedia(program.images);
const videos=normalizeMedia(program.videos);
const firstImage=getFirstImage(program);
const optimizedFirstImage=optimizeImageUrl(firstImage);
const mediaContent=firstImage?`<img src="${escapeHTML(optimizedFirstImage)}" data-original-src="${escapeHTML(firstImage)}" alt="${escapeHTML(program.city||program.country||"AQUAREV Travel")}" loading="lazy" decoding="async">`:`<div class="media-placeholder"><i class="fa-solid fa-plane-departure"></i></div>`;
let badges="";
if(images.length||videos.length){
const parts=[];
if(images.length)parts.push(`<i class="fa-solid fa-images"></i> ${images.length} ${getTranslation("photos")}`);
if(videos.length)parts.push(`<i class="fa-solid fa-video"></i> ${videos.length} ${getTranslation("videos")}`);
badges=`<div class="media-count">${parts.join(" · ")}</div>`;
}
return`<div class="program-media">${mediaContent}<div class="program-location"><i class="fa-solid fa-location-dot"></i>${escapeHTML(program.country||"")}${program.city?` · ${escapeHTML(program.city)}`:""}</div>${badges}</div>`;
}

function createInfoItem(icon,label,value){
return`<div class="info-item"><i class="fa-solid ${icon}"></i>${escapeHTML(label)}<strong>${escapeHTML(value||"—")}</strong></div>`;
}

function sanitizeFileName(name){return name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]/g,"_")}

async function getImageKitAuth(){
const response=await fetch("/api/imagekit-auth",{method:"GET",headers:{"Accept":"application/json"}});
if(!response.ok)throw new Error("Impossible d'obtenir l'authentification ImageKit.");
const authData=await response.json();
if(!authData?.token||!authData?.signature||!authData?.expire||!authData?.publicKey)throw new Error("Réponse d'authentification ImageKit invalide.");
return authData;
}

async function uploadFileToImageKit(file,programId,type,index,total){
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
for(let index=0;index<files.length;index++)uploaded.push(await uploadFileToImageKit(files[index],programId,type,index,files.length));
return uploaded;
}

function ensureEditorStyles(){
if(document.getElementById("aquarevProgramEditorStyles"))return;
const style=document.createElement("style");
style.id="aquarevProgramEditorStyles";
style.textContent=`
.aquarev-edit-overlay{position:fixed;inset:0;background:rgba(3,18,32,.78);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}
.aquarev-edit-modal{width:min(1000px,100%);max-height:94vh;overflow:auto;background:#fff;border-radius:20px;box-shadow:0 25px 80px rgba(0,0,0,.35);padding:28px;color:#063b5c}
.aquarev-edit-head{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:20px}
.aquarev-edit-head h2{margin:0;color:#063b5c}
.aquarev-edit-close{border:0;background:#eef7fa;width:42px;height:42px;border-radius:50%;font-size:20px;cursor:pointer}
.aquarev-edit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
.aquarev-edit-field{display:flex;flex-direction:column;gap:7px}
.aquarev-edit-field.full{grid-column:1/-1}
.aquarev-edit-field label{font-weight:700;font-size:14px}
.aquarev-edit-field input,.aquarev-edit-field select,.aquarev-edit-field textarea{width:100%;padding:12px;border:1px solid #cbdde4;border-radius:10px;font:inherit;background:#fff;color:#063b5c}
.aquarev-edit-field textarea{min-height:130px;resize:vertical}
.aquarev-edit-media{margin-top:20px;padding-top:20px;border-top:1px solid #dbeaf0}
.aquarev-edit-media h3{margin:0 0 12px}
.aquarev-existing-list{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px}
.aquarev-existing-item{display:flex;align-items:center;gap:8px;background:#eef7fa;padding:8px 10px;border-radius:10px;max-width:100%}
.aquarev-existing-item img{width:70px;height:55px;object-fit:cover;border-radius:7px}
.aquarev-existing-item span{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.aquarev-existing-item button{border:0;background:#d9534f;color:#fff;border-radius:7px;padding:5px 8px;cursor:pointer}
.aquarev-edit-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:25px}
.aquarev-edit-actions button{border:0;border-radius:10px;padding:13px 20px;font-weight:700;cursor:pointer}
.aquarev-edit-cancel{background:#e9f2f5;color:#063b5c}
.aquarev-edit-save{background:#063b5c;color:#fff}
.aquarev-edit-save:disabled{opacity:.6;cursor:not-allowed}
.aquarev-edit-extra{margin-top:12px}
.aquarev-edit-extra-row{display:grid;grid-template-columns:1fr 1fr 42px;gap:10px;margin-bottom:8px}
@media(max-width:700px){.aquarev-edit-grid{grid-template-columns:1fr}.aquarev-edit-field.full{grid-column:auto}.aquarev-edit-modal{padding:18px}.aquarev-edit-extra-row{grid-template-columns:1fr 1fr 38px}.aquarev-edit-actions{flex-direction:column}.aquarev-edit-actions button{width:100%}}
`;
document.head.appendChild(style);
}

function createAdminMenu(program,card){
if(!isAdmin())return null;
const wrapper=document.createElement("div");
wrapper.className="aquarev-admin-menu-wrap";
wrapper.style.cssText="position:absolute;top:12px;right:12px;z-index:20";
const button=document.createElement("button");
button.type="button";
button.className="admin-delete-btn";
button.title="Menu";
button.setAttribute("aria-label","Menu");
button.innerHTML='<i class="fa-solid fa-ellipsis-vertical"></i>';
const menu=document.createElement("div");
menu.style.cssText="display:none;position:absolute;right:0;top:44px;background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:6px;min-width:150px";
const edit=document.createElement("button");
edit.type="button";
edit.innerHTML=`<i class="fa-solid fa-pen"></i> ${escapeHTML(getTranslation("edit"))}`;
edit.style.cssText="display:block;width:100%;border:0;background:#fff;padding:10px;text-align:left;cursor:pointer;border-radius:7px;color:#063b5c";
const remove=document.createElement("button");
remove.type="button";
remove.innerHTML=`<i class="fa-solid fa-trash"></i> ${escapeHTML(getTranslation("delete"))}`;
remove.style.cssText="display:block;width:100%;border:0;background:#fff;padding:10px;text-align:left;cursor:pointer;border-radius:7px;color:#b42318";
edit.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();menu.style.display="none";openEditModal(program)});
remove.addEventListener("click",async event=>{
event.preventDefault();event.stopPropagation();menu.style.display="none";
if(!window.confirm(getTranslation("deleteConfirm")))return;
button.disabled=true;
try{
await deleteDoc(doc(db,COLLECTION_NAME,program.id));
card.remove();
if(!programsGrid.querySelector(".program-card"))showEmptyState();
alert(getTranslation("deleteSuccess"));
}catch(error){console.error("PROGRAM DELETE ERROR:",error);button.disabled=false;alert(getTranslation("deleteError"))}
});
button.addEventListener("click",event=>{
event.preventDefault();event.stopPropagation();
document.querySelectorAll(".aquarev-admin-menu").forEach(item=>{if(item!==menu)item.style.display="none"});
menu.classList.add("aquarev-admin-menu");
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
else control=`<input id="${id}" type="${type}" value="${escapeHTML(value||"")}">`;
return`<div class="aquarev-edit-field"><label for="${id}">${escapeHTML(label)}</label>${control}</div>`;
}

function createEditorMediaList(container,items,type){
const list=document.createElement("div");
list.className="aquarev-existing-list";
items.forEach((item,index)=>{
const row=document.createElement("div");
row.className="aquarev-existing-item";
row.dataset.index=index;
row.dataset.type=type;
if(type==="images")row.innerHTML=`<img src="${escapeHTML(optimizeImageUrl(item.url))}" alt=""><span>${escapeHTML(item.name||"image")}</span><button type="button">${escapeHTML(getTranslation("remove"))}</button>`;
else row.innerHTML=`<i class="fa-solid ${type==="videos"?"fa-video":"fa-file-pdf"}"></i><span>${escapeHTML(item.name||type)}</span><button type="button">${escapeHTML(getTranslation("remove"))}</button>`;
row.querySelector("button").addEventListener("click",()=>row.remove());
list.appendChild(row);
});
container.appendChild(list);
return list;
}

function openEditModal(program){
ensureEditorStyles();
const overlay=document.createElement("div");
overlay.className="aquarev-edit-overlay";
const departureDates=normalizeDepartureDates(program);
overlay.innerHTML=`
<div class="aquarev-edit-modal">
<div class="aquarev-edit-head"><h2>${escapeHTML(getTranslation("editProgram"))}</h2><button type="button" class="aquarev-edit-close">×</button></div>
<div class="aquarev-edit-grid">
${field(getTranslation("departure"),"editDeparture",program.departureDate,"date")}
${field(getTranslation("returnDate"),"editReturn",program.returnDate,"date")}
${field(getTranslation("country"),"editCountry",program.country)}
${field(getTranslation("city"),"editCity",program.city)}
${field(getTranslation("airline"),"editAirline",program.airline,"text")}
${field(getTranslation("flightType"),"editFlight",program.flightType,"select",[{value:"direct",label:getTranslation("direct")},{value:"stopover",label:getTranslation("stopover")}])}
${field(getTranslation("hotel"),"editHotel",program.hotel)}
${field(getTranslation("stars"),"editStars",program.hotelStars,"select",[1,2,3,4,5].map(value=>({value,label:String(value)})))}
${field(getTranslation("address"),"editAddress",program.hotelAddress)}
${field(getTranslation("guide"),"editGuide",program.tourGuide,"select",[{value:"with",label:getTranslation("withGuide")},{value:"without",label:getTranslation("withoutGuide")}])}
${field(getTranslation("baggage"),"editBaggage",program.baggageCount||"","select",[{value:"1",label:"1"},{value:"2",label:"2"}])}
${field("Bagage 1 - kg","editBag1",program.baggage1Weight,"number")}
${field("Bagage 2 - kg","editBag2",program.baggage2Weight,"number")}
${field(getTranslation("price"),"editPrice",program.price,"number")}
${field(getTranslation("currency"),"editCurrency",program.currency,"select",[{value:"DZD",label:"DZD"},{value:"EUR",label:"EUR"},{value:"USD",label:"USD"}])}
${field(getTranslation("description"),"editDescription",program.description,"textarea")}
<div class="aquarev-edit-field full"><label>${escapeHTML(getTranslation("additionalDates"))}</label><div class="aquarev-edit-extra" id="editDates"></div><button type="button" id="addEditDate" style="margin-top:8px;padding:9px;border:0;border-radius:8px;background:#eef7fa;color:#063b5c;cursor:pointer">+ ${escapeHTML(getTranslation("additionalDates"))}</button></div>
</div>
<div class="aquarev-edit-media"><h3>${escapeHTML(getTranslation("existingMedia"))}</h3><div id="editExistingImages"></div><div id="editExistingVideos"></div><div id="editExistingPdf"></div></div>
<div class="aquarev-edit-media"><h3>${escapeHTML(getTranslation("uploadImage"))}</h3><input id="editImages" type="file" accept="image/*" multiple></div>
<div class="aquarev-edit-media"><h3>${escapeHTML(getTranslation("uploadVideo"))}</h3><input id="editVideos" type="file" accept="video/*" multiple></div>
<div class="aquarev-edit-media"><h3>${escapeHTML(getTranslation("uploadPdf"))}</h3><input id="editPdf" type="file" accept="application/pdf,.pdf"></div>
<div class="aquarev-edit-actions"><button type="button" class="aquarev-edit-cancel">${escapeHTML(getTranslation("cancel"))}</button><button type="button" class="aquarev-edit-save">${escapeHTML(getTranslation("saveChanges"))}</button></div>
</div>`;
document.body.appendChild(overlay);
const modal=overlay.querySelector(".aquarev-edit-modal");
const close=()=>overlay.remove();
overlay.querySelector(".aquarev-edit-close").addEventListener("click",close);
overlay.querySelector(".aquarev-edit-cancel").addEventListener("click",close);
overlay.addEventListener("click",event=>{if(event.target===overlay)close()});

const datesBox=overlay.querySelector("#editDates");
function addDateRow(dep="",ret=""){
const row=document.createElement("div");
row.className="aquarev-edit-extra-row";
row.innerHTML=`<input type="date" value="${escapeHTML(dep)}"><input type="date" value="${escapeHTML(ret)}"><button type="button">×</button>`;
row.querySelector("button").addEventListener("click",()=>row.remove());
datesBox.appendChild(row);
}
departureDates.slice(1).forEach((date,index)=>addDateRow(date,Array.isArray(program.returnDates)?program.returnDates[index+1]||"":program.returnDate||""));
overlay.querySelector("#addEditDate").addEventListener("click",()=>addDateRow());

const imagesBox=overlay.querySelector("#editExistingImages");
const videosBox=overlay.querySelector("#editExistingVideos");
const pdfBox=overlay.querySelector("#editExistingPdf");
createEditorMediaList(imagesBox,normalizeMedia(program.images),"images");
createEditorMediaList(videosBox,normalizeMedia(program.videos),"videos");
const pdf=normalizePdf(program.pdf);
if(pdf)createEditorMediaList(pdfBox,[pdf],"pdf");

overlay.querySelector(".aquarev-edit-save").addEventListener("click",async()=>{
const saveButton=overlay.querySelector(".aquarev-edit-save");
if(!isAdmin())return;
const departure=overlay.querySelector("#editDeparture").value;
const returnDate=overlay.querySelector("#editReturn").value;
if(!departure||!returnDate||returnDate<departure){alert(getTranslation("saveError"));return}
saveButton.disabled=true;
saveButton.textContent=currentLanguage==="ar"?"جاري الحفظ...":currentLanguage==="en"?"Saving...":"Enregistrement...";
try{
const rows=[...datesBox.querySelectorAll(".aquarev-edit-extra-row")];
const additionalPairs=rows.map(row=>({departureDate:row.children[0].value,returnDate:row.children[1].value})).filter(item=>item.departureDate);
for(const pair of additionalPairs)if(!pair.returnDate||pair.returnDate<pair.departureDate||pair.departureDate<departure)throw new Error("DATES");
const newImages=[...overlay.querySelector("#editImages").files];
const newVideos=[...overlay.querySelector("#editVideos").files];
const newPdf=[...overlay.querySelector("#editPdf").files];
let keptImages=normalizeMedia(program.images).filter((item,index)=>overlay.querySelector(`#editExistingImages .aquarev-existing-item[data-index="${index}"]`));
let keptVideos=normalizeMedia(program.videos).filter((item,index)=>overlay.querySelector(`#editExistingVideos .aquarev-existing-item[data-index="${index}"]`));
let keptPdf=pdf&&overlay.querySelector("#editExistingPdf .aquarev-existing-item")?[pdf]:[];
if(newImages.length)keptImages.push(...await uploadFiles(newImages,program.id,"images"));
if(newVideos.length)keptVideos.push(...await uploadFiles(newVideos,program.id,"videos"));
if(newPdf.length)keptPdf=await uploadFiles(newPdf,program.id,"pdf");
const baggage=Number(overlay.querySelector("#editBaggage").value||0);
const data={
departureDate:departure,
returnDate:returnDate,
departureDates:[departure,...additionalPairs.map(item=>item.departureDate)],
returnDates:[returnDate,...additionalPairs.map(item=>item.returnDate)],
departureReturnDates:additionalPairs,
country:overlay.querySelector("#editCountry").value.trim(),
city:overlay.querySelector("#editCity").value.trim(),
airline:overlay.querySelector("#editAirline").value||"",
flightType:overlay.querySelector("#editFlight").value||"",
tourGuide:overlay.querySelector("#editGuide").value||"",
baggageCount:baggage||null,
baggage1Weight:baggage>=1&&overlay.querySelector("#editBag1").value!==""?Number(overlay.querySelector("#editBag1").value):null,
baggage2Weight:baggage>=2&&overlay.querySelector("#editBag2").value!==""?Number(overlay.querySelector("#editBag2").value):null,
hotel:overlay.querySelector("#editHotel").value.trim(),
hotelStars:Number(overlay.querySelector("#editStars").value||0),
hotelAddress:overlay.querySelector("#editAddress").value.trim(),
price:Number(overlay.querySelector("#editPrice").value||0),
currency:overlay.querySelector("#editCurrency").value,
description:overlay.querySelector("#editDescription").value.trim(),
images:keptImages,
videos:keptVideos,
pdf:keptPdf[0]||null,
mediaCount:keptImages.length+keptVideos.length+(keptPdf.length?1:0),
updatedAt:serverTimestamp()
};
await updateDoc(doc(db,COLLECTION_NAME,program.id),data);
alert(getTranslation("saveSuccess"));
close();
loadPrograms();
}catch(error){
console.error("PROGRAM EDIT ERROR:",error);
alert(error.message==="DATES"?getTranslation("saveError"):getTranslation("saveError"));
}finally{saveButton.disabled=false;saveButton.textContent=getTranslation("saveChanges")}
});
}

async function downloadPdfFile(url,fileName,button){
if(!url)return;
const originalText=button?.innerHTML||"";
if(button){button.disabled=true;button.innerHTML=`<i class="fa-solid fa-circle-notch fa-spin"></i>${escapeHTML(getTranslation("downloadPdf"))}`}
try{
const response=await fetch(url,{mode:"cors",credentials:"omit"});
if(!response.ok)throw new Error(`HTTP ${response.status}`);
const blob=await response.blob();
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
const link=document.createElement("a");
link.href=url;
link.download=fileName||"programme.pdf";
link.target="_blank";
link.rel="noopener";
link.style.display="none";
document.body.appendChild(link);
link.click();
link.remove();
}finally{if(button){button.disabled=false;button.innerHTML=originalText}}
}

function createProgramCard(program){
const images=normalizeMedia(program.images);
const videos=normalizeMedia(program.videos);
const pdf=normalizePdf(program.pdf);
const country=program.country||"";
const city=program.city||"";
const hotel=program.hotel||"";
const address=program.hotelAddress||"";
const description=program.description||"";
const stars=program.hotelStars||0;
const price=formatPrice(program.price,program.currency);
const departure=formatDate(program.departureDate);
const returnDate=formatDate(program.returnDate);
const nights=calculateNights(program.departureDate,program.returnDate);
const departureDates=normalizeDepartureDates(program);
const airline=program.airline||"";
const card=document.createElement("article");
card.className="program-card";
card.dataset.programId=program.id;
card.innerHTML=`
${createMedia(program)}
<div class="program-body">
<h3 class="program-title">${escapeHTML(city||country||getTranslation("program"))}</h3>
<div class="program-subtitle"><i class="fa-solid fa-earth-europe"></i><span>${escapeHTML(country||"AQUAREV Travel")}</span>${nights!==""?`<span>• ${nights} ${getTranslation("days")}</span>`:""}</div>
<div class="info-grid">
${createInfoItem("fa-calendar-days",getTranslation("departure"),departure)}
${createInfoItem("fa-calendar-check",getTranslation("returnDate"),returnDate)}
${createInfoItem("fa-globe",getTranslation("country"),country)}
${createInfoItem("fa-city",getTranslation("city"),city)}
${airline?createInfoItem("fa-plane",getTranslation("airline"),airline):""}
${flightTypeHTML(program.flightType)}
${guideHTML(program.tourGuide)}
${baggageHTML(program)}
</div>
${departureDates.length>1?additionalDatesHTML(program):""}
${description?`<p class="program-description">${escapeHTML(description)}</p>`:""}
<div class="hotel-box">
<div class="hotel-name"><i class="fa-solid fa-hotel"></i><span>${escapeHTML(hotel||"—")}</span></div>
${starsHTML(stars)}
${address?`<div class="hotel-address"><i class="fa-solid fa-location-dot"></i>${escapeHTML(address)}</div>`:""}
<div class="price-box"><div><div class="price-label">${escapeHTML(getTranslation("price"))}</div><div class="price"><span class="price-from">${escapeHTML(getTranslation("priceFrom"))}</span> ${price}</div></div><div class="currency">${escapeHTML(program.currency||"DZD")}</div></div>
<div class="program-primary-actions">
<a href="voyage-programme.html?id=${encodeURIComponent(program.id)}" class="card-btn program-view-btn" data-program-id="${escapeHTML(program.id)}"><i class="fa-solid fa-file-lines"></i>${escapeHTML(getTranslation("viewProgram"))}</a>
<a href="voyage-reservation.html?id=${encodeURIComponent(program.id)}" class="card-btn secondary program-reserve-btn" data-program-id="${escapeHTML(program.id)}"><i class="fa-solid fa-calendar-check"></i>${escapeHTML(getTranslation("reserve"))}</a>
</div>
${pdf?`<div class="program-pdf-action"><a href="${escapeHTML(pdf.url)}" class="card-btn pdf-btn" data-pdf-url="${escapeHTML(pdf.url)}" data-pdf-name="${escapeHTML(pdf.name||"programme.pdf")}"><i class="fa-solid fa-download"></i>${escapeHTML(getTranslation("downloadPdf"))}</a></div>`:""}
<div class="card-actions">
${images.length?`<button type="button" class="card-btn photo-btn"><i class="fa-solid fa-images"></i>${escapeHTML(getTranslation("viewPhotos"))}</button>`:`<button type="button" class="card-btn secondary" disabled><i class="fa-solid fa-image"></i>${escapeHTML(getTranslation("noPhotos"))}</button>`}
${videos.length?`<button type="button" class="card-btn secondary video-btn"><i class="fa-solid fa-video"></i>${escapeHTML(getTranslation("viewVideos"))}</button>`:""}
</div>
</div>
</div>`;
const adminMenu=createAdminMenu(program,card);
if(adminMenu){
const media=card.querySelector(".program-media");
if(media){media.style.position="relative";media.appendChild(adminMenu)}
}
const photoButton=card.querySelector(".photo-btn");
const videoButton=card.querySelector(".video-btn");
const pdfButton=card.querySelector(".pdf-btn");
if(photoButton)photoButton.addEventListener("click",()=>openGallery(images));
if(videoButton)videoButton.addEventListener("click",()=>openVideo(videos));
if(pdfButton)pdfButton.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();downloadPdfFile(pdfButton.dataset.pdfUrl,pdfButton.dataset.pdfName||"programme.pdf",pdfButton)});
const cardImage=card.querySelector(".program-media img");
if(cardImage)cardImage.addEventListener("error",()=>{const originalUrl=cardImage.dataset.originalSrc;if(originalUrl&&cardImage.src!==originalUrl){cardImage.src=originalUrl;return}cardImage.replaceWith(Object.assign(document.createElement("div"),{className:"media-placeholder",innerHTML:'<i class="fa-solid fa-image"></i>'}))});
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
programsStatus.innerHTML=`<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i></div><span>${escapeHTML(getTranslation("loading"))}</span>`;
programsGrid.innerHTML="";
try{
const programsQuery=query(collection(db,COLLECTION_NAME),where("published","==",true));
const snapshot=await getDocs(programsQuery);
const programs=[];
snapshot.forEach(documentSnapshot=>{
const data=documentSnapshot.data();
if(data.status==="deleted")return;
if(data.programType==="omra_hajj")return;
programs.push({id:documentSnapshot.id,...data});
});
sortPrograms(programs);
programsStatus.style.display="none";
if(!programs.length){showEmptyState();return}
const fragment=document.createDocumentFragment();
programs.forEach(program=>fragment.appendChild(createProgramCard(program)));
programsGrid.appendChild(fragment);
}catch(error){
console.error("PUBLIC PROGRAMS LOAD ERROR:",error);
programsStatus.style.display="none";
programsGrid.innerHTML=`<div class="error-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${escapeHTML(getTranslation("error"))}</p></div>`;
}
}

function showEmptyState(){
programsGrid.innerHTML=`<div class="empty-state"><i class="fa-solid fa-suitcase-rolling"></i><h3>${escapeHTML(getTranslation("emptyTitle"))}</h3><p>${escapeHTML(getTranslation("emptyText"))}</p></div>`;
}

function createGalleryModal(){
if(document.getElementById("programGallery"))return;
const modal=document.createElement("div");
modal.id="programGallery";
modal.className="program-gallery";
modal.innerHTML=`<div class="gallery-inner"><button type="button" class="gallery-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button><button type="button" class="gallery-prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button><img class="gallery-image" src="" alt="AQUAREV Travel" loading="eager" decoding="async"><button type="button" class="gallery-next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button><div class="gallery-counter"></div></div>`;
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
const counter=modal.querySelector(".gallery-counter");
const optimizedUrl=optimizeImageUrl(image.url);
imageElement.onerror=()=>{if(imageElement.src!==image.url)imageElement.src=image.url};
imageElement.src=optimizedUrl;
imageElement.alt=image.name||"AQUAREV Travel";
counter.textContent=`${galleryIndex+1} / ${galleryImages.length}`;
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

function setupLanguage(){
document.querySelectorAll(".language-btn").forEach(button=>button.addEventListener("click",()=>setLanguage(button.dataset.lang)));
setLanguage(currentLanguage);
}

function setupMobileMenu(){
if(!mobileMenuBtn||!mobileNav)return;
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

function setupBackTop(){
if(!backTop)return;
window.addEventListener("scroll",()=>{if(window.scrollY>450)backTop.classList.add("show");else backTop.classList.remove("show")});
backTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
}

onAuthStateChanged(auth,user=>{
currentUser=user||null;
authReady=true;
loadPrograms();
});

document.addEventListener("keydown",event=>{
if(event.key==="Escape"){closeGallery();closeVideo()}
if(event.key==="ArrowRight"){
const gallery=document.getElementById("programGallery");
if(gallery?.classList.contains("open"))changeGallery(document.documentElement.dir==="rtl"?-1:1);
}
if(event.key==="ArrowLeft"){
const gallery=document.getElementById("programGallery");
if(gallery?.classList.contains("open"))changeGallery(document.documentElement.dir==="rtl"?1:-1);
}
});

window.addEventListener("storage",event=>{
if(event.key==="AQUAREV-language"&&event.newValue)setLanguage(event.newValue);
});

setupLanguage();
setupMobileMenu();
setupBackTop();

if(currentYear)currentYear.textContent=new Date().getFullYear();