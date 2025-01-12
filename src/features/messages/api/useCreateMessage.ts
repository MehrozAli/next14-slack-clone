import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type Status = "success" | "error" | "pending" | "settled" | null;
type ResponseType = Id<"messages"> | null;
type RequestType = {
  body: string;
  image?: Id<"_storage">;
  workspaceId: Id<"workspaces">;
  channelId?: Id<"channels">;
  parentMessageId?: Id<"messages">;
  conversationId?: Id<"conversations">;
};

interface Options {
  onSuccess?: (data: ResponseType) => void;
  onError?: (err: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
}

export const useCreateMessages = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<Status>(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);
  const isError = useMemo(() => status === "error", [status]);

  const mutation = useMutation(api.messages.create);

  const mutate = useCallback(
    async (values: RequestType, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        const response = await mutation(values);

        setStatus("success");
        options?.onSuccess?.(response);

        return response;
      } catch (err) {
        setStatus("error");
        options?.onError?.(err as Error);

        if (options?.throwError) {
          throw err;
        }
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
};
