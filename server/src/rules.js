export const bookingTransitions={pending:['accepted','rejected','cancelled'],accepted:['in_progress','cancelled'],in_progress:['completed'],rejected:[],completed:[],cancelled:[]};
export function canTransition(current,next,role,owner){if(!owner)return false;if(role==='admin')return false;if(role==='provider')return ({pending:['accepted','rejected'],accepted:['in_progress'],in_progress:['completed']})[current]?.includes(next)??false;if(role==='customer')return ['pending','accepted'].includes(current)&&next==='cancelled';return false}
export function bookingDateIsValid(type,scheduledAt,now=new Date()){if(type==='instant')return true;const date=new Date(scheduledAt);return Number.isFinite(date.getTime())&&date>now}
export function isOverlapping(startA,endA,startB,endB){return new Date(startA)<new Date(endB)&&new Date(endA)>new Date(startB)}
const weekdayKeys={Mon:'mon',Tue:'tue',Wed:'wed',Thu:'thu',Fri:'fri',Sat:'sat',Sun:'sun'};
const weekdayByIndex=['sun','mon','tue','wed','thu','fri','sat'];
export function zonedParts(value,timeZone='Asia/Kolkata'){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone,weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value));
  const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return {day:weekdayKeys[values.weekday],year:Number(values.year),month:Number(values.month),date:Number(values.day),hour:Number(values.hour),minute:Number(values.minute)};
}
export function wallTimeToDate(date,time,timeZone='Asia/Kolkata'){
  const [year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number);
  const target=Date.UTC(year,month-1,day,hour,minute);let epoch=target;
  for(let i=0;i<4;i++){const p=zonedParts(epoch,timeZone);const represented=Date.UTC(p.year,p.month-1,p.date,p.hour,p.minute);epoch+=target-represented}
  return new Date(epoch);
}
export function getAvailableSlots(date,workingHours,timeZone='Asia/Kolkata',unavailable=[],appointments=[],now=new Date()){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(`${date}T00:00:00Z`))||new Date(`${date}T00:00:00Z`).toISOString().slice(0,10)!==date)return [];
  const weekday=weekdayByIndex[new Date(`${date}T00:00:00Z`).getUTCDay()],schedule=workingHours?.[weekday];
  if(typeof schedule!=='string')return [];
  const match=schedule.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);if(!match)return [];
  const [,sh,sm,eh,em]=match.map(Number);const start=sh*60+sm,end=eh*60+em;if(end<=start)return [];
  const slots=[];
  for(let m=start;m+60<=end;m+=60){const time=`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,slotStart=wallTimeToDate(date,time,timeZone),slotEnd=new Date(slotStart.getTime()+3600000);if(slotStart<=now)continue;const overlapping=appointments.filter(x=>{const at=x.scheduledAt||x.start||x;return isOverlapping(slotStart,slotEnd,at,new Date(new Date(at).getTime()+3600000))});const blocked=unavailable.some(x=>isOverlapping(slotStart,slotEnd,x.start,x.end));const status=overlapping.some(x=>['accepted','in_progress','completed'].includes(x.status))?'booked':overlapping.length?'pending':blocked?'unavailable':'available';slots.push({value:slotStart.toISOString(),label:time,status,available:status==='available'})}
  return slots;
}
export function getOpenDates(from,days,workingHours,timeZone='Asia/Kolkata',unavailable=[],appointments=[],now=new Date()){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!Number.isFinite(Date.parse(`${from}T00:00:00Z`))||new Date(`${from}T00:00:00Z`).toISOString().slice(0,10)!==from)return [];
  const result=[];const first=new Date(`${from}T00:00:00Z`);
  for(let i=0;i<days;i++){const current=new Date(first);current.setUTCDate(current.getUTCDate()+i);const date=current.toISOString().slice(0,10);const slots=getAvailableSlots(date,workingHours,timeZone,unavailable,appointments,now);const open=slots.filter(x=>x.available);if(open.length)result.push({date,availableCount:open.length,bookedCount:slots.filter(x=>x.status==='booked').length,pendingCount:slots.filter(x=>x.status==='pending').length})}
  return result;
}
export function isWithinWorkingHours(value,workingHours,timeZone='Asia/Kolkata',requireFullHour=false){
  const p=zonedParts(value,timeZone),schedule=workingHours?.[p.day];if(typeof schedule!=='string')return false;
  const match=schedule.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);if(!match)return false;
  const [,sh,sm,eh,em]=match.map(Number),minute=p.hour*60+p.minute,start=sh*60+sm,end=eh*60+em;
  return (!requireFullHour||(minute-start)%60===0)&&minute>=start&&minute+60<=end;
}
