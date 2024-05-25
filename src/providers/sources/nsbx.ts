import { flags } from '@/entrypoint/utils/targets';
import { SourcererEmbed, SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const query = {
    title: ctx.media.title,
    releaseYear: ctx.media.releaseYear,
    tmdbId: ctx.media.tmdbId,
    imdbId: ctx.media.imdbId,
    type: ctx.media.type,
    season: '',
    episode: '',
  };

  if (ctx.media.type === 'show') {
    query.season = ctx.media.season.number.toString();
    query.episode = ctx.media.episode.number.toString();
  }

  const searchUrl = `https://nsbx.ru/api/search?query=${encodeURIComponent(JSON.stringify(query))}`;
  const result = await ctx.fetcher(searchUrl);

  if (!result || result.embeds.length === 0) {
    throw new NotFoundError('No watchable item found');
  }

  const embeds: SourcererEmbed[] = [];
  for (const embed of result.embeds) {
    const streamUrl = `https://nsbx.ru/api/source/${embed.embedId}/?resourceId=${embed.resourceId}`;
    const streamResult = await ctx.fetcher(streamUrl);

    for (const stream of streamResult.streams) {
      embeds.push({
        embedId: embed.embedId,
        url: stream.url,
      });
    }
  }

  return {
    embeds,
  };
}

export const nsbxScraper = makeSourcerer({
  id: 'nsbx',
  name: 'NSBX',
  rank: 150,
  flags: [flags.CORS_ALLOWED],
  disabled: false,
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
