import {
  faFacebook,
  faInstagram,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
  data: {
    phone: string;
    email: string;
  };
};

function PreviewFive({ data }: Props) {
  return (
    <footer className="bg-[#3C604C] text-white py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="md:text-xl text-lg font-bold mb-2">
            Coffee Beats By Life
          </h3>
          <p className="text-sm">
            Your one-stop shop for the best coffee in town. Visit us or order
            online.
          </p>
        </div>
        <div>
          <h3 className="md:text-xl text-lg font-bold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li>
              <a href="#" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="#menu" className="hover:underline">
                Menu
              </a>
            </li>
            <li>
              <a href="#about" className="hover:underline">
                About
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="md:text-xl text-lg font-bold mb-2">Contact Us</h3>
          <p className="text-sm">
            Email: {data.email || "coffeebeatsbylife@gmail.com"}
          </p>
          <p className="text-sm">Phone: {data.phone || "+63 917 167 0831"}</p>
          <div className="flex gap-3 mt-2">
            <a
              href="https://www.facebook.com/coffeebeatsbylife"
              target="_blank"
              className="text-2xl hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a
              href="https://www.instagram.com/coffeebeats_bylife/"
              target="_blank"
              className="text-2xl hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://www.tiktok.com/@coffeebeats_by_life"
              target="_blank"
              className="text-2xl hover:text-gray-300"
            >
              <FontAwesomeIcon icon={faTiktok} />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-gray-200">
        &copy; {new Date().getFullYear()} Coffee Beats By Life. All rights
        reserved.
      </div>
    </footer>
  );
}
export default PreviewFive;
