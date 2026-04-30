// Phase 5C — Notification dispatch (stub).
// 실제 SMS/카카오톡/이메일 송신은 미연결. 콘솔 로깅 후 status=SENT 로 마킹.
// Payment 처럼 본격 도입 시 이 dispatcher 만 교체하면 된다.

import type { PrismaClient } from '@prisma/client';
import type { Prisma, NotificationChannel } from '@prisma/client';

type NotificationCreateInput = Prisma.NotificationUncheckedCreateInput;

/**
 * Persist a Notification and immediately attempt to dispatch it via the stub
 * adapter for its channel. Failures are recorded on the row but never thrown
 * (notifications must not break the originating user action).
 */
export async function enqueueAndDispatch(
    prisma: PrismaClient | Prisma.TransactionClient,
    input: NotificationCreateInput,
): Promise<void> {
    const created = await prisma.notification.create({ data: input });
    try {
        await dispatch(created.channel, {
            id: created.id,
            recipientType: created.recipientType,
            recipientId: created.recipientId,
            title: created.title,
            body: created.body,
        });
        await prisma.notification.update({
            where: { id: created.id },
            data: { status: 'SENT', sentAt: new Date(), errorMessage: null },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await prisma.notification.update({
            where: { id: created.id },
            data: { status: 'FAILED', errorMessage: message },
        });
    }
}

interface DispatchPayload {
    id: string;
    recipientType: string;
    recipientId: string;
    title: string;
    body: string;
}

async function dispatch(channel: NotificationChannel, n: DispatchPayload): Promise<void> {
    switch (channel) {
        case 'APP':
            // Real-time push via WebSocket / Service Worker push would go here.
            console.log(`[notify:APP] → ${n.recipientType}:${n.recipientId} ${n.title}`);
            return;
        case 'SMS':
            console.log(`[notify:SMS stub] → ${n.recipientType}:${n.recipientId} ${n.title} :: ${n.body}`);
            return;
        case 'KAKAO':
            console.log(`[notify:KAKAO stub] → ${n.recipientType}:${n.recipientId} ${n.title}`);
            return;
        case 'EMAIL':
            console.log(`[notify:EMAIL stub] → ${n.recipientType}:${n.recipientId} ${n.title}`);
            return;
    }
}
