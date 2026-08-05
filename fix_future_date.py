import re

with open(".jules/scout.md", "r") as f:
    content = f.read()

content = re.sub(
    r"## 2026-08-25 - \[Registry Pattern for Map Questions\]",
    r"## 2026-08-05 - [Registry Pattern for Map Questions]",
    content
)

with open(".jules/scout.md", "w") as f:
    f.write(content)
