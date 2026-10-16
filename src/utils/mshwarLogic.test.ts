import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartSummary,
  canTransitionOrder,
  getKdsUrgency,
  calculateCashChange,
  calculateCaptainCommission,
  validateWithdrawalRequest,
  calculateWalletMetrics,
  calculateDistanceKm,
  estimateRemainingEtaMinutes,
  interpolateCoordinate,
  generateRoutePoints,
  calculateUpdatedAverage,
  getRatingDescriptionAr,
  validateOrderRating,
  calculateRatingMetricsFromReviews,
} from './mshwarLogic.ts';
import type { CartItem } from './mshwarLogic.ts';

test('calculateCartSummary computes items subtotal and default fees', () => {
  const items: CartItem[] = [
    { id: '1', name: 'Burger', price: 25, quantity: 2 },
    { id: '2', name: 'Fries', price: 10, quantity: 1 },
  ];
  const summary = calculateCartSummary(items);
  assert.equal(summary.subtotal, 60);
  assert.equal(summary.deliveryFee, 8);
  assert.equal(summary.serviceFee, 3);
  assert.equal(summary.discountAmount, 0);
  assert.equal(summary.grandTotal, 71);
  assert.equal(summary.itemCount, 3);
});

test('calculateCartSummary applies MSHWAR30 promo code', () => {
  const items: CartItem[] = [
    { id: '1', name: 'Burger', price: 50, quantity: 2 },
  ];
  const summary = calculateCartSummary(items, 'MSHWAR30');
  assert.equal(summary.discountAmount, 30);
  assert.equal(summary.grandTotal, 83);
});

test('calculateCartSummary applies FREESHIP promo code', () => {
  const items: CartItem[] = [
    { id: '1', name: 'Pizza', price: 40, quantity: 1 },
  ];
  const summary = calculateCartSummary(items, 'FREESHIP');
  assert.equal(summary.deliveryFee, 0);
});

test('canTransitionOrder validates valid bidding and standard transitions', () => {
  assert.equal(canTransitionOrder('placed', 'bidding_open'), true);
  assert.equal(canTransitionOrder('bidding_open', 'confirmed'), true);
  assert.equal(canTransitionOrder('confirmed', 'preparing'), true);
  assert.equal(canTransitionOrder('preparing', 'ready_for_pickup'), true);
  assert.equal(canTransitionOrder('ready_for_pickup', 'on_the_way'), true);
  assert.equal(canTransitionOrder('on_the_way', 'delivered'), true);
  assert.equal(canTransitionOrder('placed', 'delivered'), false);
});

test('getKdsUrgency flags urgency levels correctly', () => {
  assert.equal(getKdsUrgency(120), 'normal');
  assert.equal(getKdsUrgency(500), 'warning');
  assert.equal(getKdsUrgency(1000), 'critical');
});

test('calculateCashChange computes valid change and flags insufficient payment', () => {
  const valid = calculateCashChange(45.5, 50);
  assert.equal(valid.isValid, true);
  assert.equal(valid.change, 4.5);

  const invalid = calculateCashChange(50, 40);
  assert.equal(invalid.isValid, false);
  assert.equal(invalid.change, 0);
});

test('calculateCaptainCommission computes platform commission cut and captain net profit', () => {
  const commission = calculateCaptainCommission(200, 15);
  // 200 * 15% = 30 ILS platform commission, 170 ILS captain net
  assert.equal(commission.platformCut, 30);
  assert.equal(commission.captainNetProfit, 170);
  assert.equal(commission.commissionRatePercent, 15);
});

test('validateWithdrawalRequest enforces minimums and available balance limits', () => {
  // Below min
  const tooLow = validateWithdrawalRequest(300, 15, 20);
  assert.equal(tooLow.isValid, false);

  // Exceeds available balance
  const tooHigh = validateWithdrawalRequest(150, 200, 20);
  assert.equal(tooHigh.isValid, false);

  // Negative / 0
  const invalidNum = validateWithdrawalRequest(150, 0, 20);
  assert.equal(invalidNum.isValid, false);

  // Valid
  const validReq = validateWithdrawalRequest(250, 100, 20);
  assert.equal(validReq.isValid, true);
  assert.equal(validReq.sanitizedAmount, 100);
});

test('calculateDistanceKm returns positive distance between locations', () => {
  const dist = calculateDistanceKm(31.5042, 34.4648, 31.4965, 34.453);
  assert.ok(dist > 0.5 && dist < 3.0, `Expected distance around 1.4km, got ${dist}`);
});

test('estimateRemainingEtaMinutes calculates reasonable travel minutes', () => {
  const eta = estimateRemainingEtaMinutes(1.5, 25);
  assert.equal(eta, 4);
  assert.equal(estimateRemainingEtaMinutes(0.02, 25), 0);
});

test('interpolateCoordinate smoothly interpolates between coordinates', () => {
  const start: [number, number] = [31.5, 34.4];
  const end: [number, number] = [31.6, 34.6];
  const atStart = interpolateCoordinate(start[0], start[1], end[0], end[1], 0);
  assert.equal(atStart[0], 31.5);
  assert.equal(atStart[1], 34.4);

  const atMid = interpolateCoordinate(start[0], start[1], end[0], end[1], 0.5);
  assert.equal(atMid[0], 31.55);
  assert.equal(atMid[1], 34.5);

  const atEnd = interpolateCoordinate(start[0], start[1], end[0], end[1], 1);
  assert.equal(atEnd[0], 31.6);
  assert.equal(atEnd[1], 34.6);
});

test('generateRoutePoints generates waypoints including start and end', () => {
  const points = generateRoutePoints([31.504, 34.464], [31.496, 34.453]);
  assert.ok(points.length >= 3);
  assert.deepEqual(points[0], [31.504, 34.464]);
  assert.deepEqual(points[points.length - 1], [31.496, 34.453]);
});

test('calculateUpdatedAverage accurately recalculates moving average', () => {
  const result1 = calculateUpdatedAverage(4.5, 10, 5);
  assert.equal(result1.newCount, 11);
  assert.equal(result1.newAvg, 4.5);

  const result2 = calculateUpdatedAverage(4.0, 1, 5);
  assert.equal(result2.newCount, 2);
  assert.equal(result2.newAvg, 4.5);
});

test('validateOrderRating validates star ranges properly', () => {
  assert.equal(validateOrderRating(5, 5).isValid, true);
  assert.equal(validateOrderRating(1, 4).isValid, true);
  assert.equal(validateOrderRating(0, 5).isValid, false);
  assert.equal(validateOrderRating(5, 6).isValid, false);
});
