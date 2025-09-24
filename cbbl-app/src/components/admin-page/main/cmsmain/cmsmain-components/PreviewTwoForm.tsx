type Props = {
  data: {
    image: string;
    title: string;
    description: string;
    content: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSave: () => void; // ✅ idagdag ito
};

function PreviewTwoForm({ data, onChange, onSave }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 mt-6">
      <h1 className="font-semibold text-xl mb-2 text-gray-800">Section Two</h1>

      {/* Input Image */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload Image
        </label>
        <input
          type="file"
          name="image"
          data-section="two" // ✅ para makita ni handleSaveSectionTwo
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
        <input
          type="text"
          name="description"
          value={data.description}
          onChange={onChange}
          placeholder="Enter description"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          name="content"
          value={data.content}
          onChange={onChange}
          placeholder="Enter content"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition h-32 resize-none"
        ></textarea>
      </div>

      {/* ✅ Save Button */}
      <button type="button" onClick={onSave} className="button-style">
        Save
      </button>
    </div>
  );
}

export default PreviewTwoForm;
