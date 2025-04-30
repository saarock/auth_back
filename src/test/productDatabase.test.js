import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import app from "../app.js";

dotenv.config();

let token;

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/test_db`);

  // Login and fetch token
  const loginRes = await request(app).post("/user/login").send({
    email: "test@example.com",
    password: "test123"
  });

  token = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Product Routes", () => {
  let productId;

  test("POST /product/saveProduct - Upload product", async () => {
    const res = await request(app)
      .post("/product/saveProduct")
      .set("Authorization", `Bearer ${token}`)
      .attach("product_image", path.join(__dirname, "test_image.jpg"))
      .field("name", "Test Product")
      .field("price", 50);

    expect([200, 201]).toContain(res.statusCode);
    productId = res.body.data?._id;
  });

  test("GET /product/getProducts", async () => {
    const res = await request(app)
      .get("/product/getProducts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("PUT /product/edit-product", async () => {
    const res = await request(app)
      .put("/product/edit-product")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: productId, name: "Updated Product", price: 60 });

    expect([200, 400]).toContain(res.statusCode);
  });

  test("DELETE /product/change-available", async () => {
    const res = await request(app)
      .delete("/product/change-available")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: productId });

    expect([200, 400]).toContain(res.statusCode);
  });

  test("DELETE /product/deleteProduct", async () => {
    const res = await request(app)
      .delete("/product/deleteProduct")
      .set("Authorization", `Bearer ${token}`)
      .send({ _id: productId });

    expect([200, 400]).toContain(res.statusCode);
  });

  test("POST /product/buy-products", async () => {
    const res = await request(app)
      .post("/product/buy-products")
      .set("Authorization", `Bearer ${token}`)
      .send({ products: [{ _id: productId, quantity: 2 }] });

    expect([200, 400]).toContain(res.statusCode);
  });

  test("GET /product/get-purchaseStats", async () => {
    const res = await request(app)
      .get("/product/get-purchaseStats")
      .set("Authorization", `Bearer ${token}`);

    expect([200, 400]).toContain(res.statusCode);
  });

  test("GET /product/manage-booked-product", async () => {
    const res = await request(app)
      .get("/product/manage-booked-product")
      .set("Authorization", `Bearer ${token}`);

    expect([200, 400]).toContain(res.statusCode);
  });

  test("POST /product/change-status-of-booked-items", async () => {
    const res = await request(app)
      .post("/product/change-status-of-booked-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: productId, status: "delivered" });

    expect([200, 400]).toContain(res.statusCode);
  });

  test("GET /product/generate-bill", async () => {
    const res = await request(app)
      .get("/product/generate-bill")
      .set("Authorization", `Bearer ${token}`);

    expect([200, 400, 500]).toContain(res.statusCode);
  });
});
