-- AlterTable
ALTER TABLE "InterviewReport" ADD COLUMN "technicalAssessment" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "InterviewReport" ADD COLUMN "communicationAssessment" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "InterviewReport" ADD COLUMN "questionReviews" JSONB NOT NULL DEFAULT '[]';