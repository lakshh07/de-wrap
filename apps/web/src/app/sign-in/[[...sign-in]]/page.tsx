import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="h-screen w-full bg-zinc-100 bg-[url('/assets/images/grid-bg.png')] bg-center bg-repeat overflow-hidden relative">
      <nav className="py-2.5 mx-[5%] text-zinc-950 rounded-xl mt-4 pl-6 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold font-cairo">DeWrap</h1>
      </nav>

      <div className="w-full h-[calc(100vh-150px)] flex justify-center items-center">
        <SignIn />
      </div>
    </div>
  );
}
