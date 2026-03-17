const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

describe("Orders Service", () => {
  let orderService;
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
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should fetch all orders for the user", async () => {
    const fakeOrders = [
      { _id: "o1", status: "delivered", totalAmount: 499 },
      { _id: "o2", status: "pending", totalAmount: 299 }
    ];
    axiosStub.get.resolves({ data: { success: true, data: fakeOrders } });

    const res = await orderService.getOrders();

    expect(axiosStub.get.calledOnce).to.be.true;
    expect(axiosStub.get.firstCall.args[0]).to.include("/orders");
    expect(res.data.data).to.have.length(2);
    expect(res.data.data[0].status).to.equal("delivered");
  });

  it("should place a new order", async () => {
    axiosStub.post.resolves({ data: { success: true, data: { _id: "o3", status: "placed" } } });

    const orderData = { items: [{ itemId: "i1", quantity: 2 }], addressId: "addr1" };
    const res = await orderService.placeOrder(orderData);

    expect(axiosStub.post.calledOnce).to.be.true;
    expect(axiosStub.post.firstCall.args[0]).to.include("/orders");
    expect(res.data.data.status).to.equal("placed");
  });

  it("should cancel an order by id", async () => {
    axiosStub.put.resolves({ data: { success: true, data: { _id: "o1", status: "cancelled" } } });

    const res = await orderService.cancelOrder("o1");

    expect(axiosStub.put.calledOnce).to.be.true;
    expect(axiosStub.put.firstCall.args[0]).to.include("/orders/o1/cancel");
    expect(res.data.data.status).to.equal("cancelled");
  });

  it("should fetch monthly revenue", async () => {
    axiosStub.get.resolves({ data: { success: true, data: [{ month: "March", total: 15000 }] } });

    const res = await orderService.getMonthlyRevenue();

    expect(axiosStub.get.calledOnce).to.be.true;
    expect(axiosStub.get.firstCall.args[0]).to.include("/revenue/monthly");
    expect(res.data.data[0].total).to.equal(15000);
  });
});
