const request = require("supertest");
const app = require("../server");
const chai = require("chai");
const expect = chai.expect;

describe("Menu API", function() {
  this.slow(10000);
  it("should get menu items", async () => {
    const res = await request(app)
      .get("/api/menu");

    expect(res.statusCode).to.equal(200);
    expect(res.body.success).to.be.true;
  });
});