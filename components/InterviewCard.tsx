"use client"; // needed for button click handling

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId, deleteInterview } from "@/lib/actions/general.action";

const InterviewCard = async ({
  id,
  userId,
  role,
  type,
  techstack,
  createdAt,
  currentUserId, // ✅ pass this from parent page
}: InterviewCardProps & { currentUserId?: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const feedback =
    userId && id
      ? await getFeedbackByInterviewId({
          interviewId: id,
          userId,
        })
      : null;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this interview?")) return;
    setLoading(true);
    const res = await deleteInterview(id, userId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.message || "Error deleting interview");
    }
    setLoading(false);
  };

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <Image
            src={getRandomInterviewCover()}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          {/* Interview Role */}
          <h3 className="mt-5 capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between gap-2">
          <DisplayTechIcons techStack={techstack} />

          <div className="flex gap-2">
            <Button className="btn-primary">
              <Link
                href={
                  feedback
                    ? `/interview/${id}/feedback`
                    : `/interview/${id}`
                }
              >
                {feedback ? "Check Feedback" : "View Interview"}
              </Link>
            </Button>

            {/* ✅ Only show Delete if current user is creator */}
            {currentUserId === userId && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
