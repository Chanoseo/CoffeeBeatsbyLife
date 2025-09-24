import Image from "next/image";

type Props = {
  data: {
    image: string;
    title: string;
    description: string;
    content: string;
  };
};

function PreviewTwo({ data }: Props) {
  return (
    <section className="bg-white p-10 text-center text-brown" id="about">
      {/* Title & Description */}
      <div className="mb-10">
        <h1 className="md:text-5xl text-3xl font-bold mb-3">{data.title}</h1>
        <p className="md:text-xl text-base">{data.description}</p>
      </div>

      <div className="lg:flex-row flex flex-col-reverse justify-center items-center gap-6">
        {/* Content */}
        <div className="lg:w-2/5 md:text-left w-full text-center">
          {data.content &&
            data.content.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
        </div>

        {/* Image */}
        {data.image && (
          <div className="flex-shrink-0">
            <Image
              src={data.image}
              alt={data.title || "Preview image"}
              width={400}
              height={400}
              className="w-[400px] h-[400px] object-cover rounded-lg"
              unoptimized // ✅ avoids Next.js domain errors while testing
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default PreviewTwo;
