import { SignIn } from '@clerk/nextjs';

export default function Signin() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <SignIn routing="hash" signUpUrl="signup" />;
    </div>
  );
}
