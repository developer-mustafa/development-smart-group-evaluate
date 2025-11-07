from pathlib import Path
p = Path('js/components/members.js')
s = p.read_text(encoding='utf-8')
old = "window.openStudentModalById(studentId, {\n      student: fallbackStudent || undefined,\n      groupName: fallbackGroupName || undefined,\n      state: stateSnapshot || undefined,\n    });"
new = "window.openStudentModalById(studentId);"
if old in s:
    s = s.replace(old, new)
    p.write_text(s, encoding='utf-8')
else:
    print('snippet not found')
