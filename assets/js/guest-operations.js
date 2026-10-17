(() => {
  'use strict';
  const preview=new URLSearchParams(location.search).has('design-preview');
  const sections={quote:['quote-scene'],story:['love-story-section'],gallery:['gallery-section'],rsvp:['rsvp-section'],gift:['gift-section'],album:['shared-album-section'],camera:['pocket-cam-section']};
  const wishes=document.getElementById('wishes-container')?.closest('section');
  function applySections(cfg){
    const values=InvitationDesign.normalize(cfg.design).sections;
    for(const [key,ids] of Object.entries(sections))for(const id of ids){const n=document.getElementById(id);if(n){if(values[key]===false)n.style.setProperty('display','none','important');else n.style.removeProperty('display');}}
    if(wishes){if(values.rsvp===false)wishes.style.setProperty('display','none','important');else wishes.style.removeProperty('display');}
  }
  const render=window.renderInvitationData;
  window.renderInvitationData=cfg=>{render(cfg);applySections(cfg);};applySections(currentConfig);
  const quick=document.createElement('a');quick.href='#guest-ticket';quick.textContent='QR saya';quick.setAttribute('aria-label','Tampilkan QR check-in saya');
  quick.style.cssText='position:fixed;right:76px;bottom:24px;z-index:40;padding:12px 18px;border-radius:999px;background:var(--accent,#92734e);color:white;box-shadow:0 3px 16px #0002;font-size:13px';
  quick.hidden=!guestCodeParam||preview||!isInvitationOpened;document.body.append(quick);
  const open=window.openInvitation;window.openInvitation=()=>{open();quick.hidden=!guestCodeParam||preview;};
  const ticket=document.getElementById('guest-ticket');
  const save=document.createElement('button');save.type='button';save.textContent='Simpan kartu undangan';save.className='mt-3 rounded-xl border border-gold-300 py-3 px-4 text-sm';save.hidden=!guestCodeParam||preview;
  const status=document.createElement('p');status.className='text-xs text-stone-500 mt-2';status.setAttribute('role','status');ticket.append(save,status);
  function lines(ctx,text,x,y,width,lineHeight,maxLines=4){
    const words=String(text||'').split(/\s+/);let line='',count=0;
    for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){ctx.fillText(line,x,y);y+=lineHeight;count++;if(count>=maxLines-1){line=next.slice(line.length).trim();break;}line=word;}else line=next;}
    if(line){while(ctx.measureText(line).width>width&&line.length>1)line=line.slice(0,-2);ctx.fillText(line,x,y);y+=lineHeight;}return y;
  }
  save.onclick=async()=>{
    const qr=document.querySelector('#qrcode canvas')||document.querySelector('#qrcode img');
    if(!qr){status.textContent='QR belum siap. Muat ulang atau tunjukkan kode tamu kepada petugas.';return;}
    save.disabled=true;
    try{
      if(qr.tagName==='IMG'&&!qr.complete)await qr.decode();
      const c=document.createElement('canvas');c.width=720;c.height=1120;const ctx=c.getContext('2d');const d=InvitationDesign.normalize(currentConfig.design);
      ctx.fillStyle=d.colors.paper;ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle=d.colors.accent;ctx.lineWidth=3;ctx.strokeRect(24,24,672,1072);
      ctx.textAlign='center';ctx.fillStyle=d.colors.ink;ctx.font='18px sans-serif';ctx.fillText('WEDDING INVITATION',360,80);
      ctx.font='36px Georgia';let y=lines(ctx,document.getElementById('hero-couple-title').textContent,360,140,620,44,2);
      ctx.font='18px sans-serif';ctx.fillText('Kepada Yth.',360,y+22);ctx.font='bold 28px sans-serif';y=lines(ctx,guestNameParam,360,y+64,620,36,2);
      ctx.fillStyle='#fff';ctx.fillRect(160,320,400,400);ctx.imageSmoothingEnabled=false;ctx.drawImage(qr,180,340,360,360);
      ctx.fillStyle=d.colors.ink;ctx.font='bold 24px monospace';ctx.fillText(guestCodeParam,360,760);
      ctx.font='20px sans-serif';y=lines(ctx,currentConfig.event?.dateFormatted,360,812,600,28,2);
      const e=WeddingApi.calendarEvent(currentConfig);y=lines(ctx,e?.location||'',360,y+18,600,28,3);
      ctx.font='17px sans-serif';ctx.fillText('Tunjukkan QR ini kepada petugas saat tiba.',360,1020);ctx.fillText('Kartu ini khusus untuk undangan Anda.',360,1052);
      WeddingApi.download(c.toDataURL('image/png'),'Kartu-undangan-'+guestCodeParam+'.png','image/png');status.textContent='Kartu berhasil dibuat. Simpan di HP untuk ditunjukkan saat tiba.';
    }catch(_){status.textContent='Kartu belum bisa dibuat. Gunakan tombol Simpan QR atau tunjukkan kode tamu.';}finally{save.disabled=false;}
  };
})();
