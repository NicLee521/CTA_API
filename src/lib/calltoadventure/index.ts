import unTypedadversaries from "./adversaries.js"
import unTypedallies from "./allies.js"
import unTypedchallenges from "./challenges.js"
import motivations from "./motivations.js"
import origins from "./origins.js"
import unTypedtraits from "./traits.js"
import destinies from "./destinies.js"

let adversaries = unTypedadversaries as any; 
let allies = unTypedallies as any; 
let challenges = unTypedchallenges as any; 
let traits = unTypedtraits as any;
let baseStory = {
    early: {
        name: '',
        origin: '',
        challenges: [],
        traits: [],
        allies: [],
        adversaries: []
    },
    middle: {
        motivation: '',
        challenges: [],
        traits: [],
        allies: [],
        adversaries: []
    },
    late: {
        destiny: '',
        challenges: [],
        traits: [],
        allies: [],
        adversaries: []
    }
}
export {
    adversaries,
    allies,
    challenges,
    motivations,
    origins,
    traits,
    destinies,
    baseStory
}