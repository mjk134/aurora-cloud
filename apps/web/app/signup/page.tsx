import SignupForm from "../../components/forms/signup-form";
import GradientBackground from "../../components/gradient-background";
import Input from "../../components/ui/input";
import { signUpAction } from "./actions";

export default function SignUp() {
  return (
    <main className="flex font-sans py-6 flex-col justify-between items-center relative min-h-screen w-full">
      <div className="opacity-0">© Copyright Aurora Cloud 2025</div>
      <GradientBackground />
      <div className="flex flex-col gap-2 md:0 md:flex-row border border-solid bg-white border-gray-200 md:w-[55%] h-[30%] rounded-xl justify-between p-5 md:p-10">
        <div className="flex md:gap-2 flex-col">
          <h1 className="text-4xl md:text-6xl font-extrabold">Sign Up</h1>
          <p className="text-sm md:text-base leading-3 md:leading-4">
            Signing up, immediately allows you to upload files,
            <br />
            no other information required! 
          </p>
        </div>
        <SignupForm serverAction={signUpAction} />
      </div>
      <div className="text-white">© Copyright Aurora Cloud 2025</div>
    </main>
  );
}
