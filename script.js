const tracks = [
  {title:"تلاوة قرآنية هادئة", subtitle:"فيديو YouTube", id:"3xRgDPRvH0o"},
  {title:"بث قرآني مباشر", subtitle:"بث مباشر من YouTube", id:"I6WuVSkrAHM"}
];
let current = 0, playing = false;
const frame = document.getElementById("youtubeFrame");
const title = document.getElementById("trackTitle");
const subtitle = document.getElementById("trackSubtitle");
const status = document.getElementById("status");
const playBtn = document.getElementById("playBtn");
const fill = document.getElementById("progressFill");

function loadTrack(index, autoplay=false){
  current = (index + tracks.length) % tracks.length;
  const t = tracks[current];
  title.textContent = t.title;
  subtitle.textContent = t.subtitle;
  frame.innerHTML = `<iframe title="${t.title}" src="https://www.youtube-nocookie.com/embed/${t.id}?playsinline=1&rel=0${autoplay ? '&autoplay=1' : ''}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  document.querySelectorAll(".track").forEach((el,i)=>el.classList.toggle("active",i===current));
  playing = autoplay;
  playBtn.textContent = playing ? "Ⅱ" : "▶";
  status.textContent = autoplay ? "جرى تحميل التلاوة؛ إذا لم يبدأ الصوت اضغط تشغيل داخل المشغّل" : "اضغط تشغيل داخل مشغّل YouTube لبدء التلاوة";
  fill.style.width = "0%";
}
document.querySelectorAll(".track").forEach(el=>el.addEventListener("click",()=>loadTrack(Number(el.dataset.index),false)));
playBtn.addEventListener("click",()=>{
  // YouTube requires a real player interaction; reloading with autoplay may still be blocked by iOS.
  loadTrack(current,true);
});
document.getElementById("prevBtn").addEventListener("click",()=>loadTrack(current-1,false));
document.getElementById("nextBtn").addEventListener("click",()=>loadTrack(current+1,false));
document.getElementById("volume").addEventListener("input",e=>{
  status.textContent = "لتغيير مستوى الصوت استخدم أزرار الصوت في جهازك أو عناصر مشغّل YouTube";
});
document.getElementById("themeBtn").addEventListener("click",()=>document.body.classList.toggle("light"));
loadTrack(0,false);