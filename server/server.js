const path=require("path");
const fs=require("fs");
require("dotenv").config({
path:path.join(__dirname,"../.env")
});
console.log("EMAIL:",process.env.EMAIL_USER);
console.log("PASS:",process.env.EMAIL_PASS?"OK":"MISSING");
console.log("BREVO KEY:",process.env.BREVO_API_KEY?"FOUND":"MISSING");
const express=require("express");
const ImageKit=require("@imagekit/nodejs");
const admin=require("firebase-admin/app");
const {getFirestore}=require("firebase-admin/firestore");
const {getApps,initializeApp,cert}=require("firebase-admin/app");
let serviceAccount;
if(process.env.RENDER){
serviceAccount=require("/etc/secrets/firebase-service-account.json");
}else{
serviceAccount=require("./aquarev-travel-firebase-adminsdk-fbsvc-efffbbec3d.json");
}
if(!getApps().length){
initializeApp({
credential:cert(serviceAccount)
});
const testDb=getFirestore();
testDb.collection("test_connection").add({
time:new Date()
})
.then(()=>{
console.log("🔥 FIRESTORE CONNECTION OK");
})
.catch(error=>{
console.error("🔥 FIRESTORE CONNECTION ERROR:",error);
});
}
const db=getFirestore();
const cors=require("cors");
const upload=require("./upload");
const generatePDF=require("./pdfGenerator");
const generateFlightPDF=require("./flightPdfGenerator");
const generateVoyageReservationPDF=require("./voyageReservationPdfGenerator");
const {sendMail,sendNewUserMail,sendFlightMail,sendVoyageReservationMail,sendPartnerMail}=require("./mailer");
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static(path.join(__dirname,"../uploads")));
app.use("/pdf",express.static(path.join(__dirname,"../pdf")));
app.use("/pdf",express.static(path.join(__dirname,"pdf")));

const imageKitClient=new ImageKit({
privateKey:process.env.IMAGEKIT_PRIVATE_KEY
});

app.get("/api/imagekit-auth",(req,res)=>{
try{
if(!process.env.IMAGEKIT_PRIVATE_KEY){
return res.status(500).json({
success:false,
message:"IMAGEKIT_PRIVATE_KEY is missing"
});
}
if(!process.env.IMAGEKIT_PUBLIC_KEY){
return res.status(500).json({
success:false,
message:"IMAGEKIT_PUBLIC_KEY is missing"
});
}
const authParams=imageKitClient.helper.getAuthenticationParameters();
res.json({
success:true,
token:authParams.token,
expire:authParams.expire,
signature:authParams.signature,
publicKey:process.env.IMAGEKIT_PUBLIC_KEY
});
}catch(error){
console.error("IMAGEKIT AUTH ERROR:",error);
res.status(500).json({
success:false,
message:"ImageKit authentication failed"
});
}
});

app.post("/new-user",async(req,res)=>{
try{
const user=req.body;
console.log("==============================");
console.log("Nouvel utilisateur inscrit");
console.log(user);
await sendNewUserMail(user);
res.json({
success:true,
message:"Utilisateur enregistré avec succès"
});
}catch(error){
console.error("NEW USER ERROR:",error);
res.status(500).json({
success:false,
message:"Erreur serveur"
});
}
});

app.post("/visa-request",upload.any(),async(req,res)=>{
try{
const data=req.body;
console.log("BODY KEYS:");
console.log(Object.keys(data));
const files=req.files||[];
console.log("==============================");
console.log("Nouvelle demande reçue");
console.log(data);
console.log("MERE:",data["Nom complet de la mère"]);
console.log("Files:",files.length);
files.forEach(file=>{
console.log(file.originalname);
});
let pdfPath=null;
try{
pdfPath=await generatePDF(data,files);
}catch(error){
console.log("PDF GENERATION ERROR:",error.message);
}
await sendMail(data,files,pdfPath);
console.log("PDF PATH BEFORE FIRESTORE:",pdfPath);
await db.collection("requests").add({
type:"Visa",
data:data,
files:files.map(file=>file.originalname),
pdfPath:pdfPath,
status:"new",
createdAt:new Date()
});
console.log("REQUEST SAVED TO FIRESTORE");
res.json({
success:true,
message:"Demande envoyée avec succès"
});
}catch(error){
console.error("SERVER ERROR:",error);
res.status(500).json({
success:false,
message:"Erreur serveur"
});
}
});

