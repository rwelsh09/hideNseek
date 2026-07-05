with open('src/components/LatLngPicker.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
in_conflict = False
conflict_part = 0 # 1 for HEAD, 2 for origin/master

for line in lines:
    if line.startswith('<<<<<<< HEAD'):
        in_conflict = True
        conflict_part = 1
        continue
    elif line.startswith('======='):
        if in_conflict:
            conflict_part = 2
            continue
    elif line.startswith('>>>>>>> origin/master'):
        if in_conflict:
            in_conflict = False
            conflict_part = 0

            # Insert the merged code
            new_lines.extend([
                'import { LocateIcon, PaletteIcon } from "lucide-react";\n',
                'import { useRef } from "react";\n',
                'import { VscQuestion, VscShare, VscTrash } from "react-icons/vsc";\n',
                'import { toast } from "react-toastify";\n',
                '\n',
                'import { DialogDescription } from "@/components/ui/dialog";\n',
                'import { Input } from "@/components/ui/input";\n',
                'import { Label } from "@/components/ui/label";\n'
            ])
            continue

    if not in_conflict:
        new_lines.append(line)

with open('src/components/LatLngPicker.tsx', 'w') as f:
    f.writelines(new_lines)
