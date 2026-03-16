const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const chai = require("chai");
const expect = chai.expect;

describe("Auth API", function() {
  this.slow(15000);
  this.timeout(20000);
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: `test${Math.random().toString(36).substring(7)}@mail.com`,
        password: "123456",
        phone: "9999999999",
        role: "customer"
      });
    
    if (res.statusCode !== 201) console.error("Test Error Body:", res.body);

    expect(res.statusCode).to.equal(201);
    expect(res.body.success).to.be.true;
  });
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});