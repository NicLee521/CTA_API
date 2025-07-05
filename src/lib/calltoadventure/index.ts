import { z } from "zod";
import adversaries from "./adversaries.js"
import allies from "./allies.js"
import challenges from "./challenges.js"
import motivations from "./motivations.js"
import origins from "./origins.js"
import traits from "./traits.js"
import destinies from "./destinies.js"

type ChallengeKey = keyof typeof challenges;
type AdversaryKey = keyof typeof adversaries;
type AllyKey = keyof typeof allies;
type TraitKey = keyof typeof traits;
type MotivationKey = typeof motivations[number];
type OriginKey = typeof origins[number];
type DestinyKey = typeof destinies[number];

const baseStory = {
    early: {
        name: '' as string,
        origin: '' as OriginKey,
        challenges: [] as ChallengeKey[],
        traits: [] as TraitKey[],
        allies: [] as AllyKey[],
        adversaries: [] as AdversaryKey[]
    },
    middle: {
        motivation: '' as MotivationKey,
        challenges: [] as ChallengeKey[],
        traits: [] as TraitKey[],
        allies: [] as AllyKey[],
        adversaries: [] as AdversaryKey[]
    },
    late: {
        destiny: '' as DestinyKey,
        challenges: [] as ChallengeKey[],
        traits: [] as TraitKey[],
        allies: [] as AllyKey[],
        adversaries: [] as AdversaryKey[]
    }
}

const allCards = [
    ...Object.keys(adversaries),
    ...Object.keys(allies),
    ...Object.keys(challenges),
    ...motivations,
    ...origins,
    ...Object.keys(traits),
    ...destinies
];

export {
    baseStory,
    allCards,
    adversaries,
    allies,
    challenges,
    motivations,
    origins,
    traits,
    destinies,
};
