"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: feedbackSchema,
      prompt: `
            You are an AI interviewer analyzing a mock interview transcript. 
            Your task is to evaluate the candidate based on predefined categories. 
            Follow these instructions strictly:

            1. Always return exactly one JSON object that matches the provided schema.  
            2. "categoryScores" must contain all 5 categories, in this order only:
              - Communication Skills
              - Technical Knowledge
              - Problem Solving
              - Cultural Fit
              - Confidence and Clarity
            3. Each category must include a score (0–100) and a clear, detailed comment.  
            4. Provide at least 2–3 "strengths" and 2–3 "areasForImprovement".  
            5. "finalAssessment" must be a concise summary of overall performance.  
            6. Do not invent new categories or fields.

            Transcript:
            ${formattedTranscript}
                  `,
        system:
            "You are a professional interviewer. Evaluate strictly, provide constructive feedback, and return structured JSON only.",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function deleteInterview(interviewId: string, userId: string) {
  try {
    const interviewRef = db.collection("interviews").doc(interviewId);
    const interviewDoc = await interviewRef.get();

    if (!interviewDoc.exists) {
      return { success: false, message: "Interview not found" };
    }

    const interviewData = interviewDoc.data();

    // Check if the logged-in user created this interview
    if (interviewData?.userId !== userId) {
      return { success: false, message: "You are not authorized to delete this interview" };
    }

    // Delete the interview
    await interviewRef.delete();

    return { success: true, message: "Interview deleted successfully" };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, message: "Error deleting interview" };
  }
}