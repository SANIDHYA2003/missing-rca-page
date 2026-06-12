const fs = require('fs');
const data = JSON.parse(fs.readFileSync('json data.json', 'utf8'));

const qt = data.filter(r => String(r.Issue).trim().toLowerCase() === 'quality & taste');
const confirmed = qt.filter(r => String(r['yes/ no']).trim().toLowerCase() === 'yes');

console.log('Confirmed Q&T Records list:');
confirmed.forEach((r, idx) => {
  console.log(`\n#${idx + 1} Store: ${r.Store}, Date: ${r.Date}, Order ID: ${r["Order I'd"] || r["Order ID"]}`);
  console.log('Issues:', r.Issues.replace(/\n/g, ' '));
  console.log('RCA:', r['Identification of root cause']);
  console.log('Additional:', r['Additional finding of RCA']);
  console.log('Staff:', r.staff || r.Staff);
});
