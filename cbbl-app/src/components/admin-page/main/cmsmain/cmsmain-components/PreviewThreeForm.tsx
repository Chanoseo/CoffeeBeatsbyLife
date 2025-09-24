type Props = {
  data: {
    title: string;
    description: string;
    buttonTextOne: string;
    buttonTextTwo: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSave: () => void; // ✅ add this
};

function PreviewThreeForm({ data, onChange, onSave }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 mt-6">
      <h1 className="font-semibold text-xl mb-2 text-gray-800">
        Section Three
      </h1>

      {/* Title */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          placeholder="Enter title"
          value={data.title}
          onChange={onChange}
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
          placeholder="Enter description"
          value={data.description}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition"
        />
      </div>

      {/* Button One */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Button One
        </label>
        <input
          type="text"
          name="buttonTextOne"
          placeholder="Enter button one text"
          value={data.buttonTextOne}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition"
        />
      </div>

      {/* Button Two */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Button Two
        </label>
        <input
          type="text"
          name="buttonTextTwo"
          placeholder="Enter button two text"
          value={data.buttonTextTwo}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition"
        />
      </div>

      {/* ✅ Save Button */}
      <button onClick={onSave} className="button-style">
        Save
      </button>
    </div>
  );
}

export default PreviewThreeForm;
