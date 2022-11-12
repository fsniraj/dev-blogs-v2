import { Model, model, models, ObjectId, Schema } from "mongoose";

export interface IComment {
  _id: ObjectId;
  belongsTo: ObjectId;
  owner: ObjectId;
  content: string;
  likes: ObjectId[];
  replies?: ObjectId[];
  repliedTo?: ObjectId;
  chiefComment?: boolean;
  createdAt: string;
}

const CommentSchema = new Schema<IComment>(
  {
    belongsTo: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    repliedTo: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    chiefComment: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = models?.Comment || model("Comment", CommentSchema);

export default Comment as Model<IComment>;
