export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-staff-soft min-h-screen">
      {children}
    </div>
  );
}
