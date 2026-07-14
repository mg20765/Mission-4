import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import chatReply from "../components/chatReply";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useTinaChat() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [isSendingSummary, setIsSendingSummary] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [hasRecommendation, setHasRecommendation] = useState(false);

  const initalGreeting = useMemo(
    () => [
      {
        role: "assistant",
        content:
          "I'm Tina, I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
      },
    ],
    [],
  );
  const [chatHistory, setChatHistory] = useState(initalGreeting);
  const messageEndRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [chatHistory, isTyping]);
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Health check response:", data);
      } catch {
        console.warn("Health check failed. Running in offline fallback mode.");
        if (isMounted.current) {
          setIsBackendHealthy(false);
        }
      }
    };

    checkSystemHealth();
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (!userMessage || userMessage.trim() === "") {
        console.error("Blocked request: userMessage state is empty or null.");
        return;
      }

      const cleanMsg = DOMPurify.sanitize(userMessage, {
        ALLOWED_TAGS: [],
      }).trim();
      if (!cleanMsg) return;
      setUserMessage("");

      const newUserMsg = { role: "user", content: cleanMsg };
      const updatedHistory = [...chatHistory, newUserMsg];

      setChatHistory(updatedHistory);
      setIsTyping(true);

      if (!isBackendHealthy) {
        setTimeout(() => {
          if (isMounted.current) {
            setChatHistory((prev) => [
              ...prev,
              {
                role: "assistant",
                content:
                  "My server is currently undergoing maintenance. Please try again shortly.",
              },
            ]);
            setIsTyping(false);
          }
        }, 1000);
        return;
      }

      const totalUserTurns = updatedHistory.filter(
        (m) => m.role === "user",
      ).length;
      const payloadHistory = [...updatedHistory];

      if (totalUserTurns >= 4) {
        payloadHistory.push({
          role: "system",
          content:
            "[SYSTEM CONTEXT: The conversation threshold limit has been met. Proceed to your final recommendation routine and conclude.]",
        });
      }

      await chatReply({
        payloadHistory,
        API_BASE_URL,
        setChatHistory,
        setIsTyping,
        isMounted,
      });
    },
    [userMessage, chatHistory, isBackendHealthy],
  );

  const openEmailPrompt = useCallback(() => {
    const lastTinaMessage = [...chatHistory]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastTinaMessage) return;
    setShowEmailPrompt(true);
  }, [chatHistory]);

  const closeEmailPrompt = useCallback(() => {
    setShowEmailPrompt(false);
  }, []);

  const submitEmailSummary = useCallback(async (email) => {
    const lastTinaMessage = [...chatHistory]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastTinaMessage) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    setShowEmailPrompt(false);
    setIsSendingSummary(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, summary: lastTinaMessage.content }),
      });

      if (!response.ok) throw new Error("Failed to send summary email");

      if (isMounted.current) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Done! I've sent your summary to ${email}.`,
          },
        ]);
      }
    } catch (err) {
      console.error("Send summary error:", err);
      if (isMounted.current) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error while sending your email.",
          },
        ]);
      }
    } finally {
      if (isMounted.current) {
        setIsSendingSummary(false);
      }
    }
    return null;
  }, [chatHistory]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  useEffect(() => {
    if (
      !hasRecommendation &&
      chatHistory.some(
        (m) => m.role === "assistant" && m.content?.includes("NEXT_STEPS"),
      )
    ) {
      setHasRecommendation(true);
    }
  }, [chatHistory, hasRecommendation]);

  const resetChat = useCallback(() => {
    setChatHistory(initalGreeting);
    setUserMessage("");
    setIsTyping(false);
    setShowEmailPrompt(false);
    setIsSendingSummary(false);
    setHasRecommendation(false);
  }, [initalGreeting]);

  return {
    showChatbot,
    setShowChatbot,
    chatHistory,
    userMessage,
    setUserMessage,
    isTyping,
    isBackendHealthy,
    isSendingSummary,
    showEmailPrompt,
    hasRecommendation,
    messagesEndRef: messageEndRef,
    handleSubmit,
    openEmailPrompt,
    closeEmailPrompt,
    submitEmailSummary,
    resetChat,
  };
}
