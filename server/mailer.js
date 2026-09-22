
const {BrevoClient}=require("@getbrevo/brevo");
const fs=require("fs");
const path=require("path");
const https=require("https");
const http=require("http");

const brevo=new BrevoClient({
apiKey:process.env.BREVO_API_KEY,
timeoutInSeconds:120,
maxRetries:5
});

function downloadRemoteFile(url,destination){
return new Promise((resolve,reject)=>{
if(!url){
return reject(new Error("Remote file URL missing"));
}

const client=url.startsWith("https://")?https:http;

const request=client.get(url,response=>{
if(response.statusCode>=300&&response.statusCode<400&&response.headers.location){
response.resume();
return downloadRemoteFile(response.headers.location,destination)
.then(resolve)
.catch(reject);
}

if(response.statusCode!==200){
response.resume();
return reject(new Error(`Remote file download failed with status ${response.statusCode}`));
}

const fileStream=fs.createWriteStream(destination);

response.pipe(fileStream);

fileStream.on("finish",()=>{
fileStream.close(()=>{
resolve(destination);
});
});

fileStream.on("error",error=>{
fileStream.close(()=>{
reject(error);
});
});
});

request.on("error",reject);

request.setTimeout(120000,()=>{
request.destroy(new Error("Remote file download timeout"));
});
});
}

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
email:"agence.aquarev.travel@gmail.com",
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
email:"agence.aquarev.travel@gmail.com",
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
email:"agence.aquarev.travel@gmail.com",
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

async function sendVoyageReservationMail(data,pdfPath){
console.log("====================================");
console.log("NOUVELLE RESERVATION VOYAGE");
console.log("RESERVATION:",data.reservationReference);
console.log("Envoi réservation voyage via Brevo API...");

const customer=data.customer||{};
const passport=data.passport||{};
const program=data.program||{};

const temporaryFiles=[];
const reservationFiles=[];

try{
const temporaryDir=path.join(__dirname,"../uploads/voyage-reservations");

if(!fs.existsSync(temporaryDir)){
fs.mkdirSync(temporaryDir,{recursive:true});
}

if(data.passportImage?.url||data.passportImage?.fileUrl){
const passportUrl=data.passportImage.url||data.passportImage.fileUrl;
const passportName=data.passportImage.name||`passport-${data.reservationReference||Date.now()}.jpg`;
const passportPath=path.join(
temporaryDir,
`${data.reservationReference||Date.now()}-passport-${path.basename(passportName)}`
);

try{
console.log("TELECHARGEMENT IMAGE PASSEPORT...");
console.log("PASSPORT URL:",passportUrl);

await downloadRemoteFile(passportUrl,passportPath);

if(fs.existsSync(passportPath)){
console.log("PASSPORT FILE DOWNLOADED:",passportPath);

reservationFiles.push({
path:passportPath,
originalname:passportName
});

temporaryFiles.push(passportPath);
}else{
console.log("PASSPORT FILE NOT FOUND AFTER DOWNLOAD:",passportPath);
}
}catch(error){
console.error("PASSPORT DOWNLOAD ERROR:",error.message);
}
}else{
console.log("PASSPORT IMAGE URL MISSING");
}

if(data.paymentReceipt?.url||data.paymentReceipt?.fileUrl){
const paymentUrl=data.paymentReceipt.url||data.paymentReceipt.fileUrl;
const paymentName=data.paymentReceipt.name||`payment-receipt-${data.reservationReference||Date.now()}`;
const paymentPath=path.join(
temporaryDir,
`${data.reservationReference||Date.now()}-payment-${path.basename(paymentName)}`
);

try{
console.log("TELECHARGEMENT JUSTIFICATIF PAIEMENT...");
console.log("PAYMENT URL:",paymentUrl);

await downloadRemoteFile(paymentUrl,paymentPath);

if(fs.existsSync(paymentPath)){
console.log("PAYMENT FILE DOWNLOADED:",paymentPath);

reservationFiles.push({
path:paymentPath,
originalname:paymentName
});

temporaryFiles.push(paymentPath);
}else{
console.log("PAYMENT FILE NOT FOUND AFTER DOWNLOAD:",paymentPath);
}
}catch(error){
console.error("PAYMENT DOWNLOAD ERROR:",error.message);
}
}else{
console.log("PAYMENT RECEIPT URL MISSING");
}

const attachments=await buildAttachments(reservationFiles,pdfPath);

console.log("VOYAGE RESERVATION ATTACHMENTS:",attachments.map(item=>item.name));

const result=await brevo.transactionalEmails.sendTransacEmail({
sender:{
name:"AQUAREV Travel",
email:process.env.SENDER_EMAIL
},
to:[
{
email:"agence.aquarev.travel@gmail.com",
name:"AQUAREV Travel"
}
],
subject:`Nouvelle réservation voyage - ${data.reservationReference||"AQUAREV Travel"}`,
textContent:`AQUAREV Travel
Nouvelle demande de réservation programme touristique.

Référence de réservation : ${data.reservationReference||"-"}

Informations programme:

Programme : ${data.programTitle||program.title||"-"}
Pays : ${data.country||program.country||"-"}
Ville : ${data.city||program.city||"-"}
Date de départ : ${data.departureDate||program.departureDate||"-"}
Date de retour : ${data.returnDate||program.returnDate||"-"}
Hôtel : ${data.hotel||program.hotel||"-"}
Prix : ${data.price||"-"} ${data.currency||"DZD"}

Informations client:

Nom : ${customer.lastName||"-"}
Prénom : ${customer.firstName||"-"}
Date de naissance : ${customer.dateOfBirth||"-"}
Lieu de naissance : ${customer.placeOfBirth||"-"}
Téléphone : ${customer.phone||"-"}
Email : ${customer.email||"-"}

Informations passeport:

Numéro passeport : ${passport.number||"-"}
Date d'émission : ${passport.issueDate||"-"}
Date d'expiration : ${passport.expiryDate||"-"}

Paiement:

Statut du paiement : ${data.paymentStatus||"pending"}

Documents:

Passeport : ${data.passportImage?.url||data.passportImage?.fileUrl||"-"}
Justificatif de paiement : ${data.paymentReceipt?.url||data.paymentReceipt?.fileUrl||"Non fourni"}

Statut de la réservation : ${data.status||"pending"}

Le document PDF complet de la réservation est joint à cet email.
La copie du passeport est également jointe à cet email${data.paymentReceipt?.url||data.paymentReceipt?.fileUrl?" ainsi que le justificatif de paiement":" "}.

AQUAREV Travel`,
attachment:attachments
});

console.log("EMAIL RESERVATION VOYAGE ENVOYE",result);

return result;
}finally{
for(const filePath of temporaryFiles){
try{
if(fs.existsSync(filePath)){
fs.unlinkSync(filePath);
console.log("TEMPORARY FILE DELETED:",filePath);
}
}catch(error){
console.error("TEMPORARY FILE DELETE ERROR:",error.message);
}
}
}
}

