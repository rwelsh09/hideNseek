import * as turf from "@turf/turf";

type Location = {
    name?: string;
    type?: string;
    coordinates: number[]; // [longitude, latitude]
};

function checkIfStationsShareZones(
    station1: Location,
    station2: Location,
    radius: number,
    units: turf.Units,
): boolean {
    const point1 = turf.point([station1.coordinates[0], station1.coordinates[1]]);
    const point2 = turf.point([station2.coordinates[0], station2.coordinates[1]]);
    return turf.distance(point1, point2, { units }) <= radius;
}

function mergeDuplicateStationOld(places: any[], radius: number, units: turf.Units): any[] {
    const grouped = new Map<string, any[]>();
    for (const place of places) {
        const name = place.properties.name ?? "";
        if (!grouped.has(name)) {
            grouped.set(name, [place]);
        } else {
            let placeAdded = false;
            for (const group of grouped) {
                const groupValues = group[1];
                if (groupValues[0].properties.name == name) {
                    let shareZones: boolean = false;
                    for (const groupPlace of groupValues) {
                        const station1: Location = { coordinates: place.geometry.coordinates };
                        const station2: Location = { coordinates: groupPlace.geometry.coordinates };
                        shareZones = checkIfStationsShareZones(station1, station2, radius, units);
                        if (!shareZones) break;
                    }
                    if (shareZones) {
                        groupValues.push(place);
                        placeAdded = true;
                        break;
                    }
                }
            }

            if (!placeAdded) {
                const matches = Array.from(grouped.entries()).filter(
                    ([key]) => typeof key === "string" && key.includes(name),
                );
                const lastGroup = matches.at(-1);
                let lastKey = "0";
                if (lastGroup) {
                    lastKey = lastGroup[0];
                }
                const lastIdx = Number(lastKey.split("#")[1] ?? "0");
                const nextIdx = lastIdx + 1;
                const key: string = name + "#" + nextIdx.toString();
                grouped.set(key, [place]);
            }
        }
    }

    const merged: any[] = [];
    grouped.forEach((group) => {
        const avgLng = group.reduce((sum, p) => sum + p.geometry.coordinates[0], 0) / group.length;
        const avgLat = group.reduce((sum, p) => sum + p.geometry.coordinates[1], 0) / group.length;
        merged.push({
            ...group[0],
            geometry: { type: "Point", coordinates: [avgLng, avgLat] },
        });
    });
    return merged;
}

function mergeDuplicateStationNew(places: any[], radius: number, units: turf.Units): any[] {
    // We group directly by name, where the value is an array of groups.
    // Each group is an array of places that share the zone.
    const groupedByName = new Map<string, any[][]>();

    // 1. Group by name
    for (const place of places) {
        const name = place.properties.name ?? "";

        let groups = groupedByName.get(name);
        if (!groups) {
            groupedByName.set(name, [[place]]);
            continue;
        }

        let placeAdded = false;
        // Only iterate over groups with the matching name
        for (const group of groups) {
            let shareZones: boolean = false;
            for (const groupPlace of group) {
                const station1: Location = {
                    coordinates: place.geometry.coordinates,
                };
                const station2: Location = {
                    coordinates: groupPlace.geometry.coordinates,
                };
                shareZones = checkIfStationsShareZones(
                    station1,
                    station2,
                    radius,
                    units,
                );
                if (!shareZones) {
                    break;
                }
            }
            if (shareZones) {
                group.push(place);
                placeAdded = true;
                break;
            }
        }

        if (!placeAdded) {
            // New distinct group for this name
            groups.push([place]);
        }
    }

    // 2. Compute central point per group
    const merged: any[] = [];
    for (const groups of groupedByName.values()) {
        for (const group of groups) {
            const avgLng =
                group.reduce((sum, p) => sum + p.geometry.coordinates[0], 0) /
                group.length;
            const avgLat =
                group.reduce((sum, p) => sum + p.geometry.coordinates[1], 0) /
                group.length;

            merged.push({
                ...group[0],
                geometry: {
                    type: "Point",
                    coordinates: [avgLng, avgLat],
                },
            });
        }
    }
    return merged;
}

const places = [];
for (let i = 0; i < 2000; i++) {
    places.push({
        properties: { name: "Station " + (i % 100) },
        geometry: { coordinates: [i * 0.001, i * 0.001] }
    });
}

const start1 = Date.now();
const res1 = mergeDuplicateStationOld(places, 0.5, "kilometers");
const end1 = Date.now();
console.log("Old:", end1 - start1, "ms, res length:", res1.length);

const start2 = Date.now();
const res2 = mergeDuplicateStationNew(places, 0.5, "kilometers");
const end2 = Date.now();
console.log("New:", end2 - start2, "ms, res length:", res2.length);

// Also verify results are identical ignoring order
const getSortedCoords = (res: any[]) => res.map(r => r.geometry.coordinates.join(",")).sort();
console.log("Results identical ignoring order?", JSON.stringify(getSortedCoords(res1)) === JSON.stringify(getSortedCoords(res2)));
