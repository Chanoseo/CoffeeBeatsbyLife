type Props = {
  data: {
    title: string;
    description: string;
    location: string;
    phone: string;
    email: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void; // ✅ add this
};

function PreviewFourForm({ data, onChange, onSave }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 mt-6">
      <h1 className="font-semibold text-xl mb-2 text-gray-800">Section Four</h1>

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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C]"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C]"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={data.location}
          onChange={onChange}
          placeholder="Enter location"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C]"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="text"
          name="phone"
          value={data.phone}
          onChange={onChange}
          placeholder="Enter phone number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C]"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="text"
          name="email"
          value={data.email}
          onChange={onChange}
          placeholder="Enter email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C]"
        />
      </div>
      <button type="button" onClick={onSave} className="button-style">
        Save
      </button>
    </div>
  );
}
export default PreviewFourForm;
