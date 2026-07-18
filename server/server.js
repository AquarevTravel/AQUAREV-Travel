require("dotenv").config({
path:"../.env"
});
console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS ? "OK" : "MISSING");
const express=require("express");
const cors=require("cors");
const path=require("path");



const upload=require("./upload");
const generatePDF=require("./pdfGenerator");
const {sendMail,sendNewUserMail}=require("./mailer");
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static(path.join(__dirname,"../uploads")));

// ===============================
// NEW USER REGISTRATION
// ===============================
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

// ===============================
// VISA REQUEST
// ===============================
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
const pdfPath=await generatePDF(data,files);
await sendMail(data,files,pdfPath);
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

// ===============================
// START SERVER
// ===============================
app.use(express.static(path.join(__dirname,"..")));
const PORT=process.env.PORT||3000;

app.listen(PORT,"0.0.0.0",()=>{
console.log(`AQUAREV Server running on port ${PORT}`);
});