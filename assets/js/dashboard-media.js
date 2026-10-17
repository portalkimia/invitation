/* Local crop and compression, followed by an authenticated image upload. */
(() => {
  'use strict';
  const make=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
  const dialog=make('dialog','','rounded-2xl p-5 w-full max-w-xl');
  dialog.style.maxHeight='94dvh';
  const title=make('h2','Upload & atur foto','text-lg font-bold');
  const note=make('p','Gambar yang diunggah akan dapat dilihat publik pada undangan. PNG mempertahankan area transparan.','text-xs text-slate-500 my-2');
  const canvas=document.createElement('canvas');canvas.style.cssText='display:block;width:100%;max-height:46dvh;object-fit:contain;background:repeating-conic-gradient(#ddd 0% 25%,#fff 0% 50%) 50%/16px 16px;border-radius:12px';
  const ratio=make('select','','border rounded p-2 w-full');ratio.setAttribute('aria-label','Bentuk potongan foto');
  for(const [value,label] of [['original','Ukuran asli'],['0.8','Tegak 4:5'],['1','Persegi 1:1'],['1.777778','Mendatar 16:9']]){const o=make('option',label);o.value=value;ratio.append(o);}
  const controls=make('div','','space-y-2 my-3');controls.append(ratio);
  const ranges={};
  for(const [key,label,min,max,value] of [['zoom','Perbesar',1,3,1],['x','Posisi kiri–kanan',0,100,50],['y','Posisi atas–bawah',0,100,50]]){const l=make('label',label,'block text-xs');const i=document.createElement('input');i.type='range';i.min=min;i.max=max;i.step=key==='zoom'?0.01:1;i.value=value;i.className='block w-full';l.append(i);controls.append(l);ranges[key]=i;}
  const status=make('p','','text-sm my-3');status.setAttribute('role','status');
  const cancel=make('button','Batal','border rounded-xl px-4 py-2'),save=make('button','Upload gambar','bg-slate-900 text-white rounded-xl px-4 py-2');cancel.type=save.type='button';
  const row=make('div','','flex gap-2 justify-end');row.append(cancel,save);dialog.append(title,note,canvas,controls,status,row);document.body.append(dialog);
  let image=null,target=null,format='image/jpeg',busy=false;
  function draw(){
    if(!image)return;
    const aspect=ratio.value==='original'?image.naturalWidth/image.naturalHeight:Number(ratio.value);
    let sw=image.naturalWidth,sh=image.naturalHeight;
    if(sw/sh>aspect)sw=sh*aspect;else sh=sw/aspect;
    sw/=Number(ranges.zoom.value);sh/=Number(ranges.zoom.value);
    const scale=Math.min(1,1600/Math.max(sw,sh));canvas.width=Math.max(1,Math.round(sw*scale));canvas.height=Math.max(1,Math.round(sh*scale));
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,(image.naturalWidth-sw)*Number(ranges.x.value)/100,(image.naturalHeight-sh)*Number(ranges.y.value)/100,sw,sh,0,0,canvas.width,canvas.height);
    status.textContent=`Hasil ${canvas.width} × ${canvas.height} px · ${format==='image/png'?'PNG transparan':'JPEG terkompresi'}`;
  }
  ratio.onchange=draw;Object.values(ranges).forEach(i=>i.oninput=draw);
  cancel.onclick=()=>dialog.close();
  dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
  dialog.addEventListener('close',()=>{if(image?.src?.startsWith('blob:'))URL.revokeObjectURL(image.src);image=null;target=null;});
  save.onclick=async()=>{
    if(busy||!image||!target?.isConnected)return;busy=true;save.disabled=cancel.disabled=true;status.textContent='Mengompres dan mengunggah gambar…';
    try{
      let data=canvas.toDataURL(format,.82);
      if(data.length>4000000){const smaller=document.createElement('canvas');const scale=1000/Math.max(canvas.width,canvas.height);smaller.width=Math.max(1,Math.round(canvas.width*scale));smaller.height=Math.max(1,Math.round(canvas.height*scale));smaller.getContext('2d').drawImage(canvas,0,0,smaller.width,smaller.height);data=smaller.toDataURL(format,.78);}
      if(data.length>4000000)throw Error('Gambar masih terlalu besar. Pilih potongan atau gambar yang lebih sederhana.');
      const r=await WeddingApi.postToGas('uploadDesignMedia',{photoBase64:data,requestId:WeddingApi.newId('design')});
      if(!r.success)throw Error(r.error||'Upload gagal.');
      if(target.isConnected){target.value=r.url;target.dispatchEvent(new Event('input',{bubbles:true}));target.dispatchEvent(new Event('change',{bubbles:true}));}
      dialog.close();showToast('Gambar diunggah dan dimasukkan ke draf. Terbitkan untuk menampilkannya.');
    }catch(e){status.textContent=e.message;}finally{busy=false;save.disabled=cancel.disabled=false;}
  };
  function attach(){
    for(const input of document.querySelectorAll('#form-event-settings input')){
      const eligible=(input.type==='url'&&input.id.startsWith('design-')) || input.dataset.gallery==='url' || /^cfg-(cover-photo|bg-image|groom-photo|bride-photo|story\d-img)$/.test(input.id);
      if(!eligible||input.dataset.uploadAttached)continue;input.dataset.uploadAttached='true';
      const b=make('button','Upload / potong foto','mt-2 border rounded-lg px-3 py-2 text-xs');b.type='button';
      const picker=document.createElement('input');picker.type='file';picker.accept='image/jpeg,image/png,image/webp';picker.hidden=true;
      b.onclick=()=>picker.click();
      picker.onchange=async()=>{
        const file=picker.files[0];picker.value='';if(!file)return;
        if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024){showToast('Pilih JPEG, PNG, atau WebP maksimal 20 MB.');return;}
        const objectUrl=URL.createObjectURL(file),img=new Image();
        img.onload=()=>{image=img;target=input;format=file.type==='image/png'?'image/png':'image/jpeg';ratio.value='original';ranges.zoom.value=1;ranges.x.value=ranges.y.value=50;draw();dialog.showModal();};
        img.onerror=()=>{URL.revokeObjectURL(objectUrl);showToast('Gambar tidak dapat dibuka.');};img.src=objectUrl;
      };
      input.after(b,picker);
    }
  }
  attach();new MutationObserver(attach).observe(document.getElementById('form-event-settings'),{childList:true,subtree:true});
})();
