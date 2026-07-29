const nodemailer=require("nodemailer");
const path=require("path");
const transporter=nodemailer.createTransport({
host:"smtp.gmail.com",
port:465,
secure:true,
family:4,
auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
},
tls:{
rejectUnauthorized:false
},
connectionTimeout:60000,
greetingTimeout:60000,
socketTimeout:60000
});
async function sendMail(data,files,pdfPath){
const attachments=[];
if(pdfPath){
attachments.push({
filename:path.basename(pdfPath),
path:pdfPath
});
}
if(files&&files.length){
files.forEach(file=>{
attachments.push({
filename:file.originalname,
path:file.path
});
});
}
const mailOptions={
from:process.env.EMAIL_USER,
to:process.env.EMAIL_USER,
subject:"Nouvelle demande VISA - AQUAREV Travel",
text:`
AquaRev Travel
Nouvelle demande VISA reçue.
Informations client:
Nom:${data["Nom complet"]||"-"}
Email:${data["Adresse e-mail"]||"-"}
Téléphone:${data["Téléphone"]||"-"}
Destination:${data.selectedCountry||"-"}
Type visa:${data.visaType||"-"}
`,
attachments:attachments
};
console.log("Verification de la connexion SMTP...");
await transporter.verify();
console.log("SMTP READY");
await transporter.sendMail(mailOptions);
console.log("EMAIL VISA ENVOYE");
}
async function sendNewUserMail(user){
const mailOptions={
from:process.env.EMAIL_USER,
to:process.env.EMAIL_USER,
subject:"Nouvel utilisateur inscrit - AQUAREV Travel",
text:`
AquaRev Travel
Nouvelle inscription utilisateur.
Nom complet:${user.name||"-"}
Email:${user.email||"-"}
Méthode inscription:${user.provider||user.method||"Email"}
Date:${new Date().toLocaleString("fr-FR")}
`
};
console.log("Verification de la connexion SMTP...");
await transporter.verify();
console.log("SMTP READY");
await transporter.sendMail(mailOptions);
console.log("EMAIL INSCRIPTION ENVOYE");
}
module.exports={
sendMail,
sendNewUserMail
};