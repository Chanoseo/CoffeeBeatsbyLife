import Form from "@/components/landing-page/main/main-components/Form";
import {
  faEnvelope,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  data: {
    title: string;
    description: string;
    location: string;
    phone: string;
    email: string;
  };
};

function PreviewFour({ data }: Props) {
  return (
    <section
      className="lg:px-30 bg-white py-10 px-5 flex flex-col items-center justify-center text-brown"
      id="contact"
    >
      <div className="mb-10 text-center">
        <h1 className="md:text-5xl text-3xl font-bold mb-3">{data.title}</h1>
        <p className="md:text-xl text-base">{data.description}</p>
      </div>

      <div className="md:flex-row md:gap-0 w-full flex flex-col gap-10 justify-center items-center">
        {/* Location */}
        <div className="w-full flex flex-col justify-center items-center">
          <FontAwesomeIcon
            icon={faLocationDot}
            className="md:text-6xl lg:text-7xl text-5xl text-[#3C604C]"
          />
          <h1 className="md:text-xl mt-2 text-lg font-bold">Our Location</h1>
          <p className="lg:text-base mt-5 text-sm">{data.location}</p>
        </div>

        {/* Phone */}
        <div className="w-full flex flex-col justify-center items-center">
          <FontAwesomeIcon
            icon={faPhone}
            className="md:text-6xl lg:text-7xl text-5xl text-[#3C604C]"
          />
          <h1 className="md:text-xl mt-2 text-lg font-bold">Call Us</h1>
          <p className="lg:text-base mt-5 text-sm">{data.phone}</p>
        </div>

        {/* Email */}
        <div className="w-full flex flex-col justify-center items-center">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="md:text-6xl lg:text-7xl text-5xl text-[#3C604C]"
          />
          <h1 className="md:text-xl mt-2 text-lg font-bold">Email Us</h1>
          <p className="lg:text-base mt-5 text-sm">{data.email}</p>
        </div>
      </div>

      <Form />
    </section>
  );
}

export default PreviewFour;
