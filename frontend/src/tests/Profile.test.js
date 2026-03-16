const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

describe("Profile & Address Service", () => {
  let orderService;
  let authService;
  let axiosStub;

  beforeEach(() => {
    axiosStub = {
      get: sinon.stub(),
      post: sinon.stub(),
      put: sinon.stub(),
      delete: sinon.stub()
    };
    orderService = proxyquire("../services/orderService", {
      axios: axiosStub
    });
    authService = proxyquire("../services/authService", {
      axios: axiosStub
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should fetch user profile", async () => {
    const fakeProfile = { name: "Test User", email: "test@test.com", phone: "1234567890", role: "customer" };
    axiosStub.get.resolves({ data: { success: true, data: fakeProfile } });

    const res = await authService.getProfile();

    expect(axiosStub.get.calledOnce).to.be.true;
    expect(axiosStub.get.firstCall.args[0]).to.include("/auth/profile");
    expect(res.data.data.name).to.equal("Test User");
    expect(res.data.data.email).to.equal("test@test.com");
  });

  it("should fetch saved addresses", async () => {
    const fakeAddresses = [
      { _id: "addr1", street: "123 Main St", city: "Mumbai" },
      { _id: "addr2", street: "456 Park Ave", city: "Delhi" }
    ];
    axiosStub.get.resolves({ data: { success: true, data: fakeAddresses } });

    const res = await orderService.getAddresses();

    expect(axiosStub.get.calledOnce).to.be.true;
    expect(axiosStub.get.firstCall.args[0]).to.include("/addresses");
    expect(res.data.data).to.have.length(2);
    expect(res.data.data[0].city).to.equal("Mumbai");
  });

  it("should add a new address", async () => {
    axiosStub.post.resolves({ data: { success: true, data: { _id: "addr3", city: "Pune" } } });

    const newAddress = { street: "789 Hill Rd", city: "Pune", pincode: "411001" };
    const res = await orderService.addAddress(newAddress);

    expect(axiosStub.post.calledOnce).to.be.true;
    expect(axiosStub.post.firstCall.args[0]).to.include("/addresses");
    expect(res.data.data.city).to.equal("Pune");
  });
});
