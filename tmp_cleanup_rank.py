# -*- coding: utf-8 -*-
import re
from pathlib import Path
path = Path('js/components/ranking.js')
text = path.read_text(encoding='utf-8', errors='surrogateescape')
pattern_search = r"^[ \t]+<p class=\"rk-micro text-gray-500 dark:text-gray-400 mt-1\">.*?_formatLabel\(groupName\)</p>\r?\n"
text, count = re.subn(pattern_search, '', text, count=1, flags=re.M)
pattern_card = r"                <p class=\"rk-micro text-gray-500 dark:text-gray-400 mt-1\">.*?_formatLabel\(groupName\)</p>"
replacement_card = "                <p class=\"rk-micro text-gray-500 dark:text-gray-400 mt-1\">রোল: ${helpers.convertToBanglaNumber(\n                  s.roll\n                )} • ${s.academicGroup || 'শাখা নেই'} • গ্রুপ: ${_formatLabel(groupName)}</p>"
text, count2 = re.subn(pattern_card, replacement_card, text, count=1, flags=re.S)
pattern_regex = r"\\s*[^\\]*\\s*$"
# Instead of corrupted, directly ensure string uses desired form
text = text.replace('র‍্যাঙ্ক\s*$', '\\s*র‍্যাঙ্ক\\s*$')
path.write_text(text, encoding='utf-8', errors='surrogateescape')
