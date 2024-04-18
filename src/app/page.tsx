import Link from "next/link";
import Image from "next/image";

import { CreatePost } from "~/app/_components/create-post";

import { api } from "~/trpc/server";
import { type AppRouter } from "~/server/api/root";
import { type inferRouterOutputs } from "@trpc/server";

import { SignInButton, useUser } from "@clerk/clerk-react";

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const { user } = useUser()

  if (!user) {
    return null
  }

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl}
        alt="Profile image"
        className="w-14 h-14 rounded-full"
      />
      <input type="text" placeholder="Type some emojis!" className="grow bg-transparent outline-none" />
    </div>
  )
}

type RouterOutputs = inferRouterOutputs<AppRouter>;
type PostWithUser = RouterOutputs['post']['getAll'][number]

const PostView = (props: PostWithUser) => {
  const { post, author } = props

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        className="w-14 h-14 rounded-full"
        alt={`@${author.username}'s profile picture`}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>{`@${author.username} `}</span>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  )
}

export default async function Home() {
  const user = useUser();
  
  const { data, isLoading } = api.post.getAll.useQuery();

  if (!isLoading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>Something went wrong...</div>
  }

  return (
    <main className="flex h-screen justify-center">
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex border-b border-slate-400 p-4">
          {!user.isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {user.isSignedIn && <CreatePostWizard />}
        </div>
        <div className="flex flex-col">
          {[...data, ...data]?.map((fullPost) => (
            <PostView {...fullPost} key={fullPost.post.id} />
          ))}
        </div>
      </div>
    </main>
  );
}

async function CrudShowcase() {
  const latestPost = await api.post.getLatest();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <CreatePost />
    </div>
  );
}
