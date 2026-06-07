import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hasDepartmentAccess } from '../../../../lib/departmentAccess';

type SuggestionPayload = {
  sopId?: string;
  userId?: string;
  submittedByName?: string;
  submittedByRole?: string;
  department?: string;
  suggestion?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SuggestionPayload;
    const { sopId, userId, submittedByName, submittedByRole, department, suggestion } = body;

    if (!sopId || !userId || !submittedByName || !department || !suggestion) {
      return NextResponse.json(
        { error: 'Missing required fields: sopId, userId, submittedByName, department, suggestion.' },
        { status: 400 }
      );
    }

    if (suggestion.trim().length < 20) {
      return NextResponse.json(
        { error: 'Suggestion must be at least 20 characters long.' },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error('Error creating SOP suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
