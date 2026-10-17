(() => {
  'use strict';
  const make=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
  const details=document.getElementById('camera-settings');
  const l=make('label','Bentuk foto','block text-xs mt-2 text-stone-300'),ratio=make('select','','block w-full bg-stone-900 border border-stone-600 rounded-lg p-2 mt-1');ratio.id='camera-photo-shape';
  for(const [value,label] of [['screen','Mengikuti layar'],['portrait','Tegak 4:5'],['square','Persegi 1:1']]){const o=make('option',label);o.value=value;ratio.append(o);}
  ratio.value=localStorage.getItem('wedding_camera_shape')||'screen';l.append(ratio);details.append(l);
  const frame=document.getElementById('camera-frame');
  function applyShape(){
    const mode=ratio.value;
    // The video itself defines the crop used by the existing capture controller.
    camVideo.style.width=mode==='screen'?'100%':'min(100%, '+(mode==='square'?'100cqh':'80cqh')+')';
    frame.style.containerType='size';
    if(mode==='screen'){camVideo.style.inset='0';camVideo.style.height='100%';camVideo.style.aspectRatio='auto';camVideo.style.margin='0';}
    else {camVideo.style.width='100%';camVideo.style.height=mode==='square'?'min(100%, 100cqw)':'min(100%, 125cqw)';camVideo.style.aspectRatio=mode==='square'?'1':'4 / 5';camVideo.style.maxWidth=mode==='square'?'100cqh':'80cqh';camVideo.style.inset='0';camVideo.style.margin='auto';}
  }
  ratio.onchange=()=>{localStorage.setItem('wedding_camera_shape',ratio.value);applyShape();};applyShape();
  const state=make('p','','text-xs text-stone-300 text-center my-1');state.id='camera-storage-summary';state.setAttribute('role','status');document.getElementById('camera-shell').append(state);
  const quotaLabel=make('p','Kuota berlaku per undangan, termasuk jika dibuka di beberapa HP.','text-[10px] text-stone-400 mt-2');details.append(quotaLabel);
  window.cameraWindowOpen=()=>{
    if(isCameraDemo)return true;
    const now=Date.now();
    if(cameraWindow.start&&now<Date.parse(cameraWindow.start)){uploadStatusText.textContent='Kamera tersedia mulai '+new Date(cameraWindow.start).toLocaleString('id-ID');return false;}
    if(cameraWindow.end&&now>Date.parse(cameraWindow.end)){uploadStatusText.textContent='Waktu kamera telah berakhir. Foto di HP tetap dapat diunduh.';return false;}return true;
  };
  function update(){
    const local=localReelPhotos.length,waiting=uploadQueue.filter(p=>!p.failed).length,failed=uploadQueue.filter(p=>p.failed).length,uploaded=localReelPhotos.filter(p=>p.uploaded).length;
    const remaining=Math.max(0,MAX_SHOTS-pocketPhotoCount);
    state.textContent=`Di HP: ${local} · Menunggu unggah: ${waiting} · Sudah diunggah: ${uploaded}${failed?' · Perlu tindakan: '+failed:''}${remaining>0&&remaining<=3?' · Sisa '+remaining+' foto':''}`;
    state.style.color=remaining>0&&remaining<=3?'#fbbf24':'';
    const maxLabel=document.querySelector('#camera-plate');if(maxLabel){for(const text of maxLabel.querySelectorAll('span,p'))if(/^Maks \d+$/.test(text.textContent.trim()))text.textContent='Maks '+MAX_SHOTS;}
    const subtitle=document.getElementById('modal-shots-taken')?.parentElement;
    if(subtitle)for(const n of subtitle.childNodes)if(n.nodeType===Node.TEXT_NODE&&/dari \d+ foto/.test(n.textContent))n.textContent=' dari '+MAX_SHOTS+' foto terabadikan';
    if(!isCameraDemo&&!cameraWindowOpen())btnShutter.disabled=true;
  }
  const counter=window.updateFilmCounter;window.updateFilmCounter=()=>{counter();update();};
  const persist=window.persistCameraState;window.persistCameraState=async()=>{await persist();update();};
  update();setInterval(()=>{if(!document.hidden)update();},1500);
})();
