const nodemailer=require("nodemailer");
const path=require("path");
const transporter=nodemailer.createTransport({
service:"gmail",
auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
},
connectionTimeout:30000,
greetingTimeout:30000,
socketTimeout:30000
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
text:
`
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
await transporter.sendMail(mailOptions);
}
async function sendNewUserMail(user){
const mailOptions={
from:process.env.EMAIL_USER,
to:process.env.EMAIL_USER,
subject:"Nouvel utilisateur inscrit - AQUAREV Travel",
text:
`
AquaRev Travel
Nouvelle inscription utilisateur.
Nom complet:${user.name||"-"}
Email:${user.email||"-"}
Méthode inscription:${user.provider||user.method||"Email"}
Date:${new Date().toLocaleString("fr-FR")}
`
};
await transporter.sendMail(mailOptions);
}
module.exports={
sendMail,
sendNewUserMail
};