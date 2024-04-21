import { unpack } from 'unpacker';

import { flags } from '@/entrypoint/utils/targets';
import { makeEmbed } from '@/providers/base';
import { hlsProxy } from '@/utils/hlsproxy';

const evalCodeRegex = /eval\((.*)\)/g;
const mp4Regex = /https?:\/\/.*\.mp4/;

export const bflixScraper = makeEmbed({
  id: 'bflix',
  name: 'bFlix',
  rank: 113,
  scrape: async (ctx) => {
    const mainPage = await ctx.proxiedFetcher<string>(ctx.url);

    const evalCode = mainPage.match(evalCodeRegex);
    if (!evalCode) throw new Error('Failed to find eval code');
    const unpacked = unpack(evalCode[0]);

    const file = unpacked.match(mp4Regex);
    if (!file?.[0]) throw new Error('Failed to find file');

    return {
      stream: [
        {
          id: 'primary',
          type: 'file',
          flags: [flags.CORS_ALLOWED],
          captions: [],
          qualities: {
            unknown: {
              type: 'mp4',
              url: `${hlsProxy}${file[0]}&referer=https://bflix.gs/'`,
            },
          },
          /* headers: {
            Referer: 'https://bflix.gs/',
          }, */
        },
      ],
    };
  },
});
