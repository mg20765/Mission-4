import TinaMessagesList from "./src/components/TinaMessagesList.jsx";
import { useTinaChat } from "./src/hooks/useTinaChat.js";
import TinaChatbotPopup from "./src/components/TinaChatbotPopup.jsx";

export default function App() {
  const chat = useTinaChat();

  if (!chat) {
    return null;
  }

  return (
    <div className="pageWrapper">
      <div className="turners-landing-header">
        <h1>Welcome to Turners Cars</h1>
        <p>
          Come in and Find your next vehicle or browse our insurance policies
          online
        </p>
      </div>

      {chat.showChatbot && (
        <div
          className="tina-backdrop-blur"
          role="button"
          aria-label="Close chatbot"
          tabIndex={0}
          onClick={() => chat.setShowChatbot(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              chat.setShowChatbot(false);
            }
          }}
        />
      )}

      <TinaChatbotPopup
        showChatbot={chat.showChatbot}
        setShowChatbot={chat.setShowChatbot}
        resetChat={chat.resetChat}
      >
        <TinaMessagesList
          chatHistory={chat.chatHistory}
          isTyping={chat.isTyping}
          isBackendHealthy={chat.isBackendHealthy}
          messagesEndRef={chat.messagesEndRef}
          showEmailPrompt={chat.showEmailPrompt}
          openEmailPrompt={chat.openEmailPrompt}
          closeEmailPrompt={chat.closeEmailPrompt}
          submitEmailSummary={chat.submitEmailSummary}
          isSendingSummary={chat.isSendingSummary}
          hasRecommendation={chat.hasRecommendation}
        />

        <form className="tina-input-row" onSubmit={chat.handleSubmit}>
          <input
            type="text"
            aria-label="Chat message"
            required
            placeholder={
              chat.isBackendHealthy
                ? "Type your response here..."
                : "Service offline..."
            }
            value={chat.userMessage}
            onChange={(e) => chat.setUserMessage(e.target.value)}
            className="tina-input"
            disabled={chat.isTyping || !chat.isBackendHealthy}
          />

          <button
            type="submit"
            className="tina-send-btn"
            disabled={
              !chat.userMessage.trim() ||
              chat.isTyping ||
              !chat.isBackendHealthy
            }
            aria-label="Send message"
          >
            <svg
              viewBox="0 0 24 24"
              style={{ width: "18px", height: "18px", fill: "white" }}
              aria-hidden="true"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </TinaChatbotPopup>
    </div>
  );
}
