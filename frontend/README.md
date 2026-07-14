# Turners Cars - Tina Chatbot Integration

A modern, responsive React interface featuring **Tina**, a glassmorphic AI Popout chatbot assistant designed for Turners Cars. The application includes dynamic backdrop blurring, real-time message streaming statuses, and system health checks.

## 🚀 Features

- **Glassmorphic AI Popout Station:** An elegant, floating chatbot interface (`TinaChatbotPopup`).
- **Cinematic Backdrop Blur:** Automatically dims and blurs the background layout when the chatbot is active for an immersive user experience.
- **State-Driven Messaging:** Managed dynamically via a custom React hook (`useTinaChat`), monitoring message logs, streaming inputs, and DOM scrolling focus.
- **Backend Health Monitoring:** Real-time graceful degradation fallback (e.g., input disables and changes placeholder text if the server goes offline).

## 📂 Project Structure Snapshot

Based on your main entry points, ensure your `/src` folder structure is aligned as follows:

```text
src/
├── components/
│   ├── TinaChatbotPopup.js       # Core wrapper panel layout
│   ├── TinaMessagesList.js       # Message bubble stream engine
│   └── TinaChatbot.css           # UI layout variables & glassmorphism styling
├── hooks/
│   └── useTinaChat.js            # Chat engine, form submissions, & API states
├── App.js                        # Layout Hub
└── App.css                       # Landing page layout styling
🛠️ Usage Example
The component handles standard layout wrappers seamlessly alongside your global navigation headers:

JavaScript
import React from "react";
import TinaChatbotPopup from "./src/components/TinaChatbotPopup";
import TinaMessagesList from "./src/components/TinaMessagesList";
import { useTinaChat } from "./hooks/useTinaChat";

function App() {
  const chat = useTinaChat();

  // Renders the backdrop, content panels, message maps, and submission logic
}
🧪 Hook State Values (useTinaChat)
The custom hook exposes the following reactive properties required by the UI:

Property	Type	Description
showChatbot	Boolean	Controls the visibility of the popup panel and blurred backdrop sheet.
setShowChatbot	Function	Toggles or hard-sets the chatbot modal visibility.
chatHistory	Array	List of mapped messages between user and AI agent.
isTyping	Boolean	Locks the input row and shows dynamic typing loaders while true.
isBackendHealthy	Boolean	Verifies remote service uptime; switches input placeholders automatically.
userMessage	String	The current controlled string inside the layout input text box.
handleSubmit	Function	Synthetic form submission router handling network requests.
messagesEndRef	Ref Object	Automatically manages viewport scroll snapping to the latest chat bubble.
🎨 Stylesheets
App.css: Governs page-wide layouts, landing content layouts (.turners-landing-header), and standard wrappers.

TinaChatbot.css: Encapsulates heavy stylistic choices like .tina-backdrop-blur, glassmorphic transparency filters, variables for button active states, and custom responsive mobile rows.
```
