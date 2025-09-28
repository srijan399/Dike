import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { generate } from '@/lib/generate';

type PredictionInput = {
    title?: string;
    description?: string;
    entities?: string[];
    timeframe?: string;
    sourceHints?: string[];
};

type FactCheckRequest = {
    prediction: PredictionInput;
    resolution: string; // free-form text describing the resolved outcome
};

const GOOGLE_NEWS_RSS = (query: string) => `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as FactCheckRequest;
        if (!body || !body.prediction || !body.resolution) {
            return NextResponse.json({ ok: false, error: 'prediction and resolution are required' }, { status: 400 });
        }

        const { prediction, resolution } = body;

        // 1) Use LLM to craft a high-signal news search query
        const queryPrompt = [
            'You are generating a concise, high-signal news search query (max 12 words).',
            'Target reliable mainstream sources. Prefer named entities, dates, places.',
            'Do not add quotes or punctuation besides spaces. No explanations.',
            '---',
            `Prediction Title: ${prediction.title || ''}`,
            `Description: ${prediction.description || ''}`,
            `Entities: ${(prediction.entities || []).join(', ')}`,
            `Timeframe: ${prediction.timeframe || ''}`,
            `Source hints: ${(prediction.sourceHints || []).join(', ')}`,
            `Resolution (what happened): ${resolution}`,
            'Now output ONLY the query string:'
        ].join('\n');

        const query = (await generate(queryPrompt)).trim().replace(/^"|"$/g, '');

        // 2) Fetch Google News RSS results for the query
        const parser = new Parser();
        const feedUrl = GOOGLE_NEWS_RSS(query);
        const feed = await parser.parseURL(feedUrl);

        const topItems = (feed.items || []).slice(0, 10).map((item: any) => {
            return {
                title: item.title || '',
                contentSnippet: (item as any).contentSnippet || item.contentSnippet || '',
                link: item.link || '',
                isoDate: item.isoDate || '',
                creator: (item as any).creator || '',
                source: (item as any).source || '',
            };
        });

        if (topItems.length === 0) {
            return NextResponse.json({ ok: true, query, verdict: false, reason: 'No news found for query' }, { status: 200 });
        }

        // 3) Ask LLM to judge whether the resolution is fair/true/honest given the snippets
        const evidenceText = topItems.map((i: any, idx: any) => {
            return `#${idx + 1} Title: ${i.title}\nSnippet: ${i.contentSnippet}\nLink: ${i.link}`;
        }).join('\n\n');

        const judgePrompt = [
            'You are a rigorous fact checker.',
            'Given the prediction context and news snippets, decide if the stated resolution is accurate, fair, and honest.',
            'Answer strictly in JSON with fields {"verdict": boolean, "confidence": number (0-1), "reason": string}.',
            'Be concise. If evidence is insufficient or contradictory, verdict should be false.',
            '---',
            `Prediction Title: ${prediction.title || ''}`,
            `Description: ${prediction.description || ''}`,
            `Resolution: ${resolution}`,
            '--- Evidence from news snippets (may be partial):',
            evidenceText,
            '---',
            'Now output ONLY the JSON. No extra text.'
        ].join('\n');

        const judgementRaw = await generate(judgePrompt);

        let verdict = false;
        let confidence = 0;
        let reason = 'Unable to parse model output';
        try {
            const parsed = JSON.parse(judgementRaw);
            verdict = Boolean(parsed.verdict);
            confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0;
            reason = typeof parsed.reason === 'string' ? parsed.reason : reason;
        } catch (_) {
            // Try a secondary minimal parser: look for true/false in text
            const lowered = judgementRaw.toLowerCase();
            if (lowered.includes('"verdict": true') || lowered.includes('verdict: true') || lowered.includes('true')) {
                verdict = true;
                reason = 'Heuristic positive from unparsed output';
            }
        }

        return NextResponse.json({ ok: true, query, verdict, confidence, reason, feedCount: topItems.length, samples: topItems.slice(0, 3) }, { status: 200 });
    } catch (error) {
        console.error('fact-check error', error);
        return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}


