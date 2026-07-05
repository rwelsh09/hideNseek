with open('src/components/cards/base.tsx', 'r') as f:
    content = f.read()

# I will just write a script to completely rebuild the `locked !== undefined` part because we want to restore only the LockIcon logic and remove the Trash part that came back from the merge.

import re

# Find the VscTrash import and remove it
content = re.sub(r'import \{ useState \} from "react";\nimport \{ VscChevronDown, VscTrash \} from "react-icons/vsc";', 'import { useRef, useState } from "react";\nimport { VscChevronDown } from "react-icons/vsc";', content)

# Now, replace the `<div className="flex gap-2 pt-2 px-2 justify-center">...</div>` block
# We can find the `<div className="flex gap-2 pt-2 px-2 justify-center">` and the matching closing `</div>`

# Just to be safe, let's use a simpler replacement
