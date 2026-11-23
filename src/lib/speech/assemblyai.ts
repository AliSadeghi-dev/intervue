import {
  TRANSCRIPTION_POLL_INTERVAL_MS,
  TRANSCRIPTION_TIMEOUT_MS,
} from "@/lib/speech/constants";

const ASSEMBLYAI_BASE = "https://api.assemblyai.com";

type TranscriptResponse = {
  id: string;
  status: "queued" | "processing" | "completed" | "error";
  text?: string;
  error?: string;
};

export function isAssemblyAIConfigured(): boolean {
  return Boolean(process.env.ASSEMBLYAI_API_KEY?.trim());
}

function getHeaders(): HeadersInit {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    throw new Error("ASSEMBLYAI_API_KEY is not configured");
  }
  return { authorization: apiKey };
}

async function uploadAudio(audio: ArrayBuffer): Promise<string> {
  const response = await fetch(`${ASSEMBLYAI_BASE}/v2/upload`, {
    method: "POST",
    headers: getHeaders(),
    body: audio,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AssemblyAI upload failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as { upload_url?: string };
  if (!payload.upload_url) {
    throw new Error("AssemblyAI upload did not return upload_url");
  }

  return payload.upload_url;
}

async function createTranscript(audioUrl: string): Promise<string> {
  const response = await fetch(`${ASSEMBLYAI_BASE}/v2/transcript`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_code: "en",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AssemblyAI transcript submit failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as { id?: string };
  if (!payload.id) {
    throw new Error("AssemblyAI transcript id missing");
  }

  return payload.id;
}

async function pollTranscript(transcriptId: string): Promise<string> {
  const started = Date.now();

  while (Date.now() - started < TRANSCRIPTION_TIMEOUT_MS) {
    const response = await fetch(`${ASSEMBLYAI_BASE}/v2/transcript/${transcriptId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`AssemblyAI poll failed (${response.status}): ${body}`);
    }

    const payload = (await response.json()) as TranscriptResponse;

    if (payload.status === "completed") {
      return (payload.text ?? "").trim();
    }

    if (payload.status === "error") {
      throw new Error(payload.error ?? "Transcription failed");
    }

    const retryAfter = Number(response.headers.get("retry-after"));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1_000
      : TRANSCRIPTION_POLL_INTERVAL_MS;

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Transcription timed out after 90 seconds");
}

export async function transcribeAudio(audio: ArrayBuffer): Promise<string> {
  const uploadUrl = await uploadAudio(audio);
  const transcriptId = await createTranscript(uploadUrl);
  const text = await pollTranscript(transcriptId);

  if (!text) {
    throw new Error("Transcription returned empty text");
  }

  return text;
}