// DEBUG: Trace app startup
console.log('[DEBUG 1] index.ts - Starting app entry point');
fetch('http://127.0.0.1:7242/ingest/f574fcfe-6ee3-42f5-8653-33237ef6f5dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:1,message:'index.ts entry',timestamp:Date.now()})}).catch(()=>{});

import './polyfills';

console.log('[DEBUG 2] index.ts - Polyfills loaded');
fetch('http://127.0.0.1:7242/ingest/f574fcfe-6ee3-42f5-8653-33237ef6f5dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:2,message:'polyfills loaded',timestamp:Date.now()})}).catch(()=>{});

import 'expo-router/entry';

console.log('[DEBUG 3] index.ts - Expo router entry loaded');
fetch('http://127.0.0.1:7242/ingest/f574fcfe-6ee3-42f5-8653-33237ef6f5dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:3,message:'expo-router loaded',timestamp:Date.now()})}).catch(()=>{});
