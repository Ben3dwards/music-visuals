export function hashSeed(seed: string): number {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function createRandom(seed: string) {
    let state = hashSeed(seed);

    function next(): number {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    function range(min: number, max: number): number {
        return min + next() * (max - min);
    }

    function int(min: number, max: number): number {
        return Math.floor(range(min, max + 1));
    }

    function pick<T>(items: readonly T[]): T {
        return items[Math.floor(next() * items.length)];
    }

    return { next, range, int, pick };
}

export function randomSeed(): string {
    return Math.random().toString(36).slice(2, 8);
}

export type Random = ReturnType<typeof createRandom>;