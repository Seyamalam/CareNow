import assert from 'node:assert/strict';
const base=process.env.API_URL||'https://carenow-api.seyamalam41.workers.dev';
async function req(path,token,body,method=body?'POST':'GET'){const r=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()};}
const a=await req('/session',null,{}),b=await req('/session',null,{});assert.equal(a.status,201);assert.equal(b.status,201);const ta=a.body.token,tb=b.body.token;
try{
 assert.equal((await req('/state')).status,401);
 const day=new Date(Date.now()+3*86400000).toISOString().slice(0,10);
 const booking={type:'appointment.book',memberId:'self',doctorId:'dr-nadia',date:day,time:'09:00 AM',mode:'Video',note:'Integration smoke test'};
 const booked=await req('/actions',ta,booking);assert.equal(booked.status,200);assert.equal(booked.body.appointments[0].fee,600);const appointment=booked.body.appointments[0].id;
 assert.equal((await req('/actions',ta,booking)).status,400);
 assert.equal((await req('/actions',tb,{type:'appointment.status',id:appointment,status:'Cancelled'})).status,400);
 assert.equal((await req('/state',tb)).body.appointments.length,1);
 const sent=await req('/actions',ta,{type:'message.send',appointmentId:appointment,text:'Demo message'});assert.equal(sent.body.messages.length,2);
 const bad=await req('/actions',ta,{type:'request.create',memberId:'self',serviceId:'nanny',city:'Dhaka',address:'Road 12',phone:'123',contactName:'Test',email:'',shift:8,days:7,startDate:day});assert.equal(bad.status,400);
 const care=await req('/actions',ta,{type:'request.create',memberId:'mother',serviceId:'elderly-caregiver',city:'Dhaka',address:'House 12, Road 7',phone:'01700000000',contactName:'Test Visitor',email:'',shift:12,days:7,startDate:day});assert.equal(care.body.requests[0].price,12600);
 const id=care.body.requests[0].id;assert.equal((await req('/actions',ta,{type:'request.status',id,status:'Assigned'})).status,200);
 const persisted=await req('/state',ta);assert.equal(persisted.body.requests[0].status,'Assigned');assert.equal(persisted.body.messages[0].text,'Demo message');
 assert.equal((await req('/actions',ta,{type:'appointment.status',id:appointment,status:'Completed'})).body.records[0].type,'Consultation');
 console.log('PASS: remote D1 health, sessions, auth, bookings, duplicate slots, ownership, messages, input validation, care pricing, transitions and persistence');
}finally{await req('/session/current',ta,null,'DELETE');await req('/session/current',tb,null,'DELETE');}
