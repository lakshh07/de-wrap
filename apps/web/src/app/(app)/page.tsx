"use client";

import { Button } from "../components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React from "react";
import { ReactTyped } from "react-typed";

const Home = () => {
  const router = useRouter();

  return (
    <main className="h-screen w-full bg-zinc-100 bg-[url('/assets/images/grid-bg.png')] bg-center bg-repeat overflow-hidden relative">
      <div className="grad1" />
      <div className="grad2" />

      <nav className="py-2.5 mx-[5%] text-zinc-950 rounded-xl mt-4 pl-6 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold font-cairo">DeWrap</h1>
      </nav>

      <div className="px-8 relative top-26 flex items-center justify-center">
        <div className="h-[110%] flex items-center justify-center">
          <div className="text-center w-[100%] flex flex-col items-center">
            <h1 className="text-[80px] leading-none text-grad font-clash-display">
              Web3-Native <br />
              smart payments for <br />
              the
              <span className="font-garamond"> world&apos;s best</span>{" "}
            </h1>

            <h1 className="font-clash-display text-[80px] leading-none text-zinc-950 font-bold">
              <ReactTyped
                strings={["Builder.", "Creaters.", "Agencies.", "Freelancers."]}
                typeSpeed={150}
                backSpeed={50}
                loop
              />
            </h1>

            <p className="mt-8 text-xl leading-[140%] font-medium text-zinc-700">
              Get paid in any token. Auto-swap. Auto-invest.
            </p>
            <p className="mt-2 text-base font-medium text-zinc-500">
              All on-chain. All powered by 1inch.
            </p>

            <div className="flex items-center gap-2 transition-all duration-300">
              <Button
                className="mt-8 bg-[#7387FF] rounded-full !px-5 text-white hover:bg-[#7387FF]/80"
                onClick={() => router.push("/home")}
              >
                Get Started <IconArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
