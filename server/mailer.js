const {BrevoClient}=require("@getbrevo/brevo");
const fs=require("fs");
const path=require("path");
const brevo=new BrevoClient({
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
}
if(files&&files.length){
for(const file of files){
if(fs.existsSync(file.path)){
attachments.push({
name:file.originalname,
content:fs.readFileSync(file.path).toString("base64")
});
}
}
}
return attachments;
}
async function sendMail(data,files,pdfPath){
const attachments=await buildAttachments(files,pdfPath);
console.log("Envoi via Brevo API...");
const result=await brevo.transactionalEmails.sendTransacEmail({
sender:{
name:"AQUAREV Travel",
email:process.env.EMAIL_USER
},
to:[
{
email:process.env.EMAIL_USER,
name:"AQUAREV Travel"
}
],
subject:"Nouvelle demande VISA - AQUAREV Travel",
textContent:`AquaRev Travel
Nouvelle demande VISA reçue.
Informations client:
Nom:${data["Nom complet"]||"-"}
Email:${data["Adresse e-mail"]||"-"}
Téléphone:${data["Téléphone"]||"-"}
Destination:${data.selectedCountry||"-"}
Type visa:${data.visaType||"-"}`,
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
email:process.env.EMAIL_USER
},
to:[
{
email:process.env.EMAIL_USER,
name:"AQUAREV Travel"
}
],
subject:"Nouvel utilisateur inscrit - AQUAREV Travel",
textContent:`AquaRev Travel
Nouvelle inscription utilisateur.
Nom complet:${user.name||"-"}
Email:${user.email||"-"}
Méthode inscription:${user.provider||user.method||"Email"}
Date:${new Date().toLocaleString("fr-FR")}`
});
console.log("EMAIL INSCRIPTION ENVOYE",result);
return result;
}
module.exports={
sendMail,
sendNewUserMail
};