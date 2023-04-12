import { log } from "console";
import { z } from "zod";
import { env } from "~/env.mjs";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const PLAYLIST_ID = "PL9bB-qR6xC5nauT7K_1_kfguwfj6JcbyE";

async function fetchYtPlaylist(id: string) {
  const res = await fetch(
    `${env.INVIDIOUS_INSTANCE_URL}/api/v1/playlists/${id}`
  );
  const json = (await res.json()) as PlaylistsResponse;
  return json;
}

async function fetchYtVideo(id: string) {
  const res = await fetch(`${env.INVIDIOUS_INSTANCE_URL}/api/v1/videos/${id}`);
  const json = (await res.json()) as VideoResponse;
  return json;
}

export const videosRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const playlist = await fetchYtPlaylist(PLAYLIST_ID);
    const videos = await Promise.all(
      playlist.videos
        .filter((video) => video.lengthSeconds > 0)
        // filter duplicates
        .filter((video, index, self) => {
          return index === self.findIndex((v) => v.videoId === video.videoId);
        })
        .map(async (video) => {
          const ytVideo = await fetchYtVideo(video.videoId);
          return {
            id: video.videoId,
            // remove the " | TUES Fest 2023" suffix
            title: video.title.replace(/ \| TUES Fest \d{4}$/, ""),
            views: ytVideo.viewCount,
            likes: ytVideo.likeCount,
            dislikes: ytVideo.dislikeCount,
          };
        })
    );
    return videos;
  }),
});

type PlaylistsResponse = {
  type: string;
  title: string;
  playlistId: string;
  playlistThumbnail: string;
  author: string;
  authorId: string;
  authorUrl: string;
  authorThumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  description: string;
  descriptionHtml: string;
  videoCount: number;
  viewCount: number;
  updated: number;
  isListed: boolean;
  videos: Array<{
    title: string;
    videoId: string;
    author: string;
    authorId: string;
    authorUrl: string;
    videoThumbnails: Array<{
      quality: string;
      url: string;
      width: number;
      height: number;
    }>;
    index: number;
    lengthSeconds: number;
  }>;
};

type VideoResponse = {
  type: string;
  title: string;
  videoId: string;
  videoThumbnails: Array<{
    quality: string;
    url: string;
    width: number;
    height: number;
  }>;
  storyboards: Array<{
    url: string;
    templateUrl: string;
    width: number;
    height: number;
    count: number;
    interval: number;
    storyboardWidth: number;
    storyboardHeight: number;
    storyboardCount: number;
  }>;
  description: string;
  descriptionHtml: string;
  published: number;
  publishedText: string;
  keywords: Array<string>;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  paid: boolean;
  premium: boolean;
  isFamilyFriendly: boolean;
  allowedRegions: Array<string>;
  genre: string;
  genreUrl: string;
  author: string;
  authorId: string;
  authorUrl: string;
  authorThumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  subCountText: string;
  lengthSeconds: number;
  allowRatings: boolean;
  rating: number;
  isListed: boolean;
  liveNow: boolean;
  isUpcoming: boolean;
  dashUrl: string;
  adaptiveFormats: Array<{
    init: string;
    index: string;
    bitrate: string;
    url: string;
    itag: string;
    type: string;
    clen: string;
    lmt: string;
    projectionType: string;
    fps: number;
    container: string;
    encoding: string;
    audioQuality?: string;
    audioSampleRate?: number;
    audioChannels?: number;
    resolution?: string;
    qualityLabel?: string;
  }>;
  formatStreams: Array<{
    url: string;
    itag: string;
    type: string;
    quality: string;
    fps: number;
    container: string;
    encoding: string;
    resolution: string;
    qualityLabel: string;
    size: string;
  }>;
  captions: Array<any>;
  recommendedVideos: Array<{
    videoId: string;
    title: string;
    videoThumbnails: Array<{
      quality: string;
      url: string;
      width: number;
      height: number;
    }>;
    author: string;
    authorUrl: string;
    authorId: string;
    lengthSeconds: number;
    viewCountText: string;
    viewCount: number;
  }>;
};
