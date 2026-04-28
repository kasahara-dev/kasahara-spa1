import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">ようこそ、{session.user?.name}さん！</p>
        <p className="text-gray-600 mt-2">
          このページは認証されたユーザーのみアクセスできます。
        </p>
      </div>
    </div>
  );
}
