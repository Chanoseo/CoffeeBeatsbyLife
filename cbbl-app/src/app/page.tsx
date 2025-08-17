import Footer from "@/components/landing-page/footer/Footer";
import Header from "@/components/landing-page/header/Header";
import Main from "@/components/landing-page/main/Main";

export const metadata = {
  title: "Coffee Beats By Life",
  description: "Welcome to Coffee Beats By Life",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function LandingPage() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}
export default LandingPage;