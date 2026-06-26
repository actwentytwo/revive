export type RevAuthType = 'apiKey' | 'userPassword'

export type RevEnvironmentInput =
  | {
      url: string
      authType: 'apiKey'
      apiKey: string
      secret: string
    }
  | {
      url: string
      authType: 'userPassword'
      username: string
      password: string
    }

export interface RevEnvironmentValidation {
  url: string
  accountId: string | null
  revVersion: string | null
  validatedAt: string
}

export interface SourceVideoRecord {
  id: string
  title: string
  description: string
  uploader: string
  owner: string
  createdDate: string
  modifiedDate: string
  duration: string
  status: string
  tags: string[]
  categories: string[]
  thumbnailUrl: string
  isUnlisted: boolean
  hasTranscripts: boolean
}

export interface SourceVideoPage {
  items: SourceVideoRecord[]
  page: number
  pageSize: number
  total: number | null
  hasMore: boolean
}
