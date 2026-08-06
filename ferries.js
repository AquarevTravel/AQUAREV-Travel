const translations={
fr:{
dir:"ltr",
lang:"fr"
},
en:{
dir:"ltr",
lang:"en"
},
ar:{
dir:"rtl",
lang:"ar"
}
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


if(savedLanguage){

changeLanguage(savedLanguage);

}


});