const fs = require('fs');
const data = JSON.parse(fs.readFileSync('json data.json', 'utf8'));

const qt = data.filter(r => String(r.Issue).trim().toLowerCase() === 'quality & taste');

console.log('--- Rider / Transit Delay (Cold Food) (all) ---');
let c1 = 0;
for (let r of qt) {
  const combined = `${r.Issues} | ${r['Identification of root cause']} | ${r['Additional finding of RCA']}`.toLowerCase();
  const isRider = /\b(rider|driver|delivery boy|delivery partner|delivery partner's|transit|pickup delay|rider assignment|delivery person|transit related)\b/i.test(combined) &&
                 /\b(delay|late|cold|soggy|hour|min)\b/i.test(combined);
  if (isRider) {
    c1++;
    console.log(`#${c1} Store: ${r.Store}, Date: ${r.Date}`);
    console.log('Issues:', r.Issues.replace(/\n/g, ' '));
    console.log('RCA:', r['Identification of root cause']);
    console.log('Additional:', r['Additional finding of RCA']);
    console.log('Confirmed:', r['yes/ no']);
    console.log('-----------------------------');
  }
}

console.log('--- Transit Spillage & Packaging Damage (all) ---');
let c2 = 0;
for (let r of qt) {
  const combined = `${r.Issues} | ${r['Identification of root cause']} | ${r['Additional finding of RCA']}`.toLowerCase();
  const isSpill = /\b(spill|spillage|leak|leakage|squash|squashed|torn|damp|container|packaging|lid|foil)\b/i.test(combined);
  // exclude if already matched as rider delay to keep exclusive
  const isRider = /\b(rider|driver|delivery boy|delivery partner|delivery partner's|transit|pickup delay|rider assignment|delivery person|transit related)\b/i.test(combined) &&
                 /\b(delay|late|cold|soggy|hour|min)\b/i.test(combined);
  if (isSpill && !isRider) {
    c2++;
    console.log(`#${c2} Store: ${r.Store}, Date: ${r.Date}`);
    console.log('Issues:', r.Issues.replace(/\n/g, ' '));
    console.log('RCA:', r['Identification of root cause']);
    console.log('Additional:', r['Additional finding of RCA']);
    console.log('Confirmed:', r['yes/ no']);
    console.log('-----------------------------');
  }
}
