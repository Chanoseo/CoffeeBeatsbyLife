import Form from "./Form"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLocationDot, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons"

function SectionFour() {
    return (
        <section className="bg-white py-10 px-30 flex flex-col items-center justify-center text-brown" id="contact">
            <div className="mb-10 text-center">
                <h1 className="text-5xl font-bold mb-3">Visit Us</h1>
                <p className="text-xl">Reserve, relax, and arrive—coffee’s ready when you are.</p>
            </div>
            <div className="w-full flex justify-center items-center">
                <div className="w-full flex flex-col justify-center items-center">
                    <FontAwesomeIcon icon={faLocationDot} className="text-7xl text-[#3C604C]"/>
                    <h1 className="mt-2 text-xl font-bold">Our Location</h1>
                    <p className="mt-5">Santo Tomas, Batangas, Philippines</p>
                </div>
                <div className="w-full flex flex-col justify-center items-center">
                    <FontAwesomeIcon icon={faPhone} className="text-7xl text-[#3C604C]"/>
                    <h1 className="mt-2 text-xl font-bold">Call Us</h1>
                    <p className="mt-5">+63 917 167 0831</p>
                </div>
                <div className="w-full flex flex-col justify-center items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="text-7xl text-[#3C604C]"/>
                    <h1 className="mt-2 text-xl font-bold">Email Us</h1>
                    <p className="mt-5">coffeebeatsbylife@gmail.com</p>
                </div>
            </div>
            <Form />
        </section>
    )
}
export default SectionFour