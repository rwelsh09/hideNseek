import re
with open("src/components/AddQuestionDialog.tsx", "r") as f:
    content = f.read()

# First, remove them from where they currently are (lines 242-263 roughly).
mcd_wrong = """                            <button
                                onClick={() =>
                                    handleQuestionSelect("measure", "mcdonalds")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Hamburger className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    McDonald&apos;s
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("measure", "seven11")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Store className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    7-Eleven
                                </span>
                            </button>"""

if mcd_wrong in content:
    content = content.replace(mcd_wrong, "")
    print("Removed from wrong location")

# Now let's just find the end of the measure section (before RADAR).
transit_btn_measure = """                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measure",
                                        "rail-measure",
                                    )
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <TramFront className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Transit
                                </span>
                            </button>"""

if transit_btn_measure in content:
    content = content.replace(transit_btn_measure, transit_btn_measure + "\n" + mcd_wrong)
    print("Added to correct location")
else:
    # Use regex if exact spacing fails
    match = re.search(r'(<button[^>]*handleQuestionSelect\(\s*"measure",\s*"rail-measure"[^>]*>[\s\S]*?</button>)', content)
    if match:
        content = content[:match.end()] + "\n" + mcd_wrong + content[match.end():]
        print("Added to correct location via regex")

with open("src/components/AddQuestionDialog.tsx", "w") as f:
    f.write(content)
