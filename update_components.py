import sys

# 1. Update LatLngPicker.tsx
with open('src/components/LatLngPicker.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'import { VscQuestion, VscShare } from "react-icons/vsc";' in line:
        new_lines.append('import { VscQuestion, VscShare, VscTrash } from "react-icons/vsc";\n')
    elif '                                <Button' in line and 'VscShare' in ''.join(lines):
        # We need to find the place right after "How it works" and before "Share"
        pass

    # We will do it more cleanly below

with open('src/components/LatLngPicker.tsx', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace(
    'import { VscQuestion, VscShare } from "react-icons/vsc";',
    'import { VscQuestion, VscShare, VscTrash } from "react-icons/vsc";'
)

# Insert the delete button between Help and Share
help_block_end = """                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[100vw] h-[100dvh] sm:max-w-2xl sm:h-[80vh] p-0 flex flex-col gap-0 rounded-none sm:rounded-xl">"""

share_button_start = """                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Share Question"
                                onClick={() => {"""

# Let's find exactly where to insert it.
# It should be after the Dialog closing tag for Help, and before the Share button.
# The structure is:
# <Dialog> (Help)
# <Button> (Share)

# Actually, the user asked to put it between `How it works` and `Share`.
# They are in a flex container:
# <div className="flex gap-2 w-full justify-between sm:justify-start">

search_pattern = """                        </div>
                    </div>
                    <div className="flex gap-2 w-full justify-between sm:justify-start">"""

# Let's see the context of the buttons
