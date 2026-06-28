import { describe, expect, it } from "vitest";
import { listSourceVideosInputSchema } from "../../videos/videos.schemas.js";

describe("videos schemas", () => {
  it("applies defaults for video listing input", () => {
    const parsed = listSourceVideosInputSchema.parse({
      projectId: "project-1",
    });

    expect(parsed).toMatchObject({
      projectId: "project-1",
      page: 0,
      pageSize: 25,
    });
  });
});
