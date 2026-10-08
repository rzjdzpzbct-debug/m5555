const tips = [
  {category:"التركيز", kicker:"قاعدة بسيطة", title:"خلي البداية سهلة.", text:"لا تنتظر المزاج المثالي. ادرس خمس دقايق، وبعدها قرر تكمل لو ترتاح."},
  {category:"تنظيم الوقت", kicker:"قاعدة اليوم", title:"رتّب يومك بثلاث مهام.", text:"اكتب أهم ثلاث شغلات تريد تخلصها. لا تملأ يومك بقائمة طويلة."},
  {category:"الدراسة", kicker:"حتى تثبّت المعلومة", title:"اختبر نفسك، لا تعيد القراءة بس.", text:"اقرأ فقرة، سكّر الكتاب، وگول الفكرة بكلامك. ارجع للنقطة اللي نسيتها."},
  {category:"النوم", kicker:"اهتم بطاقة باچر", title:"قدّم نومك شويّة شويّة.", text:"اختار وقت نوم أقرب من المعتاد بعشر أو خمس عشرة دقيقة، وكررها بالتدريج."},
  {category:"العادات", kicker:"استمر ولو قليل", title:"خمس دقايق أحسن من صفر.", text:"خلّي العادة صغيرة لدرجة يصعب تأجيلها. الاستمرار أهم من الحماس المؤقت."},
  {category:"الموبايل", kicker:"استرجع انتباهك", title:"خلّي الموبايل بعيد.", text:"وقت الدراسة، حطه بمكان مو بمتناول إيدك وحدد وقت للاستراحة."},
  {category:"الثقة بالنفس", kicker:"تذكير إلك", title:"لا تقارن بدايتك بغيرك.", text:"قارن نفسك بنفسك. حتى التقدم البسيط يستحق إنك تلاحظه."},
  {category:"الصبر", kicker:"إذا تعثّرت", title:"ارجع من جديد، بدون جلد ذات.", text:"يوم مو مثالي ما يمسح تعبك. اختار الخطوة الجاية وكمّل بهدوء."}
];
let current = 0;
let saved = new Set();
const $ = id => document.getElementById(id);
function render(){
  const tip = tips[current];
  $("category").textContent = tip.category;
  $("kicker").textContent = tip.kicker;
  $("adviceTitle").textContent = tip.title;
  $("adviceText").textContent = tip.text;
  $("counter").textContent = `${String(current+1).padStart(2,"0")} / ${String(tips.length).padStart(2,"0")}`;
  $("cardNum").textContent = String(current+1).padStart(2,"0");
  $("progressFill").style.width = `${((current+1)/tips.length)*100}%`;
  $("dots").innerHTML = "";
  tips.forEach((_,i)=>{
    const b=document.createElement("button");
    b.className="dot-btn"+(i===current?" active":"");
    b.setAttribute("aria-label",`النصيحة ${i+1}`);
    b.addEventListener("click",()=>{current=i;render()});
    $("dots").appendChild(b);
  });
  $("saveBtn").classList.toggle("saved",saved.has(current));
  $("saveBtn").querySelector("span").textContent = saved.has(current) ? "النصيحة محفوظة" : "احفظ النصيحة";
  $("saveBtn").firstChild.textContent = saved.has(current) ? "★ " : "☆ ";
  $("savedNote").textContent = "";
}
$("prevBtn").addEventListener("click",()=>{current=(current-1+tips.length)%tips.length;render()});
$("nextBtn").addEventListener("click",()=>{current=(current+1)%tips.length;render()});
$("saveBtn").addEventListener("click",()=>{saved.has(current)?saved.delete(current):saved.add(current);render();$("savedNote").textContent=saved.has(current)?"انحفظت خلال هالجلسة.":"تم إلغاء الحفظ."});
$("themeBtn").addEventListener("click",()=>{document.body.classList.toggle("light");$("themeBtn").textContent=document.body.classList.contains("light")?"☼":"◐"});
$("taskCheck").addEventListener("change",e=>{$("taskStatus").textContent=e.target.checked?"عاشت إيدك! أنجزت خطوة اليوم.":"بعدك بالبداية — تگدر عليها.";$("taskLabel").style.textDecoration=e.target.checked?"line-through":"none"});
$("year").textContent=new Date().getFullYear();
render();