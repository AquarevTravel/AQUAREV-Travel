const translations={
fr:{dir:"ltr",lang:"fr"},
en:{dir:"ltr",lang:"en"},
ar:{dir:"rtl",lang:"ar"}
};
function changeLanguage(lang){
document.documentElement.lang=translations[lang].lang;
document.documentElement.dir=translations[lang].dir;
const elements=document.querySelectorAll("[data-"+lang+"]");
elements.forEach(element=>{
element.innerHTML=element.getAttribute("data-"+lang);
});
localStorage.setItem("aquarevLanguage",lang);
}
window.addEventListener("DOMContentLoaded",()=>{
const savedLanguage=localStorage.getItem("aquarevLanguage");
if(savedLanguage)changeLanguage(savedLanguage);
});
const languageBtn=document.querySelector(".language-btn");
const languageBox=document.querySelector(".language-box");
if(languageBtn){
languageBtn.addEventListener("click",function(e){
e.stopPropagation();
languageBox.classList.toggle("active");
});
}
document.addEventListener("click",function(){
if(languageBox)languageBox.classList.remove("active");
});
const languageButtons=document.querySelectorAll(".language-menu button");
languageButtons.forEach(btn=>{
btn.addEventListener("click",function(){
languageBox.classList.remove("active");
});
});
document.addEventListener("DOMContentLoaded",()=>{
const gnvButton=document.querySelector(".gnv-section .search-btn");
const corsicaButton=document.querySelector(".corsica-section .search-btn");
const ferryModal=document.getElementById("ferryModal");
const ferryResultsTerminal=document.getElementById("ferryResultsTerminal");
const closeModal=document.querySelector(".close-modal");
let ferriesData=[];
fetch("assets/data/ferries.json")
.then(response=>response.json())
.then(data=>{
ferriesData=data.ferries||[];
console.log("FERRIES LOADED:",ferriesData.length);
})
.catch(error=>{
console.error("Error loading ferries.json",error);
});
const normalizeText=text=>{
return String(text||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
};
const aliases={
"algiers":["algiers","alger","الجزائر"],
"oran":["oran","وهران"],
"bejaia":["bejaia","béjaia","bejaïa","بجاية"],
"skikda":["skikda","سكيكدة"],
"annaba":["annaba","عنابة"],
"marseille":["marseille","مرسيليا"],
"sete":["sete","sète"],
"genoa":["genoa","genova","جنوة"],
"ajaccio":["ajaccio","أجاكسيو"],
"bastia":["bastia","باستيا"],
"propriano":["propriano","بروبرانيو"],
"toulon":["toulon","طولون"]
};
const smartMatch=(value,search)=>{
const v=normalizeText(value);
const s=normalizeText(search);
if(!s)return true;
if(v.includes(s)||s.includes(v))return true;
for(const key in aliases){
if(aliases[key].some(item=>normalizeText(item).includes(s))){
if(v.includes(key))return true;
}
}
return false;
};
function searchFerries(company,section){
const inputs=document.querySelectorAll(section+" input");
const from=inputs[0]?.value.trim().toLowerCase()||"";
const to=inputs[1]?.value.trim().toLowerCase()||"";
const date=inputs[2]?.value||"";
const results=ferriesData.filter(ferry=>
normalizeText(ferry.company)===normalizeText(company)&&
smartMatch(ferry.from,from)&&
smartMatch(ferry.to,to)&&
(date===""||ferry.departure_date===date)
);
showFerryResults(results,company);
}
if(gnvButton){
gnvButton.addEventListener("click",()=>{
searchFerries("GNV",".gnv-section");
});
}
if(corsicaButton){
corsicaButton.addEventListener("click",()=>{
searchFerries("Corsica Linea",".corsica-section");
});
}
function showFerryResults(results,company){
ferryResultsTerminal.innerHTML="";
document.getElementById("paymentSection").style.display="none";
let firstName="";
let lastName="";
let passport="";
if(company==="GNV"){
firstName=document.getElementById("gnvFirstName")?.value||"";
lastName=document.getElementById("gnvLastName")?.value||"";
passport=document.getElementById("gnvPassportNumber")?.value||"";
}
else
    { firstName=document.getElementById("corsicaFirstName")?.value.trim()||"";
         lastName=document.getElementById("corsicaLastName")?.value.trim()||"";
          passport=document.getElementById("corsicaPassportNumber")?.value.trim()||"";
          }
if(results.length===0){
ferryResultsTerminal.innerHTML=`
<h3>> NO ${company.toUpperCase()} FERRIES FOUND</h3>
<p>> NO AVAILABLE JOURNEY MATCHES YOUR SEARCH</p>
`;
}else{
let logo=company==="GNV"?"assets/ferries/gnv-logo.png":"assets/ferries/corsica-logo.png";
let output=`
<h3>> AQUAREV FERRY SEARCH SYSTEM</h3>
<p>> COMPANY : ${company}</p>
<p>> AVAILABLE FERRIES : ${results.length}</p>
<hr>
`;
results.forEach(ferry=>{
output+=`
<div class="result-card">
<img src="${logo}" alt="${company}">
<h3>> ${ferry.ship}</h3>
<p>COMPANY : ${ferry.company}</p>
<p>FROM : ${ferry.from}</p>
<p>TO : ${ferry.to}</p>
<p>DATE : ${ferry.departure_date}</p>
<p>TIME : ${ferry.departure_time}</p>
<p>DURATION : ${ferry.duration}</p>
<p>PRICE : ${ferry.price} ${ferry.currency}</p>
<hr>
<h3>> PASSENGER INFORMATION</h3>
<p>LAST NAME : ${lastName||"N/A"}</p>
<p>FIRST NAME : ${firstName||"N/A"}</p>
<p>PASSPORT NUMBER : ${passport||"N/A"}</p>
<p>VEHICLE : YES</p>
<button class="book-btn" onclick="selectFerry('${ferry.id}')">
SELECT FERRY
</button>
</div>
`;
});
ferryResultsTerminal.innerHTML=output;
}
ferryModal.classList.add("active");
}
if(closeModal){
closeModal.addEventListener("click",function(e){
e.preventDefault();
e.stopPropagation();
ferryModal.classList.remove("active");
});
}
window.selectFerry=function(id){
const ferry=ferriesData.find(item=>item.id===id);
if(!ferry)return;
const results=document.getElementById("ferryResultsTerminal");
const paymentSection=document.getElementById("paymentSection");
const bookingId=document.getElementById("bookingId");
const paymentAmount=document.getElementById("paymentAmount");
const paymentCurrency=document.getElementById("paymentCurrency");
const paymentStatus=document.getElementById("paymentStatus");
const bookingNumber="AQV-"+Date.now();
if(results)results.style.display="none";
if(paymentSection)paymentSection.style.display="block";
if(bookingId)bookingId.innerText=bookingNumber;
if(paymentAmount)paymentAmount.innerText=ferry.price;
if(paymentCurrency)paymentCurrency.innerText=ferry.currency;
if(paymentStatus)paymentStatus.innerText="";
const paymentButtons=document.querySelectorAll(".payment-btn");
paymentButtons.forEach(button=>{
button.onclick=function(){
const method=this.getAttribute("data-method");
const paymentData={
bookingId:bookingNumber,
ferry:ferry.ship,
company:ferry.company,
route:ferry.from+"-"+ferry.to,
amount:ferry.price,
currency:ferry.currency,
paymentMethod:method
};
fetch("/api/payment/chargily",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(paymentData)}).then(async response=>{const data=await response.json();console.log("CHARGILY HTTP STATUS:",response.status);console.log("CHARGILY RESPONSE:",data);if(!response.ok)throw new Error(data.error||"Payment server error");const checkoutUrl=data.checkout_url||data.url;console.log("CHARGILY CHECKOUT URL:",checkoutUrl);if(!checkoutUrl)throw new Error("Chargily checkout URL missing");const status=document.getElementById("paymentStatus");if(status)status.innerText="REDIRECTING TO PAYMENT";window.location.assign(checkoutUrl)}).catch(error=>{console.error("PAYMENT ERROR:",error);const status=document.getElementById("paymentStatus");if(status)status.innerText="PAYMENT ERROR"});
};
});
};
});