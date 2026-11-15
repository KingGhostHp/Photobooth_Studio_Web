import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, shiftMonth, monthCells, parseDay, clampDay } from "../src/studio/date-utils.js";

test("calendar weeks start on Monday and contain leap days exactly once", () => {
  const cells = monthCells("2024-02-01");
  assert.equal(cells.length, 42);
  assert.equal(new Set(cells).size, 42);
  assert.equal(parseDay(cells[0]).getUTCDay(), 1);
  assert.equal(parseDay(cells.at(-1)).getUTCDay(), 0);
  assert.equal(cells.filter((day) => day.startsWith("2024-02")).length, 29);
  assert.equal(monthCells("2025-02-01").filter((day) => day.startsWith("2025-02")).length, 28);
});
test("month and year navigation clamp dates at month end", () => {
  assert.equal(shiftMonth("2024-01-31", 1), "2024-02-29");
  assert.equal(shiftMonth("2024-02-29", 12), "2025-02-28");
  assert.equal(shiftMonth("2026-12-31", 1), "2027-01-31");
  assert.equal(shiftMonth("2026-01-31", -1), "2025-12-31");
});
test("calendar date arithmetic crosses year and daylight-saving boundaries", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-03-08", -1), "2026-03-07");
  assert.equal(addDays("2026-11-04", 365), "2027-11-04");
});
test("booking limits clamp navigation while admin dates stay unrestricted", () => {
  assert.equal(clampDay("2026-10-31", "2026-11-04", "2027-11-04"), "2026-11-04");
  assert.equal(clampDay("2027-11-05", "2026-11-04", "2027-11-04"), "2027-11-04");
  assert.equal(clampDay("2020-01-01"), "2020-01-01");
});
