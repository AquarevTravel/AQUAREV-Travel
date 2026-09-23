const fs=require("fs");
const path=require("path");
const PDFDocument=require("pdfkit");

const arabicFont=path.join(__dirname,"../fonts/Amiri-Regular.ttf");
const logoPath=path.join(__dirname,"../assets/logo/favicon.png");

const COLORS={
gold:"#C9A227",
blue:"#0B3D91",
dark:"#222222",
gray:"#666666",
lightGray:"#F4F4F4",
border:"#D9D9D9"
};

function clean(value){
return String(value??"-").trim()||"-";
}

function getValue(data,keys){
for(const key of keys){
const value=data?.[key];
if(value!==undefined&&value!==null&&String(value).trim()!==""){
return String(value).trim();
}
}
return"-";
}

function drawPageBorder(doc){
const pageWidth=doc.page.width;
const pageHeight=doc.page.height;
doc.save();
doc.lineWidth(1);
doc.strokeColor(COLORS.gold);
doc.rect(28,28,pageWidth-56,pageHeight-56).stroke();
doc.restore();
}

function drawHeader(doc,reference){
const pageWidth=doc.page.width;

if(fs.existsSync(logoPath)){
try{
doc.image(logoPath,45,42,{fit:[62,62]});
}catch(error){
console.log("VOYAGE PDF LOGO ERROR:",error.message);
}
}

doc.font("Helvetica-Bold")
.fontSize(20)
.fillColor(COLORS.blue)
.text("AQUAREV Travel",120,48);

doc.font("Helvetica-Bold")
.fontSize(13)
.fillColor(COLORS.gold)
.text("RÉSERVATION PROGRAMME TOURISTIQUE",120,73);

doc.font("Helvetica")
.fontSize(9)
.fillColor(COLORS.gray)
.text(`Référence : ${reference}`,120,94);

doc.moveTo(45,118)
.lineTo(pageWidth-45,118)
.lineWidth(1.5)
.strokeColor(COLORS.gold)
.stroke();

doc.y=135;
}

function drawSectionTitle(doc,title){
if(doc.y>720){
doc.addPage();
drawPageBorder(doc);
doc.y=55;
}
doc.moveDown(0.45);
doc.font("Helvetica-Bold")
.fontSize(12)
.fillColor(COLORS.blue)
.text(title);
doc.moveDown(0.22);
doc.moveTo(45,doc.y)
.lineTo(doc.page.width-45,doc.y)
.lineWidth(0.6)
.strokeColor(COLORS.gold)
.stroke();
doc.moveDown(0.35);
}

function drawRow(doc,label,value){
if(doc.y>760){
doc.addPage();
drawPageBorder(doc);
doc.y=55;
}
const startY=doc.y;
doc.font("Helvetica-Bold")
.fontSize(9.5)
.fillColor(COLORS.dark)
.text(`${label} :`,55,startY,{width:155});

doc.font("Helvetica")
.fontSize(9.5)
.fillColor("#000000")
.text(clean(value),215,startY,{
width:320
});

doc.moveDown(0.25);
}

function drawClientInformation(doc,customer){
drawSectionTitle(doc,"INFORMATIONS PERSONNELLES");
drawRow(doc,"Nom",customer.lastName);
drawRow(doc,"Prénom",customer.firstName);
drawRow(doc,"Date de naissance",customer.dateOfBirth);
drawRow(doc,"Lieu de naissance",customer.placeOfBirth);
drawRow(doc,"Téléphone",customer.phone);
drawRow(doc,"Email",customer.email);
}

function drawProgramInformation(doc,data,program){
drawSectionTitle(doc,"INFORMATIONS DU PROGRAMME");

drawRow(
doc,
"Programme",
data.programTitle||program.title
);

drawRow(
doc,
"Pays",
data.country||program.country
);

drawRow(
doc,
"Ville",
data.city||program.city
);

drawRow(
doc,
"Date de départ",
data.departureDate||program.departureDate
);

drawRow(
doc,
"Date de retour",
data.returnDate||program.returnDate
);

drawRow(
doc,
"Hôtel",
data.hotel||program.hotel
);

drawRow(
doc,
"Prix",
`${clean(data.price)} ${clean(data.currency||"DZD")}`
);

drawRow(
doc,
"ID programme",
data.programId
);
}

function drawPassportInformation(doc,passport){
drawSectionTitle(doc,"INFORMATIONS DU PASSEPORT");

drawRow(
doc,
"Numéro de passeport",
passport.number
);

drawRow(
doc,
"Date de délivrance",
passport.issueDate
);

drawRow(
doc,
"Date d'expiration",
passport.expiryDate
);
}

