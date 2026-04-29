import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function analyzeImage() {
  const zai = await ZAI.create();

  // Read image and convert to base64
  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/pasted_image_1777371878835.png');
  const base64Image = imageBuffer.toString('base64');

  console.log('Menganalisis gambar...');

  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analisis gambar ini dengan detail. Jelaskan apa yang terjadi, apa error yang muncul, dan bagaimana cara memperbaikinya. Jelaskan dalam bahasa Indonesia.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    thinking: { type: 'disabled' }
  });

  console.log('\n=== HASIL ANALISIS ===\n');
  console.log(response.choices[0]?.message?.content);
}

analyzeImage().catch(console.error);
