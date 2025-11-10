# -*- coding: utf-8 -*-
from pathlib import Path
path = Path('js/components/ranking.js')
text = path.read_text(encoding='utf-8', errors='surrogateescape')
old_search = "        <p class=\"rk-micro text-gray-500 dark:text-gray-400 mt-1\">???: ${helpers.convertToBanglaNumber(\n                  s.roll\n                )} \u0007 ${s.academicGroup || '???? ???'} \u0007 ?????: ${_formatLabel(groupName)}</p>\n"
if old_search in text:
    text = text.replace(old_search, '', 1)
old_card = "                <p class=\"rk-micro text-gray-500 dark:text-gray-400 mt-1\">???: ${helpers.convertToBanglaNumber(\n                  s.roll\n                )} \u0007 ${s.academicGroup || '???? ???'} \u0007 ?????: ${_formatLabel(groupName)}</p>"
new_card = "                <p class=\"rk-micro text-gray-500 dark:text-gray-400 mt-1\">রোল: ${helpers.convertToBanglaNumber(\n                  s.roll\n                )} • ${s.academicGroup || 'শাখা নেই'} • গ্রুপ: ${_formatLabel(groupName)}</p>"
if old_card not in text:
    raise SystemExit('card paragraph pattern not found')
text = text.replace(old_card, new_card, 1)
corrupted = "\\s*����??�\u0015?��_��_��T�\u0015?��\u0007\\s*$"
if corrupted in text:
    text = text.replace(corrupted, r"\s*র‍্যাঙ্ক\s*$", 1)
path.write_text(text, encoding='utf-8', errors='surrogateescape')
