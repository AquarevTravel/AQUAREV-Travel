const fs=require("fs");
const path=require("path");
const https=require("https");
const destinationsPath=path.join(__dirname,"assets","data","destinations.json");
const destinationsDir=path.join(__dirname,"assets","images","destinations");
const userAgent="AQUAREV-Travel/1.0 (destination image service)";
function normalizeText(value){
  return String(value||"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g," ")
    .replace(/\s+/g," ")
    .trim();
}
function slugify(value){
  return normalizeText(value)
    .replace(/[^\w\s-]/g,"")
    .replace(/\s+/g,"-")
    .replace(/-+/g,"-")
    .replace(/^-|-$/g,"");
}
function readDestinations(){
  if(!fs.existsSync(destinationsPath)) return [];
  try{
    return JSON.parse(fs.readFileSync(destinationsPath,"utf8"));
  }catch(error){
    console.error("DESTINATIONS JSON ERROR:",error);
    return [];
  }
}
function findDestination(value){
  const normalized=normalizeText(value);
  if(!normalized) return null;
  const destinations=readDestinations();
  for(const destination of destinations){
    const names=[destination.name,...(destination.aliases||[])];
    for(const name of names){
      const alias=normalizeText(name);
      if(!alias) continue;
      if(normalized===alias||normalized.includes(alias)||alias.includes(normalized)){
        return destination;
      }
    }
  }
  return null;
}
function requestJson(url){
  return new Promise((resolve,reject)=>{
    const request=https.get(url,{headers:{"User-Agent":userAgent}},response=>{
      let data="";
      response.setEncoding("utf8");
      response.on("data",chunk=>data+=chunk);
      response.on("end",()=>{
        if(response.statusCode<200||response.statusCode>=300){
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        try{
          resolve(JSON.parse(data));
        }catch(error){
          reject(error);
        }
      });
    });
    request.on("error",reject);
    request.setTimeout(15000,()=>{
      request.destroy(new Error("Request timeout"));
    });
  });
}
function downloadFile(url,filePath){
  return new Promise((resolve,reject)=>{
    const file=fs.createWriteStream(filePath);
    const request=https.get(url,{headers:{"User-Agent":userAgent}},response=>{
      if(response.statusCode>=300&&response.statusCode<400&&response.headers.location){
        file.close();
        fs.unlink(filePath,()=>{});
        downloadFile(response.headers.location,filePath).then(resolve).catch(reject);
        return;
      }
      if(response.statusCode!==200){
        file.close();
        fs.unlink(filePath,()=>{});
        reject(new Error(`Image HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish",()=>{
        file.close(resolve);
      });
    });
    request.on("error",error=>{
      file.close();
      fs.unlink(filePath,()=>{});
      reject(error);
    });
    request.setTimeout(30000,()=>{
      request.destroy(new Error("Image download timeout"));
    });
  });
}
async function searchWikimediaImage(city){
  const searchTerms=[
    `${city} city`,
    city
  ];
  for(const searchTerm of searchTerms){
    const params=new URLSearchParams({
      action:"query",
      format:"json",
      generator:"search",
      gsrsearch:searchTerm,
      gsrnamespace:"6",
      gsrlimit:"10",
      prop:"imageinfo",
      iiprop:"url|mime|size",
      iiurlwidth:"1600"
    });
    const url=`https://commons.wikimedia.org/w/api.php?${params.toString()}`;
    try{
      const data=await requestJson(url);
      const pages=data?.query?.pages||{};
      const results=Object.values(pages);
      for(const page of results){
        const info=page?.imageinfo?.[0];
        if(!info) continue;
        const mime=String(info.mime||"").toLowerCase();
        if(!mime.startsWith("image/")) continue;
        if(!info.thumburl&& !info.url) continue;
        return {
          url:info.thumburl||info.url,
          title:page.title||"",
          source:info.descriptionurl||""
        };
      }
    }catch(error){
      console.error(`WIKIMEDIA SEARCH ERROR [${city}]:`,error.message);
    }
  }
  return null;
}
async function ensureDestinationImage(destinationValue){
  fs.mkdirSync(destinationsDir,{recursive:true});
  const destination=findDestination(destinationValue);
  if(!destination){
    return {
      found:false,
      key:"default",
      name:"Destination inconnue",
      image:"/assets/images/destinations/default.jpg"
    };
  }
  const key=slugify(destination.key||destination.name);
  const filePath=path.join(destinationsDir,`${key}.jpg`);
  const publicPath=`/assets/images/destinations/${key}.jpg`;
  if(fs.existsSync(filePath)){
    return {
      found:true,
      cached:true,
      key,
      name:destination.name,
      image:publicPath
    };
  }
  console.log(`🌍 Recherche image destination: ${destination.name}`);
  const result=await searchWikimediaImage(destination.name);
  if(!result){
    console.log(`⚠️ Aucune image trouvée pour: ${destination.name}`);
    return {
      found:true,
      cached:false,
      key,
      name:destination.name,
      image:"/assets/images/destinations/default.jpg"
    };
  }
  try{
    await downloadFile(result.url,filePath);
    console.log(`✅ Image téléchargée: ${filePath}`);
    return {
      found:true,
      cached:false,
      key,
      name:destination.name,
      image:publicPath,
      source:result.source||"",
      title:result.title||""
    };
  }catch(error){
    console.error(`IMAGE DOWNLOAD ERROR [${destination.name}]:`,error.message);
    return {
      found:true,
      cached:false,
      key,
      name:destination.name,
      image:"/assets/images/destinations/default.jpg"
    };
  }
}
module.exports={
  normalizeText,
  slugify,
  findDestination,
  ensureDestinationImage
};