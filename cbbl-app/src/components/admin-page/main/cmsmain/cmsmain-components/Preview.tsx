import PreviewFive from "./PreviewFive";
import PreviewFour from "./PreviewFour";
import PreviewOne from "./PreviewOne";
import PreviewThree from "./PreviewThree";
import PreviewTwo from "./PreviewTwo";

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
};

function Preview({ sectionOne, sectionTwo, sectionThree, sectionFour }: Props) {
  return (
    <>
      <PreviewOne data={sectionOne} />
      <PreviewTwo data={sectionTwo} />
      <PreviewThree data={sectionThree} />
      <PreviewFour data={sectionFour} />
      <PreviewFive
        data={{ phone: sectionFour.phone, email: sectionFour.email }}
      />
    </>
  );
}

export default Preview;
