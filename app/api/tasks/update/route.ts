import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const TaskUpdateSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['PENDING', 'COMPLETED', 'BLOCKED']),
  blockerReasonCode: z.string().optional(),
  blockerExplanation: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = TaskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { taskId, status, blockerReasonCode, blockerExplanation } = parsed.data;

    const taskInstance = await prisma.taskInstance.findUnique({
      where: { id: taskId },
      include: { template: true, store: true }
    });

    if (!taskInstance) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (status === "COMPLETED") {
      if (taskInstance.template.scheduledTime) {
        const [hour, minute] = taskInstance.template.scheduledTime.split(":").map(Number);

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (currentHour < hour || (currentHour === hour && currentMinute < minute)) {
          return NextResponse.json({ 
            error: "Cannot complete task before scheduled time" 
          }, { status: 403 });
        }
      }
    }

    const updatedTask = await prisma.taskInstance.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
        blockerReasonCode: status === "BLOCKED" ? blockerReasonCode : null,
        blockerExplanation: status === "BLOCKED" ? blockerExplanation : null
      }
    });

    if (status === "BLOCKED") {
      await prisma.store.update({
        where: { id: taskInstance.storeId },
        data: {
          healthScore: {
            decrement: 5
          }
        }
      });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: unknown) {
    console.error("Task update failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
