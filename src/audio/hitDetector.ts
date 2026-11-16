export function createHitDetector(margin = 0.08, cooldownFrames = 6) {
    let average = 0;
    let last = 0;
    let cooldown = 0;

    return (level: number): boolean => {
        average += (level - average) * 0.05;

        const rising = level > last;
        last = level;
        cooldown = Math.max(0, cooldown -1);

        const isHit = rising && level - average > margin && level > 0.1 && cooldown === 0;
        if (isHit) cooldown = cooldownFrames;

        return isHit;
    };
}