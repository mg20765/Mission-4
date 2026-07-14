/**
 * Generates a sanitized HTML email template for insurance summaries.
 * @param {string} summary - The text content to be included in the summary box.
 * @returns {string} The complete HTML document as a string.
 */
function getEmailHTML(summary) {
  // Helper function to prevent XSS by escaping HTML special characters
  const escapeHTML = (str) => {
    if (!str) return "";
    return String(str).replace(
      /[&<>"']/g,
      (s) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[s],
    );
  };

  const safeSummary = escapeHTML(summary);

  return `
  <!DOCTYPE html>
  <html lang="en">  
  <head>
    <meta charset="UTF-8">  
    <style>
      
    </style>
  </head>
  <body>
    <div class="email-container">
      <h2 class="email-header">Your Turners Insurance Summary</h2>
      
      <p>Kia ora,</p>
      <p>Thank you for chatting with Tina, our automated digital insurance consultant. Here is your personalized policy recommendation breakdown:</p>
      
      <div class="summary-box">
        ${safeSummary}
      </div>
      
      <p>To finalize your coverage, visit us online at <a href="https://turners.co.nz" class="turners-link">turners.co.nz</a> or speak to an agent at your nearest branch.</p>
      
      <hr class="divider" />
      
      <p class="disclaimer">
        Disclaimer: This automated message is a policy suggestion helper tool and does not constitute formal compliance-breaking financial or legal advice.
      </p>
    </div>
  </body>
  </html>
  `.trim();
}

module.exports = getEmailHTML;
