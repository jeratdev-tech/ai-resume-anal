import { Link } from "react-router";

const Navber = () => {
  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">Resumind</p>
      </Link>
      <Link to="/upload" className="primary-button w-fit">
        Upload
      </Link>
    </nav>
  );
};

export default Navber;
