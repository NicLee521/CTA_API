import unTypedadversaries from "./adversaries"
import unTypedallies from "./allies"
import unTypedchallenges from "./challenges"
import motivations from "./motivations"
import origins from "./origins"
import unTypedtraits from "./traits"
import destinies from "./destinies"

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