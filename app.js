const form=document.getElementById("form");
const input=document.getElementById("url");
const statusBox=document.getElementById("status");
const result=document.getElementById("result");
const submit=document.getElementById("submit");
const paste=document.getElementById("paste");

function status(msg){statusBox.textContent=msg;statusBox.classList.remove("hidden")}
function validInstagram(u){try{const x=new URL(u);return /(^|\.)instagram\.com$/i.test(x.hostname)}catch{return false}}

paste.onclick=async()=>{try{input.value=await navigator.clipboard.readText();input.focus()}catch{status("اضغط مطولًا داخل الخانة واختر لصق.")}};

form.onsubmit=async(e)=>{
 e.preventDefault();
 result.classList.add("hidden");
 const url=input.value.trim();
 if(!validInstagram(url)){status("الصق رابط Instagram صحيح.");return}
 submit.disabled=true;status("جاري تجهيز أعلى جودة متاحة...");
 try{
   const r=await fetch("/api/download",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});
   const data=await r.json();
   if(!r.ok) throw new Error(data.error||"تعذر تحميل الفيديو");
   if(data.url){
     result.href=data.url;
     result.classList.remove("hidden");
     status("تم العثور على الفيديو. اضغط زر التحميل.");
   }else throw new Error("لم يتم العثور على رابط فيديو.");
 }catch(err){status("خطأ: "+err.message)}
 finally{submit.disabled=false}
};
