import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Editor, { FinalPost } from "../../../../components/editor";
import AdminLayout from "../../../../components/layout/AdminLayout";
import { generateFormData } from "../../../../utils/helper";

interface Props {}

const Create: NextPage<Props> = () => {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (post: FinalPost) => {
    setCreating(true);
    try {
      // we have to generate FormData
      const formData = generateFormData(post);

      // submit our post
      const { data } = await axios.post("/api/posts", formData);
      router.push("/admin/posts/update/" + data.post.slug);
    } catch (error: any) {
      console.log(error.response.data);
    }
    setCreating(false);
  };

  return (
    <AdminLayout title="New Post">
      <div className="max-w-4xl mx-auto">
        <Editor onSubmit={handleSubmit} busy={creating} />
      </div>
    </AdminLayout>
  );
};

export default Create;
