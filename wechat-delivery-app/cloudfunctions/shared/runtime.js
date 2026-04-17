"use strict";

const { createSeedState } = require("../../shared/seed");
const business = require("../../shared/business");

let runtimeState = createSeedState();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getState() {
  return clone(runtimeState);
}

function setState(nextState) {
  runtimeState = clone(nextState);
  return getState();
}

function resetState() {
  runtimeState = createSeedState();
  return getState();
}

function createOrder(event) {
  const state = getState();
  const result = business.createOrder(state, event);
  setState(result.state);
  return {
    success: true,
    order: result.order
  };
}

function payOrder(event) {
  const state = getState();
  const result = business.payOrder(state, event);
  setState(result.state);
  return {
    success: true,
    order: result.order,
    alreadyPaid: result.alreadyPaid
  };
}

function processRefund(event) {
  const state = getState();
  const requested = business.requestRefund(state, {
    userId: event.userId,
    orderId: event.orderId,
    reason: event.reason,
    now: event.now
  });
  const processed = business.handleRefund(requested.state, {
    userId: event.merchantUserId,
    orderId: event.orderId,
    approve: event.approve !== false,
    now: event.now
  });
  setState(processed.state);
  return {
    success: true,
    order: processed.order
  };
}

function submitReview(event) {
  const state = getState();
  const result = business.submitReview(state, event);
  setState(result.state);
  return {
    success: true,
    review: result.review,
    order: result.order
  };
}

function getMerchantStats(event) {
  return {
    success: true,
    stats: business.getMerchantStatistics(getState(), event.merchantId)
  };
}

function login(event) {
  const state = getState();
  const result = business.loginUser(state, event);
  setState(result.state);
  return {
    success: true,
    user: result.user
  };
}

module.exports = {
  business,
  getState,
  setState,
  resetState,
  createOrder,
  payOrder,
  processRefund,
  submitReview,
  getMerchantStats,
  login
};
