import LoginForm from "../../components/forms/login-form";
import GradientBackground from "../../components/gradient-background";
import Input from "../../components/ui/input";
import { loginAction } from "./actions";

export default function Login() {

    return (
        <main className="flex font-sans flex-col justify-center items-center relative min-h-screen w-full">
            <GradientBackground />
            <div className="flex flex-col gap-2 md:0 md:flex-row border border-solid bg-white border-gray-200 md:w-[55%] h-[30%] rounded-xl justify-between p-5 md:p-10">
                 <div className="flex md:gap-2 flex-col">
                    <h1 className="text-4xl md:text-6xl font-extrabold">Login</h1>
                    <p className="text-sm md:text-base leading-3 md:leading-4">
                        Signing up, immediately allows you to upload files,<br/>
                        no other information required! Sign up using either<br/>
                        username & password or Google/X.
                    </p>
                 </div>
                <LoginForm serverAction={loginAction} />
            </div>
        </main>
    )
}