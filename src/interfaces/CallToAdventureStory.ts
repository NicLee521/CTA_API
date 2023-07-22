type Challenge = {
    challenge: string;
    choice: string;
}

interface Early {
    name: string;
    origin: string;
    challenges?: Array<Challenge>;
    traits?: Array<string>;
    allies?: Array<string>;
    adversaries?: Array<string>
}

interface Middle {
    motivation: string;
    challenges?: Array<Challenge>;
    traits?: Array<string>;
    allies?: Array<string>;
    adversaries?: Array<string>
}

interface Late {
    destiny: string;
    challenges?: Array<Challenge>;
    traits?: Array<string>;
    allies?: Array<string>;
    adversaries?: Array<string>
}

export default interface CallToAdventureStory {
    early: Early;
    middle: Middle;
    late: Late;
}

