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
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createProxySSGHelpers as createServerSideHelpers } from "@trpc/react-query/ssg";
import classNames from "classnames";
import Image from "next/image";
import { useEffect, useState } from "react";
import SuperJSON from "superjson";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";
import { RadioGroup } from "@headlessui/react";

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
  const diffInMinutes = Math.min(Math.round(diff / 1000 / 60), 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFakeNow(Date.now());
    }, 1000 * 30);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <time dateTime={date.toISOString()}>
      {diffInMinutes > 0
        ? relativeFormat.format(diffInMinutes, "minute")
        : "преди малко"}
    </time>
  );
};

const SortByRadio = ({
  value,
  onChange,
}: {
  value: "views" | "likes";
  onChange: (value: "views" | "likes") => void;
}) => {
  const options = [
    {
      value: "views",
      label: "Гледания",
      icon: IconEye,
    },
    {
      value: "likes",
      label: "Харесвания",
      icon: IconThumbUpFilled,
    },
  ];
  return (
    <RadioGroup value={value} onChange={onChange}>
      <RadioGroup.Label className="sr-only">Сортирай по</RadioGroup.Label>
      <div className="flex items-center">
        {options.map((opt) => (
          <RadioGroup.Option
            key={opt.value}
            value={opt.value}
            className="relative flex cursor-pointer items-center px-2 py-1 text-lg font-medium shadow-sm first:rounded-s-md last:rounded-e-md focus:outline-none  ui-checked:bg-white ui-not-checked:border-gray-700 ui-not-checked:bg-white/10"
          >
            <span
              className="mt-0.5 flex items-center justify-center"
              aria-hidden="true"
            >
              <opt.icon
                className="ui-checked:text-black ui-not-checked:text-white"
                width="2em"
              />
            </span>
            <span className="sr-only">{opt.label}</span>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

const Home: NextPage = () => {
  const videos = api.videos.get.useQuery(undefined, {
    refetchInterval: 1000 * 60 * 2,
  });
  const [animationParent] = useAutoAnimate();
  const [sortBy, setSortBy] = useState<"views" | "likes">("views");
  const ranks = new Set<number>();
  const sortedVideos = videos.data
    ?.sort((a, b) => {
      if (sortBy === "views") {
        return (
          b.views - a.views ||
          b.likes - a.likes ||
          a.title.localeCompare(b.title)
        );
      } else {
        return (
          b.likes - a.likes ||
          b.views - a.views ||
          a.title.localeCompare(b.title)
        );
      }
    })
    .map((video) => {
      const rank =
        new Set(
          videos.data
            .filter((v) => v[sortBy] > video[sortBy])
            .map((v) => v[sortBy])
        ).size + 1;
      const isFirstInRank = !ranks.has(rank);
      if (isFirstInRank) {
        ranks.add(rank);
      }
      return {
        ...video,
        rank,
        isFirstInRank,
      };
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
                    Последно обновено{" "}
                    <RelativeDate date={new Date(videos.dataUpdatedAt)} />.
                  </span>
                </>
              )}
            </p>
          </header>
          <SortByRadio value={sortBy} onChange={setSortBy} />
          <div
            ref={animationParent}
            className="flex w-full max-w-lg flex-col items-center gap-4"
          >
            {sortedVideos?.map((video) => (
              <Link
                key={video.id}
                id={video.isFirstInRank ? `${video.rank}` : undefined}
                className={classNames(
                  "flex w-full flex-col items-center gap-4 rounded-xl p-4 shadow-sm transition-all hover:scale-105 sm:flex-row",
                  {
                    "border-8": video.rank < 4,
                    "border ": video.rank >= 4,
                    "text-black": video.rank < 3,
                    "text-white": video.rank >= 3,
                    "border-yellow-500 bg-yellow-300 hover:bg-yellow-200":
                      video.rank === 1,
                    "border-amber-600 bg-amber-500 hover:bg-amber-400":
                      video.rank === 3,
                    "border-gray-600 bg-gray-500 hover:bg-gray-400":
                      video.rank === 2,
                    "border-gray-700 bg-white/10 hover:bg-white/20":
                      video.rank >= 4,
                    "mt-8": video.rank === 4 && video.isFirstInRank,
                  }
                )}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener nofollow"
              >
                <span className="relative grid aspect-video w-full place-items-center bg-black sm:w-36 ">
                  <YtThumbnail id={video.id} title={video.title} />
                  <span className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#68cbe9] p-3 text-2xl font-semibold text-black">
                    #{video.rank}
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
