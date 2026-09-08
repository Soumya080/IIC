import json, datetime

try:
    data = json.load(open('data.json', encoding='utf-8'))
except Exception as e:
    print("JSON Parse error:", e)
    # The summary might have some unescaped quotes or things that break naive JSON string conversion.
    
out = []
out.append('# IIC 3.0 — Problem Statements\n')
out.append('Source: [https://iic-3-0.vercel.app/problem-statements](https://iic-3-0.vercel.app/problem-statements)\n')
out.append(f'Extraction date: {datetime.date.today().isoformat()}\n\n')
out.append('## Table of Contents\n')

themes = {}
for i, d in enumerate(data):
    cat = d.get('category', 'Unknown')
    if cat not in themes:
        themes[cat] = []
    themes[cat].append((i+1, d))

for cat, items in themes.items():
    out.append(f'- {cat}\n')
    for num, d in items:
        out.append(f'  - PS-{num:03d}: {d.get("title")}\n')
out.append('\n---\n\n')

for t_idx, (cat, items) in enumerate(themes.items(), 1):
    out.append(f'## Theme {t_idx}: {cat}\n\n')
    for num, d in items:
        out.append(f'### PS-{num:03d} — {d.get("title")}\n\n')
        out.append(f'**Category:** {cat}\n\n')
        out.append(f'**Problem Statement:**\n{d.get("summary")}\n\n')
        out.append('---\n\n')

out.append('## Extraction Validation\n\n')
out.append('| Metric | Result |\n')
out.append('|---|---|\n')
out.append('| Problem statements found | 35 |\n')
out.append(f'| Problem statements extracted | {len(data)} |\n')
ids = [d.get('id') for d in data]
dups = len(ids) - len(set(ids))
out.append(f'| Duplicates | {dups} |\n')
out.append(f'| Missing statements | {35-len(data)} |\n')
out.append(f'| Validation status | {"PASS" if len(data)==35 and dups==0 else "FAIL"} |\n')

open('IIC_3.0_PROBLEM_STATEMENTS.md', 'w', encoding='utf-8').write(''.join(out))
print(f"Successfully wrote {len(data)} problem statements to IIC_3.0_PROBLEM_STATEMENTS.md")
