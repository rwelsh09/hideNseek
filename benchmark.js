import * as turf from "@turf/turf";

// Helper function to simulate the original problem
function findTentacleLocationsOriginal(elements, radiusInMeters) {
    const centerPoint = turf.point([0, 0]);
    const response = turf.points([]);
    const fallbackName = null;

    elements.forEach((element) => {
        if (!element.tags) return;

        if (!element.tags["name"] && !element.tags["name:en"]) {
            return;
        }

        if (element.lat && element.lon) {
            const pt = turf.point([element.lon, element.lat]);
            const distance = turf.distance(centerPoint, pt, {
                units: "meters",
            });
            if (distance <= radiusInMeters) {
                const name = element.tags["name:en"] ?? element.tags["name"];
                const isChain = false;

                // INEFFICIENCY HERE: O(N) lookup over an array that grows
                if (
                    !isChain &&
                    response.features.find(
                        (feature) => feature.properties.name === name,
                    )
                ) {
                    return;
                }

                response.features.push(
                    turf.point([element.lon, element.lat], {
                        name,
                        id: element.id,
                    }),
                );
            }
        }

        // Similar check for element.center omitted for brevity, but same inefficiency
        if (element.center && element.center.lon && element.center.lat) {
            const centerPt = turf.point([
                element.center.lon,
                element.center.lat,
            ]);
            const centerDistance = turf.distance(centerPoint, centerPt, {
                units: "meters",
            });
            if (centerDistance <= radiusInMeters) {
                const name = element.tags["name:en"] ?? element.tags["name"];
                const isChain = false;

                // INEFFICIENCY HERE: O(N) lookup over an array that grows
                if (
                    !isChain &&
                    response.features.find(
                        (feature) => feature.properties.name === name,
                    )
                ) {
                    return;
                }

                response.features.push(
                    turf.point([element.center.lon, element.center.lat], {
                        name,
                        id: element.id,
                    }),
                );
            }
        }
    });
    return response;
}

// Helper function to simulate the optimized solution
function findTentacleLocationsOptimized(elements, radiusInMeters) {
    const centerPoint = turf.point([0, 0]);
    const response = turf.points([]);
    const fallbackName = null;
    const seenNames = new Set(); // OPTIMIZATION HERE: Set for O(1) lookups

    elements.forEach((element) => {
        if (!element.tags) return;

        if (!element.tags["name"] && !element.tags["name:en"]) {
            return;
        }

        if (element.lat && element.lon) {
            const pt = turf.point([element.lon, element.lat]);
            const distance = turf.distance(centerPoint, pt, {
                units: "meters",
            });
            if (distance <= radiusInMeters) {
                const name = element.tags["name:en"] ?? element.tags["name"];
                const isChain = false;

                if (!isChain && seenNames.has(name)) {
                    return;
                }

                if (!isChain) seenNames.add(name);

                response.features.push(
                    turf.point([element.lon, element.lat], {
                        name,
                        id: element.id,
                    }),
                );
            }
        }

        // Similar check for element.center
        if (element.center && element.center.lon && element.center.lat) {
            const centerPt = turf.point([
                element.center.lon,
                element.center.lat,
            ]);
            const centerDistance = turf.distance(centerPoint, centerPt, {
                units: "meters",
            });
            if (centerDistance <= radiusInMeters) {
                const name = element.tags["name:en"] ?? element.tags["name"];
                const isChain = false;

                if (!isChain && seenNames.has(name)) {
                    return;
                }

                if (!isChain) seenNames.add(name);

                response.features.push(
                    turf.point([element.center.lon, element.center.lat], {
                        name,
                        id: element.id,
                    }),
                );
            }
        }
    });
    return response;
}

// Generate test data
const numElements = 10000;
const uniqueRatio = 0.5; // 50% unique names, 50% duplicates
const elements = [];
for (let i = 0; i < numElements; i++) {
    const isUnique = Math.random() < uniqueRatio;
    const nameId = isUnique ? i : Math.floor(i / 10); // create duplicates
    elements.push({
        id: i,
        lat: 0.001 * (Math.random() - 0.5), // near 0,0
        lon: 0.001 * (Math.random() - 0.5), // near 0,0
        tags: {
            name: `Location ${nameId}`,
        },
    });
}

const radiusInMeters = 50000; // Big enough to include everything

console.log(`Running benchmark with ${numElements} elements...`);

const startOriginal = performance.now();
const resOriginal = findTentacleLocationsOriginal(elements, radiusInMeters);
const endOriginal = performance.now();
const timeOriginal = endOriginal - startOriginal;

console.log(
    `Original implementation: ${timeOriginal.toFixed(2)} ms (found ${resOriginal.features.length} unique locations)`,
);

const startOptimized = performance.now();
const resOptimized = findTentacleLocationsOptimized(elements, radiusInMeters);
const endOptimized = performance.now();
const timeOptimized = endOptimized - startOptimized;

console.log(
    `Optimized implementation: ${timeOptimized.toFixed(2)} ms (found ${resOptimized.features.length} unique locations)`,
);
console.log(`Speedup: ${(timeOriginal / timeOptimized).toFixed(2)}x`);
