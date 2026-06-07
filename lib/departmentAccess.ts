type DepartmentUser = {
  assignedDepartments: string[];
};

export function hasDepartmentAccess(
  userDepartments: string[],
  sopDepartments: string[]
): boolean {
  if (!Array.isArray(userDepartments) || userDepartments.length === 0) {
    return false;
  }

  if (!Array.isArray(sopDepartments) || sopDepartments.length === 0) {
    return false;
  }

  const normalizedUserDepartments = userDepartments.map((department) =>
    department.trim().toLowerCase()
  );

  return sopDepartments.some((department) =>
    normalizedUserDepartments.includes(department.trim().toLowerCase())
  );
}

export function filterSopsByDepartmentAccess<
  T extends { departments: string[] }
>(sops: T[], user: DepartmentUser): T[] {
  return sops.filter((sop) =>
    hasDepartmentAccess(user.assignedDepartments, sop.departments)
  );
}
