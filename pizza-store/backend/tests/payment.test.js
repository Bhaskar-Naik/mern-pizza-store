const request = require("supertest");
const app = require("../server");
const chai = require("chai");
const expect = chai.expect;

describe("Payment API", function() {
  this.slow(10000);
  it("should verify get payments route exists", async () => {
    const res = await request(app)
      .get("/api/payments");

    expect(res.statusCode).to.not.be.undefined;
  });
});