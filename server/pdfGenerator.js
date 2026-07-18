const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
// ======================================================
// AQUAREV TRAVEL
// VISA REQUEST PDF GENERATOR
// ======================================================
// ===============================
// PATHS
// ===============================
const arabicFont = path.join(
    __dirname,
    "../fonts/Amiri-Regular.ttf"
);
// Logo (sera ajouté après)
// ===============================
const logoPath = path.join(
    __dirname,
    "../assets/logo/favicon.png"
);
// ===============================
// COLORS
// ===============================
const COLORS = {
    gold:"#C9A227",
    blue:"#0B3D91",
    dark:"#222222",
    gray:"#666666"
};
// ===============================
// GET DATA VALUE
// ===============================
function getValue(data, keys){
    for(const key of keys){
        if(
            data[key] !== undefined &&
            data[key] !== null &&
            data[key] !== ""
        ){
            return String(data[key]);
        }
    }
    return "-";
}
// ===============================
// DRAW BORDER
// ===============================
function drawPageBorder(doc){
    doc
    .save()
    .lineWidth(1.5)
    .strokeColor(COLORS.gold)
    .roundedRect(
        25,
        25,
        545,
        790,
        8
    )
    .stroke()
    .restore();
}
// ===============================
// HEADER
// ===============================
function drawHeader(doc,reference){
    // LOGO RIGHT
    if(fs.existsSync(logoPath)){
        doc.image(
            logoPath,
            470,
            45,
            {
                width:60
            }
        );
    }
    // NAME
    doc
    .font("Amiri")
    .fontSize(26)
    .fillColor(COLORS.blue)
    .text(
        "AquaRev_Travel",
        50,
        55,
        {
            align:"center",
            width:350
        }
    );
    doc
    .fontSize(14)
    .fillColor(COLORS.dark)
    .text(
        "Demande de rendez-vous Visa",
        50,
        92,
        {
            align:"center",
            width:350
        }
    );
    // GOLD LINE
    doc
    .moveTo(
        50,
        125
    )
    .lineTo(
        545,
        125
    )
    .lineWidth(1)
    .strokeColor(COLORS.gold)
    .stroke();
    // REFERENCE
    doc
    .fontSize(11)
    .fillColor(COLORS.gray)
    .text(
        "Reference : " + reference,
        50,
        140
    );
}
// ======================================================
// DRAW SECTION TITLE
// ======================================================


function drawSectionTitle(doc,title){


    doc
    .font("Amiri")
    .fontSize(13)
    .fillColor(COLORS.blue)
    .text(
        title,
        50,
        doc.y
    );


    doc
    .moveTo(
        50,
        doc.y + 4
    )
    .lineTo(
        545,
        doc.y + 4
    )
    .strokeColor(COLORS.gold)
    .lineWidth(0.7)
    .stroke();
    doc.moveDown(0.5);
}
// ======================================================
// DRAW TELEX ROW
// ======================================================
function drawRow(doc,label,value){
    const y = doc.y;
    doc
    .font("Amiri")
    .fontSize(11)
    .fillColor(COLORS.blue)
    .text(
        label + " : ",
        55,
        y,
        {
            continued:true
        }
    );
    doc
    .font("Amiri")
    .fillColor(COLORS.dark)
    .text(
        value || "-",
        {
            continued:false
        }
    );
    doc.moveDown(0.15);
}
// ======================================================
// CLIENT INFORMATION
// ======================================================
function drawClientInformation(doc,data){
    drawSectionTitle(
        doc,
        "Informations du client"
    );
    drawRow(
    doc,
    "Nom complet",
    getValue(data,[
        "nom_complet",
        "Nom complet",
        "nom",
        "name"
    ])
);

drawRow(
    doc,
    "Nom du père",
    getValue(data,[
        "nom_pere",
        "Nom du père",
        "Nom du pÃ¨re"
    ])
);

drawRow(
    doc,
    "Nom de la mère",
    getValue(data,[
        "Nom complet de la mère",
        "Nom complet de la mere",
        "Nom complet de la mÃ¨re",
        "Nom complet de la mÃƒÂ¨re",
        "إسم و لقب الأم",
        "اسم و لقب الأم",
        "mere"
    ])
);
drawRow(
    doc,
    "Téléphone",
    getValue(data,[
        "telephone",
        "Téléphone",
        "TÃ©lÃ©phone"
    ])
);

drawRow(
    doc,
    "Adresse e-mail",
    getValue(data,[
        "email",
        "Adresse e-mail"
    ])
);

drawRow(
    doc,
    "Adresse",
    getValue(data,[
        "adresse",
        "Adresse complète",
        "Adresse complÃ¨te"
    ])
);
    doc.moveDown(0.5);
}
// ======================================================
// VISA INFORMATION
// ======================================================
function drawVisaInformation(doc,data){
    drawSectionTitle(
        doc,
        "Informations du visa"
    );
    drawRow(
        doc,
        "Numéro passeport",
        getValue(data,[
            "Numéro passeport",
            "NumÃ©ro passeport",
            "passport"
        ])
    );
    drawRow(
        doc,
        "Type de visa",
        getValue(data,[
            "visaType",
            "Type de visa"
        ])
    );
    drawRow(
        doc,
        "Destination",
        getValue(data,[
            "destination",
            "selectedCountry"
        ])
    );
    drawRow(
        doc,
        "Activité",
        getValue(data,[
            "activityType"
        ])
    );
    drawRow(
        doc,
        "Résidence",
        getValue(data,[
            "residenceType"
        ])
    );
    drawRow(
        doc,
        "Mode de paiement",
        getValue(data,[
            "paymentMethod"
        ])
    );
    doc.moveDown(0.5);
}
// ======================================================
// DOCUMENTS
// ======================================================
function drawDocuments(doc,files){
    drawSectionTitle(
        doc,
        "Documents reçus"
    );
    if(files && files.length){
        files.forEach((file,index)=>{
            drawRow(
                doc,
                "Document "+(index+1),
                file.originalname
            );
        });
    }else{
        drawRow(
            doc,
            "Documents",
            "Aucun document joint"
        );
    }
}
// ======================================================
// FOOTER + SIGNATURE
// ======================================================



