with open("src/components/AddQuestionDialog.tsx", "r") as f:
    content = f.read()

import_lines = []
lines = content.split('\n')
for i, line in enumerate(lines):
    if "import" in line and "lucide-react" in line:
        # We might have multiline import, so let's just find the first import {
        pass

# A more robust regex replacement for lucide-react import
import re
match = re.search(r'import\s+\{([^}]+)\}\s+from\s+["\']lucide-react["\'];', content)
if match:
    imports = [x.strip() for x in match.group(1).split(',')]
    if 'Hamburger' not in imports:
        imports.append('Hamburger')
    if 'Store' not in imports:
        imports.append('Store')

    new_import = f"import {{ {', '.join(imports)} }} from 'lucide-react';"
    content = content[:match.start()] + new_import + content[match.end():]

    with open("src/components/AddQuestionDialog.tsx", "w") as f:
        f.write(content)
    print("Imports successfully patched.")
else:
    print("Could not find lucide-react import.")
