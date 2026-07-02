// api/claude.js
// دالة Serverless بتشتغل على Vercel. مهمتها الوحيدة: تستقبل الطلب من الفرونت إند،
// تحط عليه الـ API key (اللي متخزّن كـ Environment Variable على Vercel ومش ظاهر أبدًا للمتصفح)،
// وتبعته لـ Anthropic API، وترجّع الرد زي ما هو.

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY مش متظبطة على السيرفر" });
    return;
  }

  // حماية بسيطة اختيارية: لو عايز تمنع أي حد برة الرابط يستخدم الـ endpoint،
  // ظبط APP_SECRET في Vercel وخلي الفرونت إند يبعته في header.
  const appSecret = process.env.APP_SECRET;
  if (appSecret) {
    const provided = req.headers["x-app-secret"];
    if (provided !== appSecret) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }
  }

  const { system, messages, max_tokens } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages مطلوبة" });
    return;
  }

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 2000,
        system,
        messages,
      }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      res.status(apiRes.status).json({ error: data });
      return;
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "حصل خطأ غير متوقع" });
  }
};
