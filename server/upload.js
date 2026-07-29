const multer=require("multer");
const path=require("path");
const fs=require("fs");
const uploadFolder=path.join(__dirname,"../uploads");
if(!fs.existsSync(uploadFolder)){
fs.mkdirSync(uploadFolder,{recursive:true});
}
const storage=multer.diskStorage({
destination:function(req,file,cb){
cb(null,uploadFolder);
},
filename:function(req,file,cb){
const ext=path.extname(file.originalname);
const safeName=Date.now()+"-"+Math.round(Math.random()*100000)+ext;
cb(null,safeName);
}
});
const fileFilter=(req,file,cb)=>{
const allowedTypes=[
"application/pdf",
"image/jpeg",
"image/png"
];
if(allowedTypes.includes(file.mimetype)){
cb(null,true);
}else{
cb(new Error("Format de fichier non accepté"),false);
}
};
const upload=multer({
storage:storage,
fileFilter:fileFilter,
limits:{
fileSize:10*1024*1024
}
});
module.exports=upload;