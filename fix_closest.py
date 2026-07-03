import re

with open("src/components/AddQuestionDialog.tsx", "r") as f:
    content = f.read()

# Find the location to insert closest buttons (after Pub)
pub_button = """                                <button
                                    onClick={() =>
                                        handleQuestionSelect("closest", "pub")
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Beer className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Pub
                                    </span>
                                </button>"""

mcd_seven11_closest = """
                                <button
                                    onClick={() =>
                                        handleQuestionSelect("closest", "mcdonalds")
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Hamburger className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        McDonald's
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        handleQuestionSelect("closest", "seven11")
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Store className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        7-Eleven
                                    </span>
                                </button>"""

if pub_button in content:
    content = content.replace(pub_button, pub_button + mcd_seven11_closest)
    with open("src/components/AddQuestionDialog.tsx", "w") as f:
        f.write(content)
    print("Successfully added buttons to Closest section.")
else:
    print("Could not find Pub button to insert after.")
