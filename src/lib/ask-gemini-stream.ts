export async function askGeminiStream(
  prompt: string,
  onMessage: (chunk: string) => void,
  chatId?: string
): Promise<void> {
  const response = await fetch(`/api/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ prompt, chat_id: chatId }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Error al consultar la IA");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const content = line.slice(5);

        if (content === "") {
          onMessage("\n");
        } else {
          onMessage(content);
        }
      }
    }
  }

  if (buffer.startsWith("data:")) {
    const content = buffer.slice(5);
    onMessage(content === "" ? "\n" : content);
  }
}
