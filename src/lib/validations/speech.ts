import { z } from "zod";

import { MAX_AUDIO_UPLOAD_BYTES } from "@/lib/speech/constants";

export const transcribeRequestFieldsSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
});

export function validateAudioByteSize(size: number): boolean {
  return size > 0 && size <= MAX_AUDIO_UPLOAD_BYTES;
}