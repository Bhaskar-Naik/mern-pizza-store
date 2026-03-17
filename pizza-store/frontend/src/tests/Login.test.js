const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

describe("Auth Service - Login", () => {
  let authService;
  let axiosStub;

  beforeEach(() => {
    axiosStub = {
      post: sinon.stub(),
      get: sinon.stub()
    };
    authService = proxyquire("../services/authService", {
      axios: axiosStub
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should call loginUser with correct credentials", async () => {
    const fakeResponse = { data: { success: true, token: "abc123" } };
    axiosStub.post.resolves(fakeResponse);

    const credentials = { email: "user@test.com", password: "password123" };
    const res = await authService.loginUser(credentials);

    expect(axiosStub.post.calledOnce).to.be.true;
    expect(axiosStub.post.firstCall.args[0]).to.include("/auth/login");
    expect(res.data.success).to.be.true;
    expect(res.data.token).to.equal("abc123");
  });

  it("should call registerUser with user details", async () => {
    const fakeResponse = { data: { success: true } };
    axiosStub.post.resolves(fakeResponse);

    const userData = {
      name: "Test User",
      email: "test@test.com",
      password: "pass123",
      phone: "9999999999"
    };
    const res = await authService.registerUser(userData);

    expect(axiosStub.post.calledOnce).to.be.true;
    expect(axiosStub.post.firstCall.args[0]).to.include("/auth/register");
    expect(res.data.success).to.be.true;
  });

  it("should reject loginUser on invalid credentials", async () => {
    axiosStub.post.rejects(new Error("Unauthorized"));

    try {
      await authService.loginUser({ email: "bad@test.com", password: "wrong" });
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect(err.message).to.equal("Unauthorized");
    }
  });
});