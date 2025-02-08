import { useParentMessageId } from "@/features/messages/store/useParentMessageId";

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId();

  const onMessageOpen = (messageId: string) => setParentMessageId(messageId);
  const onMessageClose = () => setParentMessageId(null);

  return { parentMessageId, onMessageOpen, onMessageClose };
};
