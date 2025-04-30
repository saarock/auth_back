import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../app.js";

dotenv.config();

let token;

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/test_db`);
  // mock login to get token
  const res = await request(app).post("/user/login").send({
    email: "test@example.com",
    password: "test123",
  });
  token = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Notification Routes Integration Tests", () => {
  test("PATCH /notification/change-read-status", async () => {
    const res = await request(app)
      .patch("/notification/change-read-status")
      .set("Authorization", `Bearer ${token}`)
      .send({ notificationId: "SOME_ID", read: true }); // Use valid ID if needed

    expect([200, 400]).toContain(res.statusCode);
  });
});
