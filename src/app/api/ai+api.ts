export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, exerciseData } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://fitverse.app',
        'X-Title': 'FitVerse',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [
          {
            role: 'system',
            content: `You are a fitness coach.
You are given an exercise, provide clear instructions on how to perform the exercise. Include if any equipment is required.
Explain the exercise in detail and for a beginner.

The exercise name is: {exerciseName}

Keep it short and concise. Use markdown formatting.

Use the following format:

## Equipment Required

## Instructions

### Tips

### Variations

### Safety

keep spacing between the headings and the content.

Always use headings and subheadings.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({
          error: 'Failed to get AI guidance',
          details: errorData,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const guidance = data.choices[0]?.message?.content || 'Unable to generate guidance';

    return new Response(
      JSON.stringify({ guidance }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}