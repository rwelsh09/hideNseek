with open('src/components/cards/base.tsx', 'r') as f:
    lines = f.readlines()

with open('src/components/cards/base.tsx', 'w') as f:
    for i, line in enumerate(lines):
        if i == 117 and "                    </SidebarGroupContent>" in line:
            # Skip the duplicate tag
            continue
        f.write(line)
