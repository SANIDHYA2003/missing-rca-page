const fs = require('fs');
const data = JSON.parse(fs.readFileSync('json data.json', 'utf8'));

const qtRecords = data.filter(r => String(r.Issue).trim().toLowerCase() === 'quality & taste');

const patterns = {
  'Rider Delay & Transit Cold Food': {
    description: 'Complaints of cold/soggy food or late delivery where store CCTV and logs prove preparation was on-time, indicating courier transit delays.',
    records: []
  },
  'Transit Spillage & Packaging Damage': {
    description: 'Complaints of leaked oil, spilled raita, or squashed packaging caused by rough transit handling or packing lid issues.',
    records: []
  },
  'Kitchen SOP & Prep Deviations': {
    description: 'Complaints of poor taste, undercooked food, or incorrect seasoning where RCA confirmed kitchen staff deviated from standard recipes (SOP) or FIFO rules.',
    records: []
  }
};

for (let r of qtRecords) {
  const issueText = (r.Issues || '');
  const rcaText = (r['Identification of root cause'] || '');
  const addText = (r['Additional finding of RCA'] || '');
  const rccaText = (r.RCCA || '');
  const rcpaText = (r.RCPA || '');
  const combinedText = `${issueText} | ${rcaText} | ${addText} | ${rccaText} | ${rcpaText}`.toLowerCase();

  const rec = {
    Date: r.Date,
    Order_ID: r["Order I'd"] || r["Order ID"] || r["Order_ID"] || '—',
    Store: r.Store,
    Channel: r.Channel,
    Source: r.Source,
    Issues: r.Issues,
    RCA: r['Identification of root cause'] || '—',
    Additional: r['Additional finding of RCA'] || '—',
    staff: r.staff || r.Staff || '—',
    Verdict: r.Verdict || (r['yes/ no'] && r['yes/ no'].toLowerCase() === 'yes' ? 'Confirmed store-side' : 'Not confirmed store-side')
  };

  // Classify:
  // 1. Spillage & Packaging
  if (/\b(spill|spillage|leak|leakage|squash|squashed|torn|damp|container|packaging|lid|foil|opened)\b/i.test(combinedText)) {
    patterns['Transit Spillage & Packaging Damage'].records.push(rec);
  }
  // 2. Rider Delay
  else if (/\b(rider|driver|delivery boy|delivery partner|transit|delay|late|cold|soggy)\b/i.test(combinedText) &&
           /\b(rider|transit|delivery partner|delivery person|external|transit related|rider pickup|pickup delay|rider assignment)\b/i.test(combinedText)) {
    patterns['Rider Delay & Transit Cold Food'].records.push(rec);
  }
  // 3. Kitchen SOP Deviation
  else if (/\b(sop|weigh|fifo|expired|recipe|salt|chilli|spic|cook|heat|raw|smell|taste|fresh)\b/i.test(combinedText)) {
    patterns['Kitchen SOP & Prep Deviations'].records.push(rec);
  }
}

console.log('Results of classification:');
for (let cat in patterns) {
  console.log(`- ${cat}: ${patterns[cat].records.length} records`);
}
