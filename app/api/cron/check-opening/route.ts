import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        taskInstances: {
          where: {
            // Find today's tasks
            date: new Date(new Date().setUTCHours(0, 0, 0, 0)),
            template: {
              title: "Store Opening" // Assuming this is the title for the opening task
            }
          },
          include: {
            template: true
          }
        }
      }
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const alertsSent = [];

    for (const store of stores) {
      if (!store.districtManagerEmail) continue;

      const openingTask = store.taskInstances[0];
      if (!openingTask || openingTask.status === "COMPLETED") continue;

      const [openHour, openMin] = store.openTime.split(':').map(Number);
      
      // Calculate 15 mins past open time
      const expectedOpenTime = new Date();
      expectedOpenTime.setHours(openHour, openMin + 15, 0, 0);

      const now = new Date();

      if (now > expectedOpenTime) {
        // Send Alert
        await transporter.sendMail({
          from: '"Store Ops Alerts" <alerts@formansmerch.com>',
          to: store.districtManagerEmail,
          subject: `URGENT: Store ${store.name} Opening Delayed`,
          text: `Store ${store.name} was scheduled to open at ${store.openTime} but the opening task has not been completed. Please investigate immediately.`,
        });

        alertsSent.push(store.name);
      }
    }

    return NextResponse.json({ success: true, alertsSent });
  } catch (error: unknown) {
    console.error("Failed to check store openings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
