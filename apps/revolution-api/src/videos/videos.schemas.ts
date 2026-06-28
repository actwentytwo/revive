import { z } from "zod";

export const sourceVideoRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string(),
  uploader: z.string(),
  owner: z.string(),
  createdDate: z.string(),
  modifiedDate: z.string(),
  duration: z.string(),
  status: z.string(),
  tags: z.array(z.string()),
  categories: z.array(z.string()),
  thumbnailUrl: z.string(),
  isUnlisted: z.boolean(),
  hasTranscripts: z.boolean(),
});

export const sourceVideoPageSchema = z.object({
  items: z.array(sourceVideoRecordSchema),
  page: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().min(0).nullable(),
  hasMore: z.boolean(),
});

export const listSourceVideosInputSchema = z.object({
  projectId: z.string().trim().min(1),
  search: z.string().trim().optional(),
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(25),
});

export type ListSourceVideosInput = z.infer<typeof listSourceVideosInputSchema>;
