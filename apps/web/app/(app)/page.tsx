"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { ReactTyped } from "react-typed";

const Home = () => {
  return (
    <main className="h-screen w-full bg-zinc-100 bg-[url('/assets/images/grid-bg.png')] bg-center bg-repeat overflow-hidden relative">
      <div className="grad1" />
      <div className="grad2" />

      <nav className="py-2.5 mx-[5%] text-zinc-950 rounded-xl mt-4 pl-6 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold font-cairo">DeWrap</h1>

        <div className="scale-90">
          <ConnectButton />
        </div>
      </nav>

      <div className="px-8 relative top-32 flex items-center justify-center">
        <div className="h-[110%] flex items-center justify-center">
          <div className="text-center w-[57%]">
            <h1 className="text-[80px] leading-none text-grad font-clash-display">
              Web3-Native smart payments for the
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
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
