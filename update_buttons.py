import re

file_path = "src/components/AddQuestionDialog.tsx"
with open(file_path, "r") as f:
    content = f.read()

# I will just write a function to replace the className and add the span for specific keywords.
# It's safer to use manual replacement if possible, or AST.
