export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const imageProblem = (file: { contentType?: string; size: number }) => {
  if (!file.contentType || !IMAGE_TYPES.includes(file.contentType)) {
    return "Only PNG, JPEG, GIF or WebP images can be attached";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Images must be 5 MB or smaller";
  }

  return null;
};

export const NAME_MIN = 3;
export const NAME_MAX = 80;
export const MESSAGE_BODY_MAX = 20_000;
export const REACTION_MAX = 32;

const checkLength = (value: string, label: string) => {
  if (value.length < NAME_MIN || value.length > NAME_MAX) {
    throw new Error(`${label} must be ${NAME_MIN}-${NAME_MAX} characters`);
  }

  return value;
};

export const workspaceName = (raw: string) =>
  checkLength(raw.trim().replace(/\s+/g, " "), "Workspace name");

export const channelName = (raw: string) =>
  checkLength(raw.trim().replace(/\s+/g, "-").toLowerCase(), "Channel name");

// Bodies are Quill deltas serialised by the editor; the renderer parses
// them with JSON.parse, so anything else would break the message list.
export const messageBody = (raw: string) => {
  if (raw.length > MESSAGE_BODY_MAX) {
    throw new Error("Message is too long");
  }

  let delta: unknown;

  try {
    delta = JSON.parse(raw);
  } catch {
    throw new Error("Message body must be a Quill delta");
  }

  const ops = (delta as { ops?: unknown })?.ops;

  if (!Array.isArray(ops) || !ops.every((op) => op && typeof op === "object")) {
    throw new Error("Message body must be a Quill delta");
  }

  return raw;
};

export const reactionValue = (raw: string) => {
  if (raw.length === 0 || raw.length > REACTION_MAX || /\s/.test(raw)) {
    throw new Error("Invalid reaction");
  }

  return raw;
};
