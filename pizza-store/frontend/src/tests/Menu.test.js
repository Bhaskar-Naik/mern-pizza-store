const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

describe("Menu Service", () => {
  let menuService;
  let axiosStub;

  beforeEach(() => {
    axiosStub = {
      get: sinon.stub(),
      post: sinon.stub(),
      put: sinon.stub(),
      delete: sinon.stub()
    };
    menuService = proxyquire("../services/menuService", {
      axios: axiosStub
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should fetch all menu items", async () => {
    const fakeItems = [
      { _id: "1", name: "Margherita", price: 199, category: "Classic" },
      { _id: "2", name: "BBQ Chicken", price: 299, category: "Chicken" }
    ];
    axiosStub.get.resolves({ data: { success: true, data: fakeItems } });

    const res = await menuService.getMenuItems();

    expect(axiosStub.get.calledOnce).to.be.true;
    expect(axiosStub.get.firstCall.args[0]).to.include("/menu");
    expect(res.data.data).to.have.length(2);
    expect(res.data.data[0].name).to.equal("Margherita");
  });

  it("should fetch all categories", async () => {
    const fakeCategories = [{ _id: "c1", name: "Classic" }, { _id: "c2", name: "Chicken" }];
    axiosStub.get.resolves({ data: { success: true, data: fakeCategories } });

    const res = await menuService.getCategories();

    expect(axiosStub.get.calledOnce).to.be.true;
    expect(axiosStub.get.firstCall.args[0]).to.include("/categories");
    expect(res.data.data).to.have.length(2);
  });

  it("should create a new menu item", async () => {
    axiosStub.post.resolves({ data: { success: true, data: { _id: "new1", name: "Veggie Supreme" } } });

    const newItem = { name: "Veggie Supreme", price: 249, category: "Veg" };
    const res = await menuService.createMenuItem(newItem);

    expect(axiosStub.post.calledOnce).to.be.true;
    expect(axiosStub.post.firstCall.args[0]).to.include("/menu");
    expect(res.data.data.name).to.equal("Veggie Supreme");
  });

  it("should delete a menu item by id", async () => {
    axiosStub.delete.resolves({ data: { success: true, message: "Item deleted" } });

    const res = await menuService.deleteMenuItem("item123");

    expect(axiosStub.delete.calledOnce).to.be.true;
    expect(axiosStub.delete.firstCall.args[0]).to.include("/menu/item123");
    expect(res.data.success).to.be.true;
  });
});