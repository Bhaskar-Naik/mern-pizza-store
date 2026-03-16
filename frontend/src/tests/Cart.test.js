const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

describe("Cart Service", () => {
  let cartService;
  let axiosStub;

  beforeEach(() => {
    axiosStub = {
      get: sinon.stub(),
      post: sinon.stub(),
      put: sinon.stub(),
      delete: sinon.stub()
    };
    cartService = proxyquire("../services/cartService", {
      axios: axiosStub
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should fetch cart items successfully", async () => {
    const fakeCart = { items: [{ name: "Pizza", quantity: 2, price: 250 }], totalAmount: 500 };
    axiosStub.get.resolves({ data: { success: true, data: fakeCart } });

    const res = await cartService.getCart();

    expect(axiosStub.get.calledOnce).to.be.true;
    expect(axiosStub.get.firstCall.args[0]).to.include("/cart");
    expect(res.data.data.items).to.have.length(1);
    expect(res.data.data.totalAmount).to.equal(500);
  });

  it("should add an item to the cart", async () => {
    const fakeResponse = { data: { success: true, data: { items: [{ name: "Pizza" }], totalAmount: 250 } } };
    axiosStub.post.resolves(fakeResponse);

    const itemData = { itemId: "item123", quantity: 1 };
    const res = await cartService.addToCart(itemData);

    expect(axiosStub.post.calledOnce).to.be.true;
    expect(axiosStub.post.firstCall.args[0]).to.include("/cart");
    expect(res.data.success).to.be.true;
  });

  it("should remove an item from the cart", async () => {
    axiosStub.delete.resolves({ data: { success: true, data: { items: [], totalAmount: 0 } } });

    const res = await cartService.removeFromCart("item123");

    expect(axiosStub.delete.calledOnce).to.be.true;
    expect(axiosStub.delete.firstCall.args[0]).to.include("/cart/item123");
    expect(res.data.data.items).to.have.length(0);
  });

  it("should update cart item quantity", async () => {
    axiosStub.put.resolves({ data: { success: true, data: { items: [{ quantity: 3 }], totalAmount: 750 } } });

    const res = await cartService.updateCartItem("item123", { quantity: 3 });

    expect(axiosStub.put.calledOnce).to.be.true;
    expect(axiosStub.put.firstCall.args[0]).to.include("/cart/item123");
    expect(res.data.data.totalAmount).to.equal(750);
  });
});