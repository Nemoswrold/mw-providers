import { flags } from '@/entrypoint/utils/targets';
import { SourcererOutput, makeSourcerer } from '@/providers/base';
import { MovieScrapeContext, ShowScrapeContext } from '@/utils/context';
import { NotFoundError } from '@/utils/errors';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  let url = `https://nsbx.paradoxic.org/vault?tmdbId=${ctx.media.tmdbId}`; // :)
  if (ctx.media.type === 'show') url += `&season=${ctx.media.season.number}&episode=${ctx.media.episode.number}`;

  const response = await ctx.fetcher(url);

  if (!response) throw new NotFoundError('No data found for this show/movie');

  return response as SourcererOutput;
}

export const showboxScraper = makeSourcerer({
  id: 'showbox',
  name: 'NSBX',
  rank: 150,
  disabled: false,
  flags: [flags.CORS_ALLOWED],
  scrapeShow: comboScraper,
  scrapeMovie: comboScraper,
});
