import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const prompts = JSON.parse(fs.readFileSync("prompts.json"));

export async function createPersonas(medicalPlan, clientsRequests) {
    const stage1 = prompts[0];
    const system = stage1.system;
    const user = stage1.user
        .replace("{PROPOSAL}", medicalPlan)
        .replace("{PERSONAS}", clientsRequests);

    const result = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system,
        messages: [
            {
                role: 'user',
                content: user,
            },
        ],
    });
    const stripped = result.content[0].text.replace(/^```json\s*/, "").replace(/```$/, "").trim();

    const data = JSON.parse(stripped).roles;
    return data;
}

export async function simulate_persona(persona, medicalPlan) {
    const stage2 = prompts[1];
    const system = stage2.system
        .replace("{ROLE.title}", persona.title)
        .replace("{ROLE.department}", persona.department)
        .replace("{ROLE.lens}", persona.lens)
        .replace("{ROLE.focus}", persona.focus);

    const user = stage2.user
        .replace("{PROPOSAL}", medicalPlan);

    const result = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system,
        messages: [
            {
                role: 'user',
                content: user,
            },
        ],
    });

    const stripped = result.content[0].text.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    const data = JSON.parse(stripped);
    data.title = persona.title;
    data.department = persona.department;
    data.lens = persona.lens;
    data.focus = persona.focus;
    data.requested = persona.requested;
    return data;
}

export async function reassess(persona, medicalPlan, own_reaction, other_reactions) {
    const stage3 = prompts[2];
    const system = stage3.system
        .replace("{ROLE.title}", persona.title)
        .replace("{ROLE.department}", persona.department);


    const othersSlim = other_reactions.map(r => ({
        title: r.title,
        feeling: r.feeling,
        biggest_concern: r.biggest_concern,
    }));

    const user = stage3.user
        .replace("{PROPOSAL}", medicalPlan)
        .replace("{THIS_ROLE_STAGE2_REACTION}", JSON.stringify(own_reaction))
        .replace("{OTHER_ROLES_STAGE2_REACTIONS}", JSON.stringify(othersSlim));

    const result = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system,
        messages: [
            {
                role: 'user',
                content: user,
            },
        ],
    });

    const stripped = result.content[0].text.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    const data = JSON.parse(stripped);
    return data;
}

export async function final_concensus(medicalPlan, personas_discussion_result) {
    const stage4 = prompts[3];
    const system = stage4.system;

    const user = stage4.user
        .replace("{PROPOSAL}", medicalPlan)
        .replace("{ALL_REACTIONS}", JSON.stringify(personas_discussion_result))

    const result = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system,
        messages: [
            {
                role: 'user',
                content: user,
            },
        ],
    });

    const stripped = result.content[0].text.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    const data = JSON.parse(stripped);
    return data;
}