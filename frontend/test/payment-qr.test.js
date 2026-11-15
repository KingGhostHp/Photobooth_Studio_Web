import assert from "node:assert/strict";
import { test } from "node:test";
import { paymentQrUrl } from "../src/studio/payment-qr.js";

const bank = { accountNumber: "0012345678", bankBin: "970422", qrType: "dynamic" };
const reference = "AURA AUR20991231ABCDEF12";

test("SePay VietQR encodes the configured recipient, outstanding amount and order memo", () => {
  const url = new URL(paymentQrUrl({ ...bank, qrTemplate: "compact2" }, 2000, reference));
  assert.equal(url.origin + url.pathname, "https://vietqr.app/img");
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    acc: "0012345678",
    bank: "970422",
    amount: "2000",
    des: reference,
    template: "compact",
  });
});

test("preserves uploaded QR images and omits QR when payment or bank data is missing", () => {
  const custom = { ...bank, qrType: "custom_image", customQrImage: "/images/custom.png" };
  assert.equal(paymentQrUrl(custom, 2000, reference), custom.customQrImage);
  assert.equal(paymentQrUrl(custom, 0, reference), null);
  assert.equal(paymentQrUrl({ ...bank, bankBin: "" }, 2000, reference), null);
});
