import { Innertube } from "youtubei.js";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const PLAYLIST_ID = "PL9bB-qR6xC5nauT7K_1_kfguwfj6JcbyE";

async function fetchYtPlaylist(yt: Innertube, id: string) {
  const videos = [];
  let playlistPage = await yt.getPlaylist(id);
  while (true) {
    for (const video of playlistPage.videos) {
      videos.push(video);
    }
    if (!playlistPage.has_continuation) {
      break;
    }
    playlistPage = await playlistPage.getContinuation();
  }
  return videos;
}

function numberOr0(number?: number) {
  return number && isFinite(number) ? number : 0;
}

export const videosRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const yt = await Innertube.create();
    const playlist = await fetchYtPlaylist(yt, PLAYLIST_ID);
    const videoIds = new Set<string>();
    const titleMap = new Map<string, string>();
    for (const video of playlist) {
      if ("id" in video) {
        videoIds.add(video.id);
        titleMap.set(video.id, video.title.toString());
      }
    }
    const videos = await Promise.all(
      [...videoIds].map(async (id) => {
        const info = await yt.getInfo(id);
        return {
          id,
          // remove the " | TUES Fest 2023" suffix
          title: titleMap.get(id)?.replace(/ \| TUES Fest \d{4}$/, "") || "",
          views: numberOr0(info.basic_info.view_count),
          likes: numberOr0(info.basic_info.like_count),
          // TODO: return youtube dislikes maybe?
          dislikes: 0,
        };
      })
    );
    return videos;
  }),
});
