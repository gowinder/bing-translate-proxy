const express = require("express");
require("dotenv").config();
const { translate, MET } = require("bing-translate-api");
const req = require("express/lib/request");
const { VERSION } = require("./version");

const app = express();
const port = process.env.PORT || 3000;
const apiToken = process.env.API_TOKEN;
const LINES_PER_CHUNK = parseInt(process.env.LINES_PER_CHUNK) || 10;
const TRANSLATOR_TEXT_SUBSCRIPTION_KEY = process.env.TRANSLATOR_TEXT_SUBSCRIPTION_KEY;
const TRANSLATOR_TEXT_REGION = process.env.TRANSLATOR_TEXT_REGION;
const TRANSLATOR_TEXT_ENDPOINT = process.env.TRANSLATOR_TEXT_ENDPOINT;

// 解析 JSON 请求体
app.use(express.json());

// Token 认证中间件
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token || token !== `Bearer ${apiToken}`) {
    // console.log(`toke: ${token}, apiToken: ${apiToken}`);
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// 定义翻译接口
app.post("/translate", async (req, res) => {
  const { text, target_language } = req.body;
  console.log("request, text:", text, ", target_language: ", target_language);
  if (TRANSLATOR_TEXT_SUBSCRIPTION_KEY) {
    try {
      const result = await MET.translate(text, null, target_language, {
        'Ocp-Apim-Subscription-Key': TRANSLATOR_TEXT_SUBSCRIPTION_KEY
      });
      console.log("MET result: ", JSON.stringify(result));
      // console.log('MET result[0]: ', result[0].translations[0].text);
      res.json({ translation: result[0].translations[0].text });
    } catch (error) {
      console.error("MET Translate API error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  } else {

    try {
      const result = await translate(text, null, target_language);
      console.log("result: ", result);
      res.json({ translation: result.translation });
    } catch (error) {
      console.error("Bing Translate API error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  }
});

// 新增字幕翻译接口
app.post("/translate-subtitle", async (req, res) => {
  const { subtitle, target_language } = req.body;
  console.log("Subtitle translation request, target_language:", target_language);

  try {
    const lines = subtitle.split('\n');
    const chunks = [];
    for (let i = 0; i < lines.length; i += LINES_PER_CHUNK) {
      chunks.push(lines.slice(i, i + LINES_PER_CHUNK).join('\n'));
    }

    console.log("chunks: ", chunks.length);

    const translatedChunks = await Promise.all(
      chunks.map(async (chunk, index) => {
        let result;
        try {
          result = await translate(chunk, null, target_language);
          return result.translation;
        } catch (error) {
          console.error(`翻译错误在第 ${index + 1} 段：`, error);
          console.log(`原始段落：\n${chunk}`);
          console.log(`result: ${result}`);
          return chunk; // 返回原始段落
        }
      })
    );

    console.log("翻译完成的块数：", translatedChunks.length);

    const translatedSubtitle = translatedChunks.join('\n');

    res.json({ translation: translatedSubtitle });
  } catch (error) {
    console.error("字幕翻译过程中发生错误：", error);
    res.status(500).json({ error: "字幕翻译失败" });
  }
});

app.get("/version", async (req, res) => {
  res.status(200).send(VERSION);
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
