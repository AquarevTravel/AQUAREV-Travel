const {BrevoClient}=require("@getbrevo/brevo");
const fs=require("fs");
const path=require("path");
const brevo=newBrevoClient({
apiKey:process.env.BREVO_API_KEY,
timeoutInSeconds:60,
maxRetries:3
});
async function buildAttachments(files,pdfPath){
const attachments=[];
if(pdfPath&&fs.existsSync(pdfPath)){
attachments.push({
name:path.basename(pdfPath),
content:fs.readFileSync(pdfPath).toString("base64")
});
}else if(pdfPath){
console.log("PDF NOT FOUND:",pdfPath);
}
if(files&&files.length){
for(const file of files){
if(fs.existsSync(file.path)){
attachments.push({
name:Buffer.from(file.originalname,"latin1").toString("utf8"),
content:fs.readFileSync(file.path).toString("base64")
});
}else{
console.log("FILE NOT FOUND:",file.path);
}
}
}
console.log("ATTACHMENTS:",attachments.map(item=>item.name));
return attachments;
}
function getClientValue(data,keys){
for(const key of keys){
if(data[key]!==undefined&&data[key]!==null&&String(data[key]).trim()!==""){
return String(data[key]);
}
}
return"-";
}
async function sendMail(data,files,pdfPath){
const attachments=await buildAttachments(files,pdfPath);
console.log("CLIENT DATA:",data);
console.log("Envoi via Brevo API...");
const result=await brevo.transactionalEmails.sendTransacEmail({
sender:{
name:"AQUAREV Travel",
email:process.env.SENDER_EMAIL
},
to:[
{
email:"dididididida168@gmail.com",
name:"AQUAREV Travel"
}
],
subject:"Nouvelle demande VISA - AQUAREV Travel",
textContent:`AquaRev Travel
Nouvelle demande VISA reçue.

Informations client:

Nom : ${getClientValue(data,["Nom complet","nom_complet","nom"])}
Email : ${getClientValue(data,["Adresse e-mail","Adresse e-mail","email"])}
Téléphone : ${getClientValue(data,["Téléphone","TÃ©lÃ©phone","telephone"])}
Nom du père : ${getClientValue(data,["Nom du père","Nom du pÃ¨re"])}
Nom de la mère : ${getClientValue(data,["Nom complet de la mère","Nom complet de la mere","Nom complet de la mÃ¨re","Nom complet de la mÃƒÂ¨re"])}
Adresse : ${getClientValue(data,["Adresse complète","Adresse complÃ¨te","adresse"])}
Passeport : ${getClientValue(data,["Numéro passeport","NumÃ©ro passeport"])}
Destination : ${getClientValue(data,["selectedCountry","destination"])}
Type visa : ${getClientValue(data,["visaType"])}
Activité : ${getClientValue(data,["activityType"])}
Résidence : ${getClientValue(data,["residenceType"])}
Paiement : ${getClientValue(data,["paymentMethod"])}`,
attachment:attachments
});
console.log("EMAIL VISA ENVOYE",result);
return result;
}
async function sendNewUserMail(user){
console.log("Envoi inscription via Brevo API...");
const result=await brevo.transactionalEmails.sendTransacEmail({
sender:{
name:"AQUAREV Travel",
email:process.env.SENDER_EMAIL
},
to:[
{
email:"dididididida168@gmail.com",
name:"AQUAREV Travel"
}
],
subject:"Nouvel utilisateur inscrit - AQUAREV Travel",
textContent:`AquaRev Travel
Nouvelle inscription utilisateur.

Nom complet : ${user.name||"-"}
Email : ${user.email||"-"}
Méthode inscription : ${user.provider||user.method||"Email"}
Date : ${new Date().toLocaleString("fr-FR")}`
});
console.log("EMAIL INSCRIPTION ENVOYE",result);
return result;
}
async function sendFlightMail(data,files,pdfPath){
const attachments=await buildAttachments(files,pdfPath);
console.log("FLIGHT CLIENT DATA:",data);
console.log("Envoi réservation billet via Brevo API...");
const result=await brevo.transactionalEmails.sendTransacEmail({
sender:{
name:"AQUAREV Travel",
email:process.env.SENDER_EMAIL
},
to:[
{
email:"dididididida168@gmail.com",
name:"AQUAREV Travel"
}
],
subject:"Nouvelle réservation billet avion - AQUAREV Travel",
textContent:`AquaRev Travel
Nouvelle demande de réservation billet avion.

Informations client:

Nom complet : ${getClientValue(data,["fullname","name","Nom complet"])}
Téléphone : ${getClientValue(data,["phone","Téléphone"])}
Email : ${getClientValue(data,["email","Adresse e-mail"])}
Adresse : ${getClientValue(data,["address","Adresse complète"])}

Informations passeport:

Numéro passeport : ${getClientValue(data,["passport","Numéro passeport"])}
Pays émission : ${getClientValue(data,["passportCountry"])}
Date émission : ${getClientValue(data,["issueDate"])}
Date expiration : ${getClientValue(data,["expiryDate"])}

Informations voyage:

Départ pays : ${getClientValue(data,["departureCountry"])}
Départ ville : ${getClientValue(data,["departureCity"])}
Destination : ${getClientValue(data,["destination"])}
Ville arrivée : ${getClientValue(data,["arrivalCity"])}
Date aller : ${getClientValue(data,["departureDate"])}
Date retour : ${getClientValue(data,["returnDate"])}

Compagnie aérienne : ${getClientValue(data,["airline"])}
Classe : ${getClientValue(data,["class"])}
Paiement : ${getClientValue(data,["payment"])}`,
attachment:attachments
});
console.log("EMAIL BILLET ENVOYE",result);
return result;
}
module.exports={
sendMail,
sendNewUserMail,
sendFlightMail
};