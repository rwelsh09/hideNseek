with open("src/components/LeafletActionButtons.tsx", "r") as f:
    content = f.read()

# Replace border-2 border-black border-opacity-30 with border-2 border-black/30 or whatever was meant
# Wait, user said: "Why are you refusing to look at the code of the other buttons and just simply copying them? I want them to match the other buttons on screen, they have a lighter colored grey-like border."
# If I look at LeafletActionButtons.tsx, it explicitly uses "border-2 border-black border-opacity-30".
# But wait, the standard map leaflet zoom buttons use standard leaflet CSS! Or maybe there is another button component like AddQuestionDialog or PasteQuestionButton or the Share/Options buttons.
# Let's check Share and Options buttons.
