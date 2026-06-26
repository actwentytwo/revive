import { RevClient } from '@vbrick/rev-client/native-fetch'
import type { Rev, Video } from '@vbrick/rev-client/native-fetch'
import type {
  RevEnvironmentInput,
  RevEnvironmentValidation,
  SourceVideoPage,
  SourceVideoRecord,
} from '@revive/shared'

function normalizeUrl(url: string) {
  return url.trim().replace(/\/+$/, '')
}

function createClient(environment: RevEnvironmentInput) {
  const baseOptions = {
    url: normalizeUrl(environment.url),
    keepAlive: false,
    rateLimits: {
      searchVideos: 10,
      videoDetails: 60,
    },
  }

  if (environment.authType === 'apiKey') {
    return new RevClient({
      ...baseOptions,
      apiKey: environment.apiKey!,
      secret: environment.secret!,
    })
  }

  return new RevClient({
    ...baseOptions,
    username: environment.username!,
    password: environment.password!,
  })
}

function formatError(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const maybeRevError = error as {
      message?: string
      status?: number
      code?: string
      detail?: string
    }
    const parts = [
      maybeRevError.message,
      maybeRevError.code,
      maybeRevError.detail,
      maybeRevError.status ? `HTTP ${maybeRevError.status}` : undefined,
    ].filter(Boolean)

    if (parts.length > 0) {
      return parts.join(' | ')
    }
  }

  return 'Unknown Rev API error'
}

async function withRevClient<T>(
  environment: RevEnvironmentInput,
  callback: (client: RevClient) => Promise<T>,
) {
  const client = createClient(environment)

  try {
    await client.connect()
    return await callback(client)
  } catch (error) {
    throw new Error(formatError(error))
  } finally {
    await client.disconnect().catch(() => undefined)
  }
}

function mapVideo(hit: Video.SearchHit): SourceVideoRecord {
  return {
    id: hit.id,
    title: hit.title,
    description: hit.description,
    uploader: hit.uploader || hit.uploadedBy,
    owner: hit.owner?.username || hit.owner?.fullname || hit.uploadedBy,
    createdDate: hit.whenUploaded,
    modifiedDate: hit.whenModified,
    duration: hit.duration,
    status: hit.status,
    tags: hit.tags,
    categories: hit.categories,
    thumbnailUrl: hit.thumbnailUrl,
    isUnlisted: hit.unlisted,
    hasTranscripts: hit.hasTranscripts,
  }
}

export class RevService {
  async validateEnvironment(
    environment: RevEnvironmentInput,
  ): Promise<RevEnvironmentValidation> {
    return withRevClient(environment, async (client) => {
      const [accountId, revVersion] = await Promise.all([
        client.environment.getAccountId().catch(() => null),
        client.environment.getRevVersion().catch(() => null),
      ])

      return {
        url: normalizeUrl(environment.url),
        accountId,
        revVersion,
        validatedAt: new Date().toISOString(),
      }
    })
  }

  async listVideos(args: {
    environment: RevEnvironmentInput
    search?: string
    page: number
    pageSize: number
  }): Promise<SourceVideoPage> {
    const { environment, search, page, pageSize } = args

    return withRevClient(environment, async (client) => {
      const request = client.video.search(
        {
          q: search?.trim() || undefined,
          sortField: 'whenUploaded',
          sortDirection: 'desc',
          count: pageSize,
        },
        {
          maxResults: pageSize * (page + 1),
        },
      )

      let currentPage: Rev.SearchPage<Video.SearchHit> = {
        items: [],
        current: 0,
        total: 0,
        done: true,
      }

      for (let index = 0; index <= page; index += 1) {
        currentPage = await request.nextPage()
        if (currentPage.done && index < page) {
          break
        }
      }

      const total = currentPage.total ?? request.total ?? null

      return {
        items: currentPage.items.map(mapVideo),
        page,
        pageSize,
        total,
        hasMore: total !== null ? (page + 1) * pageSize < total : !currentPage.done,
      }
    })
  }
}
