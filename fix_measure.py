with open("src/components/AddQuestionDialog.tsx", "r") as f:
    content = f.read()

# I notice the measure button for mcdonalds and seven11 is currently under the MATCH section in the code!
# Let's remove them from MATCH section and insert them into the MEASURE section.

mcd_seven11_measure = """
                            <button
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

content = content.replace(mcd_seven11_measure.strip(), "")

# Now find where the measure buttons actually end and append them there.
# The measure section should end before the "CLOSEST" section.

# Let's look for the Transit button in the MEASURE section.
transit_measure = """                                <button
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "measure",
                                            "same-train-line",
                                        )
                                    }
                                    className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <TramFront className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Transit
                                    </span>
                                </button>"""

if transit_measure in content:
    content = content.replace(transit_measure, transit_measure + "\n" + mcd_seven11_measure.strip())

with open("src/components/AddQuestionDialog.tsx", "w") as f:
    f.write(content)
