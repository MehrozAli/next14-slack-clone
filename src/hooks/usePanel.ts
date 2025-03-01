import { useParentMessageId } from "@/features/messages/store/useParentMessageId";
import { useProfileMemberId } from "@/features/members/store/useProfileMemberId";

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId();
  const [profileMemberId, setProfileMemberId] = useProfileMemberId();

  const onMessageOpen = (messageId: string) => {
    setParentMessageId(messageId);
    setProfileMemberId(null);
  };

  const onProfileOpen = (memberId: string) => {
    setProfileMemberId(memberId);
    setParentMessageId(null);
  };

  const onMessageClose = () => {
    setParentMessageId(null);
    setProfileMemberId(null);
  };

  return {
    parentMessageId,
    onMessageOpen,
    onMessageClose,
    profileMemberId,
    onProfileOpen,
  };
};
