import { useEffect, useState } from "react";
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

function LandingPage({ preview = false }) {
  const [page, setPage] = useState(null);

  useEffect(() => {
    const url = preview
      ? `/api/pages/preview/landing?token=${process.env.REACT_APP_PREVIEW_TOKEN}`
      : "/api/pages/public/landing";
    fetch(url)
      .then((r) => r.json())
      .then(setPage)
      .catch(console.error);
  }, [preview]);

  if (!page) return <div>Loading...</div>;

  const { hero, features, cta, footer } = page.body;

  return (
    <>
      <Header hero={hero} />
      <Main features={features} cta={cta} />
      <Footer data={footer} />
    </>
  );
}
export default LandingPage;
