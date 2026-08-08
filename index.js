import fs from 'fs';
import { fileURLToPath } from 'url';
import { createPersonas, simulate_persona, reassess, final_concensus } from './calls.js';

export async function generate_report(plan, requests) {
    const personas = await createPersonas(plan, requests);

    const personas_result = await Promise.all(
        personas.map(persona => simulate_persona(persona, plan))
    );

    // each persona only needs peers' summary fields, not their full reaction
    const slimmed_responses = personas_result.map(r => ({
        title: r.title,
        feeling: r.feeling,
        biggest_concern: r.biggest_concern,
    }));

    const personas_reassessed = await Promise.all(
        personas.map(persona => {
            const own_reaction = personas_result.find(r => r.title === persona.title);
            const other_reactions = slimmed_responses.filter(r => r.title !== persona.title);
            return reassess(persona, plan, own_reaction, other_reactions);
        })
    );

    // reassess() returns only the updated fields — graft them onto the original reaction objects
    for (const persona_response of personas_result) {
        const updated_opinions = personas_reassessed.find(r => r.title === persona_response.title);
        persona_response.position_changed = updated_opinions.position_changed;
        persona_response.updated_rating = updated_opinions.updated_rating;
        persona_response.updated_feeling = updated_opinions.updated_feeling;
        persona_response.reassessment = updated_opinions.reassessment;
    }

    const final_verdict = await final_concensus(plan, personas_result);

    fs.writeFileSync('reactions.json', JSON.stringify(personas_result, null, 2));
    fs.writeFileSync('final_verdict.json', JSON.stringify(final_verdict, null, 2));

    return { reactions: personas_result, final_verdict };
}
