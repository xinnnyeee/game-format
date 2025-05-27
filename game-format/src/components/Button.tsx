interface ButtonProps {
  text: string;
  onClick: () => void;
}

const Button = ({ text, onClick }: ButtonProps) => {
  return (
    <div className="d-grid gap-2 col-6 mx-auto">
      <button
        className="btn btn-outline-dark my-2"
        type="button"
        onClick={onClick}
      >
        {text}
      </button>
    </div>
  );
};

export default Button;