app.post("/flight-request",upload.any(),async(req,res)=>{
try{
const data=req.body;
const files=req.files||[];
console.log("==============================");
console.log("Nouvelle demande billet avion reçue");
console.log(data);
console.log("FILES:",files.length);
files.forEach(file=>{
console.log(file.originalname);
});
let pdfPath=null;
try{
pdfPath=await generateFlightPDF(data,files);
}catch(error){
console.log("FLIGHT PDF GENERATION ERROR:",error.message);
}
console.log("FLIGHT PDF PATH:",pdfPath);
await sendFlightMail(data,files,pdfPath);
await db.collection("requests").add({
type:"Vols",
data:data,
files:files.map(file=>file.originalname),
pdfPath:pdfPath,
status:"new",
createdAt:new Date()
});
console.log("FLIGHT REQUEST SAVED TO FIRESTORE");
res.json({
success:true,
message:"Demande billet envoyée avec succès"
});
}catch(error){
console.error("FLIGHT REQUEST ERROR:",error);
res.status(500).json({
success:false,
message:"Erreur serveur"
});
}
});

app.post("/send-partner-email",async(req,res)=>{
try{
const {email,requestId}=req.body;
if(!email||!requestId){
return res.status(400).json({
success:false,
message:"Email or request ID missing"
});
}
const requestSnap=await db.collection("requests").doc(requestId).get();
if(!requestSnap.exists){
return res.status(404).json({
success:false,
message:"Request not found"
});
}
const requestData={
id:requestSnap.id,
...requestSnap.data()
};
await sendPartnerMail(
email,
requestData.pdfPath,
requestData
);
res.json({
success:true,
message:"Partner email sent successfully"
});
}catch(error){
console.error("SEND PARTNER EMAIL ERROR:",error);
res.status(500).json({
success:false,
message:"Server error"
});
}
});

app.post("/voyage-reservation-email",async(req,res)=>{
try{
const data=req.body;
if(!data||!data.reservationReference){
return res.status(400).json({
success:false,
message:"Reservation data missing"
});
}

console.log("====================================");
console.log("Nouvelle réservation programme touristique");
console.log("REFERENCE:",data.reservationReference);
console.log("PROGRAMME:",data.programTitle);
console.log("CLIENT:",data.customer);
console.log("PASSEPORT:",data.passport);

let pdfPath=null;

try{
console.log("GENERATION VOYAGE RESERVATION PDF...");
pdfPath=await generateVoyageReservationPDF(data);

console.log("PDF GENERATOR RETURN:",pdfPath);

if(pdfPath){
let resolvedPdfPath=pdfPath;

if(!path.isAbsolute(resolvedPdfPath)){
const rootCandidate=path.resolve(__dirname,"..",resolvedPdfPath);
const serverCandidate=path.resolve(__dirname,resolvedPdfPath);

if(fs.existsSync(rootCandidate)){
resolvedPdfPath=rootCandidate;
}else if(fs.existsSync(serverCandidate)){
resolvedPdfPath=serverCandidate;
}else{
resolvedPdfPath=rootCandidate;
}
}

pdfPath=resolvedPdfPath;

console.log("VOYAGE RESERVATION PDF PATH:",pdfPath);
console.log("VOYAGE RESERVATION PDF EXISTS:",fs.existsSync(pdfPath));

if(fs.existsSync(pdfPath)){
const pdfStats=fs.statSync(pdfPath);
console.log("VOYAGE RESERVATION PDF SIZE:",pdfStats.size,"bytes");
}else{
console.error("VOYAGE RESERVATION PDF NOT FOUND:",pdfPath);
}
}else{
console.error("VOYAGE RESERVATION PDF PATH IS EMPTY");
}
}catch(error){
console.error("VOYAGE RESERVATION PDF GENERATION ERROR:",error);
}

console.log("SEND VOYAGE RESERVATION EMAIL");
console.log("PDF PATH SENT TO MAILER:",pdfPath);

await sendVoyageReservationMail(data,pdfPath);

console.log("VOYAGE RESERVATION EMAIL SENT");

res.json({
success:true,
message:"Reservation email sent successfully",
pdfPath:pdfPath
});
}catch(error){
console.error("VOYAGE RESERVATION EMAIL ERROR:",error);
res.status(500).json({
success:false,
message:"Erreur lors de l'envoi de l'email"
});
}
});