async function sendPartnerMail(email,pdfPath,request){
try{
console.log("PARTNER MAIL TEST START");
console.log("EMAIL:",email);
console.log("PDF:",pdfPath);
console.log("REQUEST:",request.id);

if(!email||!pdfPath){
console.log("PARTNER EMAIL OR PDF MISSING");
return;
}

const fs=require("fs");
const path=require("path");

if(!fs.existsSync(pdfPath)){
console.log("PARTNER PDF NOT FOUND:",pdfPath);
return;
}

const attachment={
name:path.basename(pdfPath),
content:fs.readFileSync(pdfPath).toString("base64")
};

const result=await brevo.transactionalEmails.sendTransacEmail({
sender:{
name:"AQUAREV Travel",
email:process.env.SENDER_EMAIL
},
to:[
{
email:email,
name:"AQUAREV Partner"
}
],
subject:"Nouvelle demande AQUAREV Travel",
textContent:`AQUAREV Travel

Une nouvelle demande vous a été transférée.

Service : ${request.type||"-"}
Destination : ${request.data?.destination||request.data?.selectedCountry||"-"}

Merci de consulter le document PDF joint.

AQUAREV Travel`,
attachment:[
attachment
]
});

console.log("PARTNER EMAIL SENT:",email);

return result;
}catch(error){
console.error("PARTNER EMAIL ERROR:",error);
}
}

module.exports={
sendMail,
sendNewUserMail,
sendFlightMail,
sendVoyageReservationMail,
sendPartnerMail
};
