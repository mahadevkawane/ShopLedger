'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function item(name, price, qty, hsn, gstRate) {
  return { name, sku: name.toUpperCase().replace(/\s+/g, '-'), price, qty, hsn, gstRate };
}

function order(id, items, coupon) {
  return { id, items, coupon };
}

test('CURRENT BEHAVIOUR: #1001 calculates invoice GST on 5% and 12% lines without a coupon', function () {
  const currentOrder = order(1001, [
    item('Toor Dal', 165, 1, '0713', 5),
    item('Table Butter', 260, 1, '0405', 12)
  ], '');
  const invoiceFigures = invoice.computeInvoiceFigures(currentOrder);
  const checkoutFigures = pricing.computeTotals(currentOrder.items, currentOrder.coupon);

  assert.deepStrictEqual(invoiceFigures, {
    subtotal: 425,
    discount: 0,
    tax: 39.45,
    cgst: 19.73,
    sgst: 19.72,
    total: 464.45,
    rows: [
      { name: 'Toor Dal', sku: 'TOOR-DAL', hsn: '0713', qty: 1, price: 165, gstPercent: 5, line: 165, lineTax: 8.25 },
      { name: 'Table Butter', sku: 'TABLE-BUTTER', hsn: '0405', qty: 1, price: 260, gstPercent: 12, line: 260, lineTax: 31.2 }
    ]
  });
  assert.strictEqual(checkoutFigures.tax, 39.45);
  assert.strictEqual(checkoutFigures.total, invoiceFigures.total);
});

test('CORRECT BEHAVIOUR: #1002 applies SAVE10 to subtotal before tax', function () {
  const currentOrder = order(1002, [
    item('Rice', 640, 1, '1006', 5),
    item('Sunflower Oil', 190, 2, '1512', 5)
  ], 'SAVE10');
  const invoiceFigures = invoice.computeInvoiceFigures(currentOrder);
  const checkoutFigures = pricing.computeTotals(currentOrder.items, currentOrder.coupon);

  assert.deepStrictEqual(invoiceFigures, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Rice', sku: 'RICE', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower Oil', sku: 'SUNFLOWER-OIL', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.strictEqual(checkoutFigures.discount, 102);
  assert.strictEqual(checkoutFigures.tax, 45.9);
  assert.strictEqual(checkoutFigures.total, 963.9);
});

test('CORRECT BEHAVIOUR: invoice matches checkout using HSN slab and capped coupon', function () {
  const currentOrder = order(1004, [
    item('Groundnut Oil', 1120, 2, '1508', undefined)
  ], 'SAVE10');
  const invoiceFigures = invoice.computeInvoiceFigures(currentOrder);
  const checkoutFigures = pricing.computeTotals(currentOrder.items, currentOrder.coupon);

  assert.deepStrictEqual(invoiceFigures, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: 'GROUNDNUT-OIL', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.strictEqual(invoiceFigures.subtotal, checkoutFigures.subtotal);
  assert.strictEqual(invoiceFigures.discount, checkoutFigures.discount);
  assert.strictEqual(invoiceFigures.tax, checkoutFigures.tax);
  assert.strictEqual(invoiceFigures.total, checkoutFigures.total);
});

test('CORRECT BEHAVIOUR: #1004 applies the SAVE10 ₹150 maximum discount before tax', function () {
  const currentOrder = order(1004, [
    item('Groundnut Oil', 1120, 2, '1508', 5)
  ], 'SAVE10');
  const invoiceFigures = invoice.computeInvoiceFigures(currentOrder);
  const checkoutFigures = pricing.computeTotals(currentOrder.items, currentOrder.coupon);

  assert.deepStrictEqual(invoiceFigures, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: 'GROUNDNUT-OIL', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.strictEqual(checkoutFigures.discount, 150);
  assert.strictEqual(checkoutFigures.tax, 104.5);
  assert.strictEqual(checkoutFigures.total, 2194.5);
});

test('CURRENT BEHAVIOUR: #1008 with all 18% items and no coupon matches checkout', function () {
  const currentOrder = order(1008, [
    item('Packaged Tea', 140, 1, '0902', 18),
    item('Sherbet Concentrate', 180, 2, '2106', 18)
  ], '');
  const invoiceFigures = invoice.computeInvoiceFigures(currentOrder);
  const checkoutFigures = pricing.computeTotals(currentOrder.items, currentOrder.coupon);

  assert.deepStrictEqual(invoiceFigures, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Packaged Tea', sku: 'PACKAGED-TEA', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Sherbet Concentrate', sku: 'SHERBET-CONCENTRATE', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.strictEqual(checkoutFigures.tax, 90);
  assert.strictEqual(checkoutFigures.total, invoiceFigures.total);
});
