import LoginForm from "@/components/LoginForm";

export default function ParentLoginPage() {
  return (
    <div className="min-h-screen bg-staff-soft flex items-center justify-center p-4">
      <LoginForm role="staff" />
    </div>
  );
}
