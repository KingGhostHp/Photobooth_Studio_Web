const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validDate,
  vnDate,
  addDays,
  slotPassed,
  customerInput,
  quoteCheckout,
} = require("../src/studio/domain");
const now = new Date("2026-11-04T00:00:00Z");
const { validateGallery, galleryFromRow } = require("../src/studio/costumes");
test("product galleries validate bounds and retain legacy cover photos", () => {
  assert.deepEqual(galleryFromRow({ image: "/old.png", images: [] }), ["/old.png"]);
  assert.deepEqual(validateGallery([" /a.png ", "/b.png", "/a.png"]), ["/a.png", "/b.png"]);
  for (const input of [[], null, "image.png", Array(11).fill("/a.png"), ["javascript:alert(1)"], ["data:image/svg+xml;base64,AAAA"], ["x".repeat(2000001)]])
    assert.throws(() => validateGallery(input), (error) => error.status === 400);
});
const data = {
  costumes: {
    id: "AD-101",
    name: "Áo dài",
    sizes: ["S", "M"],
    rental_price: 250000,
    deposit_amount: 500000,
    available_count: 4,
    available_status: "AVAILABLE",
  },
  service_packages: {
    id: "profile",
    name: "Profile",
    included_people: 1,
    base_price_per_person: 1500000,
    deposit: 500000,
  },
  photobooth_concepts: { id: "basic", name: "Basic", price: 70000 },
};
const client = {
  query: async (sql) => ({
    rows: sql.includes("service_addons")
      ? [{ id: "makeup", name: "Makeup", price: 250000 }]
      : [data[/FROM (\w+)/.exec(sql)[1]]].filter(Boolean),
  }),
};
const input = {
  date: "2026-11-05",
  days: 3,
  items: [{ type: "costume", id: "AD-101", size: "M", quantity: 2 }],
};
test("Vietnam dates, leap dates and half-open rental dates", () => {
  assert.equal(vnDate(new Date("2026-11-03T18:00:00Z")), "2026-11-04");
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(slotPassed("2026-11-04", "08:30 - 10:00", now), false);
});
test("rental service multiplies days and quantity; refundable deposit only quantity", async () => {
  const q = await quoteCheckout(
    client,
    { ...input, totalAmount: 1, depositAmount: 1 },
    now,
  );
  assert.equal(q.serviceTotal, 1500000);
  assert.equal(q.securityDeposit, 1000000);
  assert.equal(q.dueNow, 1000000);
  assert.equal(q.endDate, "2026-11-08");
});
test("package price per person plus unique addons once", async () => {
  const q = await quoteCheckout(
    client,
    {
      date: input.date,
      slot: "08:30 - 10:00",
      items: [
        {
          type: "package",
          id: "profile",
          people: 2,
          addons: ["makeup", "makeup"],
        },
      ],
    },
    now,
  );
  assert.equal(q.serviceTotal, 3250000);
  assert.equal(q.dueNow, 500000);
  assert.equal(q.resource, "studio");
});
test("invalid customer, dates, sizes, counts and multiple sessions are rejected", async () => {
  assert.throws(() => customerInput({ name: "A", phone: "abc" }));
  for (const patch of [
    { date: "2026-02-30" },
    { date: "2026-11-03" },
    { days: 0 },
    { days: 31 },
    { items: [] },
    { items: [{ ...input.items[0], size: "XL" }] },
    { items: [{ ...input.items[0], quantity: -1 }] },
    { items: [input.items[0], input.items[0]] },
    {
      items: [
        { type: "photobooth", id: "basic" },
        { type: "package", id: "profile" },
      ],
    },
  ])
    await assert.rejects(quoteCheckout(client, { ...input, ...patch }, now));
});
