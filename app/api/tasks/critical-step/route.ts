import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function POST(request: Request) {
  try {
    const { taskId, stepIndex, isFinalStep, lat, lng } = await request.json();

    const taskInstance = await prisma.taskInstance.findUnique({
      where: { id: taskId },
      include: { store: true }
    });

    if (!taskInstance) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (isFinalStep) {
      if (!lat || !lng) {
        return NextResponse.json({ error: "Geolocation required for final step" }, { status: 400 });
      }

      // Assume store coords are set. For prototype, if null, allow it or throw error.
      const storeLat = taskInstance.store.latitude;
      const storeLng = taskInstance.store.longitude;

      if (storeLat !== null && storeLng !== null) {
        const distKm = getDistanceFromLatLonInKm(lat, lng, storeLat, storeLng);
        // e.g. within 500 meters (0.5 km)
        if (distKm > 0.5) {
          return NextResponse.json({ 
            error: `Location validation failed. You are ${Math.round(distKm*1000)}m away. Must be within 500m.` 
          }, { status: 403 });
        }
      }
    }

    const updatedTask = await prisma.taskInstance.update({
      where: { id: taskId },
      data: {
        currentStep: stepIndex,
        ...(isFinalStep && { status: "COMPLETED", completedAt: new Date() })
      }
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Failed to update critical step:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
