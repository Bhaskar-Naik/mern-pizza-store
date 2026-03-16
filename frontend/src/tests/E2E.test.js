const { expect } = require('chai');
const axios = require('axios');
const sinon = require('sinon');

describe('E2E Workflow Test (Simulated)', function() {
  this.slow(10000);
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  let token = 'fake-jwt-token';
  let userId = 'user123';
  let pizzaId = 'pizza123';
  let pizzaName = 'Veggie Paradise';
  let pizzaPrice = 450;
  let addressId = 'addr123';

  const testUser = {
    name: 'E2E Test User',
    email: `e2e_test@test.com`,
    password: 'password123',
    phone: '9876543210'
  };

  beforeEach(() => {
    sinon.stub(axios, 'get');
    sinon.stub(axios, 'post');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('1. Should Register a new user', async () => {
    axios.post.withArgs(`${baseURL}/auth/register`).resolves({
      status: 201,
      data: { success: true, message: 'Registration successful!' }
    });

    const res = await axios.post(`${baseURL}/auth/register`, {
        ...testUser,
        role: 'customer'
    });
    expect(res.status).to.equal(201);
    expect(res.data.success).to.be.true;
  });

  it('2. Should Login successfully', async () => {
    axios.post.withArgs(`${baseURL}/auth/login`).resolves({
      status: 200,
      data: { 
        success: true, 
        token: 'fake-jwt-token', 
        user: { _id: 'user123', name: testUser.name } 
      }
    });

    const res = await axios.post(`${baseURL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    expect(res.status).to.equal(200);
    expect(res.data.token).to.not.be.empty;
    token = res.data.token;
  });

  it('3. Should fetch Menu items', async () => {
    axios.get.withArgs(`${baseURL}/menu`).resolves({
      status: 200,
      data: { success: true, data: [{ _id: 'pizza123', name: 'Veggie Paradise', price: 450 }] }
    });

    const res = await axios.get(`${baseURL}/menu`);
    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
    expect(res.data.data.length).to.be.at.least(1);
  });

  it('4. Should Add pizza to cart', async () => {
    axios.post.withArgs(`${baseURL}/cart`).resolves({
      status: 200,
      data: { success: true, data: { items: [{ itemId: 'pizza123', quantity: 1 }] } }
    });

    const res = await axios.post(`${baseURL}/cart`, 
      { itemId: pizzaId, quantity: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(res.status).to.equal(200);
    expect(res.data.data.items).to.be.an('array');
  });

  it('5. Should Add a delivery address', async () => {
    axios.post.withArgs(`${baseURL}/addresses`).resolves({
      status: 201,
      data: { success: true, data: { _id: 'addr123' } }
    });

    const res = await axios.post(`${baseURL}/addresses`, 
      { 
        houseNumber: '123', street: 'Test St', 
        city: 'Test City', state: 'TS', pincode: '123456' 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(res.status).to.equal(201);
    addressId = res.data.data._id;
  });

  it('6. Should Place an order', async () => {
    axios.post.withArgs(`${baseURL}/orders`).resolves({
      status: 201,
      data: { success: true, data: { _id: 'order123' } }
    });
    axios.post.withArgs(`${baseURL}/payments`).resolves({
      status: 201,
      data: { success: true }
    });

    const orderRes = await axios.post(`${baseURL}/orders`, 
      {
        addressId,
        items: [{ itemId: pizzaId, name: pizzaName, price: pizzaPrice, quantity: 1 }],
        totalAmount: pizzaPrice,
        deliveryMode: 'delivery'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(orderRes.status).to.equal(201);
    const orderId = orderRes.data.data._id;

    const paymentRes = await axios.post(`${baseURL}/payments`,
        { orderId, paymentMode: 'cash' },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(paymentRes.status).to.equal(201);
  });

  it('7. Should verify order in My Orders', async () => {
    axios.get.withArgs(`${baseURL}/orders`).resolves({
      status: 200,
      data: { success: true, data: [{ _id: 'order123', totalAmount: 450 }] }
    });

    const res = await axios.get(`${baseURL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(res.status).to.equal(200);
    expect(res.data.data).to.be.an('array');
    expect(res.data.data.length).to.be.at.least(1);
  });
});