function drawFooter(doc){

    const bottom = doc.y + 15;


    // ===============================
    // GOLD LINE
    // ===============================

    doc
    .moveTo(
        50,
        bottom
    )
    .lineTo(
        545,
        bottom
    )
    .strokeColor(COLORS.gold)
    .lineWidth(1)
    .stroke();



    // ===============================
    // FOOTER TEXT
    // ===============================

    doc
    .font("Amiri")
    .fontSize(9)
    .fillColor(COLORS.gray)
    .text(
        "Date d'envoi : " +
        new Date().toLocaleString("fr-FR"),
        50,
        bottom + 8
    );


    doc
    .fontSize(11)
    .fillColor(COLORS.blue)
    .text(
        "AquaRev_Travel",
        50,
        bottom + 24
    );


    doc
    .fontSize(9)
    .fillColor(COLORS.gray)
    .text(
        "Service Visa",
        50,
        bottom + 40
    );



    // ===============================
    // LOGO / STAMP
    // ===============================

    if(fs.existsSync(logoPath)){


        doc.image(
            logoPath,
            470,
            bottom + 18,
            {
                width:45,
                height:45
            }
        );


    }
    else{


        doc
        .fontSize(8)
        .fillColor(COLORS.gray)
        .text(
            "Cachet AQUAREV",
            430,
            bottom + 35
        );


    }


}






// ======================================================
// MAIN PDF GENERATOR
// ======================================================
function generatePDF(data,files){
return new Promise((resolve,reject)=>{
    const reference =
    "AQV-" + Date.now();
    const pdfFolder =
    path.join(
        __dirname,
        "../pdf"
    );
    if(!fs.existsSync(pdfFolder)){
        fs.mkdirSync(
            pdfFolder,
            {
                recursive:true
            }
        );
    }
    const pdfPath =
    path.join(
        pdfFolder,
        reference + ".pdf"
    );
    const doc =
    new PDFDocument({
        size:"A4",
        margin:45,
        autoFirstPage:true
    });
    // Arabic support
    if(fs.existsSync(arabicFont)){
        doc.registerFont(
            "Amiri",
            arabicFont
        );
        doc.font("Amiri");
    }
    else{
        doc.font("Helvetica");
    }
    const stream =
    fs.createWriteStream(
        pdfPath
    );
    doc.pipe(stream);
    // PAGE DESIGN
    drawPageBorder(doc);
    drawHeader(
        doc,
        reference
    );
    drawClientInformation(
        doc,
        data
    );
    drawVisaInformation(
        doc,
        data
    );
    drawDocuments(
        doc,
        files
    );
    drawFooter(doc);
    doc.end();
    stream.on(
        "finish",
        ()=>{
            resolve(pdfPath);
        }
    );
    stream.on(
        "error",
        reject
    );
});
}

module.exports = generatePDF;