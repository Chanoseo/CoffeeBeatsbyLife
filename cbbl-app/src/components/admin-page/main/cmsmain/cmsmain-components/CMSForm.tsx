import PreviewFourForm from "./PreviewFourForm";
import PreviewOneForm from "./PreviewOneForm";
import PreviewThreeForm from "./PreviewThreeForm";
import PreviewTwoForm from "./PreviewTwoForm";
import QRCode from "./QRCode";

type Props = {
  sectionOne: {
    image: string;
    title: string;
    description: string;
    buttonText: string;
  };
  sectionTwo: {
    image: string;
    title: string;
    description: string;
    content: string;
  };
  sectionThree: {
    title: string;
    description: string;
    buttonTextOne: string;
    buttonTextTwo: string;
  };
  sectionFour: {
    title: string;
    description: string;
    location: string;
    phone: string;
    email: string;
  };
  onChangeSectionOne: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChangeSectionTwo: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChangeSectionThree: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChangeSectionFour: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

function CMSForm({
  sectionOne,
  sectionTwo,
  sectionThree,
  sectionFour,
  onChangeSectionOne,
  onChangeSectionTwo,
  onChangeSectionThree,
  onChangeSectionFour,
}: Props) {
  // ✅ POST to API
  const handleSaveSectionOne = async () => {
    try {
      const formData = new FormData();
      const fileInput = document.querySelector<HTMLInputElement>(
        'input[name="image"]'
      );
      const file = fileInput?.files?.[0];

      if (file) formData.append("image", file);
      formData.append("title", sectionOne.title);
      formData.append("description", sectionOne.description);
      formData.append("buttonText", sectionOne.buttonText);

      const res = await fetch("/api/cms", { method: "POST", body: formData });

      if (!res.ok) throw new Error("Failed to save");
      const result = await res.json();
      alert("✅ Section One saved!");
      console.log("Saved:", result);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save Section One");
    }
  };

  const handleSaveSectionTwo = async () => {
    try {
      const formData = new FormData();
      const fileInput = document.querySelector<HTMLInputElement>(
        'input[name="image"][data-section="two"]'
      );
      const file = fileInput?.files?.[0];

      if (file) formData.append("image", file);
      formData.append("title", sectionTwo.title);
      formData.append("description", sectionTwo.description);
      formData.append("content", sectionTwo.content);
      formData.append("section", "two");

      const res = await fetch("/api/cms", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to save");
      alert("✅ Section Two saved!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save Section Two");
    }
  };

  const handleSaveSectionThree = async () => {
    try {
      const formData = new FormData();
      formData.append("section", "three");
      formData.append("title", sectionThree.title);
      formData.append("description", sectionThree.description);
      formData.append("buttonTextOne", sectionThree.buttonTextOne);
      formData.append("buttonTextTwo", sectionThree.buttonTextTwo);

      const res = await fetch("/api/cms", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to save");
      alert("✅ Section Three saved!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save Section Three");
    }
  };

  const handleSaveSectionFour = async () => {
    try {
      const formData = new FormData();
      formData.append("section", "four");
      formData.append("title", sectionFour.title);
      formData.append("description", sectionFour.description);
      formData.append("location", sectionFour.location);
      formData.append("phone", sectionFour.phone);
      formData.append("email", sectionFour.email);

      const res = await fetch("/api/cms", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to save");
      alert("✅ Section Four saved!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save Section Four");
    }
  };

  return (
    <div>
      <PreviewOneForm
        data={sectionOne}
        onChange={onChangeSectionOne}
        onSave={handleSaveSectionOne}
      />
      <PreviewTwoForm
        data={sectionTwo}
        onChange={onChangeSectionTwo}
        onSave={handleSaveSectionTwo}
      />
      <PreviewThreeForm
        data={sectionThree}
        onChange={onChangeSectionThree}
        onSave={handleSaveSectionThree}
      />
      <PreviewFourForm
        data={sectionFour}
        onChange={onChangeSectionFour}
        onSave={handleSaveSectionFour}
      />
      <QRCode />
    </div>
  );
}

export default CMSForm;
