"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInterview } from "@/lib/actions/general.action";
import { Trash2 } from "lucide-react";
import { toast } from "sonner"; // Import toast

export default function DeleteInterviewButton({
  interviewId,
  userId,
}: DeleteInterviewButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    toast.info("Are you sure you want to delete this interview?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setLoading(true);

          try {
            const result = await deleteInterview(interviewId, userId);

            if (!result.success) {
              toast.error(result.message || "Error deleting interview.");
              return;
            }

            toast.success("Interview deleted successfully!");
            startTransition(() => {
              router.refresh();
            });
          } catch (error) {
            console.error(error);
            toast.error("Unexpected error while deleting interview.");
          } finally {
            setLoading(false);
          }
        },
      },
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
      title="Delete Interview"
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <Trash2 size={20} />
      )}
    </button>
  );
}
