(() => {
  'use strict';
  const sim=!!window.WeddingSimulation;
  const make=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
  const btn=(text,fn)=>{const b=make('button',text,'px-3 py-2 border border-slate-500 rounded-lg text-xs');b.type='button';b.onclick=fn;return b;};
  const panel=make('section','','max-w-lg mx-auto px-4 mb-4 text-slate-200');
  const box=make('div','','bg-slate-800 border border-slate-600 rounded-2xl p-4 space-y-3');panel.append(box);document.querySelector('main').before(panel);
  box.append(make('h2',sim?'SIMULASI RESEPSI · data terpisah':'Identitas petugas & mode penerimaan','font-bold text-sm'));
  const nameLabel=make('label','Nama petugas','block text-xs'), name=document.createElement('input');name.maxLength=70;name.placeholder='Contoh: Rina';name.className='block w-full p-2 mt-1 bg-slate-900 border rounded-lg';nameLabel.append(name);
  const stationLabel=make('label','Meja / pintu masuk','block text-xs'), station=document.createElement('input');station.maxLength=60;station.placeholder='Contoh: Meja 1';station.className=name.className;stationLabel.append(station);
  const key=sim?'wedding_sim_operator':'wedding_reception_operator_v1';
  try{const saved=JSON.parse(localStorage.getItem(key)||'{}');name.value=saved.name||'';station.value=saved.station||'';}catch(_){}
  if(sim){name.value=name.value||'Petugas Simulasi';station.value=station.value||'Meja Demo';}
  const fastLabel=make('label','Mode cepat tanpa foto','block text-sm'),fast=document.createElement('input');fast.type='checkbox';fast.checked=localStorage.getItem('wedding_reception_fast')!=='false';fast.className='mr-2';fastLabel.prepend(fast);
  const state=make('p','Isi identitas lalu buka scanner. Nama petugas dicatat bersama kehadiran.','text-xs text-slate-400');state.setAttribute('role','status');
  const walkins=new Set();
  const operator=()=>name.value.trim()&&station.value.trim()?name.value.trim()+' · '+station.value.trim():'';
  const showQuick=()=>{
    stopPhotoCamera();capturedPhotoBase64=null;
    photoVideo.parentElement.hidden=true;captureControls.classList.add('hidden');reviewControls.classList.remove('hidden');btnRetake.hidden=true;btnConfirm.textContent='Konfirmasi kehadiran';
  };
  window.ReceptionOps={operator,walkInCode:code=>walkins.has(code),quick:()=>fast.checked,showQuick};
  const originalStartPhoto=window.startPhotoCamera;
  window.startPhotoCamera=async()=>{photoVideo.parentElement.hidden=false;btnRetake.hidden=false;await originalStartPhoto();};
  const originalScanner=window.startQrScanner;
  window.startQrScanner=async()=>{
    if(!operator()){state.textContent='Isi nama petugas dan meja terlebih dahulu.';return;}
    if(sim&&!WeddingSimulation.cameraEnabled){state.textContent='Pilih tamu simulasi di bawah atau aktifkan scanner untuk mencoba QR.';return;}
    state.textContent='Membuka scanner…';await originalScanner();await refreshLenses();state.textContent='Scanner siap jika gambar kamera sudah terlihat. Jika kosong, periksa izin kamera atau pilih lensa lain.';
  };
  box.append(nameLabel,stationLabel,fastLabel,btn('Simpan identitas & buka scanner',async()=>{
    if(!operator()){state.textContent='Nama petugas dan meja wajib diisi.';return;}
    localStorage.setItem(key,JSON.stringify({name:name.value.trim(),station:station.value.trim()}));
    if(sim)WeddingSimulation.cameraEnabled=true;await startQrScanner();
  }),state);
  fast.onchange=()=>{localStorage.setItem('wedding_reception_fast',String(fast.checked));if(!step2.classList.contains('hidden')){if(fast.checked)showQuick();else startPhotoCamera();}};
  const lensLabel=make('label','Lensa scanner','block text-xs'),lens=make('select','','block w-full bg-slate-900 border p-2 rounded-lg mt-1');lensLabel.append(lens);
  const photoLensLabel=make('label','Lensa foto kedatangan','block text-xs'),photoLens=make('select','',lens.className);photoLensLabel.append(photoLens);box.append(lensLabel,photoLensLabel);
  async function refreshLenses(){
    let devices=[];try{devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');}catch(_){}
    for(const [select,type] of [[lens,'scanner'],[photoLens,'photo']]){
      const saved=localStorage.getItem('wedding_reception_lens_'+type)||'';select.replaceChildren();const auto=make('option','Otomatis (arah depan/belakang)');auto.value='';select.append(auto);
      devices.forEach((d,i)=>{const o=make('option',d.label||'Kamera '+(i+1));o.value=d.deviceId;select.append(o);});
      select.value=devices.some(d=>d.deviceId===saved)?saved:'';
      if(type==='scanner')window.receptionLens=select.value||null;else window.receptionPhotoLens=select.value||null;
    }
  }
  lens.onchange=async()=>{window.receptionLens=lens.value||null;localStorage.setItem('wedding_reception_lens_scanner',lens.value);await stopQrScanner();await startQrScanner();};
  photoLens.onchange=async()=>{window.receptionPhotoLens=photoLens.value||null;localStorage.setItem('wedding_reception_lens_photo',photoLens.value);if(!step2.classList.contains('hidden')&&!fast.checked)await startPhotoCamera();};
  document.getElementById('btn-toggle-scanner-cam').addEventListener('click',()=>{window.receptionLens=null;lens.value='';localStorage.removeItem('wedding_reception_lens_scanner');});
  document.getElementById('btn-toggle-photo-cam').addEventListener('click',()=>{window.receptionPhotoLens=null;photoLens.value='';localStorage.removeItem('wedding_reception_lens_photo');});
  const identified=window.handleGuestIdentified;
  window.handleGuestIdentified=async raw=>{
    let code=String(raw||'').trim();
    if(code.startsWith('W1:')){const match=code.match(/^W1:([A-Z0-9_-]{1,40}):([A-Za-z0-9_-]{30,100})$/);if(!match){alert('QR undangan tidak valid.');return;}code=match[1];WeddingApi.rememberGuestToken(code,match[2]);}
    if(/^https?:\/\//.test(code)){try{const url=new URL(code);if(url.origin!==location.origin)throw Error();code=url.searchParams.get('code')||'';}catch(_){alert('Gunakan QR undangan dari situs ini.');return;}}
    return identified(code);
  };
  const walkDialog=make('dialog','','rounded-2xl p-5 w-full max-w-sm text-slate-900');
  const wf=make('form','','space-y-3');wf.append(make('h2','Tambah tamu walk-in','font-bold'),make('p','Gunakan untuk tamu tambahan yang memang belum terdaftar.','text-sm'));
  const wn=document.createElement('input');wn.placeholder='Nama lengkap';wn.setAttribute('aria-label','Nama tamu walk-in');wn.required=true;wn.maxLength=200;wn.className='border rounded-xl p-3 w-full';wf.append(wn);
  wf.append(btn('Batal',()=>walkDialog.close()));const go=make('button','Lanjutkan','bg-slate-900 text-white rounded-xl p-3');go.type='submit';wf.append(go);walkDialog.append(wf);document.body.append(walkDialog);
  box.append(btn('Tambah tamu walk-in',()=>{if(!operator()){state.textContent='Isi identitas petugas terlebih dahulu.';return;}wn.value='';walkDialog.showModal();}));
  wf.onsubmit=async e=>{e.preventDefault();const code=(sim?'SIMW_':'W_')+crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase();walkins.add(code);walkDialog.close();await handleGuestIdentified(code);if(currentGuest?.code===code)document.getElementById('checkin-guest-name').value=wn.value.trim();};
  const priorSuccess=window.showStep3Success;
  window.showStep3Success=()=>{
    priorSuccess();const duplicate=ReceptionState.currentStatus==='duplicate';step3.classList.toggle('ring-4',duplicate);step3.classList.toggle('ring-amber-400',duplicate);
    if(duplicate)document.getElementById('success-guest-greeting').textContent+= ' · Catatan pertama tetap dipertahankan';
    if(sim){const qr=document.getElementById('pocket-qrcode');qr.replaceChildren();if(typeof QRCode!=='undefined')new QRCode(qr,{text:new URL('pocket-cam.html?demo=true',location.href).href,width:170,height:170});}
  };
  if(sim){
    document.title='Simulasi Resepsi';const banner=make('p','SIMULASI — semua pencatatan hanya di browser ini. Foto tidak dikirim ke Drive.','bg-amber-400 text-slate-950 p-3 text-sm font-bold');document.body.prepend(banner);
    const samples=make('div','','flex flex-wrap gap-2');for(const code of ['SIM001','SIM002','SIM003'])samples.append(btn('Coba '+code,()=>handleGuestIdentified(code)));box.append(samples,btn('Reset data simulasi',async()=>{
      if(!confirm('Reset seluruh pencatatan simulasi di perangkat ini?'))return;for(const item of await WeddingStore.all())await WeddingStore.remove(item.id);location.reload();
    }));
    initializeReceptionQueue();
  }
  refreshLenses();
})();