app.use("/billetterie",express.static(path.join(__dirname,"../billetterie")));
app.use(express.static(path.join(__dirname,"..")));

const {createCheckout}=require("./chargily/chargily");
const {createMastercardCheckout}=require("./mastercard/mastercard");
const {createBinanceCheckout}=require("./binance/binance");
const SITE_URL=process.env.SITE_URL||"https://aquarev-travel-anfn.onrender.com";
const {createHotelPayment}=require("./services/payment-service");

app.post("/api/payment/chargily",async(req,res)=>{
try{
const checkout=await createCheckout({
amount:req.body.amount,
currency:req.body.currency,
name:req.body.name,
email:req.body.email,
bookingType:req.body.bookingType||"ferry",
bookingId:req.body.bookingId,
bookingReference:req.body.bookingReference||req.body.reference,
ferry:req.body.ferry,
hotelName:req.body.hotelName,
route:req.body.route,
success_url:`${SITE_URL}/payment-success.html`,
failure_url:`${SITE_URL}/payment-failed.html`
});
res.json(checkout);
}catch(error){
console.error("CHARGILY PAYMENT ERROR:",error);
res.status(500).json({
error:"Payment creation failed"
});
}
});

app.post("/api/payment/mastercard",async(req,res)=>{
try{
const checkout=await createMastercardCheckout({
amount:req.body.amount,
currency:req.body.currency,
name:req.body.name,
email:req.body.email,
bookingId:req.body.bookingId,
success_url:`${SITE_URL}/hotel-confirmation.html`,
failure_url:`${SITE_URL}/payment-failed.html`
});
res.json(checkout);
}catch(error){
console.error("MASTERCARD PAYMENT ERROR:",error);
res.status(500).json({
error:"Mastercard payment creation failed"
});
}
});

app.post("/api/payment/binance",async(req,res)=>{
try{
const checkout=await createBinanceCheckout({
amount:req.body.amount,
currency:req.body.currency,
name:req.body.name,
email:req.body.email,
bookingId:req.body.bookingId,
success_url:`${SITE_URL}/payment-success.html`,
failure_url:`${SITE_URL}/payment-failed.html`
});
res.json(checkout);
}catch(error){
console.error("BINANCE PAYMENT ERROR:",error);
res.status(500).json({
error:"Binance payment creation failed"
});
}
});

app.post("/api/payment/hotel",async(req,res)=>{
try{
const checkout=await createHotelPayment({
amount:req.body.amount,
currency:req.body.currency,
name:req.body.name,
email:req.body.email,
bookingId:req.body.bookingId,
hotelName:req.body.hotelName,
checkIn:req.body.checkIn,
checkOut:req.body.checkOut,
nights:req.body.nights,
rooms:req.body.rooms,
success_url:`${SITE_URL}/payment-success.html`,
failure_url:`${SITE_URL}/payment-failed.html`
});
res.json({
success:true,
...checkout
});
}catch(error){
console.error("HOTEL PAYMENT ERROR:",error.response?.data||error.message);
res.status(500).json({
success:false,
error:"Hotel payment creation failed"
});
}
});

const PORT=process.env.PORT||3000;
app.listen(PORT,"0.0.0.0",()=>{
console.log("AQUAREV Server running on port "+PORT);
});