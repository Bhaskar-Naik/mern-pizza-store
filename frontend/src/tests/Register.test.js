const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

describe("Auth Service - Register", () => {
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

  it("should register a new user successfully", async () => {
    const fakeResponse = { data: { success: true, message: "User registered" } };
    axiosStub.post.resolves(fakeResponse);

    const newUser = {
      name: "New User",
      email: "newuser@test.com",
      password: "secure123",
      phone: "8888888888"
    };
    const res = await authService.registerUser(newUser);

    expect(axiosStub.post.calledOnce).to.be.true;
    expect(axiosStub.post.firstCall.args[0]).to.include("/auth/register");
    expect(res.data.success).to.be.true;
  });

  it("should fail registration when email already exists", async () => {
    axiosStub.post.rejects(new Error("Email already registered"));

    try {
      await authService.registerUser({ email: "existing@test.com", password: "123" });
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err.message).to.equal("Email already registered");
    }
  });

  it("should call logout endpoint correctly", async () => {
    axiosStub.post.resolves({ data: { success: true } });

    const res = await authService.logoutUser();

    expect(axiosStub.post.calledOnce).to.be.true;
    expect(axiosStub.post.firstCall.args[0]).to.include("/auth/logout");
    expect(res.data.success).to.be.true;
  });
});