function drawPaymentInformation(doc,data){
drawSectionTitle(doc,"INFORMATIONS DU PAIEMENT");

drawRow(
doc,
"Statut du paiement",
data.paymentStatus||"pending"
);

drawRow(
doc,
"Justificatif",
data.paymentReceipt?.name||(
data.paymentReceipt?.url||
data.paymentReceipt?.fileUrl||
"Non fourni"
)
);
}

function drawDocuments(doc,data){
drawSectionTitle(doc,"DOCUMENTS");

drawRow(
doc,
"Passeport",
data.passportImage?.name||(
data.passportImage?.url||
data.passportImage?.fileUrl||
"Non fourni"
)
);

drawRow(
doc,
"Justificatif de paiement",
data.paymentReceipt?.name||(
data.paymentReceipt?.url||
data.paymentReceipt?.fileUrl||
"Non fourni"
)
);

if(data.passportImage?.url||data.passportImage?.fileUrl){
const url=data.passportImage.url||data.passportImage.fileUrl;
doc.font("Helvetica")
.fontSize(8)
.fillColor(COLORS.blue)
.text("Lien du passeport :",{continued:true});
doc.fillColor("#555555")
.text(url,{
link:url,
underline:true
});
doc.moveDown(0.2);
}

if(data.paymentReceipt?.url||data.paymentReceipt?.fileUrl){
const url=data.paymentReceipt.url||data.paymentReceipt.fileUrl;
doc.font("Helvetica")
.fontSize(8)
.fillColor(COLORS.blue)
.text("Lien du justificatif :",{continued:true});
doc.fillColor("#555555")
.text(url,{
link:url,
underline:true
});
doc.moveDown(0.2);
}
}

function drawReservationStatus(doc,data){
drawSectionTitle(doc,"STATUT DE LA RÉSERVATION");

drawRow(
doc,
"Référence",
data.reservationReference
);

drawRow(
doc,
"Statut",
data.status||"pending"
);

drawRow(
doc,
"Date de création",
data.createdAt&&typeof data.createdAt.toDate==="function"
?data.createdAt.toDate().toLocaleString("fr-FR")
:new Date().toLocaleString("fr-FR")
);
}

function drawFooter(doc){
const pageWidth=doc.page.width;
const pageHeight=doc.page.height;

doc.font("Helvetica")
.fontSize(8)
.fillColor(COLORS.gray)
.text(
"Ce document a été généré automatiquement par AQUAREV Travel à partir de la demande de réservation.",
45,
pageHeight-67,
{
width:pageWidth-90,
align:"center"
}
);

doc.font("Helvetica-Bold")
.fontSize(8)
.fillColor(COLORS.blue)
.text(
"AQUAREV Travel",
45,
pageHeight-50,
{
width:pageWidth-90,
align:"center"
}
);
}

async function generateVoyageReservationPDF(data){
const reservationsDir=path.join(__dirname,"../pdf/voyage-reservations");

if(!fs.existsSync(reservationsDir)){
fs.mkdirSync(reservationsDir,{recursive:true});
}

const reference=clean(data.reservationReference)
.replace(/[^\w-]/g,"_");

const fileName=`voyage-reservation-${reference}.pdf`;
const pdfPath=path.join(reservationsDir,fileName);

const customer=data.customer||{};
const passport=data.passport||{};
const program=data.program||{};

return new Promise((resolve,reject)=>{
const doc=new PDFDocument({
size:"A4",
margin:45,
bufferPages:true,
info:{
Title:`AQUAREV Travel - Réservation ${reference}`,
Author:"AQUAREV Travel",
Subject:"Réservation programme touristique"
}
});

if(fs.existsSync(arabicFont)){
try{
doc.registerFont("Amiri",arabicFont);
}catch(error){
console.log("VOYAGE PDF FONT ERROR:",error.message);
}
}

const stream=fs.createWriteStream(pdfPath);

stream.on("finish",()=>{
resolve(pdfPath);
});

stream.on("error",reject);

doc.pipe(stream);

drawPageBorder(doc);
drawHeader(doc,reference);

drawProgramInformation(doc,data,program);
drawClientInformation(doc,customer);
drawPassportInformation(doc,passport);
drawPaymentInformation(doc,data);
drawDocuments(doc,data);
drawReservationStatus(doc,data);

doc.moveDown(0.8);

if(doc.y>700){
doc.addPage();
drawPageBorder(doc);
doc.y=55;
}

doc.font("Helvetica-Bold")
.fontSize(10)
.fillColor(COLORS.blue)
.text("AQUAREV Travel");

doc.font("Helvetica")
.fontSize(8.5)
.fillColor(COLORS.gray)
.text(
"Votre partenaire pour des voyages d'exception."
);

const range=doc.bufferedPageRange();

for(let i=0;i<range.count;i++){
doc.switchToPage(i);
drawPageBorder(doc);
drawFooter(doc);
}

doc.end();
});
}

module.exports=generateVoyageReservationPDF;