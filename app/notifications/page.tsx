import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prismadb from "@/libs/prismadb";
import getCurrentUser from "@/actions/get-current-user";

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // Fetch notifications for the current user only
  const notifications = await prismadb.notification.findMany({
    where: { userId: currentUser.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="text-gray-500">No notifications yet.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li key={n.id} className={`p-4 rounded border ${n.read ? 'bg-gray-100' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="font-semibold mb-1">{n.title}</div>
              <div className="mb-1">{n.body}</div>
              <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
