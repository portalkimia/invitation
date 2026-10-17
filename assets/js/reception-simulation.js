/* This flag is a local simulation, never an authentication bypass to the server. */
(() => {
  if (new URLSearchParams(location.search).get('simulation') !== 'true') return;
  window.WeddingSimulation = { cameraEnabled:false };
  const source=[{code:'SIM001',name:'Tamu Simulasi A',category:'Reguler',rsvpStatus:'Hadir',pax:2},{code:'SIM002',name:'Tamu Simulasi VIP',category:'VIP',rsvpStatus:'Hadir',pax:3},{code:'SIM003',name:'Tamu Simulasi B',category:'Keluarga',rsvpStatus:'Masih Ragu',pax:1}];
  const store=WeddingStore, prefix='reception_sim_v1:';
  window.WeddingStore={
    get:async id=>{const r=await store.get(prefix+id);return r?{...r,id}:r;},
    put:r=>store.put({...r,id:prefix+r.id}),
    remove:id=>store.remove(prefix+id),
    all:async()=> (await store.all()).filter(r=>r.id.startsWith(prefix)).map(r=>({...r,id:r.id.slice(prefix.length)}))
  };
  let guestList=null;
  async function guests(){if(!guestList){guestList=(await WeddingStore.get('simulation_guests'))?.guests||source.map(g=>({...g,attendedAt:'',actualPax:'',pocketPhotoCount:0}));}return guestList;}
  WeddingApi.getStoredPin=()=> 'simulation-only';
  WeddingApi.saveStoredPin=()=>{};WeddingApi.clearStoredPin=()=>{};
  WeddingApi.verifyPin=async()=>({success:true,valid:true,simulation:true});
  WeddingApi.postToGas=async(action,p={})=>{
    if(action==='getSettings')return {success:true,settings:WeddingApi.getCachedSettings()||{}};
    if(action==='ping')return {success:true,version:3,simulation:true};
    if(['verifyPin','verifySession'].includes(action))return {success:true,valid:true,simulation:true};
    const list=await guests();
    if(action==='listGuests')return {success:true,guests:list.map(g=>({...g}))};
    if(action==='getGuest'){const g=list.find(g=>g.code===p.code);return g?{success:true,guest:{...g}}:{success:false,notFound:true};}
    if(action==='checkIn'){
      let g=list.find(g=>g.code===p.code);
      if(!g&&!p.walkIn)return {success:false,error:'Tamu simulasi tidak ditemukan.'};
      if(g?.attendedAt)return {success:true,alreadyCheckedIn:true,sameRequest:g.checkInRequestId===p.requestId,guest:{...g}};
      if(!g){g={code:p.code,name:p.name,category:'Reguler',pocketPhotoCount:0};list.push(g);}
      Object.assign(g,{attendedAt:new Date().toISOString(),actualPax:p.actualPax,checkInRequestId:p.requestId,checkedInBy:p.operator});
      await WeddingStore.put({id:'simulation_guests',guests:list});return {success:true,guest:{...g}};
    }
    if(action==='uploadCheckInPhoto')return {success:true,photoUrl:'',simulation:true};
    return {success:false,permanent:true,error:'Aksi ini tidak tersedia pada simulasi. Tidak ada data produksi yang dikirim.'};
  };
  WeddingApi.getFromGas=(a,p)=>WeddingApi.postToGas(a,p);
})();
