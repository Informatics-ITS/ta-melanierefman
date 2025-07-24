import { Button } from "..";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <Button
      onClick={handleBack}
      variant="basic"
      iconLeft={<ArrowLeft />}
    >
      Kembali
    </Button>
  );
};

export default BackButton;