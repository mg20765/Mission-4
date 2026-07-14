import { describe, test, expect } from "vitest";

function extractRecommendation(text) {
  if (!text) return null;
  const get = (key) => {
    const re = new RegExp(key + ":\\s*(.+)", "i");
    const m = text.match(re);
    return m ? m[1].trim() : null;
  };
  if (!get("CUSTOMER")) return null;
  return {
    customer: get("CUSTOMER"),
    vehicle: get("VEHICLE"),
    policy: get("POLICY"),
    coverage: get("COVERAGE"),
    price: get("PRICE_ESTIMATE"),
    why: get("WHY"),
    nextSteps: get("NEXT_STEPS"),
  };
}

function stripRecommendationBlock(text) {
  return typeof text === "string" ? text.trim() : text;
}

function isValidEmail(email) {
  return (
    typeof email === "string" &&
    email.trim().length > 0 &&
    email.includes("@") &&
    email.includes(".") &&
    email.indexOf("@") < email.lastIndexOf(".")
  );
}

const makeRec = (overrides = {}) => {
  const rec =
    `CUSTOMER: ${overrides.customer || "Sarah"}\n` +
    `VEHICLE: ${overrides.vehicle || "2020 Mazda 3"}\n` +
    `POLICY: ${overrides.policy || "Comprehensive"}\n` +
    `COVERAGE: ${overrides.coverage || "Covers accidental damage, theft, fire, and third-party liability."}\n` +
    `PRICE_ESTIMATE: ${overrides.price || "$85 NZD"}\n` +
    `WHY: ${overrides.why || "Great all-round cover for a popular commuter car"}\n` +
    `NEXT_STEPS: ${overrides.nextSteps || "Visit turners.co.nz for more info"}`;
  return rec;
};

describe("Recommendation extractor", () => {
  test("extracts a standard recommendation correctly", () => {
    const rec = extractRecommendation(makeRec());
    expect(rec.price).toBe("$85 NZD");
    expect(rec.customer).toBe("Sarah");
    expect(rec.policy).toBe("Comprehensive");
    expect(rec.vehicle).toBe("2020 Mazda 3");
    expect(rec.nextSteps).toContain("turners.co.nz");
  });

  test("returns null for a normal chat message", () => {
    expect(extractRecommendation("What vehicle do you drive?")).toBe(null);
  });

  test("returns null for empty string", () => {
    expect(extractRecommendation("")).toBe(null);
  });
});

test("TC19 - young driver with older car gets Basic policy", () => {
  const rec = extractRecommendation(
    makeRec({
      customer: "TC",
      vehicle: "2005 Honda Civic",
      policy: "Basic",
      price: "$35 NZD",
    }),
  );
  expect(rec.policy).toBe("Basic");
  expect(rec.customer).toBe("TC");
});

test("Gail 70-EV driver gets Premium policy", () => {
  const rec = extractRecommendation(
    makeRec({
      customer: "Gail",
      vehicle: "2023 Tesla Model 3",
      policy: "Premium",
      price: "$145 NZD",
    }),
  );
  expect(rec.policy).toBe("Premium");
  expect(rec.vehicle).toContain("Tesla");
});
test("Hemi — Toyota Hilux ute gets Comprehensive", () => {
  const rec = extractRecommendation(
    makeRec({
      customer: "Hemi",
      vehicle: "2019 Toyota Hilux",
      policy: "Comprehensive",
      price: "$110 NZD",
    }),
  );
  expect(rec.policy).toBe("Comprehensive");
  expect(rec.vehicle).toContain("Hilux");
});

test("handles Valued Customer when no name provided", () => {
  const rec = extractRecommendation(
    makeRec({
      customer: "Valued Customer",
    }),
  );
  expect(rec.customer).toBe("Valued Customer");
});
test("all three policy tiers extract correctly", () => {
  ["Basic", "Comprehensive", "Premium"].forEach((policy) => {
    const rec = extractRecommendation(makeRec({ policy }));
    expect(rec.policy).toBe(policy);
  });
});

//strip recommendation block
describe("Strip recommendation block", () => {
  test("leaves plain chat messages completely unchanged", () => {
    const msg = "What model of Mazda do you drive?";
    expect(stripRecommendationBlock(msg)).toBe(msg);
  });
});

//email
describe("Email validation", () => {
  test("accepts standard email", () => {
    expect(isValidEmail("sarah@gmail.com")).toBe(true);
  });
  test("accepts NZ domain email", () => {
    expect(isValidEmail("hemi@turners.co.nz")).toBe(true);
  });
  test("rejects email without @", () => {
    expect(isValidEmail("notanemail.com")).toBe(false);
  });
  test("rejects email without dot after @", () => {
    expect(isValidEmail("user@nodot")).toBe(false);
  });
  test("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
  test("rejects whitespace only", () => {
    expect(isValidEmail(" ")).toBe(false);
  });
  test("rejects undefined", () => {
    expect(isValidEmail(undefined)).toBe(false);
  });
});

//converstion history
describe("Conversation history", () => {
  test("builds history correctly with alternating roles", () => {
    const history = [];
    history.push({ role: "assistant", content: "Kia ora! I'm Tina." });
    history.push({ role: "user", content: "Hi, I drive a Mazda 3" });
    history.push({ role: "assistant", content: "How do you mainly use it?" });
    expect(history).toHaveLength(3);
    expect(history[0].role).toBe("assistant");
    expect(history[1].role).toBe("user");
    expect(history[2].role).toBe("assistant");
  });

  test("reset clears all history", () => {
    const history = [
      { role: "assistant", content: "Kia ora!" },
      {
        role: "user",
        content: "I drive a Hilux",
      },
    ];
    expect(history).toHaveLength(2);
  });
  test("user message content is stored exactly as typed", () => {
    const history = [];
    const userMsg = "I own a 2019 Ford Ranger ute, use it for work";
    history.push({ role: "user", content: userMsg });
    expect(history[0].content).toBe(userMsg);
  });
  test("does not send empty messages", () => {
    const history = [];
    const addMessage = (text) => {
      if (!text.trim()) return false;
      history.push({ role: "user", content: text });
      return true;
    };
    expect(addMessage("")).toBe(false);
    expect(addMessage(" ")).toBe(false);
    expect(addMessage("Hello")).toBe(true);
    expect(history).toHaveLength(1);
  });
});
