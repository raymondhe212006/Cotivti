import fs from 'fs';
import { createPersonas, simulate_persona } from './calls.js';

const testInput = JSON.parse(fs.readFileSync('test_input.json'));

const test_prompt = testInput.proposal;
const clientsRequests = testInput.personas;


async function generate_report(plan, requests) {
    const personas = await createPersonas(plan, requests);

    const personas_result = await Promise.all(
        personas.map(persona => simulate_persona(persona, plan))
    );

    console.log(personas_result);
}

generate_report(test_prompt, clientsRequests);
