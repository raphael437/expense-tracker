import { SignUp } from '@clerk/nextjs';

export default function Signup() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <SignUp routing="hash" signInUrl="login" />
    </div>
  );
}
