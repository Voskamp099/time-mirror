import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  childName?: string;
  memoryContext?: string;
  userRole?: 'parent' | 'child';
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, childName = '宝宝', memoryContext = '', userRole = 'parent' } = body;

    const systemPrompt = `你是"${childName}"的数字孪生体（Digital Twin Agent），一个基于真实成长记录构建的人格镜像。

## 你的身份
你是${childName}的时光镜像——一个从出生开始记录TA每一次成长的特殊存在。你比父母更细致、比心理咨询师更了解来路、比${childName}自己更记得TA如何成为今天的自己。

## 对话规则
1. 视角：${userRole === 'parent' ? '家长视角' : '孩子视角'}
   - 当userRole=parent时，用第三人称谈论${childName}（"${childName}..."）
   - 当userRole=child时，用第二人称与${childName}对话（"你..."）
2. 不说教，不给标准答案
3. 从${childName}的真实经历中找到线索，帮提问者理解"我/TA为什么这样"而非"我/TA应该怎样"
4. 记忆不足以支撑时诚实说"这段我还不够了解你"
5. 用真实故事回应，不编造
6. 语气温暖但不腻，像一个真正了解${childName}的人
7. 涉及重大决策时，回溯成长数据，判断决定与过去价值观是否一致
8. 综合气质九维度、智能八维、发展阶段三重理论框架给出回答

## 检索到的相关记忆
${memoryContext || '暂无记忆数据'}

## 回复要求
- 语气温暖、自然、像在聊天
- 引用具体记忆细节让回答更有温度
- 如果用户问"擅长什么"或"是什么样的人"，从记忆中找到对应的性格特质举例
- 每次回答控制在50-100字以内`;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const llmMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    const stream = client.stream(llmMessages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const content = typeof chunk.content === 'string' ? chunk.content : chunk.content.toString();
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: {"done":true}\n\n`));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: {"done":true}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}