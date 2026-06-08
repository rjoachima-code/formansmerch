import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDepartmentAccess } from '@/lib/departmentAccess';
import { z } from 'zod';

const SuggestionSchema = z.object({
  sopId: z.string().uuid(),
  userId: z.string().uuid(),
  submittedByName: z.string().min(1),
  submittedByRole: z.string().optional(),
  department: z.string().min(1),
  suggestion: z.string().min(20)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SuggestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
         { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { sopId, userId, submittedByName, submittedByRole, department, suggestion } = parsed.data;

    const [user, sop] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, assignedDepartments: true, role: true }
      }),
      prisma.storeSOP.findUnique({
        where: { id: sopId },
        select: { id: true, departments: true }
      })
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!sop) {
      return NextResponse.json({ error: 'SOP not found.' }, { status: 404 });
    }

    const hasAccess = hasDepartmentAccess(user.assignedDepartments, [department]);
    const departmentTaggedOnSop = sop.departments
      .map((d: string) => d.toLowerCase())
      .includes(department.toLowerCase());

    if (!hasAccess || !departmentTaggedOnSop) {
      return NextResponse.json(
        { error: 'You are not authorized to submit suggestions for this department SOP.' },
        { status: 403 }
      );
    }

    const createdSuggestion = await prisma.procedureImprovementSuggestion.create({
      data: {
        sopId,
        submittedByUserId: userId,
        submittedByName: submittedByName.trim(),
        submittedByRole: submittedByRole?.trim() || user.role || null,
        department: department.trim(),
        suggestion: suggestion.trim()
      }
    });

    return NextResponse.json({ suggestion: createdSuggestion }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating SOP suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
