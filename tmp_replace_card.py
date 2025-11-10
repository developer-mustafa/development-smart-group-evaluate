# -*- coding: utf-8 -*-
import re
from pathlib import Path
path = Path('js/components/ranking.js')
text = path.read_text(encoding='utf-8', errors='surrogateescape')
pattern_card = r"                <p class=\"rk-micro text-gray-500 dark:text-gray-400 mt-1\">.*?_formatLabel\(groupName\)\)</p>"
replacement_card = "                <p class=\"rk-micro text-gray-500 dark:text-gray-400 mt-1\">রোল: ${helpers.convertToBanglaNumber(\n                  s.roll\n                )} • ${s.academicGroup || 'শাখা নেই'} • গ্রুপ: ${_formatLabel(groupName)}</p>"
text, count = re.subn(pattern_card, replacement_card, text, count=1, flags=re.S)
if count == 0:
    raise SystemExit('card paragraph still not replaced')
path.write_text(text, encoding='utf-8', errors='surrogateescape')
