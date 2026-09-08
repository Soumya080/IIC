const fs = require('fs');
const js = fs.readFileSync('index.js', 'utf-8');
const startIdx = js.indexOf('[{id:"agri-pearl-millet-disease"');
let braceCount = 0;
let endIdx = -1;
for (let i = startIdx; i < js.length; i++) {
    if (js[i] === '[') braceCount++;
    else if (js[i] === ']') {
        braceCount--;
        if (braceCount === 0) {
            endIdx = i;
            break;
        }
    }
}
const dataStr = js.substring(startIdx, endIdx + 1);
const data = eval(dataStr);
fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
