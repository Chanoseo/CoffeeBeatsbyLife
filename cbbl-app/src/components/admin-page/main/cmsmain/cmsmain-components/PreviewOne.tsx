import Image from "next/image";

type Props = {
  data: {
    image: string;
    title: string;
    description: string;
    buttonText: string;
  };
};

function PreviewOne({ data }: Props) {
  return (
    <div className="lg:h-[75vh] h-[80vh] relative shadow-md shadow-black/20">
      <div className="absolute inset-0">
        {/* Dynamic Background Image */}
        <Image
          src={data.image || "/cbbl-image.jpg"}
          alt={data.title || "Preview"}
          width={1500}
          height={100}
          className="h-full w-full object-cover absolute inset-0 -z-50 pointer-events-none"
          priority
        />

        {/* Overlay */}
        <div className="xl:bg-gradient-to-r xl:from-black/20 xl:to-[#3C604C]/40 absolute inset-0 bg-black/70 -z-40"></div>

        {/* Content */}
        <div className="md:p-20 xl:text-start xl:w-2/4 h-full w-full flex flex-col justify-center p-5 text-white mt-5 text-center">
          <h1 className="md:text-5xl text-3xl font-bold mb-4">{data.title}</h1>
          <p className="md:text-lg text-md mb-8">{data.description}</p>
          {data.buttonText && (
            <div>
              <button className="button-style">{data.buttonText}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default PreviewOne;
