import { FC } from "react";
import { BsHeart, BsHeartFill } from "react-icons/bs";

interface Props {
  busy?: boolean;
  label?: string;
  liked?: boolean;
  onClick?(): void;
}

const LikeHeart: FC<Props> = ({
  liked = false,
  label,
  onClick,
}): JSX.Element => {
  return (
    <button
      type="button"
      className="text-primary-dark dark:text-primary flex items-center space-x-2 outline-none"
      onClick={onClick}
    >
      {liked ? <BsHeartFill color="#4790FD" /> : <BsHeart />}
      <span>{label}</span>
    </button>
  );
};

export default LikeHeart;
