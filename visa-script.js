document.addEventListener("DOMContentLoaded",function(){
const form=document.getElementById("visaForm");
const selectedCountry=document.getElementById("selectedCountry");
const countryButton=document.getElementById("countryButton");
const countryPopup=document.getElementById("countryPopup");
const countrySearch=document.getElementById("countrySearch");
const manualCountry=document.getElementById("manualCountry");
const countryItems=document.querySelectorAll(".country-item");
const visaType=document.getElementById("visaType");
const previousVisa=document.getElementById("previousVisa");
const activityType=document.getElementById("activityType");
const residenceType=document.getElementById("residenceType");
const otherActivityBox=document.getElementById("otherActivityBox");
const otherActivity=document.getElementById("otherActivity");
const algeriaResidence=document.getElementById("algeriaResidence");
const abroadResidence=document.getElementById("abroadResidence");
const bothResidence=document.getElementById("bothResidence");
const visaPage1=document.getElementById("visaPage1");
const visaPage2=document.getElementById("visaPage2");
const nextPageBtn=document.getElementById("nextPageBtn");
const backPageBtn=document.getElementById("backPageBtn");
const visaDocumentsInfo=document.getElementById("visaDocumentsInfo");
const visaDocumentsList=document.getElementById("visaDocumentsList");
const visaInfoTitle=document.getElementById("visaInfoTitle");
const visaInfoSubtitle=document.getElementById("visaInfoSubtitle");
const submitButton=document.querySelector(".submit-btn");



const languageGlobe=document.getElementById("languageGlobe");
const languageMenu=document.getElementById("languageMenu");

if(languageGlobe&&languageMenu){
languageGlobe.addEventListener("click",function(e){
e.stopPropagation();
languageMenu.classList.toggle("show");
});
document.addEventListener("click",function(e){
if(!languageMenu.contains(e.target)&&e.target!==languageGlobe){
languageMenu.classList.remove("show");
}
});
languageMenu.querySelectorAll("button").forEach(button=>{
button.addEventListener("click",function(){
languageMenu.classList.remove("show");
});
});
}


const visaDocuments={
tourism:{
icon:"",
fr:"Visa touristique",
en:"Tourist Visa",
ar:"تأشيرة سياحية",
documents:{
fr:["Copie du passeport","Copie de la pièce d'identité","Relevé bancaire en Dinar Algérien","Relevé bancaire en Euro","Justificatif de situation professionnelle",],
en:["Copy of passport","Copy of identity card","Bank statement in Algerian Dinar","Bank statement in Euro","Proof of professional status",],
ar:["نسخة من جواز السفر","نسخة من بطاقة التعريف","كشف حساب بنكي بالدينار الجزائري","كشف حساب بنكي باليورو","إثبات الوضعية المهنية",]
}
},
business:{
icon:"",
fr:"Visa affaires",
en:"Business Visa",
ar:"تأشيرة أعمال",
documents:{
fr:["Copie du passeport","Copie de la pièce d'identité","Invitation professionnelle","Documents de l'entreprise","Justificatif de situation professionnelle",],
en:["Copy of passport","Copy of identity card","Business invitation","Company documents","Proof of professional status",],
ar:["نسخة من جواز السفر","نسخة من بطاقة التعريف","دعوة مهنية","وثائق الشركة","إثبات الوضعية المهنية",]
}
},
study:{
icon:"",
fr:"Visa études",
en:"Study Visa",
ar:"تأشيرة دراسة",
documents:{
fr:["Copie du passeport","Copie de la pièce d'identité","Lettre d'admission de l'établissement","Diplômes et relevés de notes","Justificatif financier",],
en:["Copy of passport","Copy of identity card","Admission letter from the institution","Diplomas and transcripts","Proof of financial means",],
ar:["نسخة من جواز السفر","نسخة من بطاقة التعريف","رسالة القبول من المؤسسة التعليمية","الشهادات وكشوف النقاط","إثبات القدرة المالية"]
}
},
work:{
icon:"",
fr:"Visa travail",
en:"Work Visa",
ar:"تأشيرة عمل",
documents:{
fr:["Copie du passeport","Copie de la pièce d'identité","Contrat de travail","Autorisation ou document de l'employeur","Diplômes ou justificatifs professionnels",],
en:["Copy of passport","Copy of identity card","Employment contract","Employer authorization or document","Professional diplomas or certificates",],
ar:["نسخة من جواز السفر","نسخة من بطاقة التعريف","عقد العمل","ترخيص أو وثيقة من صاحب العمل","الشهادات أو الوثائق المهنية",]
}
},
family:{
icon:"",
fr:"Visa visite familiale",
en:"Family Visit Visa",
ar:"تأشيرة زيارة عائلية",
documents:{
fr:["Copie du passeport","Copie de la pièce d'identité","Invitation familiale","Pièce d'identité du proche","Justificatif du lien familial","Justificatif financier"],
en:["Copy of passport","Copy of identity card","Family invitation","Relative's identity document","Proof of family relationship","Proof of financial means"],
ar:["نسخة من جواز السفر","نسخة من بطاقة التعريف","دعوة عائلية","وثيقة هوية القريب","إثبات صلة القرابة","إثبات القدرة المالية"]
}
}
};

const activityDocuments={
employee:{
fr:["Attestation de travail récente","Fiches de paie des trois derniers mois","Autorisation de congé annuel","Relevé bancaire récent"],
en:["Recent employment certificate","Payslips for the last three months","Annual leave authorization","Recent bank statement"],
ar:["شهادة عمل حديثة","كشوف الراتب للأشهر الثلاثة الأخيرة","ترخيص العطلة السنوية","كشف حساب بنكي حديث"]
},
trader:{
fr:["Registre de commerce","Extrait de rôle","Mise à jour CNAS ou CASNOS","Relevé bancaire récent"],
en:["Commercial registration","Tax certificate","Updated CNAS or CASNOS document","Recent bank statement"],
ar:["السجل التجاري","مستخرج من الضرائب","وثيقة CNAS أو CASNOS محدثة","كشف حساب بنكي حديث"]
},
liberal:{
fr:["Justificatif d'activité professionnelle","Attestation fiscale","Attestation CNAS ou CASNOS","Relevé bancaire récent"],
en:["Proof of professional activity","Tax certificate","CNAS or CASNOS certificate","Recent bank statement"],
ar:["إثبات النشاط المهني","شهادة أو وثيقة ضريبية","شهادة CNAS أو CASNOS","كشف حساب بنكي حديث"]
},
student:{
fr:["Certificat de scolarité ou certificat d'inscription","Carte d'étudiant","Relevés de notes récents","Justificatif de prise en charge financière"],
en:["School or university enrollment certificate","Student card","Recent academic transcripts","Proof of financial support"],
ar:["شهادة مدرسية أو شهادة تسجيل","بطاقة الطالب","كشوف النقاط الحديثة","إثبات التكفل المالي"]
},
retired:{
fr:["Attestation de retraite","Attestation de pension","Relevé bancaire récent"],
en:["Retirement certificate","Pension certificate","Recent bank statement"],
ar:["شهادة التقاعد","شهادة المعاش","كشف حساب بنكي حديث"]
},
unemployed:{
fr:["Justificatif de situation sans emploi","Justificatif de ressources ou de prise en charge","Relevé bancaire récent"],
en:["Proof of unemployment status","Proof of financial resources or sponsorship","Recent bank statement"],
ar:["إثبات وضعية عدم العمل","إثبات الموارد المالية أو التكفل","كشف حساب بنكي حديث"]
},
other:{
fr:["Justificatif de l'activité professionnelle","Document administratif lié à l'activité","Relevé bancaire récent"],
en:["Proof of professional activity","Administrative document related to the activity","Recent bank statement"],
ar:["إثبات النشاط المهني","وثيقة إدارية مرتبطة بالنشاط","كشف حساب بنكي حديث"]
}
};

const countryTranslations={
"France":{fr:"🇫🇷 France",en:"🇫🇷 France",ar:"🇫🇷 فرنسا"},
"Italie":{fr:"🇮🇹 Italie",en:"🇮🇹 Italy",ar:"🇮🇹 إيطاليا"},
"Espagne":{fr:"🇪🇸 Espagne",en:"🇪🇸 Spain",ar:"🇪🇸 إسبانيا"},
"Allemagne":{fr:"🇩🇪 Allemagne",en:"🇩🇪 Germany",ar:"🇩🇪 ألمانيا"},
"Belgique":{fr:"🇧🇪 Belgique",en:"🇧🇪 Belgium",ar:"🇧🇪 بلجيكا"},
"Pays-Bas":{fr:"🇳🇱 Pays-Bas",en:"🇳🇱 Netherlands",ar:"🇳🇱 هولندا"},
"Suisse":{fr:"🇨🇭 Suisse",en:"🇨🇭 Switzerland",ar:"🇨🇭 سويسرا"},
"Autriche":{fr:"🇦🇹 Autriche",en:"🇦🇹 Austria",ar:"🇦🇹 النمسا"},
"Portugal":{fr:"🇵🇹 Portugal",en:"🇵🇹 Portugal",ar:"🇵🇹 البرتغال"},
"Grèce":{fr:"🇬🇷 Grèce",en:"🇬🇷 Greece",ar:"🇬🇷 اليونان"},
"Royaume-Uni":{fr:"🇬🇧 Royaume-Uni",en:"🇬🇧 United Kingdom",ar:"🇬🇧 المملكة المتحدة"},
"Irlande":{fr:"🇮🇪 Irlande",en:"🇮🇪 Ireland",ar:"🇮🇪 أيرلندا"},
"Norvège":{fr:"🇳🇴 Norvège",en:"🇳🇴 Norway",ar:"🇳🇴 النرويج"},
"Suède":{fr:"🇸🇪 Suède",en:"🇸🇪 Sweden",ar:"🇸🇪 السويد"},
"Danemark":{fr:"🇩🇰 Danemark",en:"🇩🇰 Denmark",ar:"🇩🇰 الدنمارك"},
"Finlande":{fr:"🇫🇮 Finlande",en:"🇫🇮 Finland",ar:"🇫🇮 فنلندا"},
"Pologne":{fr:"🇵🇱 Pologne",en:"🇵🇱 Poland",ar:"🇵🇱 بولندا"},
"Hongrie":{fr:"🇭🇺 Hongrie",en:"🇭🇺 Hungary",ar:"🇭🇺 المجر"},
"Roumanie":{fr:"🇷🇴 Roumanie",en:"🇷🇴 Romania",ar:"🇷🇴 رومانيا"},
"Croatie":{fr:"🇭🇷 Croatie",en:"🇭🇷 Croatia",ar:"🇭🇷 كرواتيا"},
"Tchéquie":{fr:"🇨🇿 République Tchèque",en:"🇨🇿 Czech Republic",ar:"🇨🇿 جمهورية التشيك"},
"Slovénie":{fr:"🇸🇮 Slovénie",en:"🇸🇮 Slovenia",ar:"🇸🇮 سلوفينيا"},
"Slovaquie":{fr:"🇸🇰 Slovaquie",en:"🇸🇰 Slovakia",ar:"🇸🇰 سلوفاكيا"},
"Bulgarie":{fr:"🇧🇬 Bulgarie",en:"🇧🇬 Bulgaria",ar:"🇧🇬 بلغاريا"},
"Serbie":{fr:"🇷🇸 Serbie",en:"🇷🇸 Serbia",ar:"🇷🇸 صربيا"},
"Turquie":{fr:"🇹🇷 Turquie",en:"🇹🇷 Turkey",ar:"🇹🇷 تركيا"},
"Canada":{fr:"🇨🇦 Canada",en:"🇨🇦 Canada",ar:"🇨🇦 كندا"},
"USA":{fr:"🇺🇸 États-Unis",en:"🇺🇸 United States",ar:"🇺🇸 الولايات المتحدة"},
"Australie":{fr:"🇦🇺 Australie",en:"🇦🇺 Australia",ar:"🇦🇺 أستراليا"},
"Nouvelle-Zélande":{fr:"🇳🇿 Nouvelle-Zélande",en:"🇳🇿 New Zealand",ar:"🇳🇿 نيوزيلندا"},
"Japon":{fr:"🇯🇵 Japon",en:"🇯🇵 Japan",ar:"🇯🇵 اليابان"},
"Chine":{fr:"🇨🇳 Chine",en:"🇨🇳 China",ar:"🇨🇳 الصين"},
"Corée du Sud":{fr:"🇰🇷 Corée du Sud",en:"🇰🇷 South Korea",ar:"🇰🇷 كوريا الجنوبية"},
"Inde":{fr:"🇮🇳 Inde",en:"🇮🇳 India",ar:"🇮🇳 الهند"},
"Émirats Arabes Unis":{fr:"🇦🇪 Émirats Arabes Unis",en:"🇦🇪 United Arab Emirates",ar:"🇦🇪 الإمارات العربية المتحدة"},
"Arabie Saoudite":{fr:"🇸🇦 Arabie Saoudite",en:"🇸🇦 Saudi Arabia",ar:"🇸🇦 المملكة العربية السعودية"},
"Qatar":{fr:"🇶🇦 Qatar",en:"🇶🇦 Qatar",ar:"🇶🇦 قطر"},
"Égypte":{fr:"🇪🇬 Égypte",en:"🇪🇬 Egypt",ar:"🇪🇬 مصر"},
"Maroc":{fr:"🇲🇦 Maroc",en:"🇲🇦 Morocco",ar:"🇲🇦 المغرب"},
"Tunisie":{fr:"🇹🇳 Tunisie",en:"🇹🇳 Tunisia",ar:"🇹🇳 تونس"},
"Afrique du Sud":{fr:"🇿🇦 Afrique du Sud",en:"🇿🇦 South Africa",ar:"🇿🇦 جنوب أفريقيا"},
"Brésil":{fr:"🇧🇷 Brésil",en:"🇧🇷 Brazil",ar:"🇧🇷 البرازيل"},
"Mexique":{fr:"🇲🇽 Mexique",en:"🇲🇽 Mexico",ar:"🇲🇽 المكسيك"},
"Argentine":{fr:"🇦🇷 Argentine",en:"🇦🇷 Argentina",ar:"🇦🇷 الأرجنتين"},
"Singapour":{fr:"🇸🇬 Singapour",en:"🇸🇬 Singapore",ar:"🇸🇬 سنغافورة"},
"Malaisie":{fr:"🇲🇾 Malaisie",en:"🇲🇾 Malaysia",ar:"🇲🇾 ماليزيا"},
"Thaïlande":{fr:"🇹🇭 Thaïlande",en:"🇹🇭 Thailand",ar:"🇹🇭 تايلاند"},
"Indonésie":{fr:"🇮🇩 Indonésie",en:"🇮🇩 Indonesia",ar:"🇮🇩 إندونيسيا"},
"Vietnam":{fr:"🇻🇳 Vietnam",en:"🇻🇳 Vietnam",ar:"🇻🇳 فيتنام"}
};

function getLanguage(){
return document.documentElement.lang||"fr";
}

function createLuxuryStyles(){
if(document.getElementById("aquarevLuxuryVisaStyles"))return;
const style=document.createElement("style");
style.id="aquarevLuxuryVisaStyles";
style.textContent=`
#aquarevPage2Documents{width:100%;margin:0 0 28px}
#aquarevPage2DocumentsTitle{margin:0 0 14px;color:#003b5c;font-size:19px;font-weight:800}
.aquarev-page2-file-grid{width:100%;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.aquarev-page2-file-box{width:100%!important;min-width:0!important;min-height:105px!important;height:105px!important;margin:0!important;padding:12px!important;border-radius:14px!important;box-sizing:border-box!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;background:linear-gradient(145deg,#fff,#f7fbfd)!important;border:1px solid rgba(0,59,92,.12)!important;box-shadow:0 7px 20px rgba(0,59,92,.08)!important;cursor:pointer!important;transition:.3s ease!important;overflow:hidden!important}
.aquarev-page2-file-box:hover{transform:translateY(-2px)!important;border-color:rgba(212,175,55,.55)!important;box-shadow:0 12px 25px rgba(0,59,92,.12)!important}
.aquarev-page2-file-box i{font-size:21px!important;color:#00a6c7!important;margin-bottom:7px!important}
.aquarev-page2-file-box h3{font-size:13px!important;color:#003b5c!important;font-weight:700!important;margin:0!important;line-height:1.35!important;word-break:break-word!important}
.aquarev-page2-file-box p{font-size:10px!important;color:#7a8a92!important;margin:5px 0 0!important;line-height:1.3!important}
#aquarevServicesWrapper{width:100%;margin:0 0 28px;display:flex;flex-direction:column;align-items:center}
#aquarevServicesButton{width:100%;border:1px solid rgba(212,175,55,.65);background:linear-gradient(135deg,#06283d,#003b5c 55%,#082f49);color:#fff;padding:16px 22px;border-radius:14px;cursor:pointer;font-size:15px;font-weight:700;letter-spacing:.3px;box-shadow:0 10px 25px rgba(0,59,92,.18),inset 0 1px 0 rgba(255,255,255,.12);transition:.3s ease;display:flex;align-items:center;justify-content:center;gap:10px}
#aquarevServicesButton:hover{transform:translateY(-2px);box-shadow:0 15px 30px rgba(0,59,92,.25)}
#aquarevServicesButton .luxury-star{color:#d4af37;font-size:17px}
#aquarevServicesPanel{width:100%;margin-top:13px;padding:21px;box-sizing:border-box;border-radius:16px;background:linear-gradient(145deg,#fff,#f8fbfd);border:1px solid rgba(212,175,55,.35);box-shadow:0 13px 32px rgba(0,59,92,.11);display:block}
#aquarevServicesHeader{text-align:center;margin-bottom:14px}
#aquarevServicesHeader h3{margin:0;color:#003b5c;font-size:19px;font-weight:800}
#aquarevServicesHeader p{margin:6px 0 0;color:#667781;font-size:13px;line-height:1.5}
.aquarev-service-item{display:flex;align-items:center;gap:12px;padding:12px 13px;margin:8px 0;border-radius:12px;background:#fff;border:1px solid rgba(0,59,92,.08);box-shadow:0 5px 14px rgba(0,59,92,.06);transition:.25s ease}
.aquarev-service-item:hover{transform:translateX(3px);border-color:rgba(212,175,55,.5)}
.aquarev-service-icon{width:38px;height:38px;min-width:38px;border-radius:10px;background:linear-gradient(135deg,#003b5c,#007ea7);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px}
.aquarev-service-text{flex:1;color:#173746;font-weight:650;font-size:13px;line-height:1.4}
.aquarev-service-badge{font-size:9px;color:#a17d18;border:1px solid rgba(212,175,55,.45);padding:4px 7px;border-radius:20px;font-weight:700;white-space:nowrap}
.requirement-item{display:flex!important;align-items:center;gap:14px;padding:11px 4px;margin:0;border:0;border-bottom:1px solid rgba(0,59,92,.1);background:transparent;box-shadow:none}
.requirement-item:last-child{border-bottom:0}
.requirement-item>span{width:28px;min-width:28px;color:#d4af37;font-size:12px;font-weight:800}
.requirement-item>strong{color:#173746;font-size:14px;font-weight:500;line-height:1.5}
#aquarevActivityDocumentsInfo{display:none;margin-top:12px;padding:18px 20px;border-radius:15px;background:linear-gradient(145deg,#fff,#f8fbfd);border:1px solid rgba(0,59,92,.1);box-shadow:0 8px 24px rgba(0,59,92,.08)}
#aquarevActivityDocumentsInfo.show{display:block}
#aquarevActivityDocumentsTitle{margin:0 0 4px;color:#003b5c;font-size:17px;font-weight:800}
#aquarevActivityDocumentsSubtitle{margin:0 0 8px;color:#667781;font-size:12px}
.aquarev-activity-document{display:flex;align-items:center;gap:14px;padding:10px 4px;border-bottom:1px solid rgba(0,59,92,.1)}
.aquarev-activity-document:last-child{border-bottom:0}
.aquarev-activity-document-number{width:28px;min-width:28px;color:#d4af37;font-size:12px;font-weight:800}
.aquarev-activity-document-text{color:#173746;font-size:14px;font-weight:500;line-height:1.5}
#aquarevPage2BackButton{width:100%;margin-top:12px!important}
@media(max-width:600px){
#aquarevPage2DocumentsTitle{font-size:17px}
.aquarev-page2-file-grid{grid-template-columns:1fr!important;gap:9px}
.aquarev-page2-file-box{min-height:82px!important;height:82px!important}
.aquarev-page2-file-box i{font-size:18px!important;margin-bottom:4px!important}
.aquarev-page2-file-box h3{font-size:12px!important}
.aquarev-service-badge{display:none}
#aquarevServicesPanel{padding:16px}
#aquarevServicesButton{padding:15px 14px;font-size:13px}
.aquarev-service-item{padding:11px}
}
`;
document.head.appendChild(style);
}

function changeCountryLanguage(lang){
countryItems.forEach(item=>{
const country=item.dataset.country;
if(countryTranslations[country])item.textContent=countryTranslations[country][lang]||countryTranslations[country].fr;
});
if(selectedCountry&&selectedCountry.value&&countryTranslations[selectedCountry.value]){
countryButton.textContent=countryTranslations[selectedCountry.value][lang]||countryTranslations[selectedCountry.value].fr;
}
}

function createPage2Documents(){
if(!visaPage2)return;
createLuxuryStyles();
let section=document.getElementById("aquarevPage2Documents");
if(!section){
section=document.createElement("section");
section.id="aquarevPage2Documents";
const title=document.createElement("h3");
title.id="aquarevPage2DocumentsTitle";
section.appendChild(title);
const grid=document.createElement("div");
grid.className="aquarev-page2-file-grid";
section.appendChild(grid);
const submit=document.querySelector("#visaPage2 .submit-btn");
if(submit)submit.parentElement.insertBefore(section,submit);
else visaPage2.appendChild(section);
}
const grid=section.querySelector(".aquarev-page2-file-grid");
const title=section.querySelector("#aquarevPage2DocumentsTitle");
const files=Array.from(visaPage2.querySelectorAll("input[type='file']"));
const page2Files=files.slice(0,5);
const labels={
fr:"Documents à fournir",
en:"Required documents",
ar:"الوثائق المطلوبة"
};
const fileLabels={

fr:["Document 01","Document 02","Document 03","Document 04","Document 05"],
en:["Document 01","Document 02","Document 03","Document 04","Document 05"],
ar:["الوثيقة 01","الوثيقة 02","الوثيقة 03","الوثيقة 04","الوثيقة 05"]
};
if(title)title.textContent=labels[getLanguage()]||labels.fr;
if(grid&&page2Files.length){
page2Files.forEach((input,index)=>{
let box=input.closest(".file-box");
if(!box)box=input.parentElement;
if(!box)return;
box.classList.add("aquarev-page2-file-box");
box.dataset.aquarevDocumentIndex=index;
const heading=box.querySelector("h3");
if(heading){
if(!heading.dataset.original)heading.dataset.original=heading.textContent;
heading.textContent=(fileLabels[getLanguage()]||fileLabels.fr)[index];
}
const paragraph=box.querySelector("p");
if(paragraph&&!paragraph.dataset.original)paragraph.dataset.original=paragraph.textContent;
grid.appendChild(box);
});
}
updatePage2DocumentsLanguage();
}

function updatePage2DocumentsLanguage(){
const section=document.getElementById("aquarevPage2Documents");
if(!section)return;
const lang=getLanguage();
const labels={
fr:["Document 01","Document 02","Document 03","Document 04","Document 05"],
en:["Document 01","Document 02","Document 03","Document 04","Document 05"],
ar:["الوثيقة 01","الوثيقة 02","الوثيقة 03","الوثيقة 04","الوثيقة 05"]
};
section.querySelectorAll(".aquarev-page2-file-box").forEach((box,index)=>{
const heading=box.querySelector("h3");
if(heading){
if(!heading.dataset.uploaded)heading.textContent=(labels[lang]||labels.fr)[index];
}
});
}

function createAquarevServices(){
if(!visaPage2)return;
createLuxuryStyles();
let wrapper=document.getElementById("aquarevServicesWrapper");
if(!wrapper){
wrapper=document.createElement("div");
wrapper.id="aquarevServicesWrapper";
const button=document.createElement("button");
button.type="button";
button.id="aquarevServicesButton";
const panel=document.createElement("div");
panel.id="aquarevServicesPanel";
wrapper.appendChild(button);
wrapper.appendChild(panel);
const submit=document.querySelector("#visaPage2 .submit-btn");
if(submit)submit.parentElement.insertBefore(wrapper,submit);
else visaPage2.appendChild(wrapper);
}
const button=wrapper.querySelector("#aquarevServicesButton");
const panel=wrapper.querySelector("#aquarevServicesPanel");
const updateServicesLanguage=()=>{
const lang=getLanguage();
const content={
fr:{
button:"Les documents & services que nous proposons",
title:"Services AQUAREV Travel",
subtitle:"Des prestations soigneusement préparées pour compléter votre dossier de voyage.",
items:["Réservation du billet d'avion",
"Assurance voyage",
"Lettre de motivation",
"Lettre d'admission",
"Réservation d'hôtel"],
badge:"Service AQUAREV"
},
en:{
button:"Documents & services we provide",
title:"AQUAREV Travel Services",
subtitle:"Carefully prepared services to complete your travel application.",
items:["Flight ticket reservation","Travel insurance","Motivation letter","Admission letter","Hotel reservation"],
badge:"AQUAREV Service"
},
ar:{
button:"الوثائق والخدمات التي نقدمها",
title:"خدمات AQUAREV Travel",
subtitle:"خدمات احترافية يتم إعدادها بعناية لاستكمال ملف سفرك.",
items:["حجز تذكرة الطائرة","تأمين السفر","الرسالة التحفيزية","رسالة القبول","حجز الفندق"],
badge:"خدمة AQUAREV"
}
};
const data=content[lang]||content.fr;
button.innerHTML=`<span class="luxury-star">✦</span><span>${data.button}</span><span class="luxury-star">✦</span>`;
const icons=["fa-plane-departure","fa-shield-halved","fa-pen-nib","fa-graduation-cap","fa-hotel"];
panel.innerHTML=`<div id="aquarevServicesHeader"><h3>${data.title}</h3><p>${data.subtitle}</p></div>${data.items.map((item,index)=>`<div class="aquarev-service-item"><span class="aquarev-service-icon"><i class="fa-solid ${icons[index]}"></i></span><span class="aquarev-service-text">${item}</span><span class="aquarev-service-badge">${data.badge}</span></div>`).join("")}`;
};
updateServicesLanguage();
window.updateAquarevServicesLanguage=updateServicesLanguage;
}

function fixPage2Order(){
if(!visaPage2)return;
const documents=document.getElementById("aquarevPage2Documents");
const services=document.getElementById("aquarevServicesWrapper");
const submit=document.querySelector("#visaPage2 .submit-btn");
const back=backPageBtn;
if(documents)visaPage2.appendChild(documents);
if(services)visaPage2.appendChild(services);
if(submit){
if(submit.parentElement!==visaPage2)visaPage2.appendChild(submit);
else visaPage2.appendChild(submit);
}
if(back){
const backParent=back.parentElement;
if(backParent&&backParent!==visaPage2)visaPage2.appendChild(back);
}
}

function updateActivityDocuments(type){
const old=document.getElementById("aquarevActivityDocumentsInfo");
if(old)old.remove();
if(!activityType||!activityType.value||(activityType.value==="other"&&(!otherActivity||!otherActivity.value.trim())))return;
const activity=activityType.value;
const data=activityDocuments[activity]||activityDocuments.other;
const lang=getLanguage();
const title={
fr:"Documents à fournir selon votre situation professionnelle",
en:"Documents required according to your professional status",
ar:"الوثائق المطلوبة حسب وضعيتك المهنية"
};
const subtitle={
fr:"Veuillez préparer les documents correspondant à votre activité.",
en:"Please prepare the documents corresponding to your professional activity.",
ar:"يرجى تحضير الوثائق المتعلقة بنشاطك المهني."
};
const box=document.createElement("div");
box.id="aquarevActivityDocumentsInfo";
box.classList.add("show");
box.innerHTML=`<h3 id="aquarevActivityDocumentsTitle">${title[lang]||title.fr}</h3><p id="aquarevActivityDocumentsSubtitle">${subtitle[lang]||subtitle.fr}</p>${(data[lang]||data.fr).map((item,index)=>`<div class="aquarev-activity-document"><span class="aquarev-activity-document-number">${String(index+1).padStart(2,"0")}</span><strong class="aquarev-activity-document-text">${item}</strong></div>`).join("")}`;
if(otherActivityBox&&otherActivityBox.parentElement){
otherActivityBox.parentElement.insertBefore(box,otherActivityBox.nextSibling);
}else if(activityType&&activityType.parentElement){
activityType.parentElement.appendChild(box);
}else if(visaPage1){
visaPage1.appendChild(box);
}
}

window.changeLanguage=function(lang){
document.documentElement.lang=lang;
document.body.dir=lang==="ar"?"rtl":"ltr";
document.querySelectorAll("[data-"+lang+"]").forEach(element=>{
element.innerHTML=element.getAttribute("data-"+lang);
});
document.querySelectorAll("[data-"+lang+"-placeholder]").forEach(element=>{
element.placeholder=element.getAttribute("data-"+lang+"-placeholder");
});
document.querySelectorAll(".section-title").forEach(section=>{
section.style.flexDirection=lang==="ar"?"row-reverse":"row";
});
changeCountryLanguage(lang);
updateVisaDocuments(visaType?visaType.value:"");
updateActivityDocuments(activityType?activityType.value:"");
updatePage2DocumentsLanguage();
if(window.updateAquarevServicesLanguage)window.updateAquarevServicesLanguage();
updateDynamicSections();
localStorage.setItem("aquarevVisaLanguage",lang);
};

const savedLanguage=localStorage.getItem("aquarevVisaLanguage")||"fr";
window.changeLanguage(savedLanguage);

if(countryButton&&countryPopup){
countryButton.addEventListener("click",function(e){
e.stopPropagation();
countryPopup.classList.toggle("show");
countryPopup.classList.toggle("active");
});
}

countryItems.forEach(country=>{
country.addEventListener("click",function(){
countryItems.forEach(item=>item.classList.remove("active"));
this.classList.add("active");
if(selectedCountry)selectedCountry.value=this.dataset.country;
const lang=getLanguage();
if(countryButton){
if(countryTranslations[this.dataset.country]){
countryButton.textContent=countryTranslations[this.dataset.country][lang]||countryTranslations[this.dataset.country].fr;
}else{
countryButton.textContent=this.innerText;
}
}
if(countryPopup){
countryPopup.classList.remove("show");
countryPopup.classList.remove("active");
}
});
});

if(countrySearch){
countrySearch.addEventListener("input",function(){
const search=this.value.toLowerCase().trim();
countryItems.forEach(country=>{
const name=country.innerText.toLowerCase();
country.style.display=name.includes(search)?"block":"none";
});
});
}

if(manualCountry){
manualCountry.addEventListener("input",function(){
const value=this.value.trim();
if(value!==""){
selectedCountry.value=value;
countryButton.textContent="🌍 "+value;
}
});
}

document.addEventListener("click",function(event){
if(countryPopup&&!countryPopup.contains(event.target)&&event.target!==countryButton){
countryPopup.classList.remove("show");
countryPopup.classList.remove("active");
}
});

function updateVisaDocuments(type){
if(!visaDocumentsInfo||!visaDocumentsList||!visaInfoTitle||!visaInfoSubtitle)return;
const lang=getLanguage();
if(!type||!visaDocuments[type]){
visaDocumentsInfo.style.display="none";
visaDocumentsInfo.classList.remove("show");
visaDocumentsList.innerHTML="";
return;
}
const data=visaDocuments[type];
const title=data[lang]||data.fr;
const subtitle={
fr:"Principales pièces demandées pour ce type de visa.",
en:"Main documents usually required for this visa type.",
ar:"أهم الوثائق المطلوبة لهذا النوع من التأشيرة."
};
visaInfoTitle.textContent=title;
visaInfoSubtitle.textContent=subtitle[lang]||subtitle.fr;
visaDocumentsList.innerHTML=(data.documents[lang]||data.documents.fr).map((document,index)=>{
return `<div class="requirement-item"><span>${String(index+1).padStart(2,"0")}</span><strong>${document}</strong></div>`;
}).join("");
visaDocumentsInfo.style.display="block";
visaDocumentsInfo.classList.add("show");
}

if(visaType){
visaType.addEventListener("change",function(){
updateVisaDocuments(this.value);
});
}

function updateDynamicSections(){
const activity=activityType?activityType.value:"";
const residence=residenceType?residenceType.value:"";
if(otherActivityBox){
otherActivityBox.style.display=activity==="other"?"block":"none";
otherActivityBox.classList.toggle("show",activity==="other");
}
if(algeriaResidence){
algeriaResidence.style.display=residence==="algeria"||residence==="both"?"block":"none";
}
if(abroadResidence){
abroadResidence.style.display=residence==="abroad"||residence==="both"?"block":"none";
}
if(bothResidence){
bothResidence.style.display=residence==="both"?"grid":"none";
}
updateActivityDocuments(activity);
}

if(activityType){
activityType.addEventListener("change",function(){
updateDynamicSections();
});
}

if(otherActivity){
otherActivity.addEventListener("input",function(){
if(activityType&&activityType.value==="other")updateActivityDocuments("other");
});
}

if(residenceType){
residenceType.addEventListener("change",updateDynamicSections);
}

function hidePage1DynamicSections(){
if(otherActivityBox){
otherActivityBox.style.display="none";
otherActivityBox.classList.remove("show");
}
if(algeriaResidence)algeriaResidence.style.display="none";
if(abroadResidence)abroadResidence.style.display="none";
if(bothResidence)bothResidence.style.display="none";
}

function validatePage1(){
if(!selectedCountry||selectedCountry.value.trim()===""){
const lang=getLanguage();
const message=lang==="ar"?"يرجى اختيار دولة الوجهة.":lang==="en"?"Please choose the destination country.":"Veuillez choisir le pays de destination.";
alert(message);
if(countryButton)countryButton.focus();
return false;
}
const requiredFields=visaPage1.querySelectorAll("input[required],select[required],textarea[required]");
for(const field of requiredFields){
if(!String(field.value||"").trim()){
field.focus();
const lang=getLanguage();
const message=lang==="ar"?"يرجى ملء جميع الحقول الإلزامية.":lang==="en"?"Please fill in all required fields.":"Veuillez remplir tous les champs obligatoires.";
alert(message);
return false;
}
}
if(activityType&&activityType.value==="other"&&otherActivity&&!otherActivity.value.trim()){
otherActivity.focus();
const lang=getLanguage();
const message=lang==="ar"?"يرجى تحديد نشاطك المهني.":lang==="en"?"Please specify your professional activity.":"Veuillez préciser votre activité professionnelle.";
alert(message);
return false;
}
return true;
}

function preparePage2Layout(){
if(!visaPage2)return;
createLuxuryStyles();
createPage2Documents();
createAquarevServices();
fixPage2Order();
}

function showPage2(){
if(!validatePage1())return;
preparePage2Layout();
if(visaPage1){
visaPage1.classList.remove("active-page");
visaPage1.classList.remove("active");
visaPage1.style.display="none";
}
if(visaPage2){
visaPage2.classList.add("active");
visaPage2.classList.add("active-page");
visaPage2.style.display="block";
}
window.scrollTo({top:0,behavior:"smooth"});
}

function showPage1(){
if(visaPage2){
visaPage2.classList.remove("active");
visaPage2.classList.remove("active-page");
visaPage2.style.display="none";
}
if(visaPage1){
visaPage1.classList.add("active-page");
visaPage1.classList.add("active");
visaPage1.style.display="block";
}
window.scrollTo({top:0,behavior:"smooth"});
}

if(nextPageBtn)nextPageBtn.addEventListener("click",showPage2);
if(backPageBtn)backPageBtn.addEventListener("click",showPage1);

document.querySelectorAll("input[type='tel']").forEach(phone=>{
phone.addEventListener("input",function(){
this.value=this.value.replace(/[^0-9+]/g,"");
});
});

document.querySelectorAll("input[type='file']").forEach(input=>{
input.addEventListener("change",function(){
const box=this.closest(".file-box");
if(box&&this.files.length){
box.classList.add("loaded");
const heading=box.querySelector("h3");
if(heading){
heading.dataset.uploaded="true";
heading.dataset.original=heading.dataset.original||heading.textContent;
heading.textContent=this.files.length===1?this.files[0].name:`${this.files.length} fichiers sélectionnés`;
}
}
});
});

if(form){
form.addEventListener("submit",async function(e){
e.preventDefault();
if(!validatePage1()){
showPage1();
return;
}
if(submitButton){
submitButton.disabled=true;
submitButton.innerHTML="⏳ ENVOI EN COURS...";
}
const formData=new FormData();
const fields=form.querySelectorAll("input,select,textarea");
fields.forEach(field=>{
if(field.type==="file"){
Array.from(field.files).forEach(file=>{
if(file)formData.append("documents",file);
});
return;
}
if(field.value!==undefined&&field.value!==null&&String(field.value).trim()!==""){
const key=field.name||field.id;
if(key)formData.append(key,String(field.value).trim());
}
});
formData.set("destination",selectedCountry.value.trim());
formData.set("visaType",visaType?visaType.value:"");
formData.set("visaHistory",previousVisa?previousVisa.value:"");
formData.set("activityType",activityType?activityType.value:"");
formData.set("residenceType",residenceType?residenceType.value:"");
if(otherActivity&&otherActivity.value.trim())formData.set("otherActivity",otherActivity.value.trim());

try{
const response=await fetch("/visa-request",{method:"POST",body:formData});
const result=await response.json();
if(result.success){
const lang=getLanguage();
const successMessage=lang==="ar"?"✅ تم إرسال طلب التأشيرة بنجاح إلى AQUAREV Travel":lang==="en"?"✅ Your visa application has been sent successfully to AQUAREV Travel":"✅ Votre demande de visa a été envoyée avec succès à AQUAREV Travel";
alert(successMessage);
form.reset();
if(selectedCountry)selectedCountry.value="";
if(countryButton){
const buttonText={
fr:"🌍 Choisir le pays de destination",
en:"🌍 Choose destination country",
ar:"🌍 اختر دولة الوجهة"
};
countryButton.textContent=buttonText[lang]||buttonText.fr;
}
if(countryPopup){
countryPopup.classList.remove("show");
countryPopup.classList.remove("active");
}
countryItems.forEach(item=>item.classList.remove("active"));
if(visaDocumentsInfo){
visaDocumentsInfo.style.display="none";
visaDocumentsInfo.classList.remove("show");
}
if(visaDocumentsList)visaDocumentsList.innerHTML="";
const activityDocumentsInfo=document.getElementById("aquarevActivityDocumentsInfo");
if(activityDocumentsInfo)activityDocumentsInfo.remove();
if(otherActivityBox){
otherActivityBox.style.display="none";
otherActivityBox.classList.remove("show");
}
if(algeriaResidence)algeriaResidence.style.display="none";
if(abroadResidence)abroadResidence.style.display="none";
if(bothResidence)bothResidence.style.display="none";

document.querySelectorAll("input[type='file']").forEach(input=>{
input.value="";
const box=input.closest(".file-box");
if(box){
box.classList.remove("loaded");
const heading=box.querySelector("h3");
if(heading){
heading.removeAttribute("data-uploaded");
if(heading.dataset.original)heading.textContent=heading.dataset.original;
}
}
});
showPage1();
}else{
alert("❌ "+(result.message||"Erreur lors de l'envoi de votre demande."));
}
}catch(error){
console.error("SERVER ERROR:",error);
const lang=getLanguage();
const message=lang==="ar"?"❌ تعذر الاتصال بخادم AQUAREV.":lang==="en"?"❌ Unable to contact the AQUAREV server.":"❌ Impossible de contacter le serveur AQUAREV.";
alert(message);
}
if(submitButton){
submitButton.disabled=false;
const lang=getLanguage();
submitButton.innerHTML=`<i class="fa-solid fa-paper-plane"></i><span>${lang==="ar"?"إرسال الطلب":lang==="en"?"SEND APPLICATION":"ENVOYER LA DEMANDE"}</span>`;
}
});
}

document.querySelectorAll("input,textarea,select").forEach(field=>{
field.addEventListener("focus",function(){
this.style.borderColor="#00b4d8";
});
field.addEventListener("blur",function(){
this.style.borderColor="";
});
});

window.toggleCountryPopup=function(){
if(countryPopup){
countryPopup.classList.toggle("show");
countryPopup.classList.toggle("active");
}
};

hidePage1DynamicSections();

if(visaPage1){
visaPage1.style.display="block";
visaPage1.classList.add("active-page");
visaPage1.classList.add("active");
}

if(visaPage2){
visaPage2.style.display="none";
visaPage2.classList.remove("active");
visaPage2.classList.remove("active-page");
}

createLuxuryStyles();
createPage2Documents();
createAquarevServices();
fixPage2Order();

if(visaType&&visaType.value){
updateVisaDocuments(visaType.value);
}else if(visaDocumentsInfo){
visaDocumentsInfo.style.display="none";
}

updateDynamicSections();
});