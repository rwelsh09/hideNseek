with open('src/components/TimerDrawer.tsx', 'r') as f:
    content = f.read()

content = content.replace('            lockedRecommendedStart.set(null);\n', '')
content = content.replace('        lockedRecommendedStart.set(null);\n', '')

with open('src/components/TimerDrawer.tsx', 'w') as f:
    f.write(content)
