import GradientBackground from "../../components/gradient-background";
import Input from "../../components/ui/input";

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
                <form className="flex gap-2 md:w-[35%] flex-col justify-start">
                    <div className="flex flex-col gap-1">
                        <label className="leading-[18px] text-lg">Username</label>
                        <Input type="text" placeholder="e.g. aurora_cloud" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="leading-[18px] text-lg">Password</label>
                        <Input type="password" placeholder="super secret password" />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white rounded-md p-2 mt-2">Sign Up</button>
                </form>
            </div>
        </main>
    )
}