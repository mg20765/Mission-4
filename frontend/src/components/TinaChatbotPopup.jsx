import "./TinaChatbot.css";
import { TinaChatbot } from "./TinaChatbot";
import TinaMessagesList from "./TinaMessagesList";

export default function TinaChatbotPopup({
  showChatbot,
  setShowChatbot,
  resetChat,
  children,
}) {
  return (
    <>
      <button
        className={`tina-bubble ${showChatbot ? "hidden" : ""}`}
        onClick={() => setShowChatbot(true)}
        aria-label="Open chat with Tina"
      >
        <TinaChatbot />
      </button>

      <div className={`tina-window ${showChatbot ? "open" : ""}`}>
        <div className="tina-header">
          <div className="tina-header-left">
            <div className="tina-header-avatar">
              <TinaChatbot />
            </div>
            <div className="tina-header-text-group">
              <div className="tina-header-title">Tina from Turners</div>
              <div className="tina-header-status">Insurance Assistant</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="tina-close-btn"
              onClick={resetChat}
              aria-label="Start over"
              title="Start over"
            >
              ↺
            </button>
            <button
              className="tina-close-btn"
              onClick={() => setShowChatbot(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {children}
      </div>
    </>
  );
}
