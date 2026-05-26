const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export const fetchFromGemini = async (): Promise<string> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `請產生3筆記帳資料，格式是JSON，結構如下：
              {
                "entries": [
                  {
                    "id": "1",
                    "team_id": "team-001",
                    "year": 2026,
                    "month": 5,
                    "day": 1,
                    "date": "2026-05-01",
                    "type": "income",
                    "stage": "current",
                    "confidence": "committed",
                    "category": "売上",
                    "amount": 500000,
                    "summary": "5月の売上",
                    "contact": "ABC株式会社",
                    "note": "",
                    "tags": "",
                    "member_id": "member-001",
                    "version": 1,
                    "created_at": 1748217600,
                    "created_by": "Joanna",
                    "updated_at": 1748217600,
                    "updated_by": "Joanna"
                  }
                ]
              }
              只回傳JSON，不要有其他文字。`
            }
          ]
        }
      ]
    })
  });

const data = await response.json();
  console.log(JSON.stringify(data)); // 加這行
  return data.candidates[0].content.parts[0].text;
};