import{db}from"./firebase-config.js";
import{addDoc,collection,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

export async function logPilotActivity({type,section,action,title,description="",referenceId="",amount=0,currency="DZD",status="completed",userId="",metadata={}}={}){
try{
const activity={
type:String(type||"operation"),
section:String(section||"general"),
action:String(action||"unknown"),
title:String(title||""),
description:String(description||""),
referenceId:String(referenceId||""),
amount:Number(amount)||0,
currency:String(currency||"DZD"),
status:String(status||"completed"),
userId:String(userId||""),
metadata:metadata&&typeof metadata==="object"?metadata:{},
createdAt:serverTimestamp()
};
const activityRef=await addDoc(collection(db,"activities"),activity);
console.log("PILOT ACTIVITY CREATED:",activityRef.id);
return activityRef.id;
}catch(error){
console.error("PILOT ACTIVITY ERROR:",error);
return null;
}
}