// src/pages/AdminLandingEditor.jsx
import { useEffect, useState } from "react";
import DirectImageUploader from "../components/DirectImageUploader";

export default function AdminLandingEditor() {
  const [page, setPage] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/pages/landing", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setPage)
      .catch(console.error);
  }, []);

  if (!page) return <div>Loading...</div>;

  function updateHeroImage(url) {
    setPage({ ...page, body: { ...page.body, hero: { ...page.body.hero, image: url } } });
  }

  async function saveDraft() {
    await fetch("/api/pages/landing", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(page),
    });
    alert("Draft saved!");
  }

  async function publish() {
    await fetch("/api/pages/landing/publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Published!");
  }

  return (
    <div>
      <h2>Edit Landing Page</h2>
      <input
        value={page.title}
        onChange={(e) => setPage({ ...page, title: e.target.value })}
        placeholder="Page title"
      />
      <textarea
        value={page.body.hero.headline}
        onChange={(e) =>
          setPage({
            ...page,
            body: { ...page.body, hero: { ...page.body.hero, headline: e.target.value } },
          })
        }
        placeholder="Hero headline"
      />
      <DirectImageUploader onUploaded={updateHeroImage} />
      {page.body.hero.image && <img src={page.body.hero.image} alt="Hero" width="300" />}

      <div>
        <button onClick={saveDraft}>Save Draft</button>
        <button onClick={publish}>Publish</button>
      </div>
    </div>
  );
}
