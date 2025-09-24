// Minimal Web Audio analyser exposing window.getAudioLevel()
(() => {
  let ctx, analyser, data, stream;
  let ema = 0;

  const $ = s => document.querySelector(s);
  const bar = () => document.getElementById('bar');

  async function enumerate() {
    try { await navigator.mediaDevices.getUserMedia({audio:true}); } catch(_) {}
    const devs = await navigator.mediaDevices.enumerateDevices();
    const mics = devs.filter(d => d.kind === 'audioinput');
    const sel = $('#mic'); sel.innerHTML='';
    mics.forEach((d,i)=>{
      const o=document.createElement('option');
      o.value=d.deviceId; o.textContent=d.label || `Microphone ${i+1}`;
      sel.appendChild(o);
    });
  }

  async function start() {
    try{
      $('#status').textContent = 'starting...';
      if(!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)();
      if(ctx.state!=='running') await ctx.resume();
      stop();
      const deviceId = $('#mic').value;
      const constraints = { audio: { deviceId: deviceId?{exact:deviceId}:undefined, echoCancellation:false, noiseSuppression:false, autoGainControl:false } };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      const src = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.6;
      src.connect(analyser);
      data = new Uint8Array(analyser.fftSize);
      tick();
      $('#status').textContent = 'mic running';
    }catch(e){
      $('#status').textContent = 'mic error';
      alert('Mic error: '+e.message);
    }
  }

  function stop(){
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
    analyser = null;
  }

  function rms(){
    if(!analyser) return 0;
    analyser.getByteTimeDomainData(data);
    let sum=0;
    for(let i=0;i<data.length;i++){ const v=(data[i]-128)/128; sum+=v*v; }
    const r = Math.sqrt(sum/data.length); // 0..~0.5
    return Math.min(0.5, r);
  }

  function tick(){
    const v = rms();
    // EMA for smoothness
    const a = 0.25;
    ema = ema*(1-a) + v*a;
    if(bar()) bar().style.width = Math.min(100, Math.round(ema*300)) + '%';
    requestAnimationFrame(tick);
  }

  // public getter for p5 sketch
  window.getAudioLevel = () => ema; // returns 0..~0.5

  // wire UI
  window.addEventListener('load', () => {
    enumerate();
    document.getElementById('start').onclick = start;
    document.getElementById('stop').onclick = () => { stop(); document.getElementById('status').textContent='stopped'; };
    navigator.mediaDevices?.addEventListener?.('devicechange', enumerate);
  });
})();