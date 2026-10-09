const ZENNE_NOITU_API_KEY = process.env.ZENNE_NOITU_API_KEY || 'kira_efd52d354149ba141290f40cdb08e0fd';
const ZENNE_NOITU_API_ENDPOINT = process.env.ZENNE_NOITU_API_ENDPOINT || 'https://kiraai.vn/api/v1';
const ZENNE_NOITU_DEFAULT_MODEL = process.env.ZENNE_NOITU_DEFAULT_MODEL || 'qwen3.8-flash-free';
const ZENNE_NOITU_DISPLAY_NAME = 'zenne-noitu';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, prompt, model } = req.body || {};
  const query = String(question || prompt || '').trim();

  if (!query) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung câu hỏi.' });
  }

  const selectedModel = model || ZENNE_NOITU_DEFAULT_MODEL;
  const endpoint = ZENNE_NOITU_API_ENDPOINT.replace(/\/$/, '') + '/chat/completions';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + ZENNE_NOITU_API_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'Zenne-Web-AI/1.0',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'Bạn là Trợ lý AI thông minh, thân thiện của hệ thống Nối Từ (Zenne). Hãy trả lời câu hỏi của người dùng một cách ngắn gọn, rõ ràng, chính xác và nhiệt tình bằng tiếng Việt.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data?.error?.message || data?.error || ('Lỗi từ AI server (HTTP ' + response.status + ')');
      return res.status(response.status).json({ error: errMsg });
    }

    const answer = data?.choices?.[0]?.message?.content || 'Không có câu trả lời.';
    return res.status(200).json({
      ok: true,
      answer,
      model: ZENNE_NOITU_DISPLAY_NAME,
    });
  } catch (error) {
    console.error('[API /api/pub/ai-ask] Error:', error);
    return res.status(500).json({ error: 'Không thể kết nối đến zenne-noitu API. Vui lòng thử lại sau.' });
  }
}
