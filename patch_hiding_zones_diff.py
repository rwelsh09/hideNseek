import sys

with open("src/lib/hiding-zones.ts", "r") as f:
    content = f.read()

import re

# We will replace turf.booleanWithin with turf.intersect or turf.difference check.
# Wait, if turf.booleanWithin is FALSE in my tests, maybe turf.booleanWithin fails in the browser?
# Actually, turf.booleanWithin is known to have issues with MultiPolygons in older turf versions or even 7.x.
# A much safer way to check if a circle is COMPLETELY inside a polygon is:
# "Is the intersection of the circle and the valid area empty?"
# Wait! We don't have the valid area! We only have the shaded area (which is inverted).
# So the check is: "Does the circle intersect the hole?"
# If we do `turf.difference(circle, unionized)`, if it returns null, it means the circle is completely inside the shaded area.
# Because if any part of the circle was outside the shaded area (i.e. in the hole), `turf.difference` would return that part.

old_pattern = r"if \(turf\.booleanWithin\(circle, unionized\)\) \{"
new_pattern = "if (turf.difference(turf.featureCollection([circle, unionized])) === null) {"

content, count = re.subn(old_pattern, new_pattern, content)

if count == 0:
    print("Could not find the target string!")
    sys.exit(1)

with open("src/lib/hiding-zones.ts", "w") as f:
    f.write(content)

print("Patch applied successfully.")
