const fs = require('fs');
const data = JSON.parse(fs.readFileSync('json data.json', 'utf8'));

const qtRecords = data.filter(r => String(r.Issue).trim().toLowerCase() === 'quality & taste');

console.log('Total Quality & Taste records in JSON:', qtRecords.length);

const categories = {
  'Rider / Transit Delay (Cold Food)': {
    description: 'Complaints of cold food or late delivery where store records prove prep was on-time, pointing to rider transit delays.',
    filter: (r, combined) => {
      return /\b(rider|driver|delivery boy|delivery partner|delivery partner's|transit|pickup delay|rider assignment|delivery person|transit related)\b/i.test(combined) &&
             /\b(delay|late|cold|soggy|hour|min)\b/i.test(combined);
    }
  },
  'Transit Spillage & Packaging Damage': {
    description: 'Complaints of leaked oils, spilled raita, or squashed packaging caused by transit handling or container failures.',
    filter: (r, combined) => {
      return /\b(spill|spillage|leak|leakage|squash|squashed|torn|damp|container|packaging|lid|foil)\b/i.test(combined);
    }
  },
  'Wrong Item / Substitution Dispatch': {
    description: 'Taste or value complaints where the store packed the incorrect item or misread the KOT/bill.',
    filter: (r, combined) => {
      return /\b(wrong|instead|substitution|mix|mixup|sent instead|received nonveg|received veg)\b/i.test(combined);
    }
  },
  'Quantity / Component Miss': {
    description: 'Logged as taste/quality complaints but the root cause is actually a missing meal component (e.g. raita, cutlery, paratha).',
    filter: (r, combined) => {
      return /\b(missing|missed|not given|portion|quantity|cutlery|spoon|fork|tissue|pieces|less)\b/i.test(combined) && 
             (combined.includes('missing') || combined.includes('missed') || combined.includes('not given') || combined.includes('less'));
    }
  },
  'Kitchen SOP & Prep Deviation': {
    description: 'Taste complaints (e.g. over-salted, under-cooked, stale ingredients) confirmed to be due to staff deviating from recipe weight or heating timer SOPs.',
    filter: (r, combined) => {
      // Any record with confirmed store-side fault, or mentioning cooking/recipes/SOP
      const isConfirmed = String(r['yes/ no']).trim().toLowerCase() === 'yes';
      return isConfirmed || /\b(sop|weigh|timer|expired|stale|salt|chilli|spic|cook|heat|raw|smell|taste|fresh)\b/i.test(combined);
    }
  }
};

const processed = {};
for (let catName in categories) {
  processed[catName] = [];
}

const classifiedSet = new Set();

// Let's run classification sequentially so a record is classified in only one category
for (let r of qtRecords) {
  const issueText = (r.Issues || '');
  const rcaText = (r['Identification of root cause'] || '');
  const addText = (r['Additional finding of RCA'] || '');
  const rccaText = (r.RCCA || '');
  const rcpaText = (r.RCPA || '');
  const combinedText = `${issueText} | ${rcaText} | ${addText} | ${rccaText} | ${rcpaText}`;

  let matched = false;
  for (let catName in categories) {
    if (categories[catName].filter(r, combinedText)) {
      processed[catName].push(r);
      matched = true;
      break; // assign to first matching category
    }
  }
}

console.log('Classification results:');
let totalClassified = 0;
const counts = {};
for (let catName in processed) {
  counts[catName] = processed[catName].length;
  console.log(`- ${catName}: ${processed[catName].length} records`);
  totalClassified += processed[catName].length;
}
console.log('Total classified Q&T:', totalClassified);

// Let's output samples for each category
const finalProof = {};
for (let catName in processed) {
  // Let's choose up to 5 best samples for each category
  const list = processed[catName];
  // Prioritize rows that have non-empty RCA and issues
  const sorted = [...list].sort((a, b) => {
    const scoreA = (a.Issues ? 1 : 0) + (a['Identification of root cause'] ? 1 : 0) + (String(a['yes/ no']).toLowerCase() === 'yes' ? 1 : 0);
    const scoreB = (b.Issues ? 1 : 0) + (b['Identification of root cause'] ? 1 : 0) + (String(b['yes/ no']).toLowerCase() === 'yes' ? 1 : 0);
    return scoreB - scoreA;
  });
  
  finalProof[catName] = sorted.slice(0, 5).map(r => ({
    Store: r.Store || '—',
    Issue_text: r.Issues ? r.Issues.trim().replace(/\r?\n/g, ' ') : '—',
    RCA: r['Identification of root cause'] ? r['Identification of root cause'].trim().replace(/\r?\n/g, ' ') : '—'
  }));
}

console.log('\n--- PROOF DATA MAPPING ---');
console.log(JSON.stringify(finalProof, null, 2));
