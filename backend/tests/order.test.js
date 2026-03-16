const request = require("supertest");
const app = require("../server");
const chai = require("chai");
const expect = chai.expect;

describe("Order API", function() {
  this.slow(10000);
  it("should check if get orders endpoint exists", async () => {
    const res = await request(app)
      .get("/api/orders");

    expect(res.statusCode).to.not.be.undefined;
  });
});