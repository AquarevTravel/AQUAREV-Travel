/* AQUAREV TRAVEL MAIN JAVASCRIPT */
document.addEventListener("DOMContentLoaded",()=>{





const signinButton=document.getElementById("openSignin");
const signupButton=document.getElementById("openSignup");
const signinPopup=document.getElementById("signin-popup");
const signupPopup=document.getElementById("signup-popup");



if(signinButton&&signinPopup){

signinButton.addEventListener("click",()=>{

document.getElementById("signin-frame").src="signin.html";

signinPopup.style.display="flex";

});

}

if(signupButton&&signupPopup){

signupButton.addEventListener("click",()=>{

document.getElementById("signup-frame").src="signup.html";

signupPopup.style.display="flex";

});

}






window.closeSignin=function(){
if(signinPopup)signinPopup.style.display="none";
};

window.closeSignup=function(){
if(signupPopup)signupPopup.style.display="none";
};

window.addEventListener("click",(e)=>{
if(e.target===signinPopup)signinPopup.style.display="none";
if(e.target===signupPopup)signupPopup.style.display="none";
});


/* MOBILE MENU */

const menuToggle=document.querySelector(".menu-toggle");
const navbar=document.querySelector(".navbar");

if(menuToggle&&navbar){
menuToggle.addEventListener("click",(e)=>{
e.stopPropagation();
navbar.classList.toggle("active");
});
}

document.querySelectorAll(".navbar a").forEach(link=>{
link.addEventListener("click",()=>{
if(navbar)navbar.classList.remove("active");
});
});

document.addEventListener("click",(e)=>{
if(navbar&&menuToggle){
if(!navbar.contains(e.target)&&!menuToggle.contains(e.target)){
navbar.classList.remove("active");
}
}
});


/* HEADER LANGUAGE */

const languageHeader=document.querySelector(".language-header");
const languageButton=document.querySelector(".language-globe");
const languageFlag=document.querySelector(".language-globe span");

if(languageButton&&languageHeader){
languageButton.addEventListener("click",(e)=>{
e.stopPropagation();
languageHeader.classList.toggle("active");
});
}

document.addEventListener("click",(e)=>{
if(languageHeader&&!languageHeader.contains(e.target)){
languageHeader.classList.remove("active");
}
});


document.querySelectorAll(".language-menu button").forEach(button=>{
button.addEventListener("click",()=>{
const selectedLanguage=button.getAttribute("onclick").replace("changeLanguage('","").replace("')","");

if(languageFlag){
if(selectedLanguage==="fr")languageFlag.textContent="🇫🇷";
if(selectedLanguage==="en")languageFlag.textContent="🇬🇧";
if(selectedLanguage==="ar")languageFlag.textContent="🇩🇿";
}

if(languageHeader)languageHeader.classList.remove("active");

});
});


/* MULTI LANGUAGE */

window.changeLanguage=function(language){

const elements=document.querySelectorAll("[data-fr]");

elements.forEach(element=>{

if(language==="fr")element.textContent=element.getAttribute("data-fr");
if(language==="en")element.textContent=element.getAttribute("data-en");
if(language==="ar")element.textContent=element.getAttribute("data-ar");

});


if(language==="ar"){
document.body.classList.add("rtl");
document.documentElement.dir="rtl";
}else{
document.body.classList.remove("rtl");
document.documentElement.dir="ltr";
}

const languageFlag=document.querySelector(".language-globe span");

if(languageFlag){
if(language==="fr")languageFlag.textContent="🇫🇷";
if(language==="en")languageFlag.textContent="🇬🇧";
if(language==="ar")languageFlag.textContent="🇩🇿";
}

localStorage.setItem("AQUAREV-language",language);

};


const savedLanguage=localStorage.getItem("AQUAREV-language");

if(savedLanguage){
changeLanguage(savedLanguage);
}else{
changeLanguage("fr");
}


/* HEADER SCROLL */

const header=document.querySelector(".header");

window.addEventListener("scroll",()=>{

if(header){

if(window.scrollY>80){

header.style.background="rgba(0,0,0,0.90)";
header.style.boxShadow="0 10px 30px rgba(0,0,0,.35)";

}else{

header.style.background="linear-gradient(90deg,rgba(0,0,0,.65),rgba(0,0,0,.25))";
header.style.boxShadow="none";

}

}

});


/* SMOOTH SCROLL */

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",function(e){

const target=document.querySelector(this.getAttribute("href"));

if(target){

e.preventDefault();

target.scrollIntoView({
behavior:"smooth",
block:"start"
});

}

});

});


/* SCROLL REVEAL */

const revealElements=document.querySelectorAll(".service-card,.contact-box,.section-title");

const revealObserver=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";
entry.target.style.transform="translateY(0)";

}

});

},{threshold:0.15});


