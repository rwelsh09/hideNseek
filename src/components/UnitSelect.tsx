import type { Units } from "@/maps/schema";

import { Select } from "./ui/select";

export const UnitSelect = ({
    unit,
    onChange,
    disabled,
}: {
    unit: Units;
    onChange: (unit: Units) => void;
    disabled?: boolean;
}) => {
    return (
        <Select
            trigger="Unit"
            options={{
                kilometers: "Kilometres",
                meters: "Metres",
            }}
            disabled={disabled}
            value={unit}
            onValueChange={onChange}
        />
    );
};
