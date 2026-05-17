process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.FHIR_BASE_URL = "https://example.com/fhir";
process.env.FHIR_BEARER_TOKEN = "fake-token";
process.env.JWT_SECRET = "test-secret";
process.env.APP_USERNAME = "doctor";
process.env.APP_PASSWORD = "password123";
process.env.CLIENT_ORIGIN = "http://localhost:5173";

const request = require("supertest");
const app = require("../src/app");

describe("request body format handling", () => {
  test("rejects text/plain body on POST routes", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "text/plain")
      .send("username=doctor&password=password123");

    expect(response.status).toBe(415);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(response.body.error.message).toBe(
      "Request body must be valid JSON with Content-Type: application/json."
    );
  });

  test("rejects malformed JSON body", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{ "username": "doctor", ');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVALID_JSON");
    expect(response.body.error.message).toBe("Request body contains malformed JSON.");
  });

  test("accepts valid JSON body", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send({
        username: "doctor",
        password: "password123"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.username).toBe("doctor");
    expect(response.body.data.token).toBeDefined();
  });
});