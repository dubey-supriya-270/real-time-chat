
import AcceptInviteClient from '@/components/AcceptInviteClient'
import { use } from 'react';

export default function InvitePage({params}: {params: Promise<{ inviteId: string }>}) {
  const { inviteId } = use(params);
  return <AcceptInviteClient inviteId={inviteId} />
}
