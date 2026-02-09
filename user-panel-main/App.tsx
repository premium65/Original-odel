"use client";

import { NextUIProvider } from "@nextui-org/react";
import { PropsWithChildren, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRecoilState } from "recoil";
import { authState } from "./state/authAtom";
import LoggedInHeader from "./components/default/header";
import Header from "./components/header/Header";
import Footer from "./components/Footer/footer";
import { useRouter } from "next/navigation";

function App({ children }: PropsWithChildren) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggedIn] = useRecoilState(authState); // Use Recoil state
  useEffect(() => {
    setIsHydrated(true);
  }, []);
/*   useEffect(() => {
    const clearUserToken = () => {
      localStorage.removeItem('userToken');
       // Calculate the expiration date for the cookie (set it to a past date)
    const expires = new Date();
    expires.setTime(expires.getTime() - 1); // Set the expiration time to a past date

    // Update the document.cookie to clear the token
    document.cookie = `token=; path=/; expires=${expires.toUTCString()};`;
      router.push('/')
    };
    
    window.addEventListener('beforeunload', clearUserToken);
    
    return () => {
      window.removeEventListener('beforeunload', clearUserToken);
    };
  }, []); */
/*   useEffect(() => {
    // Check if the user token is null
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.push('/unauthorized'); // Redirect to unauthorized page if token is null
    }
  }, [router]); */

  if (!isHydrated) {
    // Show a loading state or return null during SSR or until hydration is done
    return null;
  }
  return (
      <NextUIProvider>
                <ToastContainer />
            <div className="flex flex-col min-h-screen h-full">
      <div className="flex-1">
        {isLoggedIn ? <LoggedInHeader /> : <Header />}
        {/* Main content */}
        <main style={{ marginTop: "100px" }}>
          {" "}
          {/* Adjust padding bottom to footer height */}
          {children}
        </main>
        </div>
        <Footer />
        </div>

      </NextUIProvider>
  );
}

export default App;
