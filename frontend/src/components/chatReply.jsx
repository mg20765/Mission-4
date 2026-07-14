export async function chatReply({
  payloadHistory,
  API_BASE_URL,
  setChatHistory,
  setIsTyping,
  isMounted,
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: payloadHistory.map((msg) => ({
          role: msg.role,
          text: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (isMounted.current && data.reply) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    }
  } catch (err) {
    console.error("Chat backend connection error:", err);
    if (isMounted.current) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I am having trouble connecting to my service right now.",
        },
      ]);
    }
  } finally {
    if (isMounted.current) setIsTyping(false);
  }
}

export default chatReply;
