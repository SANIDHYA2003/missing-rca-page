const fs = require('fs');
const data = JSON.parse(fs.readFileSync('json data.json', 'utf8'));

const qt = data.filter(r => String(r.Issue).trim().toLowerCase() === 'quality & taste');
const confirmed = qt.filter(r => String(r['yes/ no']).trim().toLowerCase() === 'yes');
const notConfirmed = qt.filter(r => String(r['yes/ no']).trim().toLowerCase() === 'no');
const blank = qt.filter(r => !r['yes/ no'] || String(r['yes/ no']).trim() === '');

console.log('Q&T Total:', qt.length);
console.log('Q&T Confirmed ("yes"):', confirmed.length);
console.log('Q&T Not Confirmed ("no"):', notConfirmed.length);
console.log('Q&T Blank:', blank.length);
