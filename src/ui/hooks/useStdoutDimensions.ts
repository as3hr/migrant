import { useStdout } from "ink";
import { useEffect, useState } from "react";

export interface Dimensions {
    width: number;
    height: number;
}

export function useStdoutDimensions(): Dimensions {
    const { stdout } = useStdout();
    const [dimensions, setDimensions] = useState<Dimensions>({
        width: stdout?.columns || 80,
        height: stdout?.rows || 24,
    });

    useEffect(() => {
        if (!stdout) return;

        const handleResize = () => {
            setDimensions({
                width: stdout.columns || 80,
                height: stdout.rows || 24,
            });
        };

        stdout.on("resize", handleResize);
        return () => {
            stdout.off("resize", handleResize);
        };
    }, [stdout]);

    return dimensions;
}
