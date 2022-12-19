import { isValidObjectId } from "mongoose";
import { NextApiHandler } from "next";
import { isAuth } from "../../../lib/utils";
import Post from "../../../models/Post";

const handler: NextApiHandler = async (req, res) => {
  const { method } = req;
  switch (method) {
    case "GET":
      return getPostLikeStatus(req, res);
    default:
      res.status(404).send("Not found!");
  }
};

const getPostLikeStatus: NextApiHandler = async (req, res) => {
  const user = await isAuth(req, res);

  const { postId } = req.query as { postId: string };
  if (!isValidObjectId(postId))
    return res.status(422).json({ error: "Invalid post id!" });

  const post = await Post.findById(postId).select("likes");
  if (!post) return res.status(404).json({ error: "Post not found!" });

  const postLikes = post.likes || [];

  if (!user) {
    return res.json({
      likesCount: postLikes.length,
      likedByOwner: false,
    });
  }

  res.json({
    likesCount: postLikes.length,
    likedByOwner: postLikes.includes(user.id as any),
  });
};

export default handler;
