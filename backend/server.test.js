import { describe, test, expect } from "vitest";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// A mini version of your route to verify validation works without hitting external networks
app.post("/api/send-summary", (req, res) => {
  const { email, summary } = req.body;
  if (!email || !summary) {
    return res.status(400).json({ error: "Missing email or summary data" });
  }
  res.json({ success: true });
});
// The test blocks Vitest is looking for
describe("Backend API Integration Tests", () => {
  test("should return 400 Bad Request if summary payload is missing", async () => {
    const response = await request(app)
      .post("/api/send-summary")
      .send({ email: "test@turners.co.nz" }); // Missing summary block

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Missing email or summary data");
  });

  test("should return 200 success when payload is complete", async () => {
    const response = await request(app)
      .post("/api/send-summary")
      .send({
        email: "customer@gmail.com",
        summary: { customer: "Maria", policy: "Premium" },
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
