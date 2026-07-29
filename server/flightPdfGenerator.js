const PDFDocument=require("pdfkit");
const fs=require("fs");
const path=require("path");
const logoPath=path.join(__dirname,"../assets/logo/favicon.png");
const COLORS={
gold:"#C9A227",
blue:"#0B3D91",
dark:"#222222",
gray:"#666666"
};
function getValue(data,keys){
for(const key of keys){
if(data[key]!==undefined&&data[key]!==null&&data[key]!==""){
return String(data[key]);
}
}
return "-";
}
function drawBorder(doc){
doc.save().lineWidth(1.5).strokeColor(COLORS.gold).roundedRect(25,25,545,790,8).stroke().restore();
}
function drawHeader(doc,reference){
if(fs.existsSync(logoPath)){
doc.image(logoPath,470,45,{width:60});
}
doc.fontSize(26).fillColor(COLORS.blue).text("AQUAREV Travel",50,55,{align:"center",width:350});
doc.fontSize(14).fillColor(COLORS.dark).text("Demande de réservation billet avion",50,92,{align:"center",width:350});
doc.moveTo(50,125).lineTo(545,125).strokeColor(COLORS.gold).lineWidth(1).stroke();
doc.fontSize(11).fillColor(COLORS.gray).text("Reference : "+reference,50,140);
}
function drawTitle(doc,title){
doc.moveDown();
doc.fontSize(13).fillColor(COLORS.blue).text(title,50,doc.y);
doc.moveTo(50,doc.y+4).lineTo(545,doc.y+4).strokeColor(COLORS.gold).lineWidth(0.7).stroke();
doc.moveDown(0.5);
}
function drawRow(doc,label,value){
doc.fontSize(11).fillColor(COLORS.blue).text(label+" : ",55,doc.y,{continued:true});
doc.fillColor(COLORS.dark).text(value||"-");
doc.moveDown(0.15);
}
function drawFooter(doc){
const y=doc.y+20;
doc.moveTo(50,y).lineTo(545,y).strokeColor(COLORS.gold).stroke();
doc.fontSize(9).fillColor(COLORS.gray).text("Date d'envoi : "+new Date().toLocaleString("fr-FR"),50,y+10);
doc.fontSize(11).fillColor(COLORS.blue).text("AQUAREV Travel",50,y+28);
}
function generateFlightPDF(data,files){
return new Promise((resolve,reject)=>{
const reference="FLY-"+Date.now();
const folder=path.join(__dirname,"../pdf");
if(!fs.existsSync(folder)){
fs.mkdirSync(folder,{recursive:true});
}
const pdfPath=path.join(folder,reference+".pdf");
const doc=new PDFDocument({
size:"A4",
margin:45
});
const stream=fs.createWriteStream(pdfPath);
doc.pipe(stream);
drawBorder(doc);
drawHeader(doc,reference);
drawTitle(doc,"Informations client");
drawRow(doc,"Nom complet",getValue(data,["fullname","name","Nom complet"]));
drawRow(doc,"Téléphone",getValue(data,["phone","Téléphone"]));
drawRow(doc,"Email",getValue(data,["email","Adresse e-mail"]));
drawRow(doc,"Adresse",getValue(data,["address","Adresse complète"]));
drawTitle(doc,"Informations passeport");
drawRow(doc,"Numéro passeport",getValue(data,["passport","Numéro passeport"]));
drawRow(doc,"Pays émission",getValue(data,["passportCountry","Pays de délivrance"]));
drawRow(doc,"Date émission",getValue(data,["issueDate","Date de délivrance"]));
drawRow(doc,"Date expiration",getValue(data,["expiryDate","Date expiration"]));
drawTitle(doc,"Informations voyage");
drawRow(doc,"Départ pays",getValue(data,["departureCountry"]));
drawRow(doc,"Départ ville",getValue(data,["departureCity"]));
drawRow(doc,"Destination",getValue(data,["destination"]));
drawRow(doc,"Ville arrivée",getValue(data,["arrivalCity"]));
drawRow(doc,"Date aller",getValue(data,["departureDate"]));
drawRow(doc,"Date retour",getValue(data,["returnDate"]));
drawTitle(doc,"Compagnie aérienne");
drawRow(doc,"Compagnie",getValue(data,["airline"]));
drawRow(doc,"Classe",getValue(data,["class"]));
drawTitle(doc,"Paiement");
drawRow(doc,"Méthode",getValue(data,["payment"]));
drawTitle(doc,"Documents");
if(files&&files.length){
files.forEach((file,index)=>{
drawRow(doc,"Document "+(index+1),file.originalname);
});
}else{
drawRow(doc,"Documents","Aucun document joint");
}
drawFooter(doc);
doc.end();
stream.on("finish",()=>{
resolve(pdfPath);
});
stream.on("error",reject);
});
}
module.exports=generateFlightPDF;