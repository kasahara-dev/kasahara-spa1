import LoginForm from "@/components/LoginForm";

export default function ParentLoginPage() {
  return (
    <div className="min-h-screen bg-parent-soft flex items-center justify-center p-4">
      <LoginForm role="parent" />
    </div>
  );
}
