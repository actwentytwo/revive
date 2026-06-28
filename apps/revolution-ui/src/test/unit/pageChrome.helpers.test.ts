import { describe, expect, it } from "vitest";
import {
  compareVersionsDescending,
  formatConfigurationLabel,
  normalizeVbrickVersion,
} from "../../components/shared/pageChrome.helpers";

describe("page chrome helpers", () => {
  it("normalizes version values to v-prefixed format", () => {
    expect(normalizeVbrickVersion("8.6")).toBe("v8.6");
    expect(normalizeVbrickVersion("V7.3")).toBe("v7.3");
  });

  it("sorts version values in descending order", () => {
    const ordered = ["v6.0", "v8.6", "v7.3"].sort(compareVersionsDescending);
    expect(ordered).toEqual(["v8.6", "v7.3", "v6.0"]);
  });

  it("formats configuration labels with version when set", () => {
    expect(
      formatConfigurationLabel({
        id: "cfg-1",
        name: "Prod",
        productVersion: "8.6",
        environment: {
          authType: "apiKey",
          url: "https://example.test",
          apiKey: "key",
          secret: "secret",
        },
        validatedEnvironment: null,
        createdAt: "2026-06-28T00:00:00.000Z",
        updatedAt: "2026-06-28T00:00:00.000Z",
      }),
    ).toBe("Prod (v8.6)");
  });
});
