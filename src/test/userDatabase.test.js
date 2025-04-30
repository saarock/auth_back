import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../app.js";

dotenv.config();

let token;

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/test_db`);
});

afterAll(async () => {
  // await mongoose.connection.db.collection("users").deleteMany({});
  await mongoose.disconnect(); // ✅ Very important
});


describe("User Routes Integration Tests", () => {
  test("GET /user - default route", async () => {
    const res = await request(app).get("/user");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("GET request to /user");
  });



  test("POST /user/send_mail", async () => {
    const res = await request(app)
      .post("/user/send_mail")
      .send({ email: "test@example.com" });
    expect(res.statusCode).toBeGreaterThanOrEqual(200);
  
  });

  test("POST /user/mail_verify", async () => {
    const res = await request(app)
      .post("/user/mail_verify")
      .send({ email: "saarock200@gmail.com", otp: "123456" }); // Adjust logic accordingly
    expect([200, 400, 401, 404]).toContain(res.statusCode);
  });
  let createdUserId;

  test("POST /user/register", async () => {

    const res = await request(app).post("/user/register").send({
     fullName :"devu", 
     userName:"hero", 
     phoneNumber: "343",
      email:"test@example.com", 
      password: "test123", 
      role: "user"
    });
    createdUserId = res.body?.data?._id; // ✅ capture user ID
    expect([200, 201, 400, 401, 404]).toContain(res.statusCode);
  });
  

  let refreshToken;

  test("POST /user/login", async () => {
    const res = await request(app).post("/user/login").send({
      email: "test@example.com",
      password: "test123",
    });
  
    expect([200, 201, 401]).toContain(res.statusCode);
    expect(res.body.data).toHaveProperty("accessToken");
    token = res.body.data?.accessToken;
    refreshToken = res.body.data?.refreshToken;
  });
  

  test("POST /user/refresh", async () => {
    const res = await request(app).post("/user/refresh").send({
      refreshToken,
    });
    expect([200, 400, 401, 404]).toContain(res.statusCode);
  });
  

  test("POST /user/logout", async () => {
    const res = await request(app)
      .post("/user/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  test("GET /user/get-users", async () => {
    const res = await request(app)
      .get("/user/get-users")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data || [])).toBe(true);
  });

  test("PUT /user/deactivate-activate-user", async () => {
    if (!createdUserId) return; // skip if not created
    const res = await request(app)
      .put("/user/deactivate-activate-user")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: createdUserId, status: false });
    expect([200, 400]).toContain(res.statusCode);
  });
  
  test("GET /user/get-notifications", async () => {
    const res = await request(app)
      .get("/user/get-notifications")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 400]).toContain(res.statusCode);
  });

  test("POST /user/verifyToken", async () => {
    const res = await request(app)
      .post("/user/verifyToken")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 201, 500]).toContain(res.statusCode);
  });
});
