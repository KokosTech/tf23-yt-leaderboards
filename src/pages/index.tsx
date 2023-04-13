import {
  IconBrandGithubFilled,
  IconExternalLink,
  IconEye,
  IconRefresh,
  IconThumbDownFilled,
  IconThumbUpFilled,
} from "@tabler/icons-react";
import { type NextPage } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Head from "next/head";
import Link from "next/link";

import { createProxySSGHelpers as createServerSideHelpers } from "@trpc/react-query/ssg";
import classNames from "classnames";
import Image from "next/image";
import { useEffect, useState } from "react";
import SuperJSON from "superjson";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const origintech = localFont({
  src: "../assets/origintech.ttf",
  variable: "--font-origintech",
});

function shortenNameLength(name: string) {
  if (name.length > 20) {
    return name.slice(0, 20) + "...";
  }
  return name;
}

const relativeFormat = new Intl.RelativeTimeFormat("bg", {
  numeric: "auto",
});

const YtThumbnail = (video: { id: string; title: string }) => {
  const [resolution, setResolution] = useState("maxresdefault");

  return (
    <Image
      src={`https://i.ytimg.com/vi/${video.id}/${resolution}.jpg`}
      alt={video.title}
      fill
      style={{ objectFit: "contain" }}
      onError={() => setResolution("default")}
    />
  );
};

const RelativeDate = ({ date }: { date: Date }) => {
  const now = Date.now();
  const [, setFakeNow] = useState(now);
  const diff = date.getTime() - now;
  const diffInMinutes = diff / 1000 / 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setFakeNow(Date.now());
    }, 1000 * 30);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <time dateTime={date.toISOString()}>
      {relativeFormat.format(Math.min(Math.round(diffInMinutes), 0), "minute")}
    </time>
  );
};

const Home: NextPage = () => {
  const videos = api.videos.get.useQuery(undefined, {
    refetchInterval: 1000 * 60 * 2,
  });
  const sortBy: "views" | "likes" = "views";
  const sortedVideos = videos.data?.sort((a, b) => {
    if (sortBy === "views") {
      return b.views - a.views;
    } else {
      return b.likes - a.likes;
    }
  });

  return (
    <>
      <Head>
        <title>TUES Fest 2023 YouTube Video Leaderboard</title>
        <meta
          name="description"
          content="Класация на YouTube видеата на проектите от TUES Fest 2023. Защото всичко трябва да бъде състезание."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={classNames(
          "flex min-h-screen flex-col items-center bg-black font-sans",
          inter.variable,
          origintech.variable
        )}
      >
        <div className="container flex flex-col items-center gap-12 px-4 py-16 ">
          <header className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-center font-origintech text-5xl tracking-tight text-white sm:text-[5rem]">
              TUES{" "}
              <span className="bg-gradient-to-br from-[#68cbe9] via-[#7775b4] to-[#7b51a1] bg-clip-text font-origintech text-transparent">
                Fest
              </span>{" "}
              2023
            </h1>
            <h2 className="text-center text-3xl font-semibold text-white">
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-4xl font-bold text-transparent">
                Класация
              </span>{" "}
              на{" "}
              <span className="text-4xl font-extrabold">
                You<span className="text-red-500">Tube</span>
              </span>{" "}
              видеата
            </h2>
            <p className="flex justify-center gap-1 text-white">
              {videos.isFetching ? (
                <span className="animate-pulse">Обновява се...</span>
              ) : (
                <>
                  <IconRefresh width="1em" />{" "}
                  <span>
                    Последно обновена{" "}
                    <RelativeDate date={new Date(videos.dataUpdatedAt)} />.
                  </span>
                </>
              )}
            </p>
          </header>
          <div className="flex w-full max-w-lg flex-col items-center gap-4">
            {sortedVideos?.map((video, i) => (
              <Link
                key={video.id}
                className={classNames(
                  "flex w-full flex-col items-center gap-4 rounded-xl p-4 transition-all hover:scale-105 sm:flex-row",
                  {
                    "border-8": i < 3,
                    "border ": i >= 3,
                    "text-black": i < 2,
                    "text-white": i >= 2,
                    "border-yellow-500 bg-yellow-300 hover:bg-yellow-200":
                      i === 0,
                    "border-amber-600 bg-amber-500 hover:bg-amber-400": i === 1,
                    "mb-8 border-gray-600 bg-gray-500 hover:bg-gray-400":
                      i === 2,
                    "border-gray-700 bg-white/10 hover:bg-white/20": i >= 3,
                  }
                )}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener nofollow"
              >
                <span className="relative grid aspect-video w-full place-items-center bg-black sm:w-36 ">
                  <YtThumbnail id={video.id} title={video.title} />
                  <span className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#68cbe9] p-3 text-2xl font-semibold text-black">
                    #{i + 1}
                  </span>
                </span>
                <span className="flex flex-col items-center justify-center text-center sm:w-auto sm:items-start sm:justify-start sm:text-left">
                  <span className="overflow-hidden text-2xl font-bold">
                    {shortenNameLength(video.title)}
                  </span>
                  <span className="flex gap-4 text-xl font-semibold">
                    <span className="flex items-center gap-2">
                      <IconEye width="1em" />
                      <span>{video.views}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <IconThumbUpFilled width="1em" />
                      <span>{video.likes}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <IconThumbDownFilled width="1em" />
                      <span>{video.dislikes}</span>
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <footer className="flex flex-row items-center gap-5">
            <Link
              href="https://tuesfest.bg"
              target="_blank"
              rel="noopener nofollow"
              className="flex cursor-pointer gap-1 text-lg text-white transition-transform hover:scale-110 hover:underline"
            >
              <IconExternalLink width="1em" /> TUES Fest 2023
            </Link>
            <Link
              href="https://github.com/bvpav/tf23-yt-leaderboards"
              target="_blank"
              rel="noopener nofollow"
              className="flex cursor-pointer gap-1 text-lg text-white transition-transform hover:scale-110 hover:underline"
            >
              <IconBrandGithubFilled width="1em" />
              GitHub
            </Link>
          </footer>
        </div>
      </main>
    </>
  );
};

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: SuperJSON,
  });

  await helpers.videos.get.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 60,
  };
}

export default Home;
