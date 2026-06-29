import { resolveGrants } from "./catalog.defaults.js";

export const deriveGlobalGrantsFromGroups = (groups: string[], subject?: string) =>
  resolveGrants(groups, subject);
