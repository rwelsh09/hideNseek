with open('src/components/cards/base.tsx', 'r') as f:
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

            # Since this is base.tsx, we need to check which conflict it was.
            # If it's the imports at the top:
            if 'VscChevronDown' in new_lines[-1] or (len(new_lines) > 0 and 'LockIcon' in new_lines[-1]):
                # We want the version without VscTrash, and keeping useRef if needed by HEAD
                new_lines.extend([
                    'import { useRef, useState } from "react";\n',
                    'import { VscChevronDown } from "react-icons/vsc";\n'
                ])
            else:
                # The other conflict at line 89
                # Looking at HEAD:
                new_lines.extend([
                    '                        {locked !== undefined && (\n',
                    '                            <div className="flex gap-2 pt-2 px-2 justify-center">\n',
                    '                                <Button\n',
                    '                                    variant="outline"\n',
                    '                                    size="sm"\n',
                    '                                    data-tutorial-id="tutorial-lock-btn"\n',
                    '                                    aria-label={\n',
                    '                                        locked\n',
                    '                                            ? "Unlock Question"\n',
                    '                                            : "Lock Question"\n',
                    '                                    }\n',
                    '                                    title={\n',
                    '                                        locked\n',
                    '                                            ? "Unlock Question"\n',
                    '                                            : "Lock Question"\n',
                    '                                    }\n',
                    '                                    onClick={() => {\n',
                    '                                        const d = questions.get();\n',
                    '                                        if (d[questionKey]) {\n',
                    '                                            d[questionKey].locked = !locked;\n',
                    '                                            questionModified();\n',
                    '                                        }\n',
                    '                                    }}\n',
                    '                                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"\n',
                    '                                >\n',
                    '                                    {locked ? (\n',
                    '                                        <LockIcon className="w-4 h-4" />\n',
                    '                                    ) : (\n',
                    '                                        <UnlockIcon className="w-4 h-4" />\n',
                    '                                    )}\n',
                    '                                </Button>\n',
                    '                            </div>\n',
                    '                        )}\n',
                    '                    </SidebarGroupContent>\n'
                ])
            continue

    if not in_conflict:
        new_lines.append(line)

with open('src/components/cards/base.tsx', 'w') as f:
    f.writelines(new_lines)