revealElements.forEach(element=>{

element.style.opacity="0";
element.style.transform="translateY(60px)";
element.style.transition="all .8s ease";

revealObserver.observe(element);

});


/* BACK TO TOP */

const topButton=document.createElement("button");

topButton.innerHTML='<i class="fa-solid fa-arrow-up"></i>';

topButton.className="back-to-top";

document.body.appendChild(topButton);

Object.assign(topButton.style,{
position:"fixed",
bottom:"30px",
left:"30px",
width:"50px",
height:"50px",
borderRadius:"50%",
border:"none",
background:"#d4af37",
color:"#071426",
fontSize:"20px",
cursor:"pointer",
display:"none",
zIndex:"9999"
});


window.addEventListener("scroll",()=>{

if(window.scrollY>500){
topButton.style.display="block";
}else{
topButton.style.display="none";
}

});


topButton.onclick=()=>{
window.scrollTo({
top:0,
behavior:"smooth"
});
};


/* SOCIAL EFFECT */

document.querySelectorAll(".floating-social a,.footer-social a").forEach(link=>{

link.addEventListener("click",()=>{

link.style.transform="scale(1.2)";

setTimeout(()=>{
link.style.transform="";
},300);

});

});


/* FOOTER YEAR */

const year=new Date().getFullYear();

const footerText=document.querySelector(".footer-content p");

if(footerText){
footerText.innerHTML="© "+year+" AQUAREV Travel - Tous droits réservés";
}

});
/* ================= HERO TRAVEL EFFECTS ================= */

document.addEventListener("DOMContentLoaded",()=>{

const hero=document.querySelector(".hero");

if(hero){

const cloud=document.createElement("div");

cloud.className="travel-cloud";

cloud.innerHTML="☁️";

hero.appendChild(cloud);


const plane=document.createElement("div");

plane.className="travel-plane";

plane.innerHTML="✈️";

hero.appendChild(plane);

}


/* HERO BUTTON EFFECT */

const heroButton=document.querySelector(".hero-btn");

if(heroButton){

heroButton.addEventListener("mouseenter",()=>{

heroButton.style.transform="scale(1.08)";

});


heroButton.addEventListener("mouseleave",()=>{

heroButton.style.transform="scale(1)";

});

}



});


/* ================= LANGUAGE SAFETY ================= */


function updateLanguageFlag(language){

const flag=document.querySelector(".current-language");

if(!flag)return;


if(language==="fr"){

flag.textContent="🇫🇷";

}


if(language==="en"){

flag.textContent="🇬🇧";

}


if(language==="ar"){

flag.textContent="🇩🇿";

}

}



/* ================= CLOSE ALL MENUS ================= */


document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

const navbar=document.querySelector(".navbar");

const language=document.querySelector(".language-header");


if(navbar){

navbar.classList.remove("active");

}


if(language){

language.classList.remove("active");

}


}

});



/* ================= RESPONSIVE AUTH ICON MODE ================= */


function responsiveAuth(){

const width=window.innerWidth;

const buttons=document.querySelectorAll(".auth-buttons button");


buttons.forEach(button=>{


if(width<=500){

button.classList.add("mobile-auth");

}else{

button.classList.remove("mobile-auth");

}


});


}


window.addEventListener("resize",responsiveAuth);

responsiveAuth();



/* ================= PRELOAD VIDEOS ================= */


document.querySelectorAll("video").forEach(video=>{

video.setAttribute("preload","auto");

});



/* ================= IMAGE ERROR CONTROL ================= */


document.querySelectorAll("img").forEach(img=>{

img.addEventListener("error",()=>{

img.style.display="none";

});

});

/* ===== CLOSE POPUPS ON PAGE LOAD ===== */
/* ===== FORCE CLOSE POPUPS (MOBILE + DESKTOP) ===== */
document.addEventListener("DOMContentLoaded",function(){

const signin=document.getElementById("signin-popup");
const signup=document.getElementById("signup-popup");

if(signin) signin.style.display="none";
if(signup) signup.style.display="none";

document.body.style.overflow="auto";

});


window.addEventListener("pageshow",function(){

const signin=document.getElementById("signin-popup");
const signup=document.getElementById("signup-popup");

if(signin) signin.style.display="none";
if(signup) signup.style.display="none";

document.body.style.overflow="auto";


const lang=localStorage.getItem("AQUAREV-language") || "fr";

document.body.dir=lang==="ar"?"rtl":"ltr";


const supportBtn=document.querySelector(".support-btn");

if(supportBtn){

supportBtn.addEventListener("click",function(e){

e.stopPropagation();

const supportWidget=document.querySelector(".support-widget");

if(supportWidget){

supportWidget.classList.toggle("open");

}

});

}


});