(() => {
  const $ = id => document.getElementById(id);
  const fileInput = $('videoFile'), video = $('sourceVideo'), canvas = $('previewCanvas');
  const ctx = canvas.getContext('2d');
  const empty = $('emptyPreview'), status = $('status'), exportBtn = $('startExport');
  const textInput = $('ayahText');
  let objectUrl = null, raf = 0, previewing = false, exportUrl = null;
  let videoReady = false;

  function say(message){ status.textContent = message; }
  function getText(){ return textInput.value.trim(); }
  function fitCanvas(){
    const vw = video.videoWidth || 720, vh = video.videoHeight || 1280;
    const max = 1080, scale = Math.min(1, max / Math.max(vw,vh));
    canvas.width = Math.max(2, Math.round(vw*scale));
    canvas.height = Math.max(2, Math.round(vh*scale));
  }
  function splitLines(text, maxWidth, font){
    ctx.font = font;
    const words = text.split(/\s+/);
    const lines=[]; let line='';
    for(const word of words){
      const test=line ? line+' '+word : word;
      if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=word;}
      else line=test;
    }
    if(line) lines.push(line);
    return lines;
  }
  function drawFrame(time=0, reveal=true){
    if(!videoReady || !canvas.width || !canvas.height) return;
    const w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);
    try{ctx.drawImage(video,0,0,w,h);}catch(e){return;}
    const text=getText();
    if(!text) return;
    const base=Number($('fontSize').value);
    const scale=w/720;
    const fontSize=Math.max(16,base*scale);
    const font=`700 ${fontSize}px "Amiri", "Geeza Pro", serif`;
    const maxWidth=w*.84;
    const chars=Array.from(text);
    const duration=Number($('duration').value);
    const progress=reveal ? Math.min(1,Math.max(0,(time-(video.currentTime||0))*0 + ((window.__revealStart===undefined)?1:(performance.now()-window.__revealStart)/(duration*1000)))) : 1;
    const shownCount=Math.max(0,Math.ceil(chars.length*progress));
    const shown=chars.slice(0,shownCount).join('');
    const lines=splitLines(shown || ' ',maxWidth,font);
    const lineH=fontSize*1.65;
    const blockH=lines.length*lineH;
    const pos=$('position').value;
    let centerY=pos==='top'?h*.18:pos==='center'?h*.5:h*.79;
    let y=centerY-blockH/2+lineH/2;
    const padX=w*.055,padY=fontSize*.55;
    const maxLine=Math.max(...lines.map(l=>ctx.measureText(l).width),fontSize*2);
    if($('backplate').checked){
      const bw=Math.min(w*.94,maxLine+padX*2),bh=blockH+padY*2;
      const bx=(w-bw)/2,by=centerY-bh/2;
      ctx.fillStyle='rgba(3,10,7,.62)';
      roundRect(ctx,bx,by,bw,bh,Math.max(8,12*scale));ctx.fill();
      ctx.strokeStyle='rgba(228,193,111,.72)';ctx.lineWidth=Math.max(1,1.4*scale);
      ctx.stroke();
    }
    ctx.direction='rtl';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font=font;ctx.fillStyle=$('textColor').value;ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=5*scale;
    for(const line of lines){
      ctx.lineWidth=Math.max(2,3*scale);ctx.strokeStyle='rgba(0,0,0,.65)';ctx.strokeText(line,w/2,y,maxWidth);
      ctx.fillText(line,w/2,y,maxWidth);y+=lineH;
    }
    ctx.shadowBlur=0;
  }
  function roundRect(c,x,y,w,h,r){
    c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
  }
  function loop(){
    if(!previewing)return;
    drawFrame(performance.now(),false);
    raf=requestAnimationFrame(loop);
  }
  async function startPreview(){
    if(!videoReady){say('اختر فيديو أولاً.');return;}
    try{
      video.pause(); video.currentTime=0;
      await video.play();
      previewing=true;$('playPreview').disabled=true;$('pausePreview').disabled=false;
      const tick=()=>{if(!previewing)return;drawFrame(performance.now(),false);if(!video.paused&&!video.ended)raf=requestAnimationFrame(tick);else stopPreview();};
      raf=requestAnimationFrame(tick);
      say('المعاينة تعمل. حركة ظهور النص تبدأ من بداية الفيديو.');
    }catch(e){say('اضغط تشغيل من مشغل الفيديو ثم جرّب المعاينة مرة أخرى.');}
  }
  function stopPreview(){
    previewing=false;cancelAnimationFrame(raf);video.pause();
    $('playPreview').disabled=!videoReady;$('pausePreview').disabled=true;
    if(videoReady)drawFrame(performance.now(),false);
  }
  fileInput.addEventListener('change',()=>{
    const f=fileInput.files && fileInput.files[0]; if(!f)return;
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    objectUrl=URL.createObjectURL(f);video.src=objectUrl;video.load();
    video.onloadedmetadata=()=>{
      videoReady=true;fitCanvas();empty.style.display='none';canvas.style.display='block';
      exportBtn.disabled=false;$('playPreview').disabled=false;$('pausePreview').disabled=true;
      drawFrame(0,false);say(`تم تحميل الفيديو (${Math.round(video.duration)} ثانية). اكتب الآية ثم اضغط إنشاء الفيديو.`);
    };
    video.onerror=()=>say('تعذّر فتح هذا الفيديو. جرّب ملف MP4 مسجلاً من الآيفون.');
  });
  ['ayahText','position','duration','fontSize','textColor','backplate'].forEach(id=>{
    $(id).addEventListener('input',()=>{if(videoReady)drawFrame(0,false);});
    $(id).addEventListener('change',()=>{if(videoReady)drawFrame(0,false);});
  });
  $('playPreview').addEventListener('click',startPreview);
  $('pausePreview').addEventListener('click',stopPreview);

  function pickMime(){
    if(!window.MediaRecorder) return '';
    const types=['video/mp4;codecs=h264,aac','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
    return types.find(t=>MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
  }
  exportBtn.addEventListener('click',async()=>{
    if(!videoReady)return;
    if(!getText()){say('اكتب الآية أولاً.');return;}
    if(!canvas.captureStream || !window.MediaRecorder){
      say('متصفحك لا يدعم تصدير الفيديو من هذه الصفحة. افتحها في أحدث Safari أو جرّب Chrome على جهاز يدعم MediaRecorder.');
      return;
    }
    stopPreview();
    const mime=pickMime();
    if(!mime){say('هذا المتصفح لا يوفّر صيغة تسجيل مدعومة. جرّب أحدث إصدار من Safari.');return;}
    exportBtn.disabled=true;$('resultBox').hidden=true;
    say('جارٍ إنشاء الفيديو… اترك الصفحة مفتوحة ولا تقفل الشاشة.');
    const oldTime=video.currentTime;
    const duration=Math.min(video.duration,Math.max(Number($('duration').value)+2,video.duration));
    const stream=canvas.captureStream(30);
    let audioContext=null;
    try{
      // Route the video's sound into a Web Audio stream when supported.
      const AC=window.AudioContext||window.webkitAudioContext;
      if(AC){
        audioContext=new AC();
        const source=audioContext.createMediaElementSource(video);
        const destination=audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioContext.destination);
        destination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
        await audioContext.resume();
      }
    }catch(e){/* export can continue silently if Safari blocks audio capture */}
    const chunks=[];
    let recorder;
    try{recorder=new MediaRecorder(stream,{mimeType:mime});}
    catch(e){try{recorder=new MediaRecorder(stream);}catch(err){say('تعذّر بدء التسجيل في هذا المتصفح. جرّب أحدث Safari.');exportBtn.disabled=false;return;}}
    recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
    recorder.onerror=()=>say('حدث خطأ أثناء التصدير. جرّب فيديو أقصر أو دقة أقل.');
    recorder.onstop=()=>{
      const blob=new Blob(chunks,{type:recorder.mimeType||mime});
      if(exportUrl)URL.revokeObjectURL(exportUrl);
      exportUrl=URL.createObjectURL(blob);
      const ext=(recorder.mimeType||mime).includes('mp4')?'mp4':'webm';
      $('downloadLink').href=exportUrl;$('downloadLink').download='ayah-video.'+ext;
      $('downloadLink').textContent='حفظ الفيديو ('+ext.toUpperCase()+')';
      $('formatNote').textContent=ext==='webm'?'تم التصدير بصيغة WebM؛ إذا لم تعمل في تطبيقك، حوّلها إلى MP4 باستخدام أداة موثوقة.':'تم التصدير بصيغة MP4.';
      $('resultBox').hidden=false;exportBtn.disabled=false;
      video.pause();video.currentTime=Math.min(oldTime,video.duration||0);stream.getTracks().forEach(t=>t.stop());
      if(audioContext)audioContext.close().catch(()=>{});
      drawFrame(0,false);say('انتهى إنشاء الفيديو. اضغط «حفظ الفيديو» ثم اختر حفظ في «الملفات».');
    };
    // Start from the beginning so the text reveal is synchronized.
    try{
      video.currentTime=0;await new Promise(resolve=>{if(video.readyState>=2)resolve();else video.addEventListener('seeked',resolve,{once:true});});
      window.__revealStart=performance.now();
      recorder.start(250);
      await video.play();
      const render=()=>{drawFrame(performance.now(),true);if(!video.paused&&!video.ended)requestAnimationFrame(render);};
      render();
      video.onended=()=>{if(recorder.state!=='inactive')recorder.stop();};
      // Avoid a stuck recorder if iOS does not fire ended promptly.
      setTimeout(()=>{if(recorder.state!=='inactive')recorder.stop();},Math.ceil(video.duration*1000)+1500);
    }catch(e){
      say('تعذّر تشغيل الفيديو أثناء التصدير. اضغط تشغيل مرة واحدة ثم حاول مجدداً.');
      exportBtn.disabled=false;stream.getTracks().forEach(t=>t.stop());if(audioContext)audioContext.close().catch(()=>{});
    }
  });
})();