// Run deliberately to refresh the exhibition road geometry snapshots.
// OSRM routing engine; road data © OpenStreetMap contributors, ODbL.
import { writeFile } from 'node:fs/promises';
const stops = [
 { id:'banani', name:'Banani · Road 11', detail:'Banani, Dhaka', coordinate:[90.4060,23.7935] },
 { id:'gulshan', name:'Gulshan 2 Circle', detail:'Gulshan Avenue, Dhaka', coordinate:[90.4147,23.7940] },
 { id:'hospital', name:'Evercare Hospital', detail:'Bashundhara R/A, Dhaka', coordinate:[90.4311,23.8104] },
 { id:'dhanmondi', name:'Dhanmondi 27', detail:'Mirpur Road, Dhaka', coordinate:[90.3754,23.7565] },
 { id:'airport', name:'Airport · Terminal 2', detail:'Airport Road, Dhaka', coordinate:[90.4087,23.8513] },
];
const routes={};
for(const from of stops) for(const to of stops) {
 if(from.id===to.id) continue;
 const url=`https://router.project-osrm.org/route/v1/driving/${from.coordinate.join(',')};${to.coordinate.join(',')}?overview=full&geometries=geojson`;
 const response=await fetch(url, {signal:AbortSignal.timeout(20000), headers:{'User-Agent':'CareNow-exhibition-demo/1.1 (github.com/Seyamalam/CareNow)'}});
 const data=await response.json();
 if(data.code!=='Ok' || !data.routes[0]) throw new Error(JSON.stringify(data));
 const r=data.routes[0];
 routes[`${from.id}:${to.id}`]={distance:r.distance,duration:r.duration,coordinates:r.geometry.coordinates};
 console.log(from.id,to.id,Math.round(r.distance));
 await new Promise(r=>setTimeout(r,1100));
}
await writeFile('shared/transport/routes.json',JSON.stringify(routes));
await writeFile('shared/transport/stops.json',JSON.stringify(stops,null,2)+'\n');
