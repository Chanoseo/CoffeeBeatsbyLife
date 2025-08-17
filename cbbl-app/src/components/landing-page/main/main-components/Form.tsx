import SendMessageButton from "./MessageButton";

function Form() {
    return (
        <form className="w-4/5 mt-10 p-8 rounded shadow-sm shadow-black/30">
            <h1 className="text-2xl font-bold">Send Us a Message</h1>
            <p className="mt-2">We&apos;d love to hear from you!</p>
            <hr className="my-4 text-gray-300" />
            <div className="flex flex-col gap-4 mt-4">
                <label className="text-lg font-semibold" htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    className="p-2 border border-gray-300 rounded"
                />
                <label className="text-lg font-semibold" htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    className="p-2 border border-gray-300 rounded"
                />
                <label className="text-lg font-semibold" htmlFor="message">Message</label>
                <textarea
                    id="message"
                    placeholder="Your Message"
                    className="p-2 border border-gray-300 rounded h-32"
                ></textarea>
            </div>
            <SendMessageButton />
        </form>
    )
}
export default Form;