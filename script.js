const tracks=[
 {title:"تلاوة قرآنية",id:"3xRgDPRvH0o"},
 {title:"تلاوة مباشرة",id:"I6WuVSkrAHM"}
];
let selected=0, player=null, ready=false, playing=false;
const titleEl=document.getElementById("trackTitle"), statusEl=document.getElementById("status"), playBtn=document.getElementById("play");
function setTrack(i){selected=(i+tracks.length)%tracks.length;titleEl.textContent=tracks[selected].title;document.querySelectorAll("[data-track]").forEach(b=>b.classList.toggle("active",Number(b.dataset.track)===selected));statusEl.textContent="جاهز للتشغيل";playing=false;playBtn.textContent="▶";if(ready&&player){player.loadVideoById(tracks[selected].id);}else{document.getElementById("yt").src="https://www.youtube.com/embed/"+tracks[selected].id+"?enablejsapi=1&playsinline=1&rel=0";}}
document.querySelectorAll("[data-track]").forEach(b=>b.addEventListener("click",()=>setTrack(Number(b.dataset.track))));
document.getElementById("prev").addEventListener("click",()=>setTrack(selected-1));
document.getElementById("next").addEventListener("click",()=>setTrack(selected+1));
playBtn.addEventListener("click",()=>{if(ready&&player){if(playing){player.pauseVideo();playing=false;playBtn.textContent="▶";statusEl.textContent="متوقف";}else{player.playVideo();playing=true;playBtn.textContent="Ⅱ";statusEl.textContent="قيد التشغيل";}}else{statusEl.textContent="اضغط تشغيل داخل مشغل يوتيوب بالأسفل";document.getElementById("youtubeWrap").scrollIntoView({behavior:"smooth",block:"center"});}});
document.getElementById("volume").addEventListener("input",e=>{const v=Number(e.target.value);e.target.style.background=`linear-gradient(to right,#d2d1d6 ${v}%,#77757a ${v}%)`;if(ready&&player)player.setVolume(v);});
document.getElementById("seek").addEventListener("input",e=>{if(ready&&player){const d=player.getDuration();if(d)player.seekTo(d*Number(e.target.value)/100,true);}});
function onYouTubeIframeAPIReady(){player=new YT.Player("yt",{events:{onReady:()=>{ready=true;player.setVolume(70);},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){playing=true;playBtn.textContent="Ⅱ";statusEl.textContent="قيد التشغيل";}else if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.ENDED){playing=false;playBtn.textContent="▶";statusEl.textContent="متوقف";}}},playerVars:{playsinline:1,rel:0}});setInterval(()=>{if(ready&&player&&player.getDuration){const d=player.getDuration(),t=player.getCurrentTime();if(d>0){document.getElementById("seek").value=t/d*100;document.getElementById("current").textContent=fmt(t);document.getElementById("duration").textContent=fmt(d);}}},1000);}
function fmt(n){n=Math.floor(n||0);return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");}
