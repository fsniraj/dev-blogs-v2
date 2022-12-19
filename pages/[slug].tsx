import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import parse from "html-react-parser";
import DefaultLayout from "../components/layout/DefaultLayout";
import dbConnect from "../lib/dbConnect";
import Post from "../models/Post";
import Image from "next/image";
import dateFormat from "dateformat";
import Comments from "../components/common/Comments";
import LikeHeart from "../components/common/LikeHeart";
import { useCallback, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { signIn } from "next-auth/react";
import axios from "axios";
import User from "../models/User";
import AuthorInfo from "../components/common/AuthorInfo";
import Share from "../components/common/Share";
import Link from "next/link";

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const host = "https://v2.fsniraj.dev/";

const SinglePost: NextPage<Props> = ({ post }) => {
  const [likes, setLikes] = useState({ likedByOwner: false, count: 0 });
  const [liking, setLiking] = useState(false);
  const {
    id,
    title,
    content,
    tags,
    meta,
    author,
    slug,
    thumbnail,
    createdAt,
    relatedPosts,
  } = post;

  const user = useAuth();

  const getLikeLabel = useCallback((): string => {
    const { likedByOwner, count } = likes;

    if (likedByOwner && count === 1) return "You liked this post.";
    if (likedByOwner) return `You and ${count - 1} other likes this post.`;

    if (count === 0) return "Like post.";

    return count + " people liked this post.";
  }, [likes]);

  const handleOnLikeClick = async () => {
    setLiking(true);
    try {
      if (!user) return await signIn("github");
      const { data } = await axios.post(`/api/posts/update-like?postId=${id}`);
      setLikes({ likedByOwner: !likes.likedByOwner, count: data.newLikes });
    } catch (error) {
      console.log(error);
    }
    setLiking(false);
  };

  useEffect(() => {
    axios(`/api/posts/like-status?postId=${id}`)
      .then(({ data }) =>
        setLikes({ likedByOwner: data.likedByOwner, count: data.likesCount })
      )
      .catch((err) => console.log(err));
  }, []);

  return (
    <DefaultLayout title={title} desc={meta}>
      <div className="lg:px-0 px-3">
        {thumbnail ? (
          <div className="relative aspect-video">
            <Image src={thumbnail} alt={title} layout="fill" />
          </div>
        ) : null}

        <h1 className="text-6xl font-semibold text-primary-dark dark:text-primary py-2">
          {title}
        </h1>

        <div className="flex items-center justify-between py-2 text-secondary-dark dark:text-secondary-light">
          {tags.map((t, index) => (
            <span key={t + index}>#{t}</span>
          ))}
          <span>{dateFormat(createdAt, "d-mmm-yyyy")}</span>
        </div>

        <div className="py-5 transition dark:bg-primary-dark bg-primary sticky top-0 z-50">
          <Share url={host + "/" + slug} />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-full mx-auto">
          {parse(content)}
        </div>

        <div className="py-10">
          <LikeHeart
            liked={likes.likedByOwner}
            label={getLikeLabel()}
            onClick={!liking ? handleOnLikeClick : undefined}
            busy={liking}
          />
        </div>

        <div className="pt-10">
          <AuthorInfo profile={JSON.parse(author)} />
        </div>

        <div className="pt-5">
          <h3 className="text-xl font-semibold bg-secondary-dark text-primary p-2 mb-4">
            Related Posts:
          </h3>

          <div className="flex flex-col space-y-4">
            {relatedPosts.map((p) => {
              return (
                <Link key={p.slug} href={p.slug}>
                  <a className="font-semibold text-primary-dark dark:text-primary hover:underline">
                    {p.title}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>

        <Comments belongsTo={id} />
      </div>
    </DefaultLayout>
  );
};

export default SinglePost;

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    await dbConnect();
    const posts = await Post.find().select("slug");
    const paths = posts.map(({ slug }) => ({ params: { slug } }));
    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    return {
      paths: [{ params: { slug: "/" } }],
      fallback: false,
    };
  }
};

interface StaticPropsResponse {
  post: {
    id: string;
    title: string;
    content: string;
    meta: string;
    tags: string[];
    slug: string;
    thumbnail: string;
    createdAt: string;
    author: string;
    relatedPosts: {
      id: string;
      title: string;
      slug: string;
    }[];
  };
}

export const getStaticProps: GetStaticProps<
  StaticPropsResponse,
  { slug: string }
> = async ({ params }) => {
  try {
    await dbConnect();
    const post = await Post.findOne({ slug: params?.slug }).populate("author");
    if (!post) return { notFound: true };

    // fetching related posts according to tags
    const posts = await Post.find({
      tags: { $in: [...post.tags] },
      _id: { $ne: post._id },
    })
      .sort({ createdAt: "desc" })
      .limit(5)
      .select("slug title");

    const relatedPosts = posts.map((p) => {
      return {
        id: p._id.toString(),
        title: p.title,
        slug: p.slug,
      };
    });

    const {
      _id,
      title,
      content,
      meta,
      slug,
      author,
      tags,
      thumbnail,
      createdAt,
    } = post;

    const admin = await User.findOne({ role: "admin" });
    const authorInfo = (author || admin) as any;

    const postAuthor = {
      id: authorInfo._id,
      name: authorInfo.name,
      avatar: authorInfo.avatar,
      message: `This post is written by ${authorInfo.name}. ${
        authorInfo.name.split(" ")[0]
      } is an full stack JavaScript developer. You can find him on twitter @fsniraj`,
    };

    return {
      props: {
        post: {
          id: _id.toString(),
          title,
          content,
          meta,
          slug,
          tags,
          thumbnail: thumbnail?.url || "",
          createdAt: createdAt.toString(),
          author: JSON.stringify(postAuthor),
          relatedPosts,
        },
      },
      revalidate: 60,
    };
  } catch (error) {
    return { notFound: true };
  }
};
