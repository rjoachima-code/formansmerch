import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { taskId, status, blockerReasonCode, blockerExplanation } = await request.json();

    const taskInstance = await prisma.taskInstance.findUnique({
      where: { id: taskId },
      include: { template: true, store: true }
    });

    if (!taskInstance) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (status === "COMPLETED") {
      // Prevent early check-off based on scheduled time
      if (taskInstance.template.scheduledTime) {
        const [hour, minute] = taskInstance.template.scheduledTime.split(":").map(Number);
        
        // Mocking store local time using server time for simplicity in this prototype.
        // In a real app, use the store's timezone (e.g., store.timezone)
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

    // Update health score if blocked
    if (status === "BLOCKED") {
      // E.g., deduct 5 points per blocker
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
  } catch (error) {
    console.error("Task update failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
