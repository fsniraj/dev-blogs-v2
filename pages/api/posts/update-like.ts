import { isValidObjectId } from "mongoose";
import { NextApiHandler } from "next";
import { isAuth } from "../../../lib/utils";
import Post from "../../../models/Post";

const handler: NextApiHandler = async (req, res) => {
  const { method } = req;
  switch (method) {
    case "POST":
      return updatePostLike(req, res);
    default:
      res.status(404).send("Not found!");
  }
};

const updatePostLike: NextApiHandler = async (req, res) => {
  const user = await isAuth(req, res);
  if (!user) return res.status(401).json({ error: "You are not authorized!" });

  const { postId } = req.query as { postId: string };
  if (!isValidObjectId(postId))
    return res.status(422).json({ error: "Invalid post id!" });

  const post = await Post.findById(postId).select("likes");
  if (!post) return res.status(404).json({ error: "Post not found!" });

  const oldLikes = post.likes || [];
  const likedBy = user.id as any;

  // unlike
  if (oldLikes.includes(likedBy)) {
    post.likes = oldLikes.filter(
      (like) => like.toString() !== likedBy.toString()
    );
  }
  // like post
  else {
    post.likes = [...oldLikes, likedBy];
  }

  await post.save();
  res.status(201).json({
    newLikes: post.likes.length,
  });
};

export default handler;
