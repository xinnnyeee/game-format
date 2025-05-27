import { createRoutesStub } from "react-router-dom";
import "./NavBar.css";
interface NavbarProps {
  title: string;
  routeBtnName: string;
  routeBack: () => void;
  routeFwd: () => void;
}

function NavBar({ title, routeBtnName, routeBack, routeFwd }: NavbarProps) {
  return (
    <div className="navbar">
      <button className="btn btn-outline-light" onClick={routeBack}>
        Back
      </button>
      <h1 className="nav-title">{title}</h1>
      <button className="btn btn-outline-light" onClick={routeFwd}>
        {routeBtnName}
      </button>
    </div>
  );
}

export default NavBar;
