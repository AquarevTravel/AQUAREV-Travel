require("dotenv").config({
path:"../.env"
});
console.log("EMAIL:",process.env.EMAIL_USER);
console.log("PASS:",process.env.EMAIL_PASS?"OK":"MISSING");
const express=require("express");
const admin=require("firebase-admin/app");
const {getFirestore}=require("firebase-admin/firestore");
const {getApps,initializeApp,cert}=require("firebase-admin/app");
let serviceAccount;
if(process.env.FIREBASE_SERVICE_ACCOUNT){
serviceAccount=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
}else{
serviceAccount=require("./aquarev-travel-firebase-adminsdk-fbsvc-efffbbec3d.json");
}
if(!getApps().length){
initializeApp({
credential:cert(serviceAccount)
});
}
const db=getFirestore();
const cors=require("cors");
const path=require("path");
const upload=require("./upload");
const generatePDF=require("./pdfGenerator");
const generateFlightPDF=require("./flightPdfGenerator");
const {sendMail,sendNewUserMail,sendFlightMail}=require("./mailer");
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static(path.join(__dirname,"../uploads")));
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
await db.collection("requests").add({
type:"Visa",
data:data,
files:files.map(file=>file.originalname),
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
await sendFlightMail(data,files,pdfPath);
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
app.use("/billetterie",express.static(path.join(__dirname,"../billetterie")));
app.use(express.static(path.join(__dirname,"..")));
const PORT=process.env.PORT||3000;
app.listen(PORT,"0.0.0.0",()=>{
console.log(`AQUAREV Server running on port ${PORT}`);
});