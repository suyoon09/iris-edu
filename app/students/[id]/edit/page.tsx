import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getStudentById } from "@/lib/db";
import { StudentForm } from "@/components/student/StudentForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <StudentForm
              isEdit
              studentId={id}
              initialData={student}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

