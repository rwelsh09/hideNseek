import re

with open("src/components/AddQuestionDialog.tsx", "r") as f:
    content = f.read()

def replace_button(m):
    full_button = m.group(0)

    label = ""
    match = re.search(r'handleQuestionSelect\([\s\n]*"([^"]+)"[\s\n]*,[\s\n]*("([^"]+)"|(\d+(\.\d+)?))[\s\n]*,?[\s\n]*\)', full_button)
    if match:
        qtype = match.group(1)
        detail = match.group(3) if match.group(3) else match.group(4)

        labels = {
            "matching": {
                "museum-full": "Museum",
                "hospital-full": "Hospital",
                "cinema-full": "Cinema",
                "library-full": "Library",
                "golf_course-full": "Golf Course",
                "same-train-line": "Transit",
                "same-neighbourhood": "Neighborhood",
                "same-first-letter-neighbourhood": "Neighborhood",
            },
            "measuring": {
                "museum-full": "Museum",
                "hospital-full": "Hospital",
                "cinema-full": "Cinema",
                "library-full": "Library",
                "golf_course-full": "Golf Course",
                "rail-measure": "Station",
            },
            "tentacles": {
                "hospital": "Hospital",
                "cinema": "Cinema",
                "library": "Library",
                "museum": "Museum",
                "timhortons": "Tim&apos;s",
                "pub": "Pub",
                "custom": "Custom",
            },
            "photo": {
                "camera": "Selfie",
                "tree": "Unique Tree",
                "car": "Widest Street",
                "building": "Tallest Bldg",
                "restaurant": "Restaurant",
                "park": "Park",
                "store": "Store Aisle",
                "worship": "Worship",
                "train": "Train Plat.",
                "route": "Intersection",
            }
        }

        if qtype in labels and detail in labels[qtype]:
            label = labels[qtype][detail]

            icon_match = re.search(r'(<[A-Z][a-zA-Z0-9]*\s+className="w-5 h-5 sm:w-6 sm:h-6"\s*/>)', full_button)
            if icon_match:
                icon_tag = icon_match.group(1)
                new_icon_tag = icon_tag.replace('className="w-5 h-5 sm:w-6 sm:h-6"', 'className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"')
                span_tag = f'\n                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">{label}</span>\n                                '
                full_button = full_button.replace(icon_tag, new_icon_tag + span_tag)

            full_button = full_button.replace('flex justify-center', 'flex flex-col gap-1 p-1 justify-center')

    return full_button

pattern = re.compile(r'<button\b[^>]*>.*?</button>', re.DOTALL)
new_content = pattern.sub(replace_button, content)

with open("src/components/AddQuestionDialog.tsx", "w") as f:
    f.write(new_content)
