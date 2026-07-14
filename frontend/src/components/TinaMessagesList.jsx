import React, { useState } from "react";

const TinaMessagesList = React.memo(function TinaMessagesList({
  chatHistory = [],
  isTyping,
  isBackendHealthy,
  messagesEndRef,
  showEmailPrompt,
  openEmailPrompt,
  closeEmailPrompt,
  submitEmailSummary,
  isSendingSummary,
  hasRecommendation,
}) {
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const showEmailOffer = hasRecommendation;

  const handleEmailFormSubmit = async (e) => {
    e.preventDefault();
    const error = await submitEmailSummary(emailInput);
    if (error) {
      setEmailError(error);
    } else {
      setEmailInput("");
      setEmailError("");
    }
  };

  return (
    <div className="tina-messages">
      {!isBackendHealthy && (
        <div
          className="tina-status-banner offline"
          style={{
            background: "#7f1d1d",
            color: "#fca5a5",
            fontSize: "11px",
            padding: "6px",
            textAlign: "center",
          }}
        >
          ⚠️ Offline Mode: Service connection limited.
        </div>
      )}

      {chatHistory.map((message, index) => (
        <div
          key={message.id || `msg-${index}`}
          className={`tina-msg ${message.role === "assistant" ? "tina" : "user"}`}
        >
          <div className="tina-avatar">
            {message.role === "assistant" ? "T" : "U"}
          </div>
          <div className="tina-bubble-text">{message.content}</div>
        </div>
      ))}

      {isTyping && (
        <div className="tina-msg tina">
          <div className="tina-avatar">T</div>
          <div className="tina-bubble-text">
            <div className="tina-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      {showEmailOffer && !isTyping && !showEmailPrompt && (
        <div className="tina-summary">
          <button
            type="button"
            className="tina-send-btn"
            style={{ width: "auto", borderRadius: "14px", padding: "10px 16px" }}
            onClick={openEmailPrompt}
            disabled={isSendingSummary}
          >
            {isSendingSummary ? "Sending..." : "📧 Email me this quote"}
          </button>
        </div>
      )}

      {showEmailPrompt && (
        <form className="tina-email-form" onSubmit={handleEmailFormSubmit}>
          <input
            type="email"
            required
            autoFocus
            placeholder="you@example.com"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setEmailError("");
            }}
            className="tina-input"
            disabled={isSendingSummary}
          />
          {emailError && (
            <div style={{ color: "#fca5a5", fontSize: "12px" }}>
              {emailError}
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              className="tina-send-btn"
              style={{
                width: "auto",
                borderRadius: "14px",
                padding: "8px 14px",
              }}
              disabled={isSendingSummary}
            >
              {isSendingSummary ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              onClick={closeEmailPrompt}
              disabled={isSendingSummary}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "14px",
                padding: "8px 14px",
                color: "#f8fafc",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div
        className="tina-disclaimer"
        style={{
          fontSize: "11px",
          color: "#64748b",
          textAlign: "center",
          padding: "12px 8px 4px 8px",
          borderTop: "1px solid rgba(184, 206, 209, 0.03)",
          marginTop: "auto",
        }}
      >
        ℹ️{" "}
        <em>
          Tina is an automated assistant tool and does not provide formal
          financial or legal advice. Refer to turners.co.nz for explicit policy
          wording guidelines.
        </em>
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
});

export default TinaMessagesList;
