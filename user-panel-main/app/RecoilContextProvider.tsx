'use client';
import App from "@/App";
import { RecoilRoot } from "recoil";

export default function RecoilContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <App>
        {children}
      </App>
    </RecoilRoot>
  );
}
