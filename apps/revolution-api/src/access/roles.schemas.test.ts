import { describe, expect, it } from "vitest";
import { roleSchema } from "./roles.schemas.js";

describe("role schema", () => {
  it("accepts known roles", () => {
    expect(roleSchema.parse("REVOLUTION_OPERATORS")).toBe("REVOLUTION_OPERATORS");
  });
});
