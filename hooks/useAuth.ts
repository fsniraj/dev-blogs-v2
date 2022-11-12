import { useSession } from "next-auth/react";
import { UserProfile } from "../utils/types";

const useAuth = () => {
  const { data } = useSession();
  const user = data?.user;
  if (user) return user as UserProfile;
};

export default useAuth;
