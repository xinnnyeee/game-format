import React, { useState } from "react";
import singleKnockoutImg from "./assets/single knockout.jpg";
import roundRobinImg from "./assets/round robin.jpg";
import openPlayImg from "./assets/open play.jpg";
import kingOfTheCourtImg from "./assets/king of the court.jpg";
import { useNavigate } from "react-router-dom";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface LandingOption {
  id: string;
  title: string;
  image?: string;
  bgColor?: string;
  textColor: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Landing = () => {
  const navigate = useNavigate();
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // DATA CONFIGURATION
  // --------------------------------------------------------------------------
  const landingOptions: LandingOption[] = [
    {
      id: "choose",
      title: "CHOOSE YOUR GAME FORMAT.",
      bgColor: "bg-black",
      textColor: "text-white",
    },
    {
      id: "single-knockout",
      title: "SINGLE KNOCKOUT",
      image: singleKnockoutImg,
      textColor: "text-white",
    },
    {
      id: "round-robin",
      title: "ROUND ROBIN",
      image: roundRobinImg,
      textColor: "text-white",
    },
    {
      id: "open-play",
      title: "OPEN PLAY",
      image: openPlayImg,
      textColor: "text-white",
    },
    {
      id: "king-of-the-court",
      title: "KING OF THE COURT",
      image: kingOfTheCourtImg,
      textColor: "text-white",
    },
  ];

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  const handleFormatClick = (formatId: string) => {
    // Prevent selection of the "choose" header card
    if (formatId !== "choose") {
      setSelectedFormat(formatId);
      if (formatId == "round-robin") {
        navigate("/RRInput", { state: { selectedFormat } });
      } else if (formatId == "single-knockout") {
        navigate("/SKInput", { state: { selectedFormat } });
      } else if (formatId == "open-play") {
        navigate("/OPInput", { state: { selectedFormat } });
      } else if (formatId == "king-of-the-court") {
        navigate("/KOTCInput", { state: { selectedFormat } });
      } else {
        console.log("no valid format selected");
      }
    }
  };

  // --------------------------------------------------------------------------
  // RENDER HELPERS
  // --------------------------------------------------------------------------
  const renderCard = (option: LandingOption, gridPosition: string) => {
    return (
      <div
        key={option.id}
        className={`
        relative rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-200 active:scale-95
        ${option.bgColor}
        ${gridPosition}
      `}
        onClick={() => handleFormatClick(option.id)}
        style={
          option.image
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${option.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-6">
          <h2
            className={`
            font-bold text-center tracking-wide
            ${option.textColor}
            ${
              option.id === "choose"
                ? "text-3xl md:text-4xl"
                : "text-3xl md:text-4xl"
            }
          `}
          >
            {option.title}
          </h2>
        </div>
      </div>
    );
  };

  //--------------------------------------------------------------------------
  //MAIN RENDER
  //--------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto h-screen">
        {/* Asymmetrical Grid Layout */}
        <div className="grid grid-cols-2 grid-rows-3 gap-4 h-full">
          {renderCard(landingOptions[0], "row-span-1 col-span-1")}{" "}
          {/* Choose Header */}
          {renderCard(landingOptions[2], "row-span-2 col-span-1")}{" "}
          {/* Round Robin (Tall) */}
          {renderCard(landingOptions[1], "row-span-1 col-span-1")}{" "}
          {/* Single Knockout */}
          {renderCard(landingOptions[3], "row-span-1 col-span-1")}{" "}
          {/* Open Play */}
          {renderCard(landingOptions[4], "row-span-1 col-span-1")}{" "}
          {/* King of Court */}
        </div>
      </div>
    </div>
  );
};

export default Landing;
