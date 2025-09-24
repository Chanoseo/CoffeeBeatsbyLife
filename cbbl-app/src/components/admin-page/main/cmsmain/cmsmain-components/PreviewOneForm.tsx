type Props = {
  data: {
    image: string;
    title: string;
    description: string;
    buttonText: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSave: () => void; // 👈 add save callback
};

function PreviewOneForm({ data, onChange, onSave }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(); // ✅ call parent save function
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h1 className="font-semibold text-xl mb-2 text-gray-800">Section One</h1>
      <form onSubmit={handleSubmit}>
        {/* Input Image */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Upload Image
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={onChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#3C604C] file:text-white hover:file:bg-[#2F4A3A] transition-colors"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={data.title}
            onChange={onChange}
            placeholder="Enter title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={onChange}
            placeholder="Enter description"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition h-32 resize-none"
          ></textarea>
        </div>

        {/* Button Text */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Button Text
          </label>
          <input
            type="text"
            name="buttonText"
            value={data.buttonText}
            onChange={onChange}
            placeholder="Enter button text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition"
          />
        </div>

        <button type="submit" className="button-style mt-4">
          Save
        </button>
      </form>
    </div>
  );
}

export default PreviewOneForm;
